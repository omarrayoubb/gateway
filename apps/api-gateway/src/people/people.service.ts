import { Injectable, OnModuleInit, Inject, BadRequestException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

interface PeopleGrpcService {
  GetPerson(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetPeople(data: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    status?: string;
    department?: string;
  }, metadata?: Metadata): Observable<any>;
  CreatePerson(data: any, metadata?: Metadata): Observable<any>;
  UpdatePerson(data: any, metadata?: Metadata): Observable<any>;
  DeletePerson(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface DepartmentsGrpcService {
  GetDepartment(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetDepartments(data: {}, metadata?: Metadata): Observable<any>;
  CreateDepartment(data: any, metadata?: Metadata): Observable<any>;
  UpdateDepartment(data: any, metadata?: Metadata): Observable<any>;
  DeleteDepartment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AttendanceGrpcService {
  GetAttendance(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetAttendances(data: {
    sort?: string;
    employeeId?: string;
    employeeEmail?: string;
    date?: string;
    status?: string;
  }, metadata?: Metadata): Observable<any>;
  CreateAttendance(data: any, metadata?: Metadata): Observable<any>;
  UpdateAttendance(data: any, metadata?: Metadata): Observable<any>;
  DeleteAttendance(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AttendanceSummaryGrpcService {
  GetAttendanceSummary(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetAttendanceSummaries(data: {
    employeeId?: string;
    month?: string;
  }, metadata?: Metadata): Observable<any>;
  CreateAttendanceSummary(data: any, metadata?: Metadata): Observable<any>;
}

interface AttendancePolicyGrpcService {
  GetAttendancePolicy(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetAttendancePolicies(data: {}, metadata?: Metadata): Observable<any>;
  CreateAttendancePolicy(data: any, metadata?: Metadata): Observable<any>;
  UpdateAttendancePolicy(data: any, metadata?: Metadata): Observable<any>;
  DeleteAttendancePolicy(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeaveTypeGrpcService {
  GetLeaveType(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeaveTypes(data: {}, metadata?: Metadata): Observable<any>;
  CreateLeaveType(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeaveType(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeaveType(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeaveRequestGrpcService {
  GetLeaveRequest(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeaveRequests(data: { sort?: string; employeeId?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateLeaveRequest(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeaveRequest(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeaveRequest(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeaveBalanceGrpcService {
  GetLeaveBalance(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeaveBalances(data: { employeeId?: string; leaveType?: string; year?: string }, metadata?: Metadata): Observable<any>;
  CreateLeaveBalance(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeaveBalance(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeaveBalance(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeaveApprovalGrpcService {
  GetLeaveApproval(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeaveApprovals(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreateLeaveApproval(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeaveApproval(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeaveApproval(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeavePolicyGrpcService {
  GetLeavePolicy(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeavePolicies(data: {}, metadata?: Metadata): Observable<any>;
  CreateLeavePolicy(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeavePolicy(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeavePolicy(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface HolidayGrpcService {
  GetHoliday(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetHolidays(data: {}, metadata?: Metadata): Observable<any>;
  CreateHoliday(data: any, metadata?: Metadata): Observable<any>;
  UpdateHoliday(data: any, metadata?: Metadata): Observable<any>;
  DeleteHoliday(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LeaveAccrualGrpcService {
  GetLeaveAccrual(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLeaveAccruals(data: {}, metadata?: Metadata): Observable<any>;
  CreateLeaveAccrual(data: any, metadata?: Metadata): Observable<any>;
  UpdateLeaveAccrual(data: any, metadata?: Metadata): Observable<any>;
  DeleteLeaveAccrual(data: { id: string }, metadata?: Metadata): Observable<any>;
}

export interface EmployeeResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  department_id: string;
  job_title: string;
  hire_date: string;
  status: string;
  manager_email: string;
  address: string;
  city: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  created_at: string;
}

export interface PaginatedEmployeesResult {
  data: EmployeeResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  manager_email: string;
  parent_department_id: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceResponse {
  id: string;
  employee_id: string;
  employee_email: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  check_in_location: string;
  check_out_location: string;
  total_hours: number;
  overtime_hours: number;
  is_late: boolean;
  late_arrival_minutes: number;
  early_departure_minutes: number;
  deduction_amount: number;
  status: string;
  created_at: string;
}

export interface AttendanceSummaryResponse {
  id: string;
  employee_id: string;
  month: string;
  days_present: number;
  days_absent: number;
  total_hours: number;
  late_arrivals_count: number;
  overtime_hours: number;
  total_deductions: number;
  status: string;
  created_at: string;
}

export interface AttendancePolicyResponse {
  id: string;
  name: string;
  expected_start_time: string;
  expected_end_time: string;
  grace_period_minutes: number;
  minimum_hours_for_full_day: number;
  standard_work_hours: number;
  standard_work_days: number;
  late_arrival_deduction_per_hour: number;
  early_departure_deduction_per_hour: number;
  absent_day_deduction: number;
  half_day_deduction: number;
  overtime_multiplier: number;
  created_at: string;
}

export interface LeaveTypeResponse {
  id: string;
  name: string;
  description: string;
  quota: number;
  carry_forward: boolean;
  requires_approval: boolean;
  created_at: string;
}

export interface LeaveRequestResponse {
  id: string;
  employee_id: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: string;
  created_at: string;
}

export interface LeaveBalanceResponse {
  id: string;
  employee_id: string;
  leave_type: string;
  balance: number;
  used: number;
  accrued: number;
  carried_forward: number;
  year: number;
  updated_at: string;
}

export interface LeaveApprovalResponse {
  id: string;
  leave_request_id: string;
  approver_id: string;
  status: string;
  approval_level: number;
  approved_date: string | null;
  rejected_date: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface LeavePolicyResponse {
  id: string;
  name: string;
  description: string;
  max_carry_forward_days: number;
  accrual_rate: number;
  created_at: string;
}

export interface HolidayResponse {
  id: string;
  name: string;
  date: string;
  is_optional: boolean;
  created_at: string;
}

export interface LeaveAccrualResponse {
  id: string;
  employee_id: string;
  leave_type: string;
  accrual_date: string;
  days_accrued: number;
  description: string;
  created_at: string;
}

@Injectable()
export class PeopleService implements OnModuleInit {
  private peopleGrpcService: PeopleGrpcService;
  private departmentsGrpcService: DepartmentsGrpcService;
  private attendanceGrpcService: AttendanceGrpcService;
  private attendanceSummaryGrpcService: AttendanceSummaryGrpcService;
  private attendancePolicyGrpcService: AttendancePolicyGrpcService;
  private leaveTypeGrpcService: LeaveTypeGrpcService;
  private leaveRequestGrpcService: LeaveRequestGrpcService;
  private leaveBalanceGrpcService: LeaveBalanceGrpcService;
  private leaveApprovalGrpcService: LeaveApprovalGrpcService;
  private leavePolicyGrpcService: LeavePolicyGrpcService;
  private holidayGrpcService: HolidayGrpcService;
  private leaveAccrualGrpcService: LeaveAccrualGrpcService;

  constructor(
    @Inject('PEOPLE_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.peopleGrpcService = this.client.getService<PeopleGrpcService>('PeopleService');
    this.departmentsGrpcService = this.client.getService<DepartmentsGrpcService>('DepartmentsService');
    this.attendanceGrpcService = this.client.getService<AttendanceGrpcService>('AttendanceService');
    this.attendanceSummaryGrpcService = this.client.getService<AttendanceSummaryGrpcService>('AttendanceSummaryService');
    this.attendancePolicyGrpcService = this.client.getService<AttendancePolicyGrpcService>('AttendancePolicyService');
    this.leaveTypeGrpcService = this.client.getService<LeaveTypeGrpcService>('LeaveTypeService');
    this.leaveRequestGrpcService = this.client.getService<LeaveRequestGrpcService>('LeaveRequestService');
    this.leaveBalanceGrpcService = this.client.getService<LeaveBalanceGrpcService>('LeaveBalanceService');
    this.leaveApprovalGrpcService = this.client.getService<LeaveApprovalGrpcService>('LeaveApprovalService');
    this.leavePolicyGrpcService = this.client.getService<LeavePolicyGrpcService>('LeavePolicyService');
    this.holidayGrpcService = this.client.getService<HolidayGrpcService>('HolidayService');
    this.leaveAccrualGrpcService = this.client.getService<LeaveAccrualGrpcService>('LeaveAccrualService');
  }

  async getEmployee(id: string): Promise<EmployeeResponse> {
    const result = await firstValueFrom(
      this.peopleGrpcService.GetPerson({ id })
    );
    return this.mapToEmployeeResponse(result);
  }

  async getEmployees(query: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    status?: string;
    department?: string;
    department_id?: string;
    [key: string]: any; // Allow any additional filter fields
  }): Promise<PaginatedEmployeesResult> {
    const { page = 1, limit = 10, sort, status, department, department_id, search, ...otherFilters } = query;
    
    // Get all employees (we'll filter client-side for fields not supported by gRPC)
    const result = await firstValueFrom(
      this.peopleGrpcService.GetPeople({
        page: 1, // Get all for filtering, then paginate
        limit: 10000, // Large limit to get all records
        search,
        sort,
        status,
        department: department || undefined,
      })
    );

    let employees = result.people || [];
    
    // Apply additional filters
    if (department_id) {
      employees = employees.filter((emp: any) => emp.department_id === department_id);
    }
    
    // Filter by any other fields
    Object.keys(otherFilters).forEach((key) => {
      if (otherFilters[key] !== undefined && otherFilters[key] !== null && otherFilters[key] !== '') {
        const fieldMap: Record<string, string> = {
          'position': 'position',
          'job_title': 'job_title',
          'manager_email': 'manager_email',
          'city': 'city',
          'country': 'country',
        };
        const field = fieldMap[key] || key;
        employees = employees.filter((emp: any) => {
          const value = emp[field];
          return value && value.toString().toLowerCase().includes(otherFilters[key].toString().toLowerCase());
        });
      }
    });

    // Apply pagination after filtering
    const total = employees.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmployees = employees.slice(startIndex, endIndex);

    return {
      data: paginatedEmployees.map((emp: any) => this.mapToEmployeeResponse(emp)),
      total,
      page,
      limit,
    };
  }

  async createEmployee(data: any): Promise<EmployeeResponse> {
    const result = await firstValueFrom(
      this.peopleGrpcService.CreatePerson({
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        departmentId: data.department_id || data.departmentId,
        jobTitle: data.job_title || data.jobTitle,
        hireDate: data.hire_date || data.hireDate,
        status: data.status || 'active',
        managerEmail: data.manager_email || data.managerEmail,
        address: data.address,
        city: data.city,
        country: data.country,
        emergencyContactName: data.emergency_contact_name || data.emergencyContactName,
        emergencyContactPhone: data.emergency_contact_phone || data.emergencyContactPhone,
        emergencyContactRelationship: data.emergency_contact_relationship || data.emergencyContactRelationship,
      })
    );
    return this.mapToEmployeeResponse(result);
  }

  async updateEmployee(id: string, data: any): Promise<EmployeeResponse> {
    const result = await firstValueFrom(
      this.peopleGrpcService.UpdatePerson({
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        departmentId: data.department_id || data.departmentId,
        jobTitle: data.job_title || data.jobTitle,
        hireDate: data.hire_date || data.hireDate,
        status: data.status,
        managerEmail: data.manager_email || data.managerEmail,
        address: data.address,
        city: data.city,
        country: data.country,
        emergencyContactName: data.emergency_contact_name || data.emergencyContactName,
        emergencyContactPhone: data.emergency_contact_phone || data.emergencyContactPhone,
        emergencyContactRelationship: data.emergency_contact_relationship || data.emergencyContactRelationship,
      })
    );
    return this.mapToEmployeeResponse(result);
  }

  async deleteEmployee(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.peopleGrpcService.DeletePerson({ id })
    );
    return { success: result.success || true };
  }

  private mapToEmployeeResponse(data: any): EmployeeResponse {
    // Handle both camelCase (from proto) and snake_case (from API requests)
    return {
      id: data.id,
      name: data.name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : ''),
      email: data.email || '',
      phone: data.phone || '',
      position: data.position || '',
      department: data.department || '',
      department_id: data.departmentId || data.department_id || '',
      job_title: data.jobTitle || data.job_title || '',
      hire_date: data.hireDate || data.hire_date || '',
      status: data.status || 'active',
      manager_email: data.managerEmail || data.manager_email || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      emergency_contact_name: data.emergencyContactName || data.emergency_contact_name || '',
      emergency_contact_phone: data.emergencyContactPhone || data.emergency_contact_phone || '',
      emergency_contact_relationship: data.emergencyContactRelationship || data.emergency_contact_relationship || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Department methods
  async getDepartment(id: string): Promise<DepartmentResponse> {
    const result = await firstValueFrom(
      this.departmentsGrpcService.GetDepartment({ id })
    );
    return this.mapToDepartmentResponse(result);
  }

  async getDepartments(): Promise<DepartmentResponse[]> {
    const result = await firstValueFrom(
      this.departmentsGrpcService.GetDepartments({})
    );
    return (result.departments || []).map((dept: any) => this.mapToDepartmentResponse(dept));
  }

  async createDepartment(data: any): Promise<DepartmentResponse> {
    const result = await firstValueFrom(
      this.departmentsGrpcService.CreateDepartment({
        name: data.name,
        code: data.code,
        description: data.description,
        managerEmail: data.manager_email || data.managerEmail,
        parentDepartmentId: data.parent_department_id || data.parentDepartmentId || null,
        status: data.status || 'active',
      })
    );
    return this.mapToDepartmentResponse(result);
  }

  async updateDepartment(id: string, data: any): Promise<DepartmentResponse> {
    const result = await firstValueFrom(
      this.departmentsGrpcService.UpdateDepartment({
        id,
        name: data.name,
        code: data.code,
        description: data.description,
        managerEmail: data.manager_email || data.managerEmail,
        parentDepartmentId: data.parent_department_id || data.parentDepartmentId,
        status: data.status,
      })
    );
    return this.mapToDepartmentResponse(result);
  }

  async deleteDepartment(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.departmentsGrpcService.DeleteDepartment({ id })
    );
    return { success: result.success || true };
  }

  private mapToDepartmentResponse(data: any): DepartmentResponse {
    // Handle both camelCase (from proto) and snake_case (from API requests)
    return {
      id: data.id,
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      manager_email: data.managerEmail || data.manager_email || '',
      parent_department_id: data.parentDepartmentId || data.parent_department_id || null,
      status: data.status || 'active',
      created_at: data.createdAt || data.created_at || '',
      updated_at: data.updatedAt || data.updated_at || '',
    };
  }

  // Attendance methods
  async getAttendance(id: string): Promise<AttendanceResponse> {
    const result = await firstValueFrom(
      this.attendanceGrpcService.GetAttendance({ id })
    );
    return this.mapToAttendanceResponse(result);
  }

  async getAttendances(query: {
    sort?: string;
    employee_id?: string;
    employee_email?: string;
    date?: string;
    status?: string;
  }): Promise<AttendanceResponse[]> {
    const result = await firstValueFrom(
      this.attendanceGrpcService.GetAttendances({
        sort: query.sort,
        employeeId: query.employee_id,
        employeeEmail: query.employee_email,
        date: query.date,
        status: query.status,
      })
    );
    return (result.attendances || []).map((att: any) => this.mapToAttendanceResponse(att));
  }

  async createAttendance(data: any): Promise<AttendanceResponse> {
    const result = await firstValueFrom(
      this.attendanceGrpcService.CreateAttendance({
        employeeId: data.employee_id || data.employeeId,
        employeeEmail: data.employee_email || data.employeeEmail,
        date: data.date,
        checkInTime: data.check_in_time || data.checkInTime,
        checkOutTime: data.check_out_time || data.checkOutTime,
        checkInLocation: data.check_in_location || data.checkInLocation,
        checkOutLocation: data.check_out_location || data.checkOutLocation,
        totalHours: data.total_hours || data.totalHours,
        overtimeHours: data.overtime_hours || data.overtimeHours,
        isLate: data.is_late || data.isLate,
        lateArrivalMinutes: data.late_arrival_minutes || data.lateArrivalMinutes,
        earlyDepartureMinutes: data.early_departure_minutes || data.earlyDepartureMinutes,
        deductionAmount: data.deduction_amount || data.deductionAmount,
        status: data.status || 'present',
      })
    );
    return this.mapToAttendanceResponse(result);
  }

  async updateAttendance(id: string, data: any): Promise<AttendanceResponse> {
    const result = await firstValueFrom(
      this.attendanceGrpcService.UpdateAttendance({
        id,
        checkOutTime: data.check_out_time || data.checkOutTime,
        checkOutLocation: data.check_out_location || data.checkOutLocation,
        totalHours: data.total_hours || data.totalHours,
        overtimeHours: data.overtime_hours || data.overtimeHours,
      })
    );
    return this.mapToAttendanceResponse(result);
  }

  async deleteAttendance(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.attendanceGrpcService.DeleteAttendance({ id })
    );
    return { success: result.success || true };
  }

  private mapToAttendanceResponse(data: any): AttendanceResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      employee_email: data.employeeEmail || data.employee_email || '',
      date: data.date || '',
      check_in_time: data.checkInTime || data.check_in_time || '',
      check_out_time: data.checkOutTime || data.check_out_time || '',
      check_in_location: data.checkInLocation || data.check_in_location || '',
      check_out_location: data.checkOutLocation || data.check_out_location || '',
      total_hours: data.totalHours ? parseFloat(data.totalHours) : 0,
      overtime_hours: data.overtimeHours ? parseFloat(data.overtimeHours) : 0,
      is_late: data.isLate || data.is_late || false,
      late_arrival_minutes: data.lateArrivalMinutes || data.late_arrival_minutes || 0,
      early_departure_minutes: data.earlyDepartureMinutes || data.early_departure_minutes || 0,
      deduction_amount: data.deductionAmount ? parseFloat(data.deductionAmount) : 0,
      status: data.status || 'present',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Attendance Summary methods
  async getAttendanceSummaries(query: {
    employee_id?: string;
    month?: string;
  }): Promise<AttendanceSummaryResponse[]> {
    const result = await firstValueFrom(
      this.attendanceSummaryGrpcService.GetAttendanceSummaries({
        employeeId: query.employee_id,
        month: query.month,
      })
    );
    return (result.summaries || []).map((sum: any) => this.mapToAttendanceSummaryResponse(sum));
  }

  async createAttendanceSummary(data: any): Promise<AttendanceSummaryResponse> {
    const result = await firstValueFrom(
      this.attendanceSummaryGrpcService.CreateAttendanceSummary({
        employeeId: data.employee_id || data.employeeId,
        month: data.month,
        daysPresent: data.days_present || data.daysPresent,
        daysAbsent: data.days_absent || data.daysAbsent,
        totalHours: data.total_hours || data.totalHours,
        lateArrivalsCount: data.late_arrivals_count || data.lateArrivalsCount,
        overtimeHours: data.overtime_hours || data.overtimeHours,
        totalDeductions: data.total_deductions || data.totalDeductions,
        status: data.status || 'pending',
      })
    );
    return this.mapToAttendanceSummaryResponse(result);
  }

  private mapToAttendanceSummaryResponse(data: any): AttendanceSummaryResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      month: data.month || '',
      days_present: data.daysPresent || data.days_present || 0,
      days_absent: data.daysAbsent || data.days_absent || 0,
      total_hours: data.totalHours ? parseFloat(data.totalHours) : 0,
      late_arrivals_count: data.lateArrivalsCount || data.late_arrivals_count || 0,
      overtime_hours: data.overtimeHours ? parseFloat(data.overtimeHours) : 0,
      total_deductions: data.totalDeductions ? parseFloat(data.totalDeductions) : 0,
      status: data.status || 'pending',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Attendance Policy methods
  async getAttendancePolicies(): Promise<AttendancePolicyResponse[]> {
    const result = await firstValueFrom(
      this.attendancePolicyGrpcService.GetAttendancePolicies({})
    );
    return (result.policies || []).map((policy: any) => this.mapToAttendancePolicyResponse(policy));
  }

  async createAttendancePolicy(data: any): Promise<AttendancePolicyResponse> {
    const result = await firstValueFrom(
      this.attendancePolicyGrpcService.CreateAttendancePolicy({
        name: data.name,
        expectedStartTime: data.expected_start_time || data.expectedStartTime,
        expectedEndTime: data.expected_end_time || data.expectedEndTime,
        gracePeriodMinutes: data.grace_period_minutes || data.gracePeriodMinutes,
        minimumHoursForFullDay: data.minimum_hours_for_full_day || data.minimumHoursForFullDay,
        standardWorkHours: data.standard_work_hours || data.standardWorkHours,
        standardWorkDays: data.standard_work_days || data.standardWorkDays,
        lateArrivalDeductionPerHour: data.late_arrival_deduction_per_hour || data.lateArrivalDeductionPerHour,
        earlyDepartureDeductionPerHour: data.early_departure_deduction_per_hour || data.earlyDepartureDeductionPerHour,
        absentDayDeduction: data.absent_day_deduction || data.absentDayDeduction,
        halfDayDeduction: data.half_day_deduction || data.halfDayDeduction,
        overtimeMultiplier: data.overtime_multiplier || data.overtimeMultiplier,
      })
    );
    return this.mapToAttendancePolicyResponse(result);
  }

  async updateAttendancePolicy(id: string, data: any): Promise<AttendancePolicyResponse> {
    const result = await firstValueFrom(
      this.attendancePolicyGrpcService.UpdateAttendancePolicy({
        id,
        name: data.name,
        expectedStartTime: data.expected_start_time || data.expectedStartTime,
        expectedEndTime: data.expected_end_time || data.expectedEndTime,
        gracePeriodMinutes: data.grace_period_minutes || data.gracePeriodMinutes,
        minimumHoursForFullDay: data.minimum_hours_for_full_day || data.minimumHoursForFullDay,
        standardWorkHours: data.standard_work_hours || data.standardWorkHours,
        standardWorkDays: data.standard_work_days || data.standardWorkDays,
        lateArrivalDeductionPerHour: data.late_arrival_deduction_per_hour || data.lateArrivalDeductionPerHour,
        earlyDepartureDeductionPerHour: data.early_departure_deduction_per_hour || data.earlyDepartureDeductionPerHour,
        absentDayDeduction: data.absent_day_deduction || data.absentDayDeduction,
        halfDayDeduction: data.half_day_deduction || data.halfDayDeduction,
        overtimeMultiplier: data.overtime_multiplier || data.overtimeMultiplier,
      })
    );
    return this.mapToAttendancePolicyResponse(result);
  }

  async deleteAttendancePolicy(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.attendancePolicyGrpcService.DeleteAttendancePolicy({ id })
    );
    return { success: result.success || true };
  }

  private mapToAttendancePolicyResponse(data: any): AttendancePolicyResponse {
    return {
      id: data.id,
      name: data.name || '',
      expected_start_time: data.expectedStartTime || data.expected_start_time || '',
      expected_end_time: data.expectedEndTime || data.expected_end_time || '',
      grace_period_minutes: data.gracePeriodMinutes || data.grace_period_minutes || 0,
      minimum_hours_for_full_day: data.minimumHoursForFullDay ? parseFloat(data.minimumHoursForFullDay) : 0,
      standard_work_hours: data.standardWorkHours ? parseFloat(data.standardWorkHours) : 0,
      standard_work_days: data.standardWorkDays || data.standard_work_days || 0,
      late_arrival_deduction_per_hour: data.lateArrivalDeductionPerHour ? parseFloat(data.lateArrivalDeductionPerHour) : 0,
      early_departure_deduction_per_hour: data.earlyDepartureDeductionPerHour ? parseFloat(data.earlyDepartureDeductionPerHour) : 0,
      absent_day_deduction: data.absentDayDeduction ? parseFloat(data.absentDayDeduction) : 0,
      half_day_deduction: data.halfDayDeduction ? parseFloat(data.halfDayDeduction) : 0,
      overtime_multiplier: data.overtimeMultiplier ? parseFloat(data.overtimeMultiplier) : 1.0,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Leave Type Methods
  async getLeaveTypes(): Promise<LeaveTypeResponse[]> {
    const result = await firstValueFrom(
      this.leaveTypeGrpcService.GetLeaveTypes({})
    );
    return (result.leaveTypes || []).map((lt: any) => this.mapToLeaveTypeResponse(lt));
  }

  async createLeaveType(data: any): Promise<LeaveTypeResponse> {
    const result = await firstValueFrom(
      this.leaveTypeGrpcService.CreateLeaveType({
        name: data.name,
        description: data.description,
        quota: data.quota?.toString() || '0',
        carryForward: data.carry_forward ?? data.carryForward ?? false,
        requiresApproval: data.requires_approval ?? data.requiresApproval ?? true,
      })
    );
    return this.mapToLeaveTypeResponse(result);
  }

  private mapToLeaveTypeResponse(data: any): LeaveTypeResponse {
    return {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      quota: data.quota || 0,
      carry_forward: data.carryForward ?? data.carry_forward ?? false,
      requires_approval: data.requiresApproval ?? data.requires_approval ?? true,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Leave Request Methods
  async getLeaveRequests(query: { sort?: string; employee_id?: string; employeeId?: string; status?: string }): Promise<LeaveRequestResponse[]> {
    const result = await firstValueFrom(
      this.leaveRequestGrpcService.GetLeaveRequests({
        sort: query.sort,
        employeeId: query.employee_id || query.employeeId,
        status: query.status,
      })
    );
    return (result.leaveRequests || []).map((lr: any) => this.mapToLeaveRequestResponse(lr));
  }

  async createLeaveRequest(data: any): Promise<LeaveRequestResponse> {
    const employeeId = data.employee_id || data.employeeId;
    const leaveType = data.leave_type || data.leaveType;
    const startDate = data.start_date || data.startDate;
    const endDate = data.end_date || data.endDate;

    // Validate required fields (employee_id is optional)
    if (!leaveType) {
      throw new BadRequestException('leave_type is required');
    }
    if (!startDate) {
      throw new BadRequestException('start_date is required');
    }
    if (!endDate) {
      throw new BadRequestException('end_date is required');
    }

    const result = await firstValueFrom(
      this.leaveRequestGrpcService.CreateLeaveRequest({
        employeeId: employeeId || undefined,
        leaveType,
        startDate,
        endDate,
        numberOfDays: data.number_of_days || data.numberOfDays || 0,
        reason: data.reason || '',
        status: data.status || 'pending',
      })
    );
    return this.mapToLeaveRequestResponse(result);
  }

  async updateLeaveRequest(id: string, data: any): Promise<LeaveRequestResponse> {
    const result = await firstValueFrom(
      this.leaveRequestGrpcService.UpdateLeaveRequest({
        id,
        employeeId: data.employee_id || data.employeeId,
        leaveType: data.leave_type || data.leaveType,
        startDate: data.start_date || data.startDate,
        endDate: data.end_date || data.endDate,
        numberOfDays: data.number_of_days || data.numberOfDays,
        reason: data.reason,
        status: data.status,
      })
    );
    return this.mapToLeaveRequestResponse(result);
  }

  private mapToLeaveRequestResponse(data: any): LeaveRequestResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || null,
      leave_type: data.leaveType || data.leave_type || '',
      start_date: data.startDate || data.start_date || '',
      end_date: data.endDate || data.end_date || '',
      number_of_days: data.numberOfDays || data.number_of_days || 0,
      reason: data.reason || '',
      status: data.status || 'pending',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Leave Balance Methods
  async getLeaveBalances(query: { employee_id?: string; leave_type?: string; year?: string }): Promise<LeaveBalanceResponse[]> {
    const result = await firstValueFrom(
      this.leaveBalanceGrpcService.GetLeaveBalances({
        employeeId: query.employee_id,
        leaveType: query.leave_type,
        year: query.year,
      })
    );
    return (result.leaveBalances || []).map((lb: any) => this.mapToLeaveBalanceResponse(lb));
  }

  private mapToLeaveBalanceResponse(data: any): LeaveBalanceResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      leave_type: data.leaveType || data.leave_type || '',
      balance: data.balance ? parseFloat(data.balance) : 0,
      used: data.used ? parseFloat(data.used) : 0,
      accrued: data.accrued ? parseFloat(data.accrued) : 0,
      carried_forward: data.carriedForward ? parseFloat(data.carriedForward) : 0,
      year: data.year || 0,
      updated_at: data.updatedAt || data.updated_at || '',
    };
  }

  // Leave Approval Methods
  async getLeaveApprovals(query: { sort?: string }): Promise<LeaveApprovalResponse[]> {
    const result = await firstValueFrom(
      this.leaveApprovalGrpcService.GetLeaveApprovals({ sort: query.sort })
    );
    return (result.leaveApprovals || []).map((la: any) => this.mapToLeaveApprovalResponse(la));
  }

  async updateLeaveApproval(id: string, data: any): Promise<LeaveApprovalResponse> {
    const result = await firstValueFrom(
      this.leaveApprovalGrpcService.UpdateLeaveApproval({
        id,
        status: data.status,
        approvedDate: data.approved_date || data.approvedDate,
        rejectedDate: data.rejected_date || data.rejectedDate,
        rejectionReason: data.rejection_reason || data.rejectionReason,
      })
    );
    return this.mapToLeaveApprovalResponse(result);
  }

  private mapToLeaveApprovalResponse(data: any): LeaveApprovalResponse {
    return {
      id: data.id,
      leave_request_id: data.leaveRequestId || data.leave_request_id || '',
      approver_id: data.approverId || data.approver_id || '',
      status: data.status || 'pending',
      approval_level: data.approvalLevel || data.approval_level || 0,
      approved_date: data.approvedDate || data.approved_date || null,
      rejected_date: data.rejectedDate || data.rejected_date || null,
      rejection_reason: data.rejectionReason || data.rejection_reason || null,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Leave Policy Methods
  async getLeavePolicies(): Promise<LeavePolicyResponse[]> {
    const result = await firstValueFrom(
      this.leavePolicyGrpcService.GetLeavePolicies({})
    );
    return (result.leavePolicies || []).map((lp: any) => this.mapToLeavePolicyResponse(lp));
  }

  async createLeavePolicy(data: any): Promise<LeavePolicyResponse> {
    const result = await firstValueFrom(
      this.leavePolicyGrpcService.CreateLeavePolicy({
        name: data.name,
        description: data.description,
        maxCarryForwardDays: data.max_carry_forward_days || data.maxCarryForwardDays,
        accrualRate: data.accrual_rate?.toString() || data.accrualRate?.toString(),
      })
    );
    return this.mapToLeavePolicyResponse(result);
  }

  private mapToLeavePolicyResponse(data: any): LeavePolicyResponse {
    return {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      max_carry_forward_days: data.maxCarryForwardDays || data.max_carry_forward_days || 0,
      accrual_rate: data.accrualRate ? parseFloat(data.accrualRate) : 0,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Holiday Methods
  async getHolidays(): Promise<HolidayResponse[]> {
    const result = await firstValueFrom(
      this.holidayGrpcService.GetHolidays({})
    );
    return (result.holidays || []).map((h: any) => this.mapToHolidayResponse(h));
  }

  async createHoliday(data: any): Promise<HolidayResponse> {
    const result = await firstValueFrom(
      this.holidayGrpcService.CreateHoliday({
        name: data.name,
        date: data.date,
        isOptional: data.is_optional ?? data.isOptional ?? false,
      })
    );
    return this.mapToHolidayResponse(result);
  }

  private mapToHolidayResponse(data: any): HolidayResponse {
    return {
      id: data.id,
      name: data.name || '',
      date: data.date || '',
      is_optional: data.isOptional ?? data.is_optional ?? false,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Leave Accrual Methods
  async getLeaveAccruals(): Promise<LeaveAccrualResponse[]> {
    const result = await firstValueFrom(
      this.leaveAccrualGrpcService.GetLeaveAccruals({})
    );
    return (result.leaveAccruals || []).map((la: any) => this.mapToLeaveAccrualResponse(la));
  }

  private mapToLeaveAccrualResponse(data: any): LeaveAccrualResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      leave_type: data.leaveType || data.leave_type || '',
      accrual_date: data.accrualDate || data.accrual_date || '',
      days_accrued: data.daysAccrued ? parseFloat(data.daysAccrued) : 0,
      description: data.description || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }
}

