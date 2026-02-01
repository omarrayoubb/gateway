import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';

@Injectable()
export class EmployeeSkillsService {
  constructor(
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
  ) {}

  async create(createEmployeeSkillDto: CreateEmployeeSkillDto): Promise<EmployeeSkill> {
    const employeeSkill = this.employeeSkillRepository.create({
      ...createEmployeeSkillDto,
      verifiedDate: createEmployeeSkillDto.verifiedDate 
        ? new Date(createEmployeeSkillDto.verifiedDate) 
        : null,
    });

    return await this.employeeSkillRepository.save(employeeSkill);
  }

  async findAll(query: { 
    employee_id?: string; 
    employeeId?: string; 
    skill_id?: string;
    skillId?: string;
    proficiency_level?: string;
    proficiencyLevel?: string;
  }): Promise<EmployeeSkill[]> {
    const queryBuilder = this.employeeSkillRepository.createQueryBuilder('employee_skill');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('employee_skill.employeeId = :employeeId', { employeeId });
    }

    // Filter by skill_id if provided
    const skillId = query.skill_id || query.skillId;
    if (skillId) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee_skill.skillId = :skillId', { skillId });
    }

    // Filter by proficiency_level if provided
    const proficiencyLevel = query.proficiency_level || query.proficiencyLevel;
    if (proficiencyLevel) {
      const whereCondition = (employeeId || skillId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee_skill.proficiencyLevel = :proficiencyLevel', { proficiencyLevel });
    }

    queryBuilder.orderBy('employee_skill.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<EmployeeSkill> {
    const employeeSkill = await this.employeeSkillRepository.findOne({
      where: { id },
    });

    if (!employeeSkill) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }

    return employeeSkill;
  }

  async update(id: string, updateEmployeeSkillDto: UpdateEmployeeSkillDto): Promise<EmployeeSkill> {
    const employeeSkill = await this.findOne(id);
    
    const updateData: any = { ...updateEmployeeSkillDto };
    if (updateEmployeeSkillDto.verifiedDate) {
      updateData.verifiedDate = new Date(updateEmployeeSkillDto.verifiedDate);
    }

    Object.assign(employeeSkill, updateData);
    return await this.employeeSkillRepository.save(employeeSkill);
  }

  async remove(id: string): Promise<void> {
    const employeeSkill = await this.findOne(id);
    await this.employeeSkillRepository.remove(employeeSkill);
  }
}
