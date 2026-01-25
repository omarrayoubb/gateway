import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<Holiday> {
    const holiday = this.holidayRepository.create({
      ...createHolidayDto,
      date: new Date(createHolidayDto.date),
      isOptional: createHolidayDto.isOptional ?? false,
    });

    return await this.holidayRepository.save(holiday);
  }

  async findAll(): Promise<Holiday[]> {
    return await this.holidayRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }

    return holiday;
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.findOne(id);
    
    const updateData: any = { ...updateHolidayDto };
    if (updateHolidayDto.date) {
      updateData.date = new Date(updateHolidayDto.date);
    }

    Object.assign(holiday, updateData);
    return await this.holidayRepository.save(holiday);
  }

  async remove(id: string): Promise<void> {
    const holiday = await this.findOne(id);
    await this.holidayRepository.remove(holiday);
  }
}

