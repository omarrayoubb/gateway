import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { CreateAttendanceSummaryDto } from './dto/create-attendance-summary.dto';

@Injectable()
export class AttendanceSummaryService {
  constructor(
    @InjectRepository(AttendanceSummary)
    private readonly summaryRepository: Repository<AttendanceSummary>,
  ) {}

  async create(createSummaryDto: CreateAttendanceSummaryDto): Promise<AttendanceSummary> {
    try {
      // Check if summary already exists for this employee and month
      const existingSummary = await this.summaryRepository.findOne({
        where: {
          employeeId: createSummaryDto.employeeId,
          month: createSummaryDto.month,
        },
      });

      if (existingSummary) {
        throw new ConflictException(`Attendance summary already exists for employee ${createSummaryDto.employeeId} for month ${createSummaryDto.month}`);
      }

      const summary = this.summaryRepository.create(createSummaryDto);
      return await this.summaryRepository.save(summary);
    } catch (error) {
      console.error('Error in AttendanceSummaryService.create:', error);
      throw error;
    }
  }

  async upsert(createSummaryDto: CreateAttendanceSummaryDto): Promise<AttendanceSummary> {
    try {
      // Check if summary already exists for this employee and month
      const existingSummary = await this.summaryRepository.findOne({
        where: {
          employeeId: createSummaryDto.employeeId,
          month: createSummaryDto.month,
        },
      });

      if (existingSummary) {
        // Update existing summary
        Object.assign(existingSummary, createSummaryDto);
        return await this.summaryRepository.save(existingSummary);
      }

      // Create new summary
      const summary = this.summaryRepository.create(createSummaryDto);
      return await this.summaryRepository.save(summary);
    } catch (error) {
      console.error('Error in AttendanceSummaryService.upsert:', error);
      throw error;
    }
  }

  async findAll(query: { employeeId?: string; month?: string }): Promise<AttendanceSummary[]> {
    const queryBuilder = this.summaryRepository.createQueryBuilder('summary');

    if (query.employeeId) {
      queryBuilder.where('summary.employeeId = :employeeId', { employeeId: query.employeeId });
    }

    if (query.month) {
      const whereCondition = query.employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('summary.month = :month', { month: query.month });
    }

    queryBuilder.orderBy('summary.month', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<AttendanceSummary> {
    const summary = await this.summaryRepository.findOne({
      where: { id },
    });

    if (!summary) {
      throw new NotFoundException(`Attendance summary with ID ${id} not found`);
    }

    return summary;
  }
}

