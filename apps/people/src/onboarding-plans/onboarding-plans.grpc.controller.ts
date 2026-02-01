import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { OnboardingPlansService } from './onboarding-plans.service';
import { CreateOnboardingPlanDto } from './dto/create-onboarding-plan.dto';
import { UpdateOnboardingPlanDto } from './dto/update-onboarding-plan.dto';
import { OnboardingPlanStatus } from './entities/onboarding-plan.entity';

@Controller()
export class OnboardingPlansGrpcController {
  constructor(private readonly onboardingPlansService: OnboardingPlansService) {}

  @GrpcMethod('OnboardingPlanService', 'GetOnboardingPlans')
  async getOnboardingPlans(data: { sort?: string }) {
    try {
      const plans = await this.onboardingPlansService.findAll({ sort: data.sort });
      return {
        onboardingPlans: plans.map(plan => this.mapOnboardingPlanToProto(plan)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get onboarding plans',
      });
    }
  }

  @GrpcMethod('OnboardingPlanService', 'CreateOnboardingPlan')
  async createOnboardingPlan(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      // Validate and convert status enum
      let status: OnboardingPlanStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(OnboardingPlanStatus);
        if (validStatuses.includes(data.status as OnboardingPlanStatus)) {
          status = data.status as OnboardingPlanStatus;
        }
      }

      const createDto: CreateOnboardingPlanDto = {
        name: data.name,
        employeeId: data.employeeId || data.employee_id || undefined,
        startDate: data.startDate || data.start_date || undefined,
        durationDays: data.durationDays || data.duration_days 
          ? parseInt(data.durationDays || data.duration_days) 
          : undefined,
        description: data.description || undefined,
        welcomeMessage: data.welcomeMessage || data.welcome_message || undefined,
        assignBuddy: data.assignBuddy !== undefined ? data.assignBuddy : (data.assign_buddy !== undefined ? data.assign_buddy : undefined),
        buddyId: data.buddyId || data.buddy_id || undefined,
        requireInitialGoals: data.requireInitialGoals !== undefined ? data.requireInitialGoals : (data.require_initial_goals !== undefined ? data.require_initial_goals : undefined),
        phases: data.phases || undefined,
        checklistTemplate: data.checklistTemplate || data.checklist_template || undefined,
        requiredDocuments: data.requiredDocuments || data.required_documents || undefined,
        status: status,
      };

      const plan = await this.onboardingPlansService.create(createDto);
      return this.mapOnboardingPlanToProto(plan);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create onboarding plan',
      });
    }
  }

  @GrpcMethod('OnboardingPlanService', 'UpdateOnboardingPlan')
  async updateOnboardingPlan(data: any) {
    try {
      // Validate and convert status enum
      let status: OnboardingPlanStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(OnboardingPlanStatus);
        if (validStatuses.includes(data.status as OnboardingPlanStatus)) {
          status = data.status as OnboardingPlanStatus;
        }
      }

      const updateDto: UpdateOnboardingPlanDto = {
        name: data.name || undefined,
        employeeId: data.employeeId || data.employee_id || undefined,
        startDate: data.startDate || data.start_date || undefined,
        durationDays: data.durationDays || data.duration_days 
          ? parseInt(data.durationDays || data.duration_days) 
          : undefined,
        description: data.description || undefined,
        welcomeMessage: data.welcomeMessage || data.welcome_message || undefined,
        assignBuddy: data.assignBuddy !== undefined ? data.assignBuddy : (data.assign_buddy !== undefined ? data.assign_buddy : undefined),
        buddyId: data.buddyId || data.buddy_id || undefined,
        requireInitialGoals: data.requireInitialGoals !== undefined ? data.requireInitialGoals : (data.require_initial_goals !== undefined ? data.require_initial_goals : undefined),
        phases: data.phases || undefined,
        checklistTemplate: data.checklistTemplate || data.checklist_template || undefined,
        requiredDocuments: data.requiredDocuments || data.required_documents || undefined,
        status: status,
      };
      const plan = await this.onboardingPlansService.update(data.id, updateDto);
      return this.mapOnboardingPlanToProto(plan);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update onboarding plan',
      });
    }
  }

  @GrpcMethod('OnboardingPlanService', 'DeleteOnboardingPlan')
  async deleteOnboardingPlan(data: { id: string }) {
    try {
      await this.onboardingPlansService.remove(data.id);
      return { success: true, message: 'Onboarding plan deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete onboarding plan',
      });
    }
  }

  private mapOnboardingPlanToProto(plan: any) {
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
      id: plan.id,
      name: plan.name,
      employeeId: plan.employeeId || plan.employee_id || '',
      startDate: formatDate(plan.startDate || plan.start_date),
      durationDays: plan.durationDays || plan.duration_days || 0,
      description: plan.description || '',
      welcomeMessage: plan.welcomeMessage || plan.welcome_message || '',
      assignBuddy: plan.assignBuddy !== undefined ? plan.assignBuddy : (plan.assign_buddy !== undefined ? plan.assign_buddy : false),
      buddyId: plan.buddyId || plan.buddy_id || '',
      requireInitialGoals: plan.requireInitialGoals !== undefined ? plan.requireInitialGoals : (plan.require_initial_goals !== undefined ? plan.require_initial_goals : false),
      phases: plan.phases || [],
      checklistTemplate: plan.checklistTemplate || plan.checklist_template || [],
      requiredDocuments: plan.requiredDocuments || plan.required_documents || [],
      status: plan.status,
      createdAt: formatDateTime(plan.createdAt),
    };
  }
}
