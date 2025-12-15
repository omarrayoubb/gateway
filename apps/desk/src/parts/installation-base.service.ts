import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallationBase } from './entities/installation-base.entity';
import { CreateInstallationBaseDto } from './dto/create-installation-base.dto';
import { UpdateInstallationBaseDto } from './dto/update-installation-base.dto';

@Injectable()
export class InstallationBaseService {
  constructor(
    @InjectRepository(InstallationBase)
    private readonly installationBaseRepository: Repository<InstallationBase>,
  ) {}

  private transformToResponse(equipment: InstallationBase): any {
    return {
      id: equipment.id,
      equipment_name: equipment.equipment_name,
      serial_number: equipment.serial_number,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      account_id: equipment.account_id,
      contact_id: equipment.contact_id,
      installation_date: equipment.installation_date,
      installation_location: equipment.installation_location,
      latitude: equipment.latitude,
      longitude: equipment.longitude,
      warranty_start_date: equipment.warranty_start_date,
      warranty_end_date: equipment.warranty_end_date,
      warranty_status: equipment.warranty_status,
      condition: equipment.condition,
      lifecycle_status: equipment.lifecycle_status,
      expected_lifespan_years: equipment.expected_lifespan_years,
      end_of_life_date: equipment.end_of_life_date,
      next_ppm_date: equipment.next_ppm_date,
      total_service_calls: equipment.total_service_calls,
      total_downtime_hours: equipment.total_downtime_hours,
      created_date: equipment.createdAt,
    };
  }

  private calculateWarrantyStatus(
    warranty_start_date: Date | null,
    warranty_end_date: Date | null,
  ): string | null {
    if (!warranty_start_date || !warranty_end_date) {
      return null;
    }

    const now = new Date();
    if (now < warranty_start_date) {
      return 'Pending';
    }
    if (now > warranty_end_date) {
      return 'Expired';
    }
    return 'Active';
  }

  private calculateEndOfLifeDate(
    installation_date: Date | null,
    expected_lifespan_years: number | null,
  ): Date | null {
    if (!installation_date || !expected_lifespan_years) {
      return null;
    }

    const eolDate = new Date(installation_date);
    eolDate.setFullYear(eolDate.getFullYear() + expected_lifespan_years);
    return eolDate;
  }

  async findAll(account_id?: string, sort?: string): Promise<any[]> {
    const queryBuilder =
      this.installationBaseRepository.createQueryBuilder('ib');

    if (account_id) {
      queryBuilder.andWhere('ib.account_id = :account_id', { account_id });
    }

    if (sort) {
      const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
      const sortField = sort.replace(/^-/, '');
      queryBuilder.orderBy(`ib.${sortField}`, sortOrder);
    } else {
      queryBuilder.orderBy('ib.createdAt', 'DESC');
    }

    const equipment = await queryBuilder.getMany();
    return equipment.map((eq) => {
      const response = this.transformToResponse(eq);
      // Calculate warranty_status if not set
      if (!response.warranty_status && eq.warranty_start_date && eq.warranty_end_date) {
        response.warranty_status = this.calculateWarrantyStatus(
          eq.warranty_start_date,
          eq.warranty_end_date,
        );
      }
      return response;
    });
  }

  async findOne(id: string): Promise<any> {
    const equipment = await this.installationBaseRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    const response = this.transformToResponse(equipment);
    // Calculate warranty_status if not set
    if (!response.warranty_status && equipment.warranty_start_date && equipment.warranty_end_date) {
      response.warranty_status = this.calculateWarrantyStatus(
        equipment.warranty_start_date,
        equipment.warranty_end_date,
      );
    }
    return response;
  }

  async create(
    createInstallationBaseDto: CreateInstallationBaseDto,
  ): Promise<any> {
    const equipmentData: any = {
      ...createInstallationBaseDto,
      total_service_calls: 0,
      total_downtime_hours: 0,
      eol_alert_sent: false,
    };

    // Convert date strings to Date objects
    if (equipmentData.installation_date) {
      equipmentData.installation_date = new Date(equipmentData.installation_date);
    }
    if (equipmentData.warranty_start_date) {
      equipmentData.warranty_start_date = new Date(equipmentData.warranty_start_date);
    }
    if (equipmentData.warranty_end_date) {
      equipmentData.warranty_end_date = new Date(equipmentData.warranty_end_date);
    }
    if (equipmentData.next_ppm_date) {
      equipmentData.next_ppm_date = new Date(equipmentData.next_ppm_date);
    }

    // Calculate end_of_life_date if installation_date and expected_lifespan_years are provided
    if (equipmentData.installation_date && equipmentData.expected_lifespan_years) {
      equipmentData.end_of_life_date = this.calculateEndOfLifeDate(
        equipmentData.installation_date,
        equipmentData.expected_lifespan_years,
      );
    }

    // Calculate warranty_status
    if (equipmentData.warranty_start_date && equipmentData.warranty_end_date) {
      equipmentData.warranty_status = this.calculateWarrantyStatus(
        equipmentData.warranty_start_date,
        equipmentData.warranty_end_date,
      );
    }

    const equipment = this.installationBaseRepository.create(equipmentData);
    const savedEquipment = await this.installationBaseRepository.save(
      equipment,
    );
    const savedEquipmentEntity = Array.isArray(savedEquipment)
      ? savedEquipment[0]
      : savedEquipment;
    return this.transformToResponse(savedEquipmentEntity);
  }

  async update(
    id: string,
    updateInstallationBaseDto: UpdateInstallationBaseDto,
  ): Promise<any> {
    const equipment = await this.installationBaseRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    const updateData: any = { ...updateInstallationBaseDto };

    // Convert date strings to Date objects if provided
    if (updateData.next_ppm_date) {
      updateData.next_ppm_date = new Date(updateData.next_ppm_date);
    }
    if (updateData.eol_alert_date) {
      updateData.eol_alert_date = new Date(updateData.eol_alert_date);
    }

    Object.assign(equipment, updateData);
    const updatedEquipment = await this.installationBaseRepository.save(
      equipment,
    );
    const updatedEquipmentEntity = Array.isArray(updatedEquipment)
      ? updatedEquipment[0]
      : updatedEquipment;
    return this.transformToResponse(updatedEquipmentEntity);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.installationBaseRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    await this.installationBaseRepository.remove(equipment);
  }
}

