import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { EmployeeSkillsService } from './employee-skills.service';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';

@Controller()
export class EmployeeSkillsGrpcController {
  constructor(private readonly employeeSkillsService: EmployeeSkillsService) {}

  @GrpcMethod('EmployeeSkillService', 'GetEmployeeSkills')
  async getEmployeeSkills(data: { 
    employeeId?: string; 
    skillId?: string;
    proficiencyLevel?: string;
  }) {
    try {
      const query = {
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        skill_id: data.skillId,
        skillId: data.skillId,
        proficiency_level: data.proficiencyLevel,
        proficiencyLevel: data.proficiencyLevel,
      };
      const employeeSkills = await this.employeeSkillsService.findAll(query);
      return {
        employeeSkills: employeeSkills.map(es => this.mapEmployeeSkillToProto(es)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get employee skills',
      });
    }
  }

  @GrpcMethod('EmployeeSkillService', 'CreateEmployeeSkill')
  async createEmployeeSkill(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.skillId) {
        throw new RpcException({
          code: 3,
          message: 'skillId is required',
        });
      }

      const createDto: CreateEmployeeSkillDto = {
        employeeId: data.employeeId,
        skillId: data.skillId,
        proficiencyLevel: data.proficiencyLevel || undefined,
        verified: data.verified !== undefined ? data.verified : false,
        verifiedBy: data.verifiedBy || undefined,
        verifiedDate: data.verifiedDate || undefined,
      };

      const employeeSkill = await this.employeeSkillsService.create(createDto);
      return this.mapEmployeeSkillToProto(employeeSkill);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create employee skill',
      });
    }
  }

  @GrpcMethod('EmployeeSkillService', 'UpdateEmployeeSkill')
  async updateEmployeeSkill(data: any) {
    try {
      const updateDto: UpdateEmployeeSkillDto = {
        proficiencyLevel: data.proficiencyLevel || undefined,
        verified: data.verified !== undefined ? data.verified : undefined,
        verifiedBy: data.verifiedBy || undefined,
        verifiedDate: data.verifiedDate || undefined,
      };
      const employeeSkill = await this.employeeSkillsService.update(data.id, updateDto);
      return this.mapEmployeeSkillToProto(employeeSkill);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update employee skill',
      });
    }
  }

  @GrpcMethod('EmployeeSkillService', 'DeleteEmployeeSkill')
  async deleteEmployeeSkill(data: { id: string }) {
    try {
      await this.employeeSkillsService.remove(data.id);
      return { success: true, message: 'Employee skill deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete employee skill',
      });
    }
  }

  private mapEmployeeSkillToProto(employeeSkill: any) {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: employeeSkill.id,
      employeeId: employeeSkill.employeeId,
      skillId: employeeSkill.skillId,
      proficiencyLevel: employeeSkill.proficiencyLevel,
      verified: employeeSkill.verified || false,
      verifiedBy: employeeSkill.verifiedBy || '',
      verifiedDate: formatDate(employeeSkill.verifiedDate),
      createdAt: formatDateTime(employeeSkill.createdAt),
    };
  }
}
