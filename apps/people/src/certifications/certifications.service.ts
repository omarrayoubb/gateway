import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
  ) {}

  async findAll(): Promise<Certification[]> {
    return await this.certificationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createCertificationDto: CreateCertificationDto): Promise<Certification> {
    const certification = this.certificationRepository.create({
      ...createCertificationDto,
    });

    return await this.certificationRepository.save(certification);
  }
}
