import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      // Check if code already exists
      const existingDepartment = await this.departmentRepository.findOneBy({
        code: createDepartmentDto.code,
      });

      if (existingDepartment) {
        throw new ConflictException(`Department with code ${createDepartmentDto.code} already exists`);
      }

      // Validate parent department if provided
      if (createDepartmentDto.parentDepartmentId) {
        const parentDepartment = await this.departmentRepository.findOne({
          where: { id: createDepartmentDto.parentDepartmentId },
        });

        if (!parentDepartment) {
          throw new NotFoundException(`Parent department with ID ${createDepartmentDto.parentDepartmentId} not found`);
        }
      }

      const department = this.departmentRepository.create(createDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error) {
      console.error('Error in DepartmentsService.create:', error);
      throw error;
    }
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      relations: ['parentDepartment', 'children'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parentDepartment', 'children'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Check if code is being updated and if it conflicts
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingDepartment = await this.departmentRepository.findOneBy({
        code: updateDepartmentDto.code,
      });

      if (existingDepartment) {
        throw new ConflictException(`Department with code ${updateDepartmentDto.code} already exists`);
      }
    }

    // Validate parent department if provided
    if (updateDepartmentDto.parentDepartmentId) {
      if (updateDepartmentDto.parentDepartmentId === id) {
        throw new ConflictException('Department cannot be its own parent');
      }

      const parentDepartment = await this.departmentRepository.findOne({
        where: { id: updateDepartmentDto.parentDepartmentId },
      });

      if (!parentDepartment) {
        throw new NotFoundException(`Parent department with ID ${updateDepartmentDto.parentDepartmentId} not found`);
      }
    }

    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // Check if department has children
    const children = await this.departmentRepository.find({
      where: { parentDepartmentId: id },
    });

    if (children.length > 0) {
      throw new ConflictException('Cannot delete department with child departments');
    }

    await this.departmentRepository.remove(department);
  }
}

