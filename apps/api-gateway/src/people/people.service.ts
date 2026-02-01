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

interface PayrollRecordGrpcService {
  GetPayrollRecord(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetPayrollRecords(data: { sort?: string; employeeId?: string; payPeriod?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreatePayrollRecord(data: any, metadata?: Metadata): Observable<any>;
  UpdatePayrollRecord(data: any, metadata?: Metadata): Observable<any>;
  DeletePayrollRecord(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface PayrollConfigurationGrpcService {
  GetPayrollConfigurations(data: {}, metadata?: Metadata): Observable<any>;
  CreatePayrollConfiguration(data: any, metadata?: Metadata): Observable<any>;
}

interface PayrollExceptionGrpcService {
  GetPayrollExceptions(data: {}, metadata?: Metadata): Observable<any>;
  CreatePayrollException(data: any, metadata?: Metadata): Observable<any>;
}

interface CustomPayrollComponentGrpcService {
  GetCustomPayrollComponents(data: {}, metadata?: Metadata): Observable<any>;
  CreateCustomPayrollComponent(data: any, metadata?: Metadata): Observable<any>;
}

interface PerformanceReviewGrpcService {
  GetPerformanceReview(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetPerformanceReviews(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreatePerformanceReview(data: any, metadata?: Metadata): Observable<any>;
  UpdatePerformanceReview(data: any, metadata?: Metadata): Observable<any>;
  DeletePerformanceReview(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface PerformanceGoalGrpcService {
  GetPerformanceGoals(data: {}, metadata?: Metadata): Observable<any>;
  CreatePerformanceGoal(data: any, metadata?: Metadata): Observable<any>;
}

interface ReviewCycleGrpcService {
  GetReviewCycles(data: {}, metadata?: Metadata): Observable<any>;
  CreateReviewCycle(data: any, metadata?: Metadata): Observable<any>;
}

interface ReviewTemplateGrpcService {
  GetReviewTemplates(data: {}, metadata?: Metadata): Observable<any>;
  CreateReviewTemplate(data: any, metadata?: Metadata): Observable<any>;
}

interface GoalGrpcService {
  GetGoal(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetGoals(data: { sort?: string; employeeId?: string; status?: string; category?: string; parentGoalId?: string }, metadata?: Metadata): Observable<any>;
  CreateGoal(data: any, metadata?: Metadata): Observable<any>;
  UpdateGoal(data: any, metadata?: Metadata): Observable<any>;
  DeleteGoal(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface SkillGrpcService {
  GetSkills(data: {}, metadata?: Metadata): Observable<any>;
  CreateSkill(data: any, metadata?: Metadata): Observable<any>;
}

interface EmployeeSkillGrpcService {
  GetEmployeeSkills(data: { employeeId?: string; skillId?: string; proficiencyLevel?: string }, metadata?: Metadata): Observable<any>;
  CreateEmployeeSkill(data: any, metadata?: Metadata): Observable<any>;
  UpdateEmployeeSkill(data: any, metadata?: Metadata): Observable<any>;
  DeleteEmployeeSkill(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CompetencyGrpcService {
  GetCompetencies(data: {}, metadata?: Metadata): Observable<any>;
  CreateCompetency(data: any, metadata?: Metadata): Observable<any>;
}

interface CompetencyAssessmentGrpcService {
  GetCompetencyAssessments(data: { employeeId?: string; competencyId?: string; level?: number }, metadata?: Metadata): Observable<any>;
  CreateCompetencyAssessment(data: any, metadata?: Metadata): Observable<any>;
}

interface CourseGrpcService {
  GetCourses(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreateCourse(data: any, metadata?: Metadata): Observable<any>;
  UpdateCourse(data: any, metadata?: Metadata): Observable<any>;
  DeleteCourse(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CourseEnrollmentGrpcService {
  GetCourseEnrollments(data: { employeeId?: string; courseId?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateCourseEnrollment(data: any, metadata?: Metadata): Observable<any>;
  UpdateCourseEnrollment(data: any, metadata?: Metadata): Observable<any>;
  DeleteCourseEnrollment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LearningPathGrpcService {
  GetLearningPaths(data: {}, metadata?: Metadata): Observable<any>;
  CreateLearningPath(data: any, metadata?: Metadata): Observable<any>;
}

interface CertificationGrpcService {
  GetCertifications(data: {}, metadata?: Metadata): Observable<any>;
  CreateCertification(data: any, metadata?: Metadata): Observable<any>;
}

interface EmployeeCertificationGrpcService {
  GetEmployeeCertifications(data: { employeeId?: string; certificationId?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateEmployeeCertification(data: any, metadata?: Metadata): Observable<any>;
}

interface CareerPathGrpcService {
  GetCareerPaths(data: {}, metadata?: Metadata): Observable<any>;
  CreateCareerPath(data: any, metadata?: Metadata): Observable<any>;
}

interface CareerPathEnrollmentGrpcService {
  GetCareerPathEnrollments(data: { employeeId?: string; careerPathId?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateCareerPathEnrollment(data: any, metadata?: Metadata): Observable<any>;
  UpdateCareerPathEnrollment(data: any, metadata?: Metadata): Observable<any>;
  DeleteCareerPathEnrollment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AnnouncementGrpcService {
  GetAnnouncements(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreateAnnouncement(data: any, metadata?: Metadata): Observable<any>;
}

interface MessageGrpcService {
  GetMessages(data: { sort?: string; recipientId?: string; senderId?: string }, metadata?: Metadata): Observable<any>;
  CreateMessage(data: any, metadata?: Metadata): Observable<any>;
  UpdateMessage(data: any, metadata?: Metadata): Observable<any>;
  DeleteMessage(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface JobPostingGrpcService {
  GetJobPostings(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreateJobPosting(data: any, metadata?: Metadata): Observable<any>;
  UpdateJobPosting(data: any, metadata?: Metadata): Observable<any>;
  DeleteJobPosting(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ApplicantGrpcService {
  GetApplicants(data: { sort?: string; jobPostingId?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateApplicant(data: any, metadata?: Metadata): Observable<any>;
  UpdateApplicant(data: any, metadata?: Metadata): Observable<any>;
  DeleteApplicant(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface OnboardingPlanGrpcService {
  GetOnboardingPlans(data: { sort?: string }, metadata?: Metadata): Observable<any>;
  CreateOnboardingPlan(data: any, metadata?: Metadata): Observable<any>;
  UpdateOnboardingPlan(data: any, metadata?: Metadata): Observable<any>;
  DeleteOnboardingPlan(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface OnboardingTaskGrpcService {
  GetOnboardingTasks(data: { onboardingPlanId?: string; assignedTo?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateOnboardingTask(data: any, metadata?: Metadata): Observable<any>;
  UpdateOnboardingTask(data: any, metadata?: Metadata): Observable<any>;
  DeleteOnboardingTask(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface UserGrpcService {
  BootstrapAdmin(data: any, metadata?: Metadata): Observable<any>;
  Register(data: any, metadata?: Metadata): Observable<any>;
  Activate(data: any, metadata?: Metadata): Observable<any>;
  Login(data: any, metadata?: Metadata): Observable<any>;
  RefreshToken(data: any, metadata?: Metadata): Observable<any>;
  ForgotPassword(data: any, metadata?: Metadata): Observable<any>;
  ResetPassword(data: any, metadata?: Metadata): Observable<any>;
  GetMe(data: any, metadata?: Metadata): Observable<any>;
  GetUsers(data: any, metadata?: Metadata): Observable<any>;
  GetUser(data: any, metadata?: Metadata): Observable<any>;
  UpdateUser(data: any, metadata?: Metadata): Observable<any>;
}

interface HierarchyGrpcService {
  GetSubordinates(data: { employeeId: string }, metadata?: Metadata): Observable<any>;
  GetSubordinatesTree(data: { employeeId: string }, metadata?: Metadata): Observable<any>;
  GetAncestors(data: { employeeId: string }, metadata?: Metadata): Observable<any>;
  GetOrganizationTree(data: any, metadata?: Metadata): Observable<any>;
}

interface ApprovalGrpcService {
  CreateApproval(data: any, metadata?: Metadata): Observable<any>;
  GetApprovals(data: any, metadata?: Metadata): Observable<any>;
  GetApproval(data: { id: string }, metadata?: Metadata): Observable<any>;
  Approve(data: any, metadata?: Metadata): Observable<any>;
  Reject(data: any, metadata?: Metadata): Observable<any>;
  GetHistory(data: { approvalId: string }, metadata?: Metadata): Observable<any>;
}

interface NotificationGrpcService {
  GetNotifications(data: any, metadata?: Metadata): Observable<any>;
  MarkAsRead(data: any, metadata?: Metadata): Observable<any>;
  MarkAllAsRead(data: any, metadata?: Metadata): Observable<any>;
  GetUnreadCount(data: any, metadata?: Metadata): Observable<any>;
}

interface AuditLogGrpcService {
  GetAuditLogs(data: any, metadata?: Metadata): Observable<any>;
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
  base_salary: number | null;
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

export interface PayrollRecordResponse {
  id: string;
  employee_id: string;
  pay_period: string;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: string;
  payment_date: string;
  created_at: string;
}

export interface PayrollConfigurationResponse {
  id: string;
  name: string;
  pay_frequency: string;
  pay_day: number;
  tax_rate: number;
  deduction_rules: Record<string, any>;
  created_at: string;
}

export interface PayrollExceptionResponse {
  id: string;
  employee_id: string;
  pay_period: string;
  exception_type: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface CustomPayrollComponentResponse {
  id: string;
  name: string;
  type: string;
  amount: number;
  applies_to: string;
  created_at: string;
}

export interface PerformanceReviewResponse {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_cycle_id: string;
  review_date: string;
  rating: number;
  comments: string;
  status: string;
  created_at: string;
}

export interface PerformanceGoalResponse {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  target_date: string;
  status: string;
  progress: number;
  created_at: string;
}

export interface ReviewCycleResponse {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface ReviewTemplateResponse {
  id: string;
  name: string;
  description: string;
  sections: Array<{ title: string; weight: number }>;
  created_at: string;
}

export interface GoalResponse {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  status: string;
  progress: number;
  parent_goal_id: string | null;
  alignment_level: string;
  created_at: string;
}

export interface SkillResponse {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: string;
}

export interface EmployeeSkillResponse {
  id: string;
  employee_id: string;
  skill_id: string;
  proficiency_level: string;
  verified: boolean;
  verified_by: string;
  verified_date: string;
  created_at: string;
}

export interface CompetencyResponse {
  id: string;
  name: string;
  category: string;
  description: string;
  levels: Array<{ level: number; description: string }>;
  created_at: string;
}

export interface CompetencyAssessmentResponse {
  id: string;
  employee_id: string;
  competency_id: string;
  assessed_by: string;
  level: number;
  assessment_date: string;
  notes: string;
  created_at: string;
}

export interface CourseResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  instructor: string;
  duration_hours: number;
  delivery_mode: string;
  max_participants: number;
  cost_per_participant: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface CourseEnrollmentResponse {
  id: string;
  employee_id: string;
  course_id: string;
  enrollment_date: string;
  completion_date: string | null;
  status: string;
  progress: number;
  created_at: string;
}

export interface LearningPathResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  courses: string[];
  mandatory: boolean;
  created_at: string;
}

export interface CertificationResponse {
  id: string;
  name: string;
  issuing_organization: string;
  description: string;
  category: string;
  validity_period_months: number;
  cost: number;
  mandatory: boolean;
  created_at: string;
}

export interface EmployeeCertificationResponse {
  id: string;
  employee_id: string;
  certification_id: string;
  issue_date: string;
  expiry_date: string;
  certificate_number: string;
  status: string;
  created_at: string;
}

export interface CareerPathResponse {
  id: string;
  name: string;
  description: string;
  starting_role: string;
  target_role: string;
  department: string;
  estimated_duration_years: number;
  difficulty_level: string;
  required_skills: string[];
  required_competencies: string[];
  milestones: Array<{ title: string; duration_months: number }>;
  created_at: string;
}

export interface CareerPathEnrollmentResponse {
  id: string;
  employee_id: string;
  career_path_id: string;
  enrollment_date: string;
  current_milestone: number;
  progress: number;
  status: string;
  created_at: string;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_audience: string;
  target_departments: string[];
  priority: string;
  status: string;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  read_at: string | null;
  attachments: string[];
  created_at: string;
}

export interface JobPostingResponse {
  id: string;
  title: string;
  department: string;
  department_id: string;
  description: string;
  requirements: string[];
  status: string;
  posted_date: string;
  closing_date: string;
  created_at: string;
}

export interface ApplicantResponse {
  id: string;
  job_posting_id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  status: string;
  applied_date: string;
  interview_date: string | null;
  interview_notes: string | null;
  created_at: string;
}

export interface OnboardingPlanResponse {
  id: string;
  name: string;
  employee_id: string;
  start_date: string;
  duration_days: number;
  description: string;
  welcome_message: string;
  assign_buddy: boolean;
  buddy_id: string;
  require_initial_goals: boolean;
  phases: Array<{ name: string; description: string }>;
  checklist_template: Array<{ title: string; description: string; required: boolean }>;
  required_documents: Array<{ name: string; description: string; required: boolean }>;
  status: string;
  created_at: string;
}

export interface OnboardingTaskResponse {
  id: string;
  onboarding_plan_id: string;
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  status: string;
  completed_date: string | null;
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
  private payrollRecordGrpcService: PayrollRecordGrpcService;
  private payrollConfigurationGrpcService: PayrollConfigurationGrpcService;
  private payrollExceptionGrpcService: PayrollExceptionGrpcService;
  private customPayrollComponentGrpcService: CustomPayrollComponentGrpcService;
  private performanceReviewGrpcService: PerformanceReviewGrpcService;
  private performanceGoalGrpcService: PerformanceGoalGrpcService;
  private reviewCycleGrpcService: ReviewCycleGrpcService;
  private reviewTemplateGrpcService: ReviewTemplateGrpcService;
  private goalGrpcService: GoalGrpcService;
  private skillGrpcService: SkillGrpcService;
  private employeeSkillGrpcService: EmployeeSkillGrpcService;
  private competencyGrpcService: CompetencyGrpcService;
  private competencyAssessmentGrpcService: CompetencyAssessmentGrpcService;
  private courseGrpcService: CourseGrpcService;
  private courseEnrollmentGrpcService: CourseEnrollmentGrpcService;
  private learningPathGrpcService: LearningPathGrpcService;
  private certificationGrpcService: CertificationGrpcService;
  private employeeCertificationGrpcService: EmployeeCertificationGrpcService;
  private careerPathGrpcService: CareerPathGrpcService;
  private careerPathEnrollmentGrpcService: CareerPathEnrollmentGrpcService;
  private announcementGrpcService: AnnouncementGrpcService;
  private messageGrpcService: MessageGrpcService;
  private jobPostingGrpcService: JobPostingGrpcService;
  private applicantGrpcService: ApplicantGrpcService;
  private onboardingPlanGrpcService: OnboardingPlanGrpcService;
  private onboardingTaskGrpcService: OnboardingTaskGrpcService;
  private userGrpcService: UserGrpcService;
  private hierarchyGrpcService: HierarchyGrpcService;
  private approvalGrpcService: ApprovalGrpcService;
  private notificationGrpcService: NotificationGrpcService;
  private auditLogGrpcService: AuditLogGrpcService;

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
    this.payrollRecordGrpcService = this.client.getService<PayrollRecordGrpcService>('PayrollRecordService');
    this.payrollConfigurationGrpcService = this.client.getService<PayrollConfigurationGrpcService>('PayrollConfigurationService');
    this.payrollExceptionGrpcService = this.client.getService<PayrollExceptionGrpcService>('PayrollExceptionService');
    this.customPayrollComponentGrpcService = this.client.getService<CustomPayrollComponentGrpcService>('CustomPayrollComponentService');
    this.performanceReviewGrpcService = this.client.getService<PerformanceReviewGrpcService>('PerformanceReviewService');
    this.performanceGoalGrpcService = this.client.getService<PerformanceGoalGrpcService>('PerformanceGoalService');
    this.reviewCycleGrpcService = this.client.getService<ReviewCycleGrpcService>('ReviewCycleService');
    this.reviewTemplateGrpcService = this.client.getService<ReviewTemplateGrpcService>('ReviewTemplateService');
    this.goalGrpcService = this.client.getService<GoalGrpcService>('GoalService');
    this.skillGrpcService = this.client.getService<SkillGrpcService>('SkillService');
    this.employeeSkillGrpcService = this.client.getService<EmployeeSkillGrpcService>('EmployeeSkillService');
    this.competencyGrpcService = this.client.getService<CompetencyGrpcService>('CompetencyService');
    this.competencyAssessmentGrpcService = this.client.getService<CompetencyAssessmentGrpcService>('CompetencyAssessmentService');
    this.courseGrpcService = this.client.getService<CourseGrpcService>('CourseService');
    this.courseEnrollmentGrpcService = this.client.getService<CourseEnrollmentGrpcService>('CourseEnrollmentService');
    this.learningPathGrpcService = this.client.getService<LearningPathGrpcService>('LearningPathService');
    this.certificationGrpcService = this.client.getService<CertificationGrpcService>('CertificationService');
    this.employeeCertificationGrpcService = this.client.getService<EmployeeCertificationGrpcService>('EmployeeCertificationService');
    this.careerPathGrpcService = this.client.getService<CareerPathGrpcService>('CareerPathService');
    this.careerPathEnrollmentGrpcService = this.client.getService<CareerPathEnrollmentGrpcService>('CareerPathEnrollmentService');
    this.announcementGrpcService = this.client.getService<AnnouncementGrpcService>('AnnouncementService');
    this.messageGrpcService = this.client.getService<MessageGrpcService>('MessageService');
    this.jobPostingGrpcService = this.client.getService<JobPostingGrpcService>('JobPostingService');
    this.applicantGrpcService = this.client.getService<ApplicantGrpcService>('ApplicantService');
    this.onboardingPlanGrpcService = this.client.getService<OnboardingPlanGrpcService>('OnboardingPlanService');
    this.onboardingTaskGrpcService = this.client.getService<OnboardingTaskGrpcService>('OnboardingTaskService');
    this.userGrpcService = this.client.getService<UserGrpcService>('UserService');
    this.hierarchyGrpcService = this.client.getService<HierarchyGrpcService>('HierarchyService');
    this.approvalGrpcService = this.client.getService<ApprovalGrpcService>('ApprovalService');
    this.notificationGrpcService = this.client.getService<NotificationGrpcService>('NotificationService');
    this.auditLogGrpcService = this.client.getService<AuditLogGrpcService>('AuditLogService');
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
        baseSalary: data.base_salary || data.baseSalary,
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
        baseSalary: data.base_salary || data.baseSalary,
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
      base_salary: data.baseSalary ? parseFloat(data.baseSalary) : (data.base_salary ? parseFloat(data.base_salary) : null),
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

  // Payroll Record Methods
  async getPayrollRecords(query: { 
    sort?: string; 
    employee_id?: string; 
    employeeId?: string; 
    pay_period?: string;
    payPeriod?: string;
    status?: string;
  }): Promise<PayrollRecordResponse[]> {
    const result = await firstValueFrom(
      this.payrollRecordGrpcService.GetPayrollRecords({
        sort: query.sort,
        employeeId: query.employee_id || query.employeeId,
        payPeriod: query.pay_period || query.payPeriod,
        status: query.status,
      })
    );
    return (result.payrollRecords || []).map((pr: any) => this.mapToPayrollRecordResponse(pr));
  }

  async createPayrollRecord(data: any): Promise<PayrollRecordResponse> {
    const result = await firstValueFrom(
      this.payrollRecordGrpcService.CreatePayrollRecord({
        employeeId: data.employee_id || data.employeeId,
        payPeriod: data.pay_period || data.payPeriod,
        grossPay: data.gross_pay || data.grossPay,
        deductions: data.deductions,
        netPay: data.net_pay || data.netPay,
        status: data.status || 'pending',
        paymentDate: data.payment_date || data.paymentDate,
      })
    );
    return this.mapToPayrollRecordResponse(result);
  }

  async updatePayrollRecord(id: string, data: any): Promise<PayrollRecordResponse> {
    const result = await firstValueFrom(
      this.payrollRecordGrpcService.UpdatePayrollRecord({
        id,
        employeeId: data.employee_id || data.employeeId,
        payPeriod: data.pay_period || data.payPeriod,
        grossPay: data.gross_pay || data.grossPay,
        deductions: data.deductions,
        netPay: data.net_pay || data.netPay,
        status: data.status,
        paymentDate: data.payment_date || data.paymentDate,
      })
    );
    return this.mapToPayrollRecordResponse(result);
  }

  private mapToPayrollRecordResponse(data: any): PayrollRecordResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      pay_period: data.payPeriod || data.pay_period || '',
      gross_pay: data.grossPay ? parseFloat(data.grossPay) : 0,
      deductions: data.deductions ? parseFloat(data.deductions) : 0,
      net_pay: data.netPay ? parseFloat(data.netPay) : 0,
      status: data.status || 'pending',
      payment_date: data.paymentDate || data.payment_date || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Payroll Configuration Methods
  async getPayrollConfigurations(): Promise<PayrollConfigurationResponse[]> {
    const result = await firstValueFrom(
      this.payrollConfigurationGrpcService.GetPayrollConfigurations({})
    );
    return (result.payrollConfigurations || []).map((config: any) => this.mapToPayrollConfigurationResponse(config));
  }

  async createPayrollConfiguration(data: any): Promise<PayrollConfigurationResponse> {
    const result = await firstValueFrom(
      this.payrollConfigurationGrpcService.CreatePayrollConfiguration({
        name: data.name,
        payFrequency: data.pay_frequency || data.payFrequency,
        payDay: data.pay_day || data.payDay,
        taxRate: data.tax_rate || data.taxRate,
        deductionRules: data.deduction_rules || data.deductionRules || {},
      })
    );
    return this.mapToPayrollConfigurationResponse(result);
  }

  private mapToPayrollConfigurationResponse(data: any): PayrollConfigurationResponse {
    return {
      id: data.id,
      name: data.name || '',
      pay_frequency: data.payFrequency || data.pay_frequency || '',
      pay_day: data.payDay || data.pay_day || 1,
      tax_rate: data.taxRate ? parseFloat(data.taxRate) : 0,
      deduction_rules: data.deductionRules || data.deduction_rules || {},
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Payroll Exception Methods
  async getPayrollExceptions(): Promise<PayrollExceptionResponse[]> {
    const result = await firstValueFrom(
      this.payrollExceptionGrpcService.GetPayrollExceptions({})
    );
    return (result.payrollExceptions || []).map((exception: any) => this.mapToPayrollExceptionResponse(exception));
  }

  async createPayrollException(data: any): Promise<PayrollExceptionResponse> {
    const result = await firstValueFrom(
      this.payrollExceptionGrpcService.CreatePayrollException({
        employeeId: data.employee_id || data.employeeId,
        payPeriod: data.pay_period || data.payPeriod,
        exceptionType: data.exception_type || data.exceptionType,
        description: data.description || '',
        amount: data.amount ? parseFloat(data.amount) : 0,
        status: data.status || 'pending',
      })
    );
    return this.mapToPayrollExceptionResponse(result);
  }

  private mapToPayrollExceptionResponse(data: any): PayrollExceptionResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      pay_period: data.payPeriod || data.pay_period || '',
      exception_type: data.exceptionType || data.exception_type || '',
      description: data.description || '',
      amount: data.amount ? parseFloat(data.amount) : 0,
      status: data.status || 'pending',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Custom Payroll Component Methods
  async getCustomPayrollComponents(): Promise<CustomPayrollComponentResponse[]> {
    const result = await firstValueFrom(
      this.customPayrollComponentGrpcService.GetCustomPayrollComponents({})
    );
    return (result.customPayrollComponents || []).map((component: any) => this.mapToCustomPayrollComponentResponse(component));
  }

  async createCustomPayrollComponent(data: any): Promise<CustomPayrollComponentResponse> {
    const result = await firstValueFrom(
      this.customPayrollComponentGrpcService.CreateCustomPayrollComponent({
        name: data.name,
        type: data.type,
        amount: data.amount ? parseFloat(data.amount) : 0,
        appliesTo: data.applies_to || data.appliesTo,
      })
    );
    return this.mapToCustomPayrollComponentResponse(result);
  }

  private mapToCustomPayrollComponentResponse(data: any): CustomPayrollComponentResponse {
    return {
      id: data.id,
      name: data.name || '',
      type: data.type || '',
      amount: data.amount ? parseFloat(data.amount) : 0,
      applies_to: data.appliesTo || data.applies_to || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Performance Review Methods
  async getPerformanceReviews(query: { sort?: string }): Promise<PerformanceReviewResponse[]> {
    const result = await firstValueFrom(
      this.performanceReviewGrpcService.GetPerformanceReviews({
        sort: query.sort,
      })
    );
    return (result.performanceReviews || []).map((review: any) => this.mapToPerformanceReviewResponse(review));
  }

  async createPerformanceReview(data: any): Promise<PerformanceReviewResponse> {
    const result = await firstValueFrom(
      this.performanceReviewGrpcService.CreatePerformanceReview({
        employeeId: data.employee_id || data.employeeId,
        reviewerId: data.reviewer_id || data.reviewerId,
        reviewCycleId: data.review_cycle_id || data.reviewCycleId,
        reviewDate: data.review_date || data.reviewDate,
        rating: data.rating ? data.rating.toString() : undefined,
        comments: data.comments || undefined,
        status: data.status || 'pending',
      })
    );
    return this.mapToPerformanceReviewResponse(result);
  }

  async updatePerformanceReview(id: string, data: any): Promise<PerformanceReviewResponse> {
    const result = await firstValueFrom(
      this.performanceReviewGrpcService.UpdatePerformanceReview({
        id,
        rating: data.rating ? data.rating.toString() : undefined,
        comments: data.comments || undefined,
        status: data.status || undefined,
        reviewDate: data.review_date || data.reviewDate || undefined,
      })
    );
    return this.mapToPerformanceReviewResponse(result);
  }

  private mapToPerformanceReviewResponse(data: any): PerformanceReviewResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      reviewer_id: data.reviewerId || data.reviewer_id || '',
      review_cycle_id: data.reviewCycleId || data.review_cycle_id || '',
      review_date: data.reviewDate || data.review_date || '',
      rating: data.rating ? parseFloat(data.rating) : 0,
      comments: data.comments || '',
      status: data.status || 'pending',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Performance Goal Methods
  async getPerformanceGoals(): Promise<PerformanceGoalResponse[]> {
    const result = await firstValueFrom(
      this.performanceGoalGrpcService.GetPerformanceGoals({})
    );
    return (result.performanceGoals || []).map((goal: any) => this.mapToPerformanceGoalResponse(goal));
  }

  async createPerformanceGoal(data: any): Promise<PerformanceGoalResponse> {
    const result = await firstValueFrom(
      this.performanceGoalGrpcService.CreatePerformanceGoal({
        employeeId: data.employee_id || data.employeeId,
        title: data.title,
        description: data.description || undefined,
        targetDate: data.target_date || data.targetDate || undefined,
        status: data.status || 'active',
        progress: data.progress || 0,
      })
    );
    return this.mapToPerformanceGoalResponse(result);
  }

  private mapToPerformanceGoalResponse(data: any): PerformanceGoalResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      title: data.title || '',
      description: data.description || '',
      target_date: data.targetDate || data.target_date || '',
      status: data.status || 'active',
      progress: data.progress || 0,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Review Cycle Methods
  async getReviewCycles(): Promise<ReviewCycleResponse[]> {
    const result = await firstValueFrom(
      this.reviewCycleGrpcService.GetReviewCycles({})
    );
    return (result.reviewCycles || []).map((cycle: any) => this.mapToReviewCycleResponse(cycle));
  }

  async createReviewCycle(data: any): Promise<ReviewCycleResponse> {
    const result = await firstValueFrom(
      this.reviewCycleGrpcService.CreateReviewCycle({
        name: data.name,
        startDate: data.start_date || data.startDate,
        endDate: data.end_date || data.endDate,
        status: data.status || 'active',
      })
    );
    return this.mapToReviewCycleResponse(result);
  }

  private mapToReviewCycleResponse(data: any): ReviewCycleResponse {
    return {
      id: data.id,
      name: data.name || '',
      start_date: data.startDate || data.start_date || '',
      end_date: data.endDate || data.end_date || '',
      status: data.status || 'active',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Review Template Methods
  async getReviewTemplates(): Promise<ReviewTemplateResponse[]> {
    const result = await firstValueFrom(
      this.reviewTemplateGrpcService.GetReviewTemplates({})
    );
    return (result.reviewTemplates || []).map((template: any) => this.mapToReviewTemplateResponse(template));
  }

  async createReviewTemplate(data: any): Promise<ReviewTemplateResponse> {
    const result = await firstValueFrom(
      this.reviewTemplateGrpcService.CreateReviewTemplate({
        name: data.name,
        description: data.description || undefined,
        sections: data.sections ? JSON.stringify(data.sections) : undefined,
      })
    );
    return this.mapToReviewTemplateResponse(result);
  }

  private mapToReviewTemplateResponse(data: any): ReviewTemplateResponse {
    let sections: Array<{ title: string; weight: number }> = [];
    if (data.sections) {
      try {
        sections = typeof data.sections === 'string' ? JSON.parse(data.sections) : data.sections;
      } catch (e) {
        sections = [];
      }
    }

    return {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      sections: sections,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Goal Methods
  async getGoals(query: { 
    sort?: string; 
    employee_id?: string; 
    employeeId?: string; 
    status?: string;
    category?: string;
    parent_goal_id?: string;
    parentGoalId?: string;
  }): Promise<GoalResponse[]> {
    const result = await firstValueFrom(
      this.goalGrpcService.GetGoals({
        sort: query.sort,
        employeeId: query.employee_id || query.employeeId,
        status: query.status,
        category: query.category,
        parentGoalId: query.parent_goal_id || query.parentGoalId,
      })
    );
    return (result.goals || []).map((goal: any) => this.mapToGoalResponse(goal));
  }

  async createGoal(data: any): Promise<GoalResponse> {
    const result = await firstValueFrom(
      this.goalGrpcService.CreateGoal({
        employeeId: data.employee_id || data.employeeId,
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
        targetDate: data.target_date || data.targetDate || undefined,
        status: data.status || 'active',
        progress: data.progress || 0,
        parentGoalId: data.parent_goal_id || data.parentGoalId || undefined,
        alignmentLevel: data.alignment_level || data.alignmentLevel || 'individual',
      })
    );
    return this.mapToGoalResponse(result);
  }

  async updateGoal(id: string, data: any): Promise<GoalResponse> {
    const result = await firstValueFrom(
      this.goalGrpcService.UpdateGoal({
        id,
        employeeId: data.employee_id || data.employeeId,
        title: data.title,
        description: data.description,
        category: data.category,
        targetDate: data.target_date || data.targetDate,
        status: data.status,
        progress: data.progress,
        parentGoalId: data.parent_goal_id || data.parentGoalId,
        alignmentLevel: data.alignment_level || data.alignmentLevel,
      })
    );
    return this.mapToGoalResponse(result);
  }

  async deleteGoal(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.goalGrpcService.DeleteGoal({ id })
    );
    return { success: result.success || true };
  }

  private mapToGoalResponse(data: any): GoalResponse {
    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      target_date: data.targetDate || data.target_date || '',
      status: data.status || 'active',
      progress: data.progress || 0,
      parent_goal_id: data.parentGoalId || data.parent_goal_id || null,
      alignment_level: data.alignmentLevel || data.alignment_level || 'individual',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Skill Methods
  async getSkills(): Promise<SkillResponse[]> {
    const result = await firstValueFrom(
      this.skillGrpcService.GetSkills({})
    );
    return (result.skills || []).map((skill: any) => this.mapToSkillResponse(skill));
  }

  async createSkill(data: any): Promise<SkillResponse> {
    const result = await firstValueFrom(
      this.skillGrpcService.CreateSkill({
        name: data.name,
        category: data.category || undefined,
        description: data.description || undefined,
      })
    );
    return this.mapToSkillResponse(result);
  }

  private mapToSkillResponse(data: any): SkillResponse {
    return {
      id: data.id,
      name: data.name || '',
      category: data.category || '',
      description: data.description || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Employee Skill Methods
  async getEmployeeSkills(query: { 
    employee_id?: string; 
    employeeId?: string; 
    skill_id?: string;
    skillId?: string;
    proficiency_level?: string;
    proficiencyLevel?: string;
  }): Promise<EmployeeSkillResponse[]> {
    const result = await firstValueFrom(
      this.employeeSkillGrpcService.GetEmployeeSkills({
        employeeId: query.employee_id || query.employeeId,
        skillId: query.skill_id || query.skillId,
        proficiencyLevel: query.proficiency_level || query.proficiencyLevel,
      })
    );
    return (result.employeeSkills || []).map((es: any) => this.mapToEmployeeSkillResponse(es));
  }

  async createEmployeeSkill(data: any): Promise<EmployeeSkillResponse> {
    const result = await firstValueFrom(
      this.employeeSkillGrpcService.CreateEmployeeSkill({
        employeeId: data.employee_id || data.employeeId,
        skillId: data.skill_id || data.skillId,
        proficiencyLevel: data.proficiency_level || data.proficiencyLevel || 'beginner',
        verified: data.verified !== undefined ? data.verified : false,
        verifiedBy: data.verified_by || data.verifiedBy || undefined,
        verifiedDate: data.verified_date || data.verifiedDate || undefined,
      })
    );
    return this.mapToEmployeeSkillResponse(result);
  }

  async updateEmployeeSkill(id: string, data: any): Promise<EmployeeSkillResponse> {
    const result = await firstValueFrom(
      this.employeeSkillGrpcService.UpdateEmployeeSkill({
        id,
        proficiencyLevel: data.proficiency_level || data.proficiencyLevel,
        verified: data.verified !== undefined ? data.verified : undefined,
        verifiedBy: data.verified_by || data.verifiedBy,
        verifiedDate: data.verified_date || data.verifiedDate,
      })
    );
    return this.mapToEmployeeSkillResponse(result);
  }

  async deleteEmployeeSkill(id: string): Promise<{ success: boolean }> {
    const result = await firstValueFrom(
      this.employeeSkillGrpcService.DeleteEmployeeSkill({ id })
    );
    return { success: result.success || true };
  }

  private mapToEmployeeSkillResponse(data: any): EmployeeSkillResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      skill_id: data.skillId || data.skill_id || '',
      proficiency_level: data.proficiencyLevel || data.proficiency_level || 'beginner',
      verified: data.verified || false,
      verified_by: data.verifiedBy || data.verified_by || '',
      verified_date: formatDate(data.verifiedDate || data.verified_date),
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Competency Methods
  async getCompetencies(): Promise<CompetencyResponse[]> {
    const result = await firstValueFrom(
      this.competencyGrpcService.GetCompetencies({})
    );
    return (result.competencies || []).map((competency: any) => this.mapToCompetencyResponse(competency));
  }

  async createCompetency(data: any): Promise<CompetencyResponse> {
    const result = await firstValueFrom(
      this.competencyGrpcService.CreateCompetency({
        name: data.name,
        category: data.category || undefined,
        description: data.description || undefined,
        levels: data.levels ? JSON.stringify(data.levels) : undefined,
      })
    );
    return this.mapToCompetencyResponse(result);
  }

  private mapToCompetencyResponse(data: any): CompetencyResponse {
    let levels: Array<{ level: number; description: string }> = [];
    if (data.levels) {
      try {
        levels = typeof data.levels === 'string' ? JSON.parse(data.levels) : data.levels;
      } catch (e) {
        levels = [];
      }
    }

    return {
      id: data.id,
      name: data.name || '',
      category: data.category || '',
      description: data.description || '',
      levels: levels,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Competency Assessment Methods
  async getCompetencyAssessments(query: { 
    employee_id?: string; 
    employeeId?: string; 
    competency_id?: string;
    competencyId?: string;
    level?: string;
  }): Promise<CompetencyAssessmentResponse[]> {
    const result = await firstValueFrom(
      this.competencyAssessmentGrpcService.GetCompetencyAssessments({
        employeeId: query.employee_id || query.employeeId,
        competencyId: query.competency_id || query.competencyId,
        level: query.level ? parseInt(query.level) : undefined,
      })
    );
    return (result.competencyAssessments || []).map((assessment: any) => this.mapToCompetencyAssessmentResponse(assessment));
  }

  async createCompetencyAssessment(data: any): Promise<CompetencyAssessmentResponse> {
    const result = await firstValueFrom(
      this.competencyAssessmentGrpcService.CreateCompetencyAssessment({
        employeeId: data.employee_id || data.employeeId,
        competencyId: data.competency_id || data.competencyId,
        assessedBy: data.assessed_by || data.assessedBy,
        level: data.level || 1,
        assessmentDate: data.assessment_date || data.assessmentDate,
        notes: data.notes || undefined,
      })
    );
    return this.mapToCompetencyAssessmentResponse(result);
  }

  private mapToCompetencyAssessmentResponse(data: any): CompetencyAssessmentResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      competency_id: data.competencyId || data.competency_id || '',
      assessed_by: data.assessedBy || data.assessed_by || '',
      level: data.level || 1,
      assessment_date: formatDate(data.assessmentDate || data.assessment_date),
      notes: data.notes || '',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Course Methods
  async getCourses(query: { sort?: string }): Promise<CourseResponse[]> {
    const result = await firstValueFrom(
      this.courseGrpcService.GetCourses({
        sort: query.sort,
      })
    ) as any;
    return (result.courses || []).map((course: any) => this.mapToCourseResponse(course));
  }

  async createCourse(data: any): Promise<CourseResponse> {
    const result = await firstValueFrom(
      this.courseGrpcService.CreateCourse({
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        instructor: data.instructor || undefined,
        durationHours: data.duration_hours || data.durationHours,
        deliveryMode: data.delivery_mode || data.deliveryMode || undefined,
        maxParticipants: data.max_participants || data.maxParticipants,
        costPerParticipant: data.cost_per_participant || data.costPerParticipant,
        startDate: data.start_date || data.startDate || undefined,
        endDate: data.end_date || data.endDate || undefined,
        status: data.status || 'draft',
      })
    ) as any;
    return this.mapToCourseResponse(result);
  }

  async updateCourse(id: string, data: any): Promise<CourseResponse> {
    const result = await firstValueFrom(
      this.courseGrpcService.UpdateCourse({
        id,
        name: data.name,
        code: data.code,
        description: data.description,
        category: data.category,
        instructor: data.instructor,
        durationHours: data.duration_hours || data.durationHours,
        deliveryMode: data.delivery_mode || data.deliveryMode,
        maxParticipants: data.max_participants || data.maxParticipants,
        costPerParticipant: data.cost_per_participant || data.costPerParticipant,
        startDate: data.start_date || data.startDate,
        endDate: data.end_date || data.endDate,
        status: data.status,
      })
    );
    return this.mapToCourseResponse(result);
  }

  private mapToCourseResponse(data: any): CourseResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      category: data.category || '',
      instructor: data.instructor || '',
      duration_hours: data.durationHours || data.duration_hours || 0,
      delivery_mode: data.deliveryMode || data.delivery_mode || '',
      max_participants: data.maxParticipants || data.max_participants || 0,
      cost_per_participant: data.costPerParticipant ? parseFloat(data.costPerParticipant) : (data.cost_per_participant ? parseFloat(data.cost_per_participant) : 0),
      start_date: formatDate(data.startDate || data.start_date),
      end_date: formatDate(data.endDate || data.end_date),
      status: data.status || 'draft',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Course Enrollment Methods
  async getCourseEnrollments(query: { 
    employee_id?: string; 
    employeeId?: string; 
    course_id?: string;
    courseId?: string;
    status?: string;
  }): Promise<CourseEnrollmentResponse[]> {
    const result = await firstValueFrom(
      this.courseEnrollmentGrpcService.GetCourseEnrollments({
        employeeId: query.employee_id || query.employeeId,
        courseId: query.course_id || query.courseId,
        status: query.status,
      })
    );
    return (result.courseEnrollments || []).map((enrollment: any) => this.mapToCourseEnrollmentResponse(enrollment));
  }

  async createCourseEnrollment(data: any): Promise<CourseEnrollmentResponse> {
    const result = await firstValueFrom(
      this.courseEnrollmentGrpcService.CreateCourseEnrollment({
        employeeId: data.employee_id || data.employeeId,
        courseId: data.course_id || data.courseId,
        enrollmentDate: data.enrollment_date || data.enrollmentDate,
        completionDate: data.completion_date || data.completionDate || undefined,
        status: data.status || 'enrolled',
        progress: data.progress || 0,
      })
    ) as any;
    return this.mapToCourseEnrollmentResponse(result);
  }

  async updateCourseEnrollment(id: string, data: any): Promise<CourseEnrollmentResponse> {
    const result = await firstValueFrom(
      this.courseEnrollmentGrpcService.UpdateCourseEnrollment({
        id,
        completionDate: data.completion_date || data.completionDate || undefined,
        status: data.status || undefined,
        progress: data.progress,
      })
    );
    return this.mapToCourseEnrollmentResponse(result);
  }

  private mapToCourseEnrollmentResponse(data: any): CourseEnrollmentResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      course_id: data.courseId || data.course_id || '',
      enrollment_date: formatDate(data.enrollmentDate || data.enrollment_date),
      completion_date: formatDate(data.completionDate || data.completion_date) || null,
      status: data.status || 'enrolled',
      progress: data.progress || 0,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Learning Path Methods
  async getLearningPaths(): Promise<LearningPathResponse[]> {
    const result = await firstValueFrom(
      this.learningPathGrpcService.GetLearningPaths({})
    ) as any;
    return (result.learningPaths || []).map((path: any) => this.mapToLearningPathResponse(path));
  }

  async createLearningPath(data: any): Promise<LearningPathResponse> {
    const result = await firstValueFrom(
      this.learningPathGrpcService.CreateLearningPath({
        name: data.name,
        description: data.description || undefined,
        category: data.category || undefined,
        difficultyLevel: data.difficulty_level || data.difficultyLevel || undefined,
        courses: data.courses ? JSON.stringify(data.courses) : undefined,
        mandatory: data.mandatory !== undefined ? data.mandatory : false,
      })
    ) as any;
    return this.mapToLearningPathResponse(result);
  }

  private mapToLearningPathResponse(data: any): LearningPathResponse {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    let courses: string[] = [];
    if (data.courses) {
      try {
        courses = typeof data.courses === 'string' ? JSON.parse(data.courses) : data.courses;
      } catch (e) {
        courses = [];
      }
    }

    return {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      category: data.category || '',
      difficulty_level: data.difficultyLevel || data.difficulty_level || '',
      courses: courses,
      mandatory: data.mandatory || false,
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Certification Methods
  async getCertifications(): Promise<CertificationResponse[]> {
    const result = await firstValueFrom(
      this.certificationGrpcService.GetCertifications({})
    );
    return (result.certifications || []).map((cert: any) => this.mapToCertificationResponse(cert));
  }

  async createCertification(data: any): Promise<CertificationResponse> {
    const result = await firstValueFrom(
      this.certificationGrpcService.CreateCertification({
        name: data.name,
        issuingOrganization: data.issuing_organization || data.issuingOrganization,
        description: data.description || undefined,
        category: data.category || undefined,
        validityPeriodMonths: data.validity_period_months || data.validityPeriodMonths,
        cost: data.cost ? data.cost.toString() : undefined,
        mandatory: data.mandatory !== undefined ? data.mandatory : false,
      })
    ) as any;
    return this.mapToCertificationResponse(result);
  }

  private mapToCertificationResponse(data: any): CertificationResponse {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: data.id,
      name: data.name || '',
      issuing_organization: data.issuingOrganization || data.issuing_organization || '',
      description: data.description || '',
      category: data.category || '',
      validity_period_months: data.validityPeriodMonths || data.validity_period_months || 0,
      cost: data.cost ? parseFloat(data.cost) : 0,
      mandatory: data.mandatory || false,
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Employee Certification Methods
  async getEmployeeCertifications(query: { 
    employee_id?: string; 
    employeeId?: string; 
    certification_id?: string;
    certificationId?: string;
    status?: string;
  }): Promise<EmployeeCertificationResponse[]> {
    const result = await firstValueFrom(
      this.employeeCertificationGrpcService.GetEmployeeCertifications({
        employeeId: query.employee_id || query.employeeId,
        certificationId: query.certification_id || query.certificationId,
        status: query.status,
      })
    ) as any;
    return (result.employeeCertifications || []).map((cert: any) => this.mapToEmployeeCertificationResponse(cert));
  }

  async createEmployeeCertification(data: any): Promise<EmployeeCertificationResponse> {
    const result = await firstValueFrom(
      this.employeeCertificationGrpcService.CreateEmployeeCertification({
        employeeId: data.employee_id || data.employeeId,
        certificationId: data.certification_id || data.certificationId,
        issueDate: data.issue_date || data.issueDate,
        expiryDate: data.expiry_date || data.expiryDate || undefined,
        certificateNumber: data.certificate_number || data.certificateNumber || undefined,
        status: data.status || 'active',
      })
    ) as any;
    return this.mapToEmployeeCertificationResponse(result);
  }

  private mapToEmployeeCertificationResponse(data: any): EmployeeCertificationResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      certification_id: data.certificationId || data.certification_id || '',
      issue_date: formatDate(data.issueDate || data.issue_date),
      expiry_date: formatDate(data.expiryDate || data.expiry_date),
      certificate_number: data.certificateNumber || data.certificate_number || '',
      status: data.status || 'active',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Career Path Methods
  async getCareerPaths(): Promise<CareerPathResponse[]> {
    const result = await firstValueFrom(
      this.careerPathGrpcService.GetCareerPaths({})
    ) as any;
    return (result.careerPaths || []).map((path: any) => this.mapToCareerPathResponse(path));
  }

  async createCareerPath(data: any): Promise<CareerPathResponse> {
    const result = await firstValueFrom(
      this.careerPathGrpcService.CreateCareerPath({
        name: data.name,
        description: data.description || undefined,
        startingRole: data.starting_role || data.startingRole || undefined,
        targetRole: data.target_role || data.targetRole || undefined,
        department: data.department || undefined,
        estimatedDurationYears: data.estimated_duration_years || data.estimatedDurationYears,
        difficultyLevel: data.difficulty_level || data.difficultyLevel || undefined,
        requiredSkills: data.required_skills || data.requiredSkills,
        requiredCompetencies: data.required_competencies || data.requiredCompetencies,
        milestones: data.milestones,
      })
    ) as any;
    return this.mapToCareerPathResponse(result);
  }

  private mapToCareerPathResponse(data: any): CareerPathResponse {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    let requiredSkills: string[] = [];
    if (data.requiredSkills) {
      try {
        requiredSkills = typeof data.requiredSkills === 'string' ? JSON.parse(data.requiredSkills) : data.requiredSkills;
      } catch (e) {
        requiredSkills = [];
      }
    }

    let requiredCompetencies: string[] = [];
    if (data.requiredCompetencies) {
      try {
        requiredCompetencies = typeof data.requiredCompetencies === 'string' ? JSON.parse(data.requiredCompetencies) : data.requiredCompetencies;
      } catch (e) {
        requiredCompetencies = [];
      }
    }

    let milestones: Array<{ title: string; duration_months: number }> = [];
    if (data.milestones) {
      try {
        milestones = typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones;
      } catch (e) {
        milestones = [];
      }
    }

    return {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      starting_role: data.startingRole || data.starting_role || '',
      target_role: data.targetRole || data.target_role || '',
      department: data.department || '',
      estimated_duration_years: data.estimatedDurationYears || data.estimated_duration_years || 0,
      difficulty_level: data.difficultyLevel || data.difficulty_level || '',
      required_skills: requiredSkills,
      required_competencies: requiredCompetencies,
      milestones: milestones,
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Career Path Enrollment Methods
  async getCareerPathEnrollments(query: { 
    employee_id?: string; 
    employeeId?: string; 
    career_path_id?: string;
    careerPathId?: string;
    status?: string;
  }): Promise<CareerPathEnrollmentResponse[]> {
    const result = await firstValueFrom(
      this.careerPathEnrollmentGrpcService.GetCareerPathEnrollments({
        employeeId: query.employee_id || query.employeeId,
        careerPathId: query.career_path_id || query.careerPathId,
        status: query.status,
      })
    ) as any;
    return (result.careerPathEnrollments || []).map((enrollment: any) => this.mapToCareerPathEnrollmentResponse(enrollment));
  }

  async createCareerPathEnrollment(data: any): Promise<CareerPathEnrollmentResponse> {
    const result = await firstValueFrom(
      this.careerPathEnrollmentGrpcService.CreateCareerPathEnrollment({
        employeeId: data.employee_id || data.employeeId,
        careerPathId: data.career_path_id || data.careerPathId,
        enrollmentDate: data.enrollment_date || data.enrollmentDate,
        currentMilestone: data.current_milestone || data.currentMilestone || 0,
        progress: data.progress || 0,
        status: data.status || 'active',
      })
    ) as any;
    return this.mapToCareerPathEnrollmentResponse(result);
  }

  async updateCareerPathEnrollment(id: string, data: any): Promise<CareerPathEnrollmentResponse> {
    const result = await firstValueFrom(
      this.careerPathEnrollmentGrpcService.UpdateCareerPathEnrollment({
        id,
        currentMilestone: data.current_milestone || data.currentMilestone,
        progress: data.progress,
        status: data.status,
      })
    ) as any;
    return this.mapToCareerPathEnrollmentResponse(result);
  }

  private mapToCareerPathEnrollmentResponse(data: any): CareerPathEnrollmentResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      employee_id: data.employeeId || data.employee_id || '',
      career_path_id: data.careerPathId || data.career_path_id || '',
      enrollment_date: formatDate(data.enrollmentDate || data.enrollment_date),
      current_milestone: data.currentMilestone || data.current_milestone || 0,
      progress: data.progress || 0,
      status: data.status || 'active',
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Announcement Methods
  async getAnnouncements(query: { sort?: string }): Promise<AnnouncementResponse[]> {
    const result = await firstValueFrom(
      this.announcementGrpcService.GetAnnouncements({
        sort: query.sort,
      })
    ) as any;
    return (result.announcements || []).map((announcement: any) => this.mapToAnnouncementResponse(announcement));
  }

  async createAnnouncement(data: any): Promise<AnnouncementResponse> {
    const result = await firstValueFrom(
      this.announcementGrpcService.CreateAnnouncement({
        title: data.title,
        content: data.content,
        authorId: data.author_id || data.authorId,
        targetAudience: data.target_audience || data.targetAudience || undefined,
        targetDepartments: data.target_departments || data.targetDepartments,
        priority: data.priority || undefined,
        status: data.status || undefined,
      })
    ) as any;
    return this.mapToAnnouncementResponse(result);
  }

  private mapToAnnouncementResponse(data: any): AnnouncementResponse {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    let targetDepartments: string[] = [];
    if (data.targetDepartments) {
      try {
        targetDepartments = typeof data.targetDepartments === 'string' ? JSON.parse(data.targetDepartments) : data.targetDepartments;
      } catch (e) {
        targetDepartments = [];
      }
    }

    return {
      id: data.id,
      title: data.title || '',
      content: data.content || '',
      author_id: data.authorId || data.author_id || '',
      target_audience: data.targetAudience || data.target_audience || 'all',
      target_departments: targetDepartments,
      priority: data.priority || 'normal',
      status: data.status || 'draft',
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Message Methods
  async getMessages(query: { 
    sort?: string;
    recipient_id?: string;
    recipientId?: string;
    sender_id?: string;
    senderId?: string;
  }): Promise<MessageResponse[]> {
    const result = await firstValueFrom(
      this.messageGrpcService.GetMessages({
        sort: query.sort,
        recipientId: query.recipient_id || query.recipientId,
        senderId: query.sender_id || query.senderId,
      })
    ) as any;
    return (result.messages || []).map((message: any) => this.mapToMessageResponse(message));
  }

  async createMessage(data: any): Promise<MessageResponse> {
    const result = await firstValueFrom(
      this.messageGrpcService.CreateMessage({
        senderId: data.sender_id || data.senderId,
        recipientId: data.recipient_id || data.recipientId,
        subject: data.subject,
        content: data.content,
        read: data.read !== undefined ? data.read : false,
        attachments: data.attachments,
      })
    ) as any;
    return this.mapToMessageResponse(result);
  }

  async updateMessage(id: string, data: any): Promise<MessageResponse> {
    const result = await firstValueFrom(
      this.messageGrpcService.UpdateMessage({
        id,
        read: data.read !== undefined ? data.read : undefined,
        readAt: data.read_at || data.readAt || undefined,
      })
    ) as any;
    return this.mapToMessageResponse(result);
  }

  private mapToMessageResponse(data: any): MessageResponse {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    let attachments: string[] = [];
    if (data.attachments) {
      try {
        attachments = typeof data.attachments === 'string' ? JSON.parse(data.attachments) : data.attachments;
      } catch (e) {
        attachments = [];
      }
    }

    return {
      id: data.id,
      sender_id: data.senderId || data.sender_id || '',
      recipient_id: data.recipientId || data.recipient_id || '',
      subject: data.subject || '',
      content: data.content || '',
      read: data.read || false,
      read_at: formatDateTime(data.readAt || data.read_at) || null,
      attachments: attachments,
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Job Posting Methods
  async getJobPostings(query: { sort?: string }): Promise<JobPostingResponse[]> {
    const result = await firstValueFrom(
      this.jobPostingGrpcService.GetJobPostings({
        sort: query.sort,
      })
    ) as any;
    return (result.jobPostings || []).map((jobPosting: any) => this.mapToJobPostingResponse(jobPosting));
  }

  async createJobPosting(data: any): Promise<JobPostingResponse> {
    const result = await firstValueFrom(
      this.jobPostingGrpcService.CreateJobPosting({
        title: data.title,
        department: data.department || undefined,
        departmentId: data.department_id || data.departmentId || undefined,
        description: data.description || undefined,
        requirements: data.requirements || undefined,
        status: data.status || undefined,
        postedDate: data.posted_date || data.postedDate || undefined,
        closingDate: data.closing_date || data.closingDate || undefined,
      })
    ) as any;
    return this.mapToJobPostingResponse(result);
  }

  async updateJobPosting(id: string, data: any): Promise<JobPostingResponse> {
    const result = await firstValueFrom(
      this.jobPostingGrpcService.UpdateJobPosting({
        id,
        title: data.title,
        department: data.department,
        departmentId: data.department_id || data.departmentId,
        description: data.description,
        requirements: data.requirements,
        status: data.status,
        postedDate: data.posted_date || data.postedDate,
        closingDate: data.closing_date || data.closingDate,
      })
    ) as any;
    return this.mapToJobPostingResponse(result);
  }

  private mapToJobPostingResponse(data: any): JobPostingResponse {
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

    let requirements: string[] = [];
    if (data.requirements) {
      try {
        requirements = typeof data.requirements === 'string' ? JSON.parse(data.requirements) : data.requirements;
      } catch (e) {
        requirements = [];
      }
    }

    return {
      id: data.id,
      title: data.title || '',
      department: data.department || '',
      department_id: data.departmentId || data.department_id || '',
      description: data.description || '',
      requirements: requirements,
      status: data.status || 'draft',
      posted_date: formatDate(data.postedDate || data.posted_date),
      closing_date: formatDate(data.closingDate || data.closing_date),
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Applicant Methods
  async getApplicants(query: { 
    sort?: string;
    job_posting_id?: string;
    jobPostingId?: string;
    status?: string;
  }): Promise<ApplicantResponse[]> {
    const result = await firstValueFrom(
      this.applicantGrpcService.GetApplicants({
        sort: query.sort,
        jobPostingId: query.job_posting_id || query.jobPostingId,
        status: query.status,
      })
    ) as any;
    return (result.applicants || []).map((applicant: any) => this.mapToApplicantResponse(applicant));
  }

  async createApplicant(data: any): Promise<ApplicantResponse> {
    const result = await firstValueFrom(
      this.applicantGrpcService.CreateApplicant({
        jobPostingId: data.job_posting_id || data.jobPostingId,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        resumeUrl: data.resume_url || data.resumeUrl || undefined,
        coverLetter: data.cover_letter || data.coverLetter || undefined,
        status: data.status || 'applied',
        appliedDate: data.applied_date || data.appliedDate,
      })
    ) as any;
    return this.mapToApplicantResponse(result);
  }

  async updateApplicant(id: string, data: any): Promise<ApplicantResponse> {
    const result = await firstValueFrom(
      this.applicantGrpcService.UpdateApplicant({
        id,
        status: data.status,
        interviewDate: data.interview_date || data.interviewDate || undefined,
        interviewNotes: data.interview_notes || data.interviewNotes || undefined,
      })
    ) as any;
    return this.mapToApplicantResponse(result);
  }

  private mapToApplicantResponse(data: any): ApplicantResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      job_posting_id: data.jobPostingId || data.job_posting_id || '',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      resume_url: data.resumeUrl || data.resume_url || '',
      cover_letter: data.coverLetter || data.cover_letter || '',
      status: data.status || 'applied',
      applied_date: formatDate(data.appliedDate || data.applied_date),
      interview_date: formatDate(data.interviewDate || data.interview_date) || null,
      interview_notes: data.interviewNotes || data.interview_notes || null,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // Onboarding Plan Methods
  async getOnboardingPlans(query: { sort?: string }): Promise<OnboardingPlanResponse[]> {
    const result = await firstValueFrom(
      this.onboardingPlanGrpcService.GetOnboardingPlans({
        sort: query.sort,
      })
    ) as any;
    return (result.onboardingPlans || []).map((plan: any) => this.mapToOnboardingPlanResponse(plan));
  }

  async createOnboardingPlan(data: any): Promise<OnboardingPlanResponse> {
    const result = await firstValueFrom(
      this.onboardingPlanGrpcService.CreateOnboardingPlan({
        name: data.name,
        employeeId: data.employee_id || data.employeeId || undefined,
        startDate: data.start_date || data.startDate || undefined,
        durationDays: data.duration_days || data.durationDays,
        description: data.description || undefined,
        welcomeMessage: data.welcome_message || data.welcomeMessage || undefined,
        assignBuddy: data.assign_buddy !== undefined ? data.assign_buddy : (data.assignBuddy !== undefined ? data.assignBuddy : undefined),
        buddyId: data.buddy_id || data.buddyId || undefined,
        requireInitialGoals: data.require_initial_goals !== undefined ? data.require_initial_goals : (data.requireInitialGoals !== undefined ? data.requireInitialGoals : undefined),
        phases: data.phases || undefined,
        checklistTemplate: data.checklist_template || data.checklistTemplate || undefined,
        requiredDocuments: data.required_documents || data.requiredDocuments || undefined,
        status: data.status || undefined,
      })
    ) as any;
    return this.mapToOnboardingPlanResponse(result);
  }

  async updateOnboardingPlan(id: string, data: any): Promise<OnboardingPlanResponse> {
    const result = await firstValueFrom(
      this.onboardingPlanGrpcService.UpdateOnboardingPlan({
        id,
        name: data.name,
        employeeId: data.employee_id || data.employeeId,
        startDate: data.start_date || data.startDate,
        durationDays: data.duration_days || data.durationDays,
        description: data.description,
        welcomeMessage: data.welcome_message || data.welcomeMessage,
        assignBuddy: data.assign_buddy !== undefined ? data.assign_buddy : data.assignBuddy,
        buddyId: data.buddy_id || data.buddyId,
        requireInitialGoals: data.require_initial_goals !== undefined ? data.require_initial_goals : data.requireInitialGoals,
        phases: data.phases,
        checklistTemplate: data.checklist_template || data.checklistTemplate,
        requiredDocuments: data.required_documents || data.requiredDocuments,
        status: data.status,
      })
    ) as any;
    return this.mapToOnboardingPlanResponse(result);
  }

  private mapToOnboardingPlanResponse(data: any): OnboardingPlanResponse {
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

    let phases: Array<{ name: string; description: string }> = [];
    if (data.phases) {
      try {
        phases = typeof data.phases === 'string' ? JSON.parse(data.phases) : data.phases;
      } catch (e) {
        phases = [];
      }
    }

    let checklistTemplate: Array<{ title: string; description: string; required: boolean }> = [];
    if (data.checklistTemplate) {
      try {
        checklistTemplate = typeof data.checklistTemplate === 'string' ? JSON.parse(data.checklistTemplate) : data.checklistTemplate;
      } catch (e) {
        checklistTemplate = [];
      }
    }

    let requiredDocuments: Array<{ name: string; description: string; required: boolean }> = [];
    if (data.requiredDocuments) {
      try {
        requiredDocuments = typeof data.requiredDocuments === 'string' ? JSON.parse(data.requiredDocuments) : data.requiredDocuments;
      } catch (e) {
        requiredDocuments = [];
      }
    }

    return {
      id: data.id,
      name: data.name || '',
      employee_id: data.employeeId || data.employee_id || '',
      start_date: formatDate(data.startDate || data.start_date),
      duration_days: data.durationDays || data.duration_days || 0,
      description: data.description || '',
      welcome_message: data.welcomeMessage || data.welcome_message || '',
      assign_buddy: data.assignBuddy !== undefined ? data.assignBuddy : (data.assign_buddy !== undefined ? data.assign_buddy : false),
      buddy_id: data.buddyId || data.buddy_id || '',
      require_initial_goals: data.requireInitialGoals !== undefined ? data.requireInitialGoals : (data.require_initial_goals !== undefined ? data.require_initial_goals : false),
      phases: phases,
      checklist_template: checklistTemplate,
      required_documents: requiredDocuments,
      status: data.status || 'draft',
      created_at: formatDateTime(data.createdAt || data.created_at),
    };
  }

  // Onboarding Task Methods
  async getOnboardingTasks(query: { 
    onboarding_plan_id?: string;
    onboardingPlanId?: string;
    assigned_to?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<OnboardingTaskResponse[]> {
    const result = await firstValueFrom(
      this.onboardingTaskGrpcService.GetOnboardingTasks({
        onboardingPlanId: query.onboarding_plan_id || query.onboardingPlanId,
        assignedTo: query.assigned_to || query.assignedTo,
        status: query.status,
      })
    ) as any;
    return (result.onboardingTasks || []).map((task: any) => this.mapToOnboardingTaskResponse(task));
  }

  async createOnboardingTask(data: any): Promise<OnboardingTaskResponse> {
    const result = await firstValueFrom(
      this.onboardingTaskGrpcService.CreateOnboardingTask({
        onboardingPlanId: data.onboarding_plan_id || data.onboardingPlanId,
        title: data.title,
        description: data.description || undefined,
        assignedTo: data.assigned_to || data.assignedTo || undefined,
        dueDate: data.due_date || data.dueDate || undefined,
        status: data.status || 'pending',
      })
    ) as any;
    return this.mapToOnboardingTaskResponse(result);
  }

  async updateOnboardingTask(id: string, data: any): Promise<OnboardingTaskResponse> {
    const result = await firstValueFrom(
      this.onboardingTaskGrpcService.UpdateOnboardingTask({
        id,
        status: data.status,
        completedDate: data.completed_date || data.completedDate || undefined,
      })
    ) as any;
    return this.mapToOnboardingTaskResponse(result);
  }

  private mapToOnboardingTaskResponse(data: any): OnboardingTaskResponse {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    return {
      id: data.id,
      onboarding_plan_id: data.onboardingPlanId || data.onboarding_plan_id || '',
      title: data.title || '',
      description: data.description || '',
      assigned_to: data.assignedTo || data.assigned_to || '',
      due_date: formatDate(data.dueDate || data.due_date),
      status: data.status || 'pending',
      completed_date: formatDate(data.completedDate || data.completed_date) || null,
      created_at: data.createdAt || data.created_at || '',
    };
  }

  // ============================================
  // USER/AUTHENTICATION METHODS
  // ============================================
  async register(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.Register({
        email: data.email,
        employeeId: data.employee_id || data.employeeId,
        role: data.role,
        createdBy: data.created_by || 'system',
      })
    ) as any;
    return result;
  }

  async bootstrapAdmin(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.BootstrapAdmin({
        email: data.email,
        password: data.password,
        name: data.name || 'System Administrator',
      })
    ) as any;
    return result;
  }

  async activate(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.Activate({
        activationToken: data.activation_token || data.activationToken,
        password: data.password,
      })
    ) as any;
    return result;
  }

  async login(data: any, ipAddress?: string, userAgent?: string): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.Login({
        email: data.email,
        password: data.password,
        ipAddress,
        userAgent,
      })
    ) as any;
    return result;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.RefreshToken({ refreshToken })
    ) as any;
    return result;
  }

  async forgotPassword(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.ForgotPassword({ email: data.email })
    ) as any;
    return result;
  }

  async resetPassword(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.ResetPassword({
        resetToken: data.reset_token || data.resetToken,
        newPassword: data.new_password || data.newPassword,
      })
    ) as any;
    return result;
  }

  async getMe(userId: string): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.GetMe({ userId })
    ) as any;
    return result;
  }

  async getUsers(query: any): Promise<any[]> {
    const result = await firstValueFrom(
      this.userGrpcService.GetUsers({
        role: query.role,
        status: query.status,
        departmentId: query.department_id || query.departmentId,
      })
    ) as any;
    return result.users || [];
  }

  async getUser(id: string): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.GetUser({ id })
    ) as any;
    return result;
  }

  async updateUser(id: string, data: any): Promise<any> {
    const result = await firstValueFrom(
      this.userGrpcService.UpdateUser({
        id,
        role: data.role,
        status: data.status,
        updatedBy: data.updated_by || 'system',
      })
    ) as any;
    return result;
  }

  // ============================================
  // HIERARCHY METHODS
  // ============================================
  async getSubordinates(employeeId: string): Promise<any[]> {
    const result = await firstValueFrom(
      this.hierarchyGrpcService.GetSubordinates({ employeeId })
    ) as any;
    return result.employees || [];
  }

  async getSubordinatesTree(employeeId: string): Promise<any> {
    const result = await firstValueFrom(
      this.hierarchyGrpcService.GetSubordinatesTree({ employeeId })
    ) as any;
    return result;
  }

  async getAncestors(employeeId: string): Promise<any[]> {
    const result = await firstValueFrom(
      this.hierarchyGrpcService.GetAncestors({ employeeId })
    ) as any;
    return result.employees || [];
  }

  async getOrganizationTree(): Promise<any> {
    const result = await firstValueFrom(
      this.hierarchyGrpcService.GetOrganizationTree({})
    ) as any;
    return result;
  }

  // ============================================
  // APPROVAL METHODS
  // ============================================
  async createApproval(data: any): Promise<any> {
    const result = await firstValueFrom(
      this.approvalGrpcService.CreateApproval({
        requestType: data.request_type || data.requestType,
        requestId: data.request_id || data.requestId,
        requesterId: data.requester_id || data.requesterId,
        approvalChain: data.approval_chain || data.approvalChain,
      })
    ) as any;
    return result;
  }

  async getApprovals(query: any): Promise<any[]> {
    const result = await firstValueFrom(
      this.approvalGrpcService.GetApprovals({
        status: query.status,
        requesterId: query.requester_id || query.requesterId,
        approverId: query.approver_id || query.approverId,
        requestType: query.request_type || query.requestType,
      })
    ) as any;
    return result.approvals || [];
  }

  async getApproval(id: string): Promise<any> {
    const result = await firstValueFrom(
      this.approvalGrpcService.GetApproval({ id })
    ) as any;
    return result;
  }

  async approveApproval(id: string, approverId: string, data: any): Promise<any> {
    const result = await firstValueFrom(
      this.approvalGrpcService.Approve({
        id,
        approverId,
        comments: data.comments,
      })
    ) as any;
    return result;
  }

  async rejectApproval(id: string, approverId: string, data: any): Promise<any> {
    const result = await firstValueFrom(
      this.approvalGrpcService.Reject({
        id,
        approverId,
        rejectionReason: data.rejection_reason || data.rejectionReason,
      })
    ) as any;
    return result;
  }

  async getApprovalHistory(approvalId: string): Promise<any[]> {
    const result = await firstValueFrom(
      this.approvalGrpcService.GetHistory({ approvalId })
    ) as any;
    return result.history || [];
  }

  // ============================================
  // NOTIFICATION METHODS
  // ============================================
  async getNotifications(userId: string, query: any): Promise<any[]> {
    const result = await firstValueFrom(
      this.notificationGrpcService.GetNotifications({
        userId,
        read: query.read,
        type: query.type,
      })
    ) as any;
    return result.notifications || [];
  }

  async markNotificationAsRead(id: string, userId: string): Promise<any> {
    const result = await firstValueFrom(
      this.notificationGrpcService.MarkAsRead({ id, userId })
    ) as any;
    return result;
  }

  async markAllNotificationsAsRead(userId: string): Promise<any> {
    const result = await firstValueFrom(
      this.notificationGrpcService.MarkAllAsRead({ userId })
    ) as any;
    return result;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await firstValueFrom(
      this.notificationGrpcService.GetUnreadCount({ userId })
    ) as any;
    return result.count || 0;
  }

  // ============================================
  // AUDIT LOG METHODS
  // ============================================
  async getAuditLogs(query: any): Promise<any> {
    const result = await firstValueFrom(
      this.auditLogGrpcService.GetAuditLogs({
        userId: query.user_id || query.userId,
        action: query.action,
        entityType: query.entity_type || query.entityType,
        dateFrom: query.date_from || query.dateFrom,
        dateTo: query.date_to || query.dateTo,
        page: query.page ? parseInt(query.page) : undefined,
        limit: query.limit ? parseInt(query.limit) : undefined,
      })
    ) as any;
    return {
      data: result.auditLogs || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 50,
    };
  }
}

