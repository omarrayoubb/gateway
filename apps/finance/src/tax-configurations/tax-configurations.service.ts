import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TaxConfiguration, TaxType, CalculationMethod } from './entities/tax-configuration.entity';
import { CreateTaxConfigurationDto } from './dto/create-tax-configuration.dto';
import { UpdateTaxConfigurationDto } from './dto/update-tax-configuration.dto';
import { TaxConfigurationPaginationDto } from './dto/pagination.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class TaxConfigurationsService {
  constructor(
    @InjectRepository(TaxConfiguration)
    private readonly taxConfigurationRepository: Repository<TaxConfiguration>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createTaxDto: CreateTaxConfigurationDto): Promise<TaxConfiguration> {
    try {
      // Validate required fields
      if (!createTaxDto.tax_code) {
        throw new BadRequestException('tax_code is required');
      }
      if (!createTaxDto.tax_name) {
        throw new BadRequestException('tax_name is required');
      }
      if (!createTaxDto.tax_type) {
        throw new BadRequestException('tax_type is required');
      }
      if (!createTaxDto.calculation_method) {
        throw new BadRequestException('calculation_method is required');
      }
      if (!createTaxDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const organizationId = createTaxDto.organization_id || null;

      // Check for duplicate tax code
      const existingTax = await this.taxConfigurationRepository.findOne({
        where: {
          taxCode: createTaxDto.tax_code,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      if (existingTax) {
        throw new ConflictException(`Tax configuration with code ${createTaxDto.tax_code} already exists`);
      }

      // Verify account exists
      const account = await this.accountRepository.findOne({
        where: { id: createTaxDto.account_id },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${createTaxDto.account_id} not found`);
      }

      // Validate tax rate based on calculation method
      if (createTaxDto.calculation_method === CalculationMethod.PERCENTAGE) {
        if (createTaxDto.tax_rate === undefined || createTaxDto.tax_rate === null) {
          throw new BadRequestException('tax_rate is required when calculation_method is percentage');
        }
        if (createTaxDto.tax_rate < 0 || createTaxDto.tax_rate > 100) {
          throw new BadRequestException('tax_rate must be between 0 and 100 for percentage calculation');
        }
      } else if (createTaxDto.calculation_method === CalculationMethod.FIXED) {
        if (createTaxDto.tax_rate === undefined || createTaxDto.tax_rate === null) {
          throw new BadRequestException('tax_rate is required when calculation_method is fixed');
        }
        if (createTaxDto.tax_rate < 0) {
          throw new BadRequestException('tax_rate must be non-negative for fixed calculation');
        }
      }

      // Validate effective dates
      if (createTaxDto.effective_from && createTaxDto.effective_to) {
        const fromDate = new Date(createTaxDto.effective_from);
        const toDate = new Date(createTaxDto.effective_to);
        if (fromDate >= toDate) {
          throw new BadRequestException('effective_from must be before effective_to');
        }
      }

      const taxConfig = this.taxConfigurationRepository.create({
        organizationId: organizationId,
        taxCode: createTaxDto.tax_code,
        taxName: createTaxDto.tax_name,
        taxType: createTaxDto.tax_type,
        taxRate: createTaxDto.tax_rate || 0,
        calculationMethod: createTaxDto.calculation_method,
        isInclusive: createTaxDto.is_inclusive || false,
        appliesTo: createTaxDto.applies_to || [],
        accountId: createTaxDto.account_id,
        isActive: true,
        effectiveFrom: createTaxDto.effective_from ? new Date(createTaxDto.effective_from) : null,
        effectiveTo: createTaxDto.effective_to ? new Date(createTaxDto.effective_to) : null,
      });

      return await this.taxConfigurationRepository.save(taxConfig);
    } catch (error) {
      console.error('Error in TaxConfigurationsService.create:', error);
      throw error;
    }
  }

  async findAll(query: TaxConfigurationPaginationDto): Promise<TaxConfiguration[]> {
    try {
      const queryBuilder = this.taxConfigurationRepository.createQueryBuilder('tax');

      if (query.tax_type) {
        queryBuilder.where('tax.taxType = :taxType', { taxType: query.tax_type });
      }

      if (query.is_active !== undefined) {
        const whereCondition = query.tax_type ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('tax.isActive = :isActive', { isActive: query.is_active });
      }

      // Apply sorting
      if (query.sort && query.sort.trim()) {
        let sortField = query.sort.trim();
        let sortOrder: 'ASC' | 'DESC' = 'ASC';

        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1).trim();
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field.trim();
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }

        console.log(`TaxConfigurationsService.findAll - Sorting by: ${sortField}, order: ${sortOrder}`);

        const fieldMap: { [key: string]: string } = {
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
          'tax_code': 'taxCode',
          'tax_name': 'taxName',
          'tax_type': 'taxType',
          'tax_rate': 'taxRate',
          'effective_from': 'effectiveFrom',
          'effective_to': 'effectiveTo',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            console.log(`TaxConfigurationsService.findAll - Applying sort: tax.${entityField} ${sortOrder}`);
            queryBuilder.orderBy(`tax.${entityField}`, sortOrder);
          } catch (error) {
            console.error(`TaxConfigurationsService.findAll - Sort error, using default:`, error);
            queryBuilder.orderBy('tax.createdDate', 'DESC');
          }
        } else {
          console.warn(`TaxConfigurationsService.findAll - Invalid sort field: ${entityField}, using default`);
          queryBuilder.orderBy('tax.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('tax.createdDate', 'DESC');
      }

      const results = await queryBuilder.getMany();
      console.log(`TaxConfigurationsService.findAll: Found ${results.length} tax configurations`);
      return results;
    } catch (error) {
      console.error('Error in TaxConfigurationsService.findAll:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query: query,
      });
      throw error;
    }
  }

  async findOne(id: string): Promise<TaxConfiguration> {
    const taxConfig = await this.taxConfigurationRepository.findOne({
      where: { id },
      relations: ['account'],
    });
    if (!taxConfig) {
      throw new NotFoundException(`Tax configuration with ID ${id} not found`);
    }
    return taxConfig;
  }

  async findByTaxCode(taxCode: string, organizationId?: string, date?: Date): Promise<TaxConfiguration | null> {
    try {
      const queryBuilder = this.taxConfigurationRepository
        .createQueryBuilder('tax')
        .where('tax.taxCode = :taxCode', { taxCode })
        .andWhere('tax.isActive = :isActive', { isActive: true });

      if (organizationId) {
        queryBuilder.andWhere('tax.organizationId = :organizationId', { organizationId });
      } else {
        queryBuilder.andWhere('tax.organizationId IS NULL');
      }

      // Filter by effective date if provided
      if (date) {
        queryBuilder.andWhere(
          '(tax.effectiveFrom IS NULL OR tax.effectiveFrom <= :date) AND (tax.effectiveTo IS NULL OR tax.effectiveTo >= :date)',
          { date },
        );
      }

      queryBuilder.orderBy('tax.createdDate', 'DESC').limit(1);

      return await queryBuilder.getOne();
    } catch (error) {
      console.error('Error in TaxConfigurationsService.findByTaxCode:', error);
      throw error;
    }
  }

  async calculateTax(calculateDto: CalculateTaxDto, organizationId?: string): Promise<any> {
    try {
      const date = calculateDto.date ? new Date(calculateDto.date) : new Date();
      const taxConfig = await this.findByTaxCode(calculateDto.tax_code, organizationId, date);

      if (!taxConfig) {
        throw new NotFoundException(`Active tax configuration with code ${calculateDto.tax_code} not found for the specified date`);
      }

      let taxAmount = 0;
      let baseAmount = calculateDto.amount;
      let totalAmount = calculateDto.amount;

      if (taxConfig.calculationMethod === CalculationMethod.PERCENTAGE) {
        if (taxConfig.isInclusive) {
          // Tax is included in the amount, so we need to extract it
          // total = base + (base * rate) = base * (1 + rate)
          // base = total / (1 + rate)
          baseAmount = calculateDto.amount / (1 + taxConfig.taxRate / 100);
          taxAmount = calculateDto.amount - baseAmount;
          totalAmount = calculateDto.amount;
        } else {
          // Tax is added to the base amount
          baseAmount = calculateDto.amount;
          taxAmount = (calculateDto.amount * taxConfig.taxRate) / 100;
          totalAmount = baseAmount + taxAmount;
        }
      } else if (taxConfig.calculationMethod === CalculationMethod.FIXED) {
        if (taxConfig.isInclusive) {
          // Tax is included in the amount
          baseAmount = calculateDto.amount - taxConfig.taxRate;
          taxAmount = taxConfig.taxRate;
          totalAmount = calculateDto.amount;
        } else {
          // Tax is added to the base amount
          baseAmount = calculateDto.amount;
          taxAmount = taxConfig.taxRate;
          totalAmount = baseAmount + taxAmount;
        }
      }

      return {
        base_amount: parseFloat(baseAmount.toFixed(2)),
        tax_code: taxConfig.taxCode,
        tax_rate: parseFloat(taxConfig.taxRate.toString()),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
      };
    } catch (error) {
      console.error('Error in TaxConfigurationsService.calculateTax:', error);
      throw error;
    }
  }

  async update(id: string, updateTaxDto: UpdateTaxConfigurationDto): Promise<TaxConfiguration> {
    const taxConfig = await this.findOne(id);

    // Check for duplicate tax code if it's being updated
    if (updateTaxDto.tax_code && updateTaxDto.tax_code !== taxConfig.taxCode) {
      const organizationId = updateTaxDto.organization_id || taxConfig.organizationId || null;
      const existingTax = await this.taxConfigurationRepository.findOne({
        where: {
          taxCode: updateTaxDto.tax_code,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingTax && existingTax.id !== id) {
        throw new ConflictException(`Tax configuration with code ${updateTaxDto.tax_code} already exists`);
      }
    }

    // Verify account exists if being updated
    if (updateTaxDto.account_id && updateTaxDto.account_id !== taxConfig.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: updateTaxDto.account_id },
      });
      if (!account) {
        throw new NotFoundException(`Account with ID ${updateTaxDto.account_id} not found`);
      }
    }

    // Validate tax rate if calculation method is percentage
    if (updateTaxDto.calculation_method === CalculationMethod.PERCENTAGE || 
        (taxConfig.calculationMethod === CalculationMethod.PERCENTAGE && updateTaxDto.tax_rate !== undefined)) {
      const taxRate = updateTaxDto.tax_rate !== undefined ? updateTaxDto.tax_rate : taxConfig.taxRate;
      if (taxRate < 0 || taxRate > 100) {
        throw new BadRequestException('tax_rate must be between 0 and 100 for percentage calculation');
      }
    }

    // Update fields
    if (updateTaxDto.tax_code !== undefined) taxConfig.taxCode = updateTaxDto.tax_code;
    if (updateTaxDto.tax_name !== undefined) taxConfig.taxName = updateTaxDto.tax_name;
    if (updateTaxDto.tax_type !== undefined) taxConfig.taxType = updateTaxDto.tax_type;
    if (updateTaxDto.tax_rate !== undefined) taxConfig.taxRate = updateTaxDto.tax_rate;
    if (updateTaxDto.calculation_method !== undefined) taxConfig.calculationMethod = updateTaxDto.calculation_method;
    if (updateTaxDto.is_inclusive !== undefined) taxConfig.isInclusive = updateTaxDto.is_inclusive;
    if (updateTaxDto.applies_to !== undefined) taxConfig.appliesTo = updateTaxDto.applies_to;
    if (updateTaxDto.account_id !== undefined) taxConfig.accountId = updateTaxDto.account_id;
    if (updateTaxDto.effective_from !== undefined) taxConfig.effectiveFrom = updateTaxDto.effective_from ? new Date(updateTaxDto.effective_from) : null;
    if (updateTaxDto.effective_to !== undefined) taxConfig.effectiveTo = updateTaxDto.effective_to ? new Date(updateTaxDto.effective_to) : null;

    return await this.taxConfigurationRepository.save(taxConfig);
  }

  async remove(id: string): Promise<void> {
    const taxConfig = await this.findOne(id);
    await this.taxConfigurationRepository.remove(taxConfig);
  }
}

