import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Controller()
export class CertificationsGrpcController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @GrpcMethod('CertificationService', 'GetCertifications')
  async getCertifications() {
    try {
      const certifications = await this.certificationsService.findAll();
      return {
        certifications: certifications.map(cert => this.mapCertificationToProto(cert)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get certifications',
      });
    }
  }

  @GrpcMethod('CertificationService', 'CreateCertification')
  async createCertification(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }
      if (!data.issuingOrganization) {
        throw new RpcException({
          code: 3,
          message: 'issuingOrganization is required',
        });
      }

      const createDto: CreateCertificationDto = {
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        description: data.description || undefined,
        category: data.category || undefined,
        validityPeriodMonths: data.validityPeriodMonths ? parseInt(data.validityPeriodMonths) : undefined,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        mandatory: data.mandatory !== undefined ? data.mandatory : false,
      };

      const certification = await this.certificationsService.create(createDto);
      return this.mapCertificationToProto(certification);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create certification',
      });
    }
  }

  private mapCertificationToProto(certification: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: certification.id,
      name: certification.name,
      issuingOrganization: certification.issuingOrganization,
      description: certification.description || '',
      category: certification.category || '',
      validityPeriodMonths: certification.validityPeriodMonths || 0,
      cost: certification.cost ? parseFloat(certification.cost.toString()) : 0,
      mandatory: certification.mandatory || false,
      createdAt: formatDateTime(certification.createdAt),
    };
  }
}
