import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { 
  PeopleService, 
  EmployeeResponse, 
  PaginatedEmployeesResult, 
  DepartmentResponse,
  AttendanceResponse,
  AttendanceSummaryResponse,
  AttendancePolicyResponse,
  LeaveTypeResponse,
  LeaveRequestResponse,
  LeaveBalanceResponse,
  LeaveApprovalResponse,
  LeavePolicyResponse,
  HolidayResponse,
  LeaveAccrualResponse,
} from './people.service';

@Controller('entities/Employee')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Employee?sort=-created_at
   * List all employees with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<EmployeeResponse[]> {
    // Convert string numbers to numbers
    const processedQuery = {
      ...query,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    };
    const result = await this.peopleService.getEmployees(processedQuery);
    return result.data;
  }

  /**
   * GET /entities/Employee/filter?status=active&department=Engineering
   * Filter employees by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<EmployeeResponse[]> {
    // Convert string numbers to numbers
    const processedQuery = {
      ...query,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    };
    const result = await this.peopleService.getEmployees(processedQuery);
    return result.data;
  }

  /**
   * POST /entities/Employee
   * Create a new employee
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeDto: any): Promise<EmployeeResponse> {
    return await this.peopleService.createEmployee(createEmployeeDto);
  }

  /**
   * PUT /entities/Employee/:id
   * Update an employee
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: any,
  ): Promise<EmployeeResponse> {
    return await this.peopleService.updateEmployee(id, updateEmployeeDto);
  }

  /**
   * DELETE /entities/Employee/:id
   * Delete an employee
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.peopleService.deleteEmployee(id);
  }
}

@Controller('entities/Department')
export class DepartmentsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Department
   * List all departments
   */
  @Get()
  async findAll(): Promise<DepartmentResponse[]> {
    return await this.peopleService.getDepartments();
  }

  /**
   * POST /entities/Department
   * Create a new department
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDepartmentDto: any): Promise<DepartmentResponse> {
    return await this.peopleService.createDepartment(createDepartmentDto);
  }

  /**
   * PUT /entities/Department/:id
   * Update a department
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: any,
  ): Promise<DepartmentResponse> {
    return await this.peopleService.updateDepartment(id, updateDepartmentDto);
  }

  /**
   * DELETE /entities/Department/:id
   * Delete a department
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.peopleService.deleteDepartment(id);
  }
}

@Controller('entities/Attendance')
export class AttendanceController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Attendance?sort=-date
   * List all attendance records with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<AttendanceResponse[]> {
    return await this.peopleService.getAttendances(query);
  }

  /**
   * GET /entities/Attendance/filter?employee_email=john@example.com&date=2024-01-19
   * Filter attendance records by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<AttendanceResponse[]> {
    return await this.peopleService.getAttendances(query);
  }

  /**
   * POST /entities/Attendance
   * Create a new attendance record (Check In)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAttendanceDto: any): Promise<AttendanceResponse> {
    try {
      return await this.peopleService.createAttendance(createAttendanceDto);
    } catch (error: any) {
      console.error('Error creating attendance:', error);
      // Map gRPC error codes to HTTP exceptions
      const errorCode = error?.code || error?.status?.code;
      const errorDetails = error?.details || error?.message || error?.status?.details;
      
      if (errorCode === 6) {
        throw new ConflictException(errorDetails || 'Resource already exists');
      } else if (errorCode === 3) {
        throw new BadRequestException(errorDetails || 'Invalid request');
      } else if (errorCode === 5) {
        throw new NotFoundException(errorDetails || 'Resource not found');
      } else if (errorCode) {
        throw new BadRequestException(errorDetails || 'Request failed');
      }
      throw error;
    }
  }

  /**
   * PUT /entities/Attendance/:id
   * Update an attendance record (Check Out)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: any,
  ): Promise<AttendanceResponse> {
    return await this.peopleService.updateAttendance(id, updateAttendanceDto);
  }

  /**
   * DELETE /entities/Attendance/:id
   * Delete an attendance record
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.peopleService.deleteAttendance(id);
  }
}

@Controller('entities/AttendanceSummary')
export class AttendanceSummaryController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/AttendanceSummary
   * List all attendance summaries
   */
  @Get()
  async findAll(@Query() query: any): Promise<AttendanceSummaryResponse[]> {
    return await this.peopleService.getAttendanceSummaries(query);
  }

  /**
   * GET /entities/AttendanceSummary/filter?employee_id=employee-1&month=2024-01
   * Get attendance summaries with filters
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<AttendanceSummaryResponse[]> {
    return await this.peopleService.getAttendanceSummaries(query);
  }

  /**
   * POST /entities/AttendanceSummary
   * Create a new attendance summary
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSummaryDto: any): Promise<AttendanceSummaryResponse> {
    return await this.peopleService.createAttendanceSummary(createSummaryDto);
  }
}

@Controller('entities/AttendancePolicy')
export class AttendancePolicyController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/AttendancePolicy
   * List all attendance policies
   */
  @Get()
  async findAll(): Promise<AttendancePolicyResponse[]> {
    return await this.peopleService.getAttendancePolicies();
  }

  /**
   * POST /entities/AttendancePolicy
   * Create a new attendance policy
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPolicyDto: any): Promise<AttendancePolicyResponse> {
    return await this.peopleService.createAttendancePolicy(createPolicyDto);
  }

  /**
   * PUT /entities/AttendancePolicy/:id
   * Update an attendance policy
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePolicyDto: any,
  ): Promise<AttendancePolicyResponse> {
    return await this.peopleService.updateAttendancePolicy(id, updatePolicyDto);
  }

  /**
   * DELETE /entities/AttendancePolicy/:id
   * Delete an attendance policy
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.peopleService.deleteAttendancePolicy(id);
  }
}

@Controller('entities/LeaveType')
export class LeaveTypesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeaveType
   * List all leave types
   */
  @Get()
  async findAll(): Promise<LeaveTypeResponse[]> {
    return await this.peopleService.getLeaveTypes();
  }

  /**
   * POST /entities/LeaveType
   * Create a new leave type
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveTypeDto: any): Promise<LeaveTypeResponse> {
    return await this.peopleService.createLeaveType(createLeaveTypeDto);
  }
}

@Controller('entities/LeaveRequest')
export class LeaveRequestsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeaveRequest?sort=-created_date
   * List all leave requests
   */
  @Get()
  async findAll(@Query() query: any): Promise<LeaveRequestResponse[]> {
    return await this.peopleService.getLeaveRequests(query);
  }

  /**
   * POST /entities/LeaveRequest
   * Create a new leave request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveRequestDto: any): Promise<LeaveRequestResponse> {
    return await this.peopleService.createLeaveRequest(createLeaveRequestDto);
  }

  /**
   * PUT /entities/LeaveRequest/:id
   * Update a leave request
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: any,
  ): Promise<LeaveRequestResponse> {
    return await this.peopleService.updateLeaveRequest(id, updateLeaveRequestDto);
  }
}

@Controller('entities/LeaveBalance')
export class LeaveBalancesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeaveBalance
   * List all leave balances
   */
  @Get()
  async findAll(@Query() query: any): Promise<LeaveBalanceResponse[]> {
    return await this.peopleService.getLeaveBalances(query);
  }

  /**
   * GET /entities/LeaveBalance/filter?employee_id=employee-1&leave_type=leave-type-1
   * Filter leave balances
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<LeaveBalanceResponse[]> {
    return await this.peopleService.getLeaveBalances(query);
  }
}

@Controller('entities/LeaveApproval')
export class LeaveApprovalsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeaveApproval?sort=-created_date
   * List all leave approvals
   */
  @Get()
  async findAll(@Query() query: any): Promise<LeaveApprovalResponse[]> {
    return await this.peopleService.getLeaveApprovals(query);
  }

  /**
   * PUT /entities/LeaveApproval/:id
   * Update a leave approval
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveApprovalDto: any,
  ): Promise<LeaveApprovalResponse> {
    return await this.peopleService.updateLeaveApproval(id, updateLeaveApprovalDto);
  }
}

@Controller('entities/LeavePolicy')
export class LeavePoliciesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeavePolicy
   * List all leave policies
   */
  @Get()
  async findAll(): Promise<LeavePolicyResponse[]> {
    return await this.peopleService.getLeavePolicies();
  }

  /**
   * POST /entities/LeavePolicy
   * Create a new leave policy
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeavePolicyDto: any): Promise<LeavePolicyResponse> {
    return await this.peopleService.createLeavePolicy(createLeavePolicyDto);
  }
}

@Controller('entities/Holiday')
export class HolidaysController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Holiday
   * List all holidays
   */
  @Get()
  async findAll(): Promise<HolidayResponse[]> {
    return await this.peopleService.getHolidays();
  }

  /**
   * POST /entities/Holiday
   * Create a new holiday
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHolidayDto: any): Promise<HolidayResponse> {
    return await this.peopleService.createHoliday(createHolidayDto);
  }
}

@Controller('entities/LeaveAccrual')
export class LeaveAccrualsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LeaveAccrual
   * List all leave accruals
   */
  @Get()
  async findAll(): Promise<LeaveAccrualResponse[]> {
    return await this.peopleService.getLeaveAccruals();
  }
}

