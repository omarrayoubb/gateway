import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PeopleModule } from './people/people.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AttendanceSummaryModule } from './attendance-summary/attendance-summary.module';
import { AttendancePolicyModule } from './attendance-policy/attendance-policy.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { LeaveBalancesModule } from './leave-balances/leave-balances.module';
import { LeaveApprovalsModule } from './leave-approvals/leave-approvals.module';
import { LeavePoliciesModule } from './leave-policies/leave-policies.module';
import { HolidaysModule } from './holidays/holidays.module';
import { LeaveAccrualsModule } from './leave-accruals/leave-accruals.module';
import { PayrollRecordsModule } from './payroll-records/payroll-records.module';
import { PayrollConfigurationsModule } from './payroll-configurations/payroll-configurations.module';
import { PayrollExceptionsModule } from './payroll-exceptions/payroll-exceptions.module';
import { CustomPayrollComponentsModule } from './custom-payroll-components/custom-payroll-components.module';
import { PerformanceReviewsModule } from './performance-reviews/performance-reviews.module';
import { PerformanceGoalsModule } from './performance-goals/performance-goals.module';
import { ReviewCyclesModule } from './review-cycles/review-cycles.module';
import { ReviewTemplatesModule } from './review-templates/review-templates.module';
import { GoalsModule } from './goals/goals.module';
import { SkillsModule } from './skills/skills.module';
import { EmployeeSkillsModule } from './employee-skills/employee-skills.module';
import { CompetenciesModule } from './competencies/competencies.module';
import { CompetencyAssessmentsModule } from './competency-assessments/competency-assessments.module';
import { CoursesModule } from './courses/courses.module';
import { CourseEnrollmentsModule } from './course-enrollments/course-enrollments.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { CertificationsModule } from './certifications/certifications.module';
import { EmployeeCertificationsModule } from './employee-certifications/employee-certifications.module';
import { CareerPathsModule } from './career-paths/career-paths.module';
import { CareerPathEnrollmentsModule } from './career-path-enrollments/career-path-enrollments.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MessagesModule } from './messages/messages.module';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { OnboardingPlansModule } from './onboarding-plans/onboarding-plans.module';
import { OnboardingTasksModule } from './onboarding-tasks/onboarding-tasks.module';
import { HierarchyModule } from './hierarchy/hierarchy.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { Employee } from './people/entities/person.entity';
import { Department } from './departments/entities/department.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import { AttendanceSummary } from './attendance-summary/entities/attendance-summary.entity';
import { AttendancePolicy } from './attendance-policy/entities/attendance-policy.entity';
import { LeaveType } from './leave-types/entities/leave-type.entity';
import { LeaveRequest } from './leave-requests/entities/leave-request.entity';
import { LeaveBalance } from './leave-balances/entities/leave-balance.entity';
import { LeaveApproval } from './leave-approvals/entities/leave-approval.entity';
import { LeavePolicy } from './leave-policies/entities/leave-policy.entity';
import { Holiday } from './holidays/entities/holiday.entity';
import { LeaveAccrual } from './leave-accruals/entities/leave-accrual.entity';
import { PayrollRecord } from './payroll-records/entities/payroll-record.entity';
import { PayrollConfiguration } from './payroll-configurations/entities/payroll-configuration.entity';
import { PayrollException } from './payroll-exceptions/entities/payroll-exception.entity';
import { CustomPayrollComponent } from './custom-payroll-components/entities/custom-payroll-component.entity';
import { PerformanceReview } from './performance-reviews/entities/performance-review.entity';
import { PerformanceGoal } from './performance-goals/entities/performance-goal.entity';
import { ReviewCycle } from './review-cycles/entities/review-cycle.entity';
import { ReviewTemplate } from './review-templates/entities/review-template.entity';
import { Goal } from './goals/entities/goal.entity';
import { Skill } from './skills/entities/skill.entity';
import { EmployeeSkill } from './employee-skills/entities/employee-skill.entity';
import { Competency } from './competencies/entities/competency.entity';
import { CompetencyAssessment } from './competency-assessments/entities/competency-assessment.entity';
import { Course } from './courses/entities/course.entity';
import { CourseEnrollment } from './course-enrollments/entities/course-enrollment.entity';
import { LearningPath } from './learning-paths/entities/learning-path.entity';
import { Certification } from './certifications/entities/certification.entity';
import { EmployeeCertification } from './employee-certifications/entities/employee-certification.entity';
import { CareerPath } from './career-paths/entities/career-path.entity';
import { CareerPathEnrollment } from './career-path-enrollments/entities/career-path-enrollment.entity';
import { Announcement } from './announcements/entities/announcement.entity';
import { Message } from './messages/entities/message.entity';
import { JobPosting } from './job-postings/entities/job-posting.entity';
import { Applicant } from './applicants/entities/applicant.entity';
import { OnboardingPlan } from './onboarding-plans/entities/onboarding-plan.entity';
import { OnboardingTask } from './onboarding-tasks/entities/onboarding-task.entity';
import { PeopleUser } from './people/entities/people-user.entity';
import { Approval } from './approvals/entities/approval.entity';
import { ApprovalHistory } from './approvals/entities/approval-history.entity';
import { Notification } from './notifications/entities/notification.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rawUrl =
          configService.get('PEOPLE_DATABASE_URL') || configService.get('DATABASE_URL');
        const databaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : rawUrl;
        const synchronize =
          configService.get('PEOPLE_DB_SYNCHRONIZE') === 'true' ||
          configService.get('DB_SYNCHRONIZE') === 'true';
        const entities = [
          Employee,
          Department,
          Attendance,
          AttendanceSummary,
          AttendancePolicy,
          LeaveType,
          LeaveRequest,
          LeaveBalance,
          LeaveApproval,
          LeavePolicy,
          Holiday,
          LeaveAccrual,
          PayrollRecord,
          PayrollConfiguration,
          PayrollException,
          CustomPayrollComponent,
          PerformanceReview,
          PerformanceGoal,
          ReviewCycle,
          ReviewTemplate,
          Goal,
          Skill,
          EmployeeSkill,
          Competency,
          CompetencyAssessment,
          Course,
          CourseEnrollment,
          LearningPath,
          Certification,
          EmployeeCertification,
          CareerPath,
          CareerPathEnrollment,
          Announcement,
          Message,
          JobPosting,
          Applicant,
          OnboardingPlan,
          OnboardingTask,
          PeopleUser,
          Approval,
          ApprovalHistory,
          Notification,
          AuditLog,
        ];
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities,
            synchronize,
          };
        }
        return {
          type: 'postgres',
          host: configService.get('PEOPLE_DB_HOST') || configService.get('DB_HOST') || 'localhost',
          port: configService.get('PEOPLE_DB_PORT') || configService.get('DB_PORT') || 5432,
          username: configService.get('PEOPLE_DB_USERNAME') || configService.get('DB_USERNAME') || 'postgres',
          password: configService.get('PEOPLE_DB_PASSWORD') || configService.get('DB_PASSWORD') || 'postgres',
          database: configService.get('PEOPLE_DB_DATABASE') || configService.get('DB_DATABASE') || 'people_db',
          entities,
          synchronize,
        };
      },
    }),
    PeopleModule,
    DepartmentsModule,
    AttendanceModule,
    AttendanceSummaryModule,
    AttendancePolicyModule,
    LeaveTypesModule,
    LeaveRequestsModule,
    LeaveBalancesModule,
    LeaveApprovalsModule,
    LeavePoliciesModule,
    HolidaysModule,
    LeaveAccrualsModule,
    PayrollRecordsModule,
    PayrollConfigurationsModule,
    PayrollExceptionsModule,
    CustomPayrollComponentsModule,
    PerformanceReviewsModule,
    PerformanceGoalsModule,
    ReviewCyclesModule,
    ReviewTemplatesModule,
    GoalsModule,
    SkillsModule,
    EmployeeSkillsModule,
    CompetenciesModule,
    CompetencyAssessmentsModule,
    CoursesModule,
    CourseEnrollmentsModule,
    LearningPathsModule,
    CertificationsModule,
    EmployeeCertificationsModule,
    CareerPathsModule,
    CareerPathEnrollmentsModule,
    AnnouncementsModule,
    MessagesModule,
    JobPostingsModule,
    ApplicantsModule,
    OnboardingPlansModule,
    OnboardingTasksModule,
    HierarchyModule,
    ApprovalsModule,
    NotificationsModule,
    AuditLogsModule,
  ],
})
export class AppModule {}

