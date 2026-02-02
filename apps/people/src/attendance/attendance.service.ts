import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    try {
      // Check if attendance record already exists for this employee and date
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          employeeId: createAttendanceDto.employeeId,
          date: new Date(createAttendanceDto.date),
        },
      });

      if (existingAttendance) {
        // Update existing record instead of throwing error
        // This allows users to update their check-in time/location if needed
        Object.assign(existingAttendance, {
          employeeEmail: createAttendanceDto.employeeEmail || existingAttendance.employeeEmail,
          checkInTime: createAttendanceDto.checkInTime ? new Date(createAttendanceDto.checkInTime) : existingAttendance.checkInTime,
          checkInLocation: createAttendanceDto.checkInLocation || existingAttendance.checkInLocation,
          status: createAttendanceDto.status || existingAttendance.status,
        });

        return await this.attendanceRepository.save(existingAttendance);
      }

      const attendance = this.attendanceRepository.create({
        ...createAttendanceDto,
        date: new Date(createAttendanceDto.date),
        checkInTime: createAttendanceDto.checkInTime ? new Date(createAttendanceDto.checkInTime) : null,
        checkOutTime: createAttendanceDto.checkOutTime ? new Date(createAttendanceDto.checkOutTime) : null,
      });

      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      console.error('Error in AttendanceService.create:', error);
      throw error;
    }
  }

  async findAll(query: { sort?: string; employeeId?: string; employeeEmail?: string; date?: string; status?: string }): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository.createQueryBuilder('attendance');

    if (query.employeeId) {
      queryBuilder.where('attendance.employeeId = :employeeId', { employeeId: query.employeeId });
    }

    if (query.employeeEmail) {
      const whereCondition = query.employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('attendance.employeeEmail = :employeeEmail', { employeeEmail: query.employeeEmail });
    }

    if (query.date) {
      const whereCondition = query.employeeId || query.employeeEmail ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('attendance.date = :date', { date: query.date });
    }

    if (query.status) {
      const whereCondition = query.employeeId || query.employeeEmail || query.date ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('attendance.status = :status', { status: query.status });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'date': 'date',
        'created_at': 'createdAt',
        'check_in_time': 'checkInTime',
        'check_out_time': 'checkOutTime',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`attendance.${dbField}`, order);
    } else {
      queryBuilder.orderBy('attendance.date', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);

    // Calculate total hours if check-in and check-out times are provided
    if (updateAttendanceDto.checkOutTime && attendance.checkInTime) {
      const checkIn = new Date(attendance.checkInTime);
      const checkOut = new Date(updateAttendanceDto.checkOutTime);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      updateAttendanceDto.totalHours = diffHours;
      
      // Calculate overtime (assuming 8 hours standard)
      if (diffHours > 8) {
        updateAttendanceDto.overtimeHours = diffHours - 8;
      }
    }

    Object.assign(attendance, {
      ...updateAttendanceDto,
      checkOutTime: updateAttendanceDto.checkOutTime ? new Date(updateAttendanceDto.checkOutTime) : attendance.checkOutTime,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}

