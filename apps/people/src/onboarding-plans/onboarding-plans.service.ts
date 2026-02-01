import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingPlan } from './entities/onboarding-plan.entity';
import { CreateOnboardingPlanDto } from './dto/create-onboarding-plan.dto';
import { UpdateOnboardingPlanDto } from './dto/update-onboarding-plan.dto';

@Injectable()
export class OnboardingPlansService {
  constructor(
    @InjectRepository(OnboardingPlan)
    private readonly onboardingPlanRepository: Repository<OnboardingPlan>,
  ) {}

  async create(createOnboardingPlanDto: CreateOnboardingPlanDto): Promise<OnboardingPlan> {
    const onboardingPlan = this.onboardingPlanRepository.create({
      ...createOnboardingPlanDto,
      startDate: createOnboardingPlanDto.startDate 
        ? new Date(createOnboardingPlanDto.startDate) 
        : null,
    });

    return await this.onboardingPlanRepository.save(onboardingPlan);
  }

  async findAll(query: { sort?: string }): Promise<OnboardingPlan[]> {
    const queryBuilder = this.onboardingPlanRepository.createQueryBuilder('onboarding_plan');

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'created_date': 'createdAt',
        'start_date': 'startDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`onboarding_plan.${dbField}`, order);
    } else {
      queryBuilder.orderBy('onboarding_plan.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<OnboardingPlan> {
    const onboardingPlan = await this.onboardingPlanRepository.findOne({
      where: { id },
    });

    if (!onboardingPlan) {
      throw new NotFoundException(`Onboarding plan with ID ${id} not found`);
    }

    return onboardingPlan;
  }

  async update(id: string, updateOnboardingPlanDto: UpdateOnboardingPlanDto): Promise<OnboardingPlan> {
    const onboardingPlan = await this.findOne(id);
    
    const updateData: any = { ...updateOnboardingPlanDto };
    if (updateOnboardingPlanDto.startDate) {
      updateData.startDate = new Date(updateOnboardingPlanDto.startDate);
    }

    Object.assign(onboardingPlan, updateData);
    return await this.onboardingPlanRepository.save(onboardingPlan);
  }

  async remove(id: string): Promise<void> {
    const onboardingPlan = await this.findOne(id);
    await this.onboardingPlanRepository.remove(onboardingPlan);
  }
}
