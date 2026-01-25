import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Controller()
export class HolidaysGrpcController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @GrpcMethod('HolidayService', 'GetHoliday')
  async getHoliday(data: { id: string }) {
    try {
      const holiday = await this.holidaysService.findOne(data.id);
      return this.mapHolidayToProto(holiday);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get holiday',
      });
    }
  }

  @GrpcMethod('HolidayService', 'GetHolidays')
  async getHolidays(data: {}) {
    try {
      const holidays = await this.holidaysService.findAll();
      return {
        holidays: holidays.map(h => this.mapHolidayToProto(h)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get holidays',
      });
    }
  }

  @GrpcMethod('HolidayService', 'CreateHoliday')
  async createHoliday(data: any) {
    try {
      const createDto: CreateHolidayDto = {
        name: data.name,
        date: data.date,
        isOptional: data.isOptional || false,
      };

      const holiday = await this.holidaysService.create(createDto);
      return this.mapHolidayToProto(holiday);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create holiday',
      });
    }
  }

  @GrpcMethod('HolidayService', 'UpdateHoliday')
  async updateHoliday(data: any) {
    try {
      const updateDto: UpdateHolidayDto = {
        name: data.name || undefined,
        date: data.date || undefined,
        isOptional: data.isOptional !== undefined ? data.isOptional : undefined,
      };
      const holiday = await this.holidaysService.update(data.id, updateDto);
      return this.mapHolidayToProto(holiday);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update holiday',
      });
    }
  }

  @GrpcMethod('HolidayService', 'DeleteHoliday')
  async deleteHoliday(data: { id: string }) {
    try {
      await this.holidaysService.remove(data.id);
      return { success: true, message: 'Holiday deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete holiday',
      });
    }
  }

  private mapHolidayToProto(holiday: any) {
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
      id: holiday.id,
      name: holiday.name,
      date: formatDate(holiday.date),
      isOptional: holiday.isOptional || false,
      createdAt: formatDateTime(holiday.createdAt),
    };
  }
}

