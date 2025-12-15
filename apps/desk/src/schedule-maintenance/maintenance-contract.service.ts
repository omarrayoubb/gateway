import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceContract } from './entities/maintenance-contract.entity';
import { CreateMaintenanceContractDto } from './dto/create-maintenance-contract.dto';
import { UpdateMaintenanceContractDto } from './dto/update-maintenance-contract.dto';

@Injectable()
export class MaintenanceContractService {
  constructor(
    @InjectRepository(MaintenanceContract)
    private readonly maintenanceContractRepository: Repository<MaintenanceContract>,
  ) {}

  private generateContractNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `MC-${timestamp}-${random}`;
  }

  private transformToResponse(contract: MaintenanceContract): any {
    return {
      id: contract.id,
      contract_number: contract.contract_number,
      contract_name: contract.contract_name,
      contract_type: contract.contract_type,
      status: contract.status,
      account_id: contract.account_id,
      contact_id: contract.contact_id,
      start_date: contract.start_date,
      end_date: contract.end_date,
      service_frequency: contract.service_frequency,
      visits_per_year: contract.visits_per_year,
      visits_completed: contract.visits_completed,
      visits_remaining: contract.visits_remaining,
      preferred_day_of_week: contract.preferred_day_of_week,
      preferred_time_slot: contract.preferred_time_slot,
      auto_schedule_enabled: contract.auto_schedule_enabled,
      assigned_technician: contract.assigned_technician,
      service_location: contract.service_location,
      special_instructions: contract.special_instructions,
      contract_value: contract.contract_value,
      billing_frequency: contract.billing_frequency,
      includes_parts: contract.includes_parts,
      includes_labor: contract.includes_labor,
      emergency_coverage: contract.emergency_coverage,
      auto_renewal: contract.auto_renewal,
      sla_response_time_hours: contract.sla_response_time_hours,
      next_scheduled_visit: contract.next_scheduled_visit,
      created_date: contract.createdAt,
    };
  }

  async findAll(account_id?: string, status?: string): Promise<any[]> {
    const queryBuilder =
      this.maintenanceContractRepository.createQueryBuilder('mc');

    if (account_id) {
      queryBuilder.andWhere('mc.account_id = :account_id', { account_id });
    }

    if (status) {
      queryBuilder.andWhere('mc.status = :status', { status });
    }

    queryBuilder.orderBy('mc.createdAt', 'DESC');

    const contracts = await queryBuilder.getMany();
    return contracts.map((contract) => this.transformToResponse(contract));
  }

  async findOne(id: string): Promise<any> {
    const contract = await this.maintenanceContractRepository.findOne({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return this.transformToResponse(contract);
  }

  async create(
    createMaintenanceContractDto: CreateMaintenanceContractDto,
  ): Promise<any> {
    // Auto-generate contract number if not provided
    const contractData: any = {
      ...createMaintenanceContractDto,
      contract_number:
        createMaintenanceContractDto.contract_number ||
        this.generateContractNumber(),
      status: createMaintenanceContractDto.status || 'Active',
      visits_completed: 0,
    };

    // Calculate visits_remaining if visits_per_year is provided
    if (contractData.visits_per_year) {
      contractData.visits_remaining = contractData.visits_per_year;
    }

    // Convert date strings to Date objects
    if (contractData.start_date) {
      contractData.start_date = new Date(contractData.start_date);
    }
    if (contractData.end_date) {
      contractData.end_date = new Date(contractData.end_date);
    }

    const contract = this.maintenanceContractRepository.create(contractData);
    const savedContract = await this.maintenanceContractRepository.save(
      contract,
    );
    // TypeORM save can return T or T[], but we pass a single entity so it returns T
    const contractEntity = Array.isArray(savedContract)
      ? savedContract[0]
      : savedContract;
    return this.transformToResponse(contractEntity);
  }

  async update(
    id: string,
    updateMaintenanceContractDto: UpdateMaintenanceContractDto,
  ): Promise<any> {
    const contract = await this.maintenanceContractRepository.findOne({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    const updateData: any = { ...updateMaintenanceContractDto };

    // Convert date string to Date object if provided
    if (updateData.next_scheduled_visit) {
      updateData.next_scheduled_visit = new Date(updateData.next_scheduled_visit);
    }

    Object.assign(contract, updateData);
    const updatedContract = await this.maintenanceContractRepository.save(
      contract,
    );
    // TypeORM save can return T or T[], but we pass a single entity so it returns T
    const contractEntity = Array.isArray(updatedContract)
      ? updatedContract[0]
      : updatedContract;
    return this.transformToResponse(contractEntity);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.maintenanceContractRepository.findOne({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.maintenanceContractRepository.remove(contract);
  }
}

