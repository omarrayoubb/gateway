import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTask } from './entities/onboarding-task.entity';
import { CreateOnboardingTaskDto } from './dto/create-onboarding-task.dto';
import { UpdateOnboardingTaskDto } from './dto/update-onboarding-task.dto';

@Injectable()
export class OnboardingTasksService {
  constructor(
    @InjectRepository(OnboardingTask)
    private readonly onboardingTaskRepository: Repository<OnboardingTask>,
  ) {}

  async create(createOnboardingTaskDto: CreateOnboardingTaskDto): Promise<OnboardingTask> {
    const onboardingTask = this.onboardingTaskRepository.create({
      ...createOnboardingTaskDto,
      dueDate: createOnboardingTaskDto.dueDate 
        ? new Date(createOnboardingTaskDto.dueDate) 
        : null,
    });

    return await this.onboardingTaskRepository.save(onboardingTask);
  }

  async findAll(query: { 
    onboarding_plan_id?: string;
    onboardingPlanId?: string;
    assigned_to?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<OnboardingTask[]> {
    const queryBuilder = this.onboardingTaskRepository.createQueryBuilder('onboarding_task');

    // Filter by onboarding_plan_id if provided
    const onboardingPlanId = query.onboarding_plan_id || query.onboardingPlanId;
    if (onboardingPlanId) {
      queryBuilder.where('onboarding_task.onboardingPlanId = :onboardingPlanId', { onboardingPlanId });
    }

    // Filter by assigned_to if provided
    const assignedTo = query.assigned_to || query.assignedTo;
    if (assignedTo) {
      const whereCondition = onboardingPlanId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('onboarding_task.assignedTo = :assignedTo', { assignedTo });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = (onboardingPlanId || assignedTo) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('onboarding_task.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('onboarding_task.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<OnboardingTask> {
    const onboardingTask = await this.onboardingTaskRepository.findOne({
      where: { id },
    });

    if (!onboardingTask) {
      throw new NotFoundException(`Onboarding task with ID ${id} not found`);
    }

    return onboardingTask;
  }

  async update(id: string, updateOnboardingTaskDto: UpdateOnboardingTaskDto): Promise<OnboardingTask> {
    const onboardingTask = await this.findOne(id);
    
    const updateData: any = { ...updateOnboardingTaskDto };
    if (updateOnboardingTaskDto.completedDate) {
      updateData.completedDate = new Date(updateOnboardingTaskDto.completedDate);
    }

    Object.assign(onboardingTask, updateData);
    return await this.onboardingTaskRepository.save(onboardingTask);
  }

  async remove(id: string): Promise<void> {
    const onboardingTask = await this.findOne(id);
    await this.onboardingTaskRepository.remove(onboardingTask);
  }
}
