import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { EmployeeCertificationsService } from './employee-certifications.service';
import { CreateEmployeeCertificationDto } from './dto/create-employee-certification.dto';

@Controller()
export class EmployeeCertificationsGrpcController {
  constructor(private readonly employeeCertificationsService: EmployeeCertificationsService) {}

  @GrpcMethod('EmployeeCertificationService', 'GetEmployeeCertifications')
  async getEmployeeCertifications(data: { 
    employeeId?: string; 
    certificationId?: string;
    status?: string;
  }) {
    try {
      const query = {
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        certification_id: data.certificationId,
        certificationId: data.certificationId,
        status: data.status,
      };
      const certifications = await this.employeeCertificationsService.findAll(query);
      return {
        employeeCertifications: certifications.map(cert => this.mapEmployeeCertificationToProto(cert)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get employee certifications',
      });
    }
  }

  @GrpcMethod('EmployeeCertificationService', 'CreateEmployeeCertification')
  async createEmployeeCertification(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.certificationId) {
        throw new RpcException({
          code: 3,
          message: 'certificationId is required',
        });
      }
      if (!data.issueDate) {
        throw new RpcException({
          code: 3,
          message: 'issueDate is required',
        });
      }

      const createDto: CreateEmployeeCertificationDto = {
        employeeId: data.employeeId,
        certificationId: data.certificationId,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate || undefined,
        certificateNumber: data.certificateNumber || undefined,
        status: data.status || undefined,
      };

      const certification = await this.employeeCertificationsService.create(createDto);
      return this.mapEmployeeCertificationToProto(certification);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create employee certification',
      });
    }
  }

  private mapEmployeeCertificationToProto(certification: any) {
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
      id: certification.id,
      employeeId: certification.employeeId,
      certificationId: certification.certificationId,
      issueDate: formatDate(certification.issueDate),
      expiryDate: formatDate(certification.expiryDate),
      certificateNumber: certification.certificateNumber || '',
      status: certification.status,
      createdAt: formatDateTime(certification.createdAt),
    };
  }
}
