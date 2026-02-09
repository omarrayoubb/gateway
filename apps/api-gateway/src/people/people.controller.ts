import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  PayrollRecordResponse,
  PayrollConfigurationResponse,
  PayrollExceptionResponse,
  CustomPayrollComponentResponse,
  PerformanceReviewResponse,
  PerformanceGoalResponse,
  ReviewCycleResponse,
  ReviewTemplateResponse,
  GoalResponse,
  SkillResponse,
  EmployeeSkillResponse,
  CompetencyResponse,
  CompetencyAssessmentResponse,
  CourseResponse,
  CourseEnrollmentResponse,
  LearningPathResponse,
  CertificationResponse,
  EmployeeCertificationResponse,
  CareerPathResponse,
  CareerPathEnrollmentResponse,
  AnnouncementResponse,
  MessageResponse,
  JobPostingResponse,
  ApplicantResponse,
  OnboardingPlanResponse,
  OnboardingTaskResponse,
} from './people.service';
import { AccountsService } from '../accounts/accounts.service';

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
   * GET /entities/Employee/:id
   * Get a single employee by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmployeeResponse> {
    return await this.peopleService.getEmployee(id);
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

  /**
   * PUT /entities/LeaveType/:id
   * Update a leave type
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: any,
  ): Promise<LeaveTypeResponse> {
    return await this.peopleService.updateLeaveType(id, updateLeaveTypeDto);
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
   * GET /entities/LeaveRequest/filter?employee_id=...&status=...
   * Filter leave requests by employee_id, status, etc.
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<LeaveRequestResponse[]> {
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

  /**
   * POST /entities/LeaveBalance/adjust
   * Add or subtract days/hours from an employee's leave balance.
   * Body: { employee_id, leave_type, year? (default current), balance_delta } — positive = add, negative = subtract
   */
  @Post('adjust')
  async adjust(@Body() body: any): Promise<LeaveBalanceResponse> {
    return await this.peopleService.adjustLeaveBalance(body);
  }

  /**
   * POST /entities/LeaveBalance
   * Create a new leave balance record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveBalanceDto: any): Promise<LeaveBalanceResponse> {
    return await this.peopleService.createLeaveBalance(createLeaveBalanceDto);
  }

  /**
   * PUT /entities/LeaveBalance/:id
   * Update a leave balance record
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveBalanceDto: any,
  ): Promise<LeaveBalanceResponse> {
    return await this.peopleService.updateLeaveBalance(id, updateLeaveBalanceDto);
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

@Controller('entities/PayrollRecord')
export class PayrollRecordsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/PayrollRecord?sort=-pay_period
   * List all payroll records with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<PayrollRecordResponse[]> {
    return await this.peopleService.getPayrollRecords(query);
  }

  /**
   * GET /entities/PayrollRecord/filter?employee_id=employee-1&pay_period=2024-01
   * Filter payroll records by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<PayrollRecordResponse[]> {
    return await this.peopleService.getPayrollRecords(query);
  }

  /**
   * POST /entities/PayrollRecord
   * Create a new payroll record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPayrollRecordDto: any): Promise<PayrollRecordResponse> {
    return await this.peopleService.createPayrollRecord(createPayrollRecordDto);
  }

  /**
   * PUT /entities/PayrollRecord/:id
   * Update a payroll record
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePayrollRecordDto: any,
  ): Promise<PayrollRecordResponse> {
    return await this.peopleService.updatePayrollRecord(id, updatePayrollRecordDto);
  }
}

@Controller('entities/PayrollConfiguration')
export class PayrollConfigurationsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/PayrollConfiguration
   * List all payroll configurations
   */
  @Get()
  async findAll(): Promise<PayrollConfigurationResponse[]> {
    return await this.peopleService.getPayrollConfigurations();
  }

  /**
   * POST /entities/PayrollConfiguration
   * Create a new payroll configuration
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPayrollConfigurationDto: any): Promise<PayrollConfigurationResponse> {
    return await this.peopleService.createPayrollConfiguration(createPayrollConfigurationDto);
  }
}

@Controller('entities/PayrollException')
export class PayrollExceptionsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/PayrollException
   * List all payroll exceptions
   */
  @Get()
  async findAll(): Promise<PayrollExceptionResponse[]> {
    return await this.peopleService.getPayrollExceptions();
  }

  /**
   * POST /entities/PayrollException
   * Create a new payroll exception
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPayrollExceptionDto: any): Promise<PayrollExceptionResponse> {
    return await this.peopleService.createPayrollException(createPayrollExceptionDto);
  }
}

@Controller('entities/CustomPayrollComponent')
export class CustomPayrollComponentsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/CustomPayrollComponent
   * List all custom payroll components
   */
  @Get()
  async findAll(): Promise<CustomPayrollComponentResponse[]> {
    return await this.peopleService.getCustomPayrollComponents();
  }

  /**
   * POST /entities/CustomPayrollComponent
   * Create a new custom payroll component
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomPayrollComponentDto: any): Promise<CustomPayrollComponentResponse> {
    return await this.peopleService.createCustomPayrollComponent(createCustomPayrollComponentDto);
  }
}

@Controller('entities/PerformanceReview')
export class PerformanceReviewsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/PerformanceReview?sort=-review_date
   * List all performance reviews with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<PerformanceReviewResponse[]> {
    return await this.peopleService.getPerformanceReviews(query);
  }

  /**
   * POST /entities/PerformanceReview
   * Create a new performance review
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPerformanceReviewDto: any): Promise<PerformanceReviewResponse> {
    return await this.peopleService.createPerformanceReview(createPerformanceReviewDto);
  }

  /**
   * PUT /entities/PerformanceReview/:id
   * Update a performance review
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePerformanceReviewDto: any,
  ): Promise<PerformanceReviewResponse> {
    return await this.peopleService.updatePerformanceReview(id, updatePerformanceReviewDto);
  }
}

@Controller('entities/PerformanceGoal')
export class PerformanceGoalsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/PerformanceGoal
   * List all performance goals
   */
  @Get()
  async findAll(): Promise<PerformanceGoalResponse[]> {
    return await this.peopleService.getPerformanceGoals();
  }

  /**
   * POST /entities/PerformanceGoal
   * Create a new performance goal
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPerformanceGoalDto: any): Promise<PerformanceGoalResponse> {
    return await this.peopleService.createPerformanceGoal(createPerformanceGoalDto);
  }
}

@Controller('entities/ReviewCycle')
export class ReviewCyclesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/ReviewCycle
   * List all review cycles
   */
  @Get()
  async findAll(): Promise<ReviewCycleResponse[]> {
    return await this.peopleService.getReviewCycles();
  }

  /**
   * POST /entities/ReviewCycle
   * Create a new review cycle
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReviewCycleDto: any): Promise<ReviewCycleResponse> {
    return await this.peopleService.createReviewCycle(createReviewCycleDto);
  }
}

@Controller('entities/ReviewTemplate')
export class ReviewTemplatesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/ReviewTemplate
   * List all review templates
   */
  @Get()
  async findAll(): Promise<ReviewTemplateResponse[]> {
    return await this.peopleService.getReviewTemplates();
  }

  /**
   * POST /entities/ReviewTemplate
   * Create a new review template
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReviewTemplateDto: any): Promise<ReviewTemplateResponse> {
    return await this.peopleService.createReviewTemplate(createReviewTemplateDto);
  }
}

@Controller('entities/Goal')
export class GoalsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Goal?sort=-created_at
   * List all goals with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<GoalResponse[]> {
    return await this.peopleService.getGoals(query);
  }

  /**
   * GET /entities/Goal/filter?employee_id=employee-1&status=active
   * Filter goals by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<GoalResponse[]> {
    return await this.peopleService.getGoals(query);
  }

  /**
   * POST /entities/Goal
   * Create a new goal
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGoalDto: any): Promise<GoalResponse> {
    return await this.peopleService.createGoal(createGoalDto);
  }

  /**
   * PUT /entities/Goal/:id
   * Update a goal
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: any,
  ): Promise<GoalResponse> {
    return await this.peopleService.updateGoal(id, updateGoalDto);
  }

  /**
   * DELETE /entities/Goal/:id
   * Delete a goal
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.peopleService.deleteGoal(id);
  }
}

@Controller('entities/Skill')
export class SkillsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Skill
   * List all skills
   */
  @Get()
  async findAll(): Promise<SkillResponse[]> {
    return await this.peopleService.getSkills();
  }

  /**
   * POST /entities/Skill
   * Create a new skill
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: any): Promise<SkillResponse> {
    return await this.peopleService.createSkill(createSkillDto);
  }
}

@Controller('entities/EmployeeSkill')
export class EmployeeSkillsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/EmployeeSkill
   * List all employee skills
   */
  @Get()
  async findAll(@Query() query: any): Promise<EmployeeSkillResponse[]> {
    return await this.peopleService.getEmployeeSkills(query);
  }

  /**
   * GET /entities/EmployeeSkill/filter?employee_id=employee-1
   * Filter employee skills by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<EmployeeSkillResponse[]> {
    return await this.peopleService.getEmployeeSkills(query);
  }

  /**
   * POST /entities/EmployeeSkill
   * Create a new employee skill
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeSkillDto: any): Promise<EmployeeSkillResponse> {
    return await this.peopleService.createEmployeeSkill(createEmployeeSkillDto);
  }

  /**
   * PUT /entities/EmployeeSkill/:id
   * Update an employee skill
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeSkillDto: any,
  ): Promise<EmployeeSkillResponse> {
    return await this.peopleService.updateEmployeeSkill(id, updateEmployeeSkillDto);
  }
}

@Controller('entities/Competency')
export class CompetenciesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Competency
   * List all competencies
   */
  @Get()
  async findAll(): Promise<CompetencyResponse[]> {
    return await this.peopleService.getCompetencies();
  }

  /**
   * POST /entities/Competency
   * Create a new competency
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompetencyDto: any): Promise<CompetencyResponse> {
    return await this.peopleService.createCompetency(createCompetencyDto);
  }
}

@Controller('entities/CompetencyAssessment')
export class CompetencyAssessmentsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/CompetencyAssessment
   * List all competency assessments
   */
  @Get()
  async findAll(@Query() query: any): Promise<CompetencyAssessmentResponse[]> {
    return await this.peopleService.getCompetencyAssessments(query);
  }

  /**
   * GET /entities/CompetencyAssessment/filter?employee_id=employee-1
   * Filter competency assessments by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<CompetencyAssessmentResponse[]> {
    return await this.peopleService.getCompetencyAssessments(query);
  }

  /**
   * POST /entities/CompetencyAssessment
   * Create a new competency assessment
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompetencyAssessmentDto: any): Promise<CompetencyAssessmentResponse> {
    return await this.peopleService.createCompetencyAssessment(createCompetencyAssessmentDto);
  }
}

@Controller('entities/Course')
export class CoursesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Course?sort=-created_at
   * List all courses with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<CourseResponse[]> {
    return await this.peopleService.getCourses(query);
  }

  /**
   * POST /entities/Course
   * Create a new course
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: any): Promise<CourseResponse> {
    return await this.peopleService.createCourse(createCourseDto);
  }

  /**
   * PUT /entities/Course/:id
   * Update a course
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: any,
  ): Promise<CourseResponse> {
    return await this.peopleService.updateCourse(id, updateCourseDto);
  }
}

@Controller('entities/CourseEnrollment')
export class CourseEnrollmentsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/CourseEnrollment
   * List all course enrollments
   */
  @Get()
  async findAll(@Query() query: any): Promise<CourseEnrollmentResponse[]> {
    return await this.peopleService.getCourseEnrollments(query);
  }

  /**
   * GET /entities/CourseEnrollment/filter?employee_id=employee-1&status=enrolled
   * Filter course enrollments by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<CourseEnrollmentResponse[]> {
    return await this.peopleService.getCourseEnrollments(query);
  }

  /**
   * POST /entities/CourseEnrollment
   * Create a new course enrollment
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseEnrollmentDto: any): Promise<CourseEnrollmentResponse> {
    return await this.peopleService.createCourseEnrollment(createCourseEnrollmentDto);
  }

  /**
   * PUT /entities/CourseEnrollment/:id
   * Update a course enrollment
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseEnrollmentDto: any,
  ): Promise<CourseEnrollmentResponse> {
    return await this.peopleService.updateCourseEnrollment(id, updateCourseEnrollmentDto);
  }
}

@Controller('entities/LearningPath')
export class LearningPathsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/LearningPath
   * List all learning paths
   */
  @Get()
  async findAll(): Promise<LearningPathResponse[]> {
    return await this.peopleService.getLearningPaths();
  }

  /**
   * POST /entities/LearningPath
   * Create a new learning path
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLearningPathDto: any): Promise<LearningPathResponse> {
    return await this.peopleService.createLearningPath(createLearningPathDto);
  }
}

@Controller('entities/Certification')
export class CertificationsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Certification
   * List all certifications
   */
  @Get()
  async findAll(): Promise<CertificationResponse[]> {
    return await this.peopleService.getCertifications();
  }

  /**
   * POST /entities/Certification
   * Create a new certification
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCertificationDto: any): Promise<CertificationResponse> {
    return await this.peopleService.createCertification(createCertificationDto);
  }
}

@Controller('entities/EmployeeCertification')
export class EmployeeCertificationsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/EmployeeCertification
   * List all employee certifications
   */
  @Get()
  async findAll(@Query() query: any): Promise<EmployeeCertificationResponse[]> {
    return await this.peopleService.getEmployeeCertifications(query);
  }

  /**
   * GET /entities/EmployeeCertification/filter?employee_id=employee-1
   * Filter employee certifications by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<EmployeeCertificationResponse[]> {
    return await this.peopleService.getEmployeeCertifications(query);
  }

  /**
   * POST /entities/EmployeeCertification
   * Create a new employee certification
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeCertificationDto: any): Promise<EmployeeCertificationResponse> {
    return await this.peopleService.createEmployeeCertification(createEmployeeCertificationDto);
  }
}

@Controller('entities/CareerPath')
export class CareerPathsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/CareerPath
   * List all career paths
   */
  @Get()
  async findAll(): Promise<CareerPathResponse[]> {
    return await this.peopleService.getCareerPaths();
  }

  /**
   * POST /entities/CareerPath
   * Create a new career path
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCareerPathDto: any): Promise<CareerPathResponse> {
    return await this.peopleService.createCareerPath(createCareerPathDto);
  }
}

@Controller('entities/CareerPathEnrollment')
export class CareerPathEnrollmentsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/CareerPathEnrollment
   * List all career path enrollments
   */
  @Get()
  async findAll(@Query() query: any): Promise<CareerPathEnrollmentResponse[]> {
    return await this.peopleService.getCareerPathEnrollments(query);
  }

  /**
   * GET /entities/CareerPathEnrollment/filter?employee_id=employee-1
   * Filter career path enrollments by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<CareerPathEnrollmentResponse[]> {
    return await this.peopleService.getCareerPathEnrollments(query);
  }

  /**
   * POST /entities/CareerPathEnrollment
   * Create a new career path enrollment
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCareerPathEnrollmentDto: any): Promise<CareerPathEnrollmentResponse> {
    return await this.peopleService.createCareerPathEnrollment(createCareerPathEnrollmentDto);
  }

  /**
   * PUT /entities/CareerPathEnrollment/:id
   * Update a career path enrollment
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCareerPathEnrollmentDto: any,
  ): Promise<CareerPathEnrollmentResponse> {
    return await this.peopleService.updateCareerPathEnrollment(id, updateCareerPathEnrollmentDto);
  }
}

@Controller('entities/Announcement')
export class AnnouncementsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Announcement?sort=-created_at
   * List all announcements with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<AnnouncementResponse[]> {
    return await this.peopleService.getAnnouncements(query);
  }

  /**
   * POST /entities/Announcement
   * Create a new announcement
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAnnouncementDto: any): Promise<AnnouncementResponse> {
    return await this.peopleService.createAnnouncement(createAnnouncementDto);
  }
}

@Controller('entities/Message')
export class MessagesController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Message?sort=-created_at&filter[recipient_id]=employee-1
   * List messages with optional sorting and filtering
   */
  @Get()
  async findAll(@Query() query: any): Promise<MessageResponse[]> {
    // Handle filter query parameters
    const filterQuery: any = {
      sort: query.sort,
    };
    
    // Support both filter[recipient_id] and recipient_id formats
    if (query['filter[recipient_id]']) {
      filterQuery.recipient_id = query['filter[recipient_id]'];
    } else if (query.recipient_id) {
      filterQuery.recipient_id = query.recipient_id;
    }
    
    if (query['filter[sender_id]']) {
      filterQuery.sender_id = query['filter[sender_id]'];
    } else if (query.sender_id) {
      filterQuery.sender_id = query.sender_id;
    }

    return await this.peopleService.getMessages(filterQuery);
  }

  /**
   * GET /entities/Message/filter?recipient_id=...&sender_id=...
   * Filter messages by recipient or sender
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<MessageResponse[]> {
    return await this.peopleService.getMessages(query);
  }

  /**
   * POST /entities/Message
   * Create a new message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMessageDto: any): Promise<MessageResponse> {
    return await this.peopleService.createMessage(createMessageDto);
  }

  /**
   * PUT /entities/Message/:id
   * Update a message (e.g., mark as read)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: any,
  ): Promise<MessageResponse> {
    return await this.peopleService.updateMessage(id, updateMessageDto);
  }
}

@Controller('entities/JobPosting')
export class JobPostingsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/JobPosting?sort=-created_at
   * List all job postings with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<JobPostingResponse[]> {
    return await this.peopleService.getJobPostings(query);
  }

  /**
   * GET /entities/JobPosting/filter?status=open
   * Filter job postings by status, etc.
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<JobPostingResponse[]> {
    return await this.peopleService.getJobPostings(query);
  }

  /**
   * POST /entities/JobPosting
   * Create a new job posting
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createJobPostingDto: any): Promise<JobPostingResponse> {
    return await this.peopleService.createJobPosting(createJobPostingDto);
  }

  /**
   * PUT /entities/JobPosting/:id
   * Update a job posting
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobPostingDto: any,
  ): Promise<JobPostingResponse> {
    return await this.peopleService.updateJobPosting(id, updateJobPostingDto);
  }
}

@Controller('entities/Applicant')
export class ApplicantsController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/Applicant?sort=-created_at
   * List all applicants with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<ApplicantResponse[]> {
    return await this.peopleService.getApplicants(query);
  }

  /**
   * GET /entities/Applicant/filter?job_posting_id=job-1&status=applied
   * Filter applicants by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<ApplicantResponse[]> {
    return await this.peopleService.getApplicants(query);
  }

  /**
   * POST /entities/Applicant
   * Create a new applicant
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createApplicantDto: any): Promise<ApplicantResponse> {
    return await this.peopleService.createApplicant(createApplicantDto);
  }

  /**
   * PUT /entities/Applicant/:id
   * Update an applicant (e.g., update status, interview details)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApplicantDto: any,
  ): Promise<ApplicantResponse> {
    return await this.peopleService.updateApplicant(id, updateApplicantDto);
  }
}

@Controller('entities/OnboardingPlan')
export class OnboardingPlansController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/OnboardingPlan?sort=-created_at
   * List all onboarding plans with optional sorting
   */
  @Get()
  async findAll(@Query() query: any): Promise<OnboardingPlanResponse[]> {
    return await this.peopleService.getOnboardingPlans(query);
  }

  /**
   * POST /entities/OnboardingPlan
   * Create a new onboarding plan
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOnboardingPlanDto: any): Promise<OnboardingPlanResponse> {
    return await this.peopleService.createOnboardingPlan(createOnboardingPlanDto);
  }

  /**
   * PUT /entities/OnboardingPlan/:id
   * Update an onboarding plan
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOnboardingPlanDto: any,
  ): Promise<OnboardingPlanResponse> {
    return await this.peopleService.updateOnboardingPlan(id, updateOnboardingPlanDto);
  }
}

@Controller('entities/OnboardingTask')
export class OnboardingTasksController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * GET /entities/OnboardingTask
   * List all onboarding tasks
   */
  @Get()
  async findAll(@Query() query: any): Promise<OnboardingTaskResponse[]> {
    return await this.peopleService.getOnboardingTasks(query);
  }

  /**
   * GET /entities/OnboardingTask/filter?onboarding_plan_id=plan-1&status=pending
   * Filter onboarding tasks by any field
   */
  @Get('filter')
  async filter(@Query() query: any): Promise<OnboardingTaskResponse[]> {
    return await this.peopleService.getOnboardingTasks(query);
  }

  /**
   * POST /entities/OnboardingTask
   * Create a new onboarding task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOnboardingTaskDto: any): Promise<OnboardingTaskResponse> {
    return await this.peopleService.createOnboardingTask(createOnboardingTaskDto);
  }

  /**
   * PUT /entities/OnboardingTask/:id
   * Update an onboarding task (e.g., mark as completed)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOnboardingTaskDto: any,
  ): Promise<OnboardingTaskResponse> {
    return await this.peopleService.updateOnboardingTask(id, updateOnboardingTaskDto);
  }
}

// ============================================
// AUTHENTICATION CONTROLLERS (delegate to Accounts only)
// ============================================
@Controller('auth')
export class AuthController {
  constructor(
    private readonly peopleService: PeopleService,
    private readonly accountsService: AccountsService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: any) {
    return this.accountsService.register(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.accountsService.login(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Headers('authorization') authorization: string) {
    const token = authorization?.replace?.('Bearer ', '') ?? '';
    return this.accountsService.getProfile(token);
  }
}

@Controller('entities/User')
export class UsersController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return await this.peopleService.getUsers(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.peopleService.getUser(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any): Promise<any> {
    return await this.peopleService.updateUser(id, body);
  }
}

// ============================================
// HIERARCHY CONTROLLERS
// ============================================
@Controller('hierarchy')
export class HierarchyController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get('employee/:id/subordinates')
  async getSubordinates(@Param('id') id: string): Promise<any[]> {
    return await this.peopleService.getSubordinates(id);
  }

  @Get('employee/:id/tree')
  async getSubordinatesTree(@Param('id') id: string): Promise<any> {
    return await this.peopleService.getSubordinatesTree(id);
  }

  @Get('employee/:id/ancestors')
  async getAncestors(@Param('id') id: string): Promise<any[]> {
    return await this.peopleService.getAncestors(id);
  }

  @Get('organization')
  async getOrganizationTree(): Promise<any> {
    return await this.peopleService.getOrganizationTree();
  }
}

// ============================================
// APPROVAL CONTROLLERS
// ============================================
@Controller('entities/Approval')
export class ApprovalsController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any): Promise<any> {
    return await this.peopleService.createApproval(body);
  }

  @Get()
  async findAll(@Query() query: any): Promise<any[]> {
    return await this.peopleService.getApprovals(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.peopleService.getApproval(id);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body() body: any, @Headers('authorization') auth: string): Promise<any> {
    // TODO: Extract approverId from JWT token
    const approverId = body.approver_id || body.approverId || 'temp';
    return await this.peopleService.approveApproval(id, approverId, body);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body() body: any, @Headers('authorization') auth: string): Promise<any> {
    // TODO: Extract approverId from JWT token
    const approverId = body.approver_id || body.approverId || 'temp';
    return await this.peopleService.rejectApproval(id, approverId, body);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string): Promise<any[]> {
    return await this.peopleService.getApprovalHistory(id);
  }
}

// ============================================
// NOTIFICATION CONTROLLERS
// ============================================
@Controller('entities/Notification')
export class NotificationsController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll(@Query() query: any, @Headers('authorization') auth: string): Promise<any[]> {
    // TODO: Extract userId from JWT token
    const userId = query.user_id || query.userId || 'temp';
    return await this.peopleService.getNotifications(userId, query);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Headers('authorization') auth: string): Promise<any> {
    // TODO: Extract userId from JWT token
    const userId = 'temp';
    return await this.peopleService.markNotificationAsRead(id, userId);
  }

  @Put('mark-all-read')
  async markAllAsRead(@Headers('authorization') auth: string): Promise<any> {
    // TODO: Extract userId from JWT token
    const userId = 'temp';
    return await this.peopleService.markAllNotificationsAsRead(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Headers('authorization') auth: string): Promise<{ count: number }> {
    // TODO: Extract userId from JWT token
    const userId = 'temp';
    const count = await this.peopleService.getUnreadNotificationCount(userId);
    return { count };
  }
}

// ============================================
// AUDIT LOG CONTROLLERS
// ============================================
@Controller('entities/AuditLog')
export class AuditLogsController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll(@Query() query: any): Promise<any> {
    return await this.peopleService.getAuditLogs(query);
  }
}

