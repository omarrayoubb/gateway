import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...createGoalDto,
      targetDate: createGoalDto.targetDate 
        ? new Date(createGoalDto.targetDate) 
        : null,
    });

    return await this.goalRepository.save(goal);
  }

  async findAll(query: { 
    sort?: string; 
    employee_id?: string; 
    employeeId?: string; 
    status?: string;
    category?: string;
    parent_goal_id?: string;
    parentGoalId?: string;
  }): Promise<Goal[]> {
    const queryBuilder = this.goalRepository.createQueryBuilder('goal');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('goal.employeeId = :employeeId', { employeeId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('goal.status = :status', { status: query.status });
    }

    // Filter by category if provided
    if (query.category) {
      const whereCondition = (employeeId || query.status) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('goal.category = :category', { category: query.category });
    }

    // Filter by parent_goal_id if provided
    const parentGoalId = query.parent_goal_id || query.parentGoalId;
    if (parentGoalId) {
      const whereCondition = (employeeId || query.status || query.category) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('goal.parentGoalId = :parentGoalId', { parentGoalId });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'target_date': 'targetDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`goal.${dbField}`, order);
    } else {
      queryBuilder.orderBy('goal.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(id);
    
    const updateData: any = { ...updateGoalDto };
    if (updateGoalDto.targetDate) {
      updateData.targetDate = new Date(updateGoalDto.targetDate);
    }

    Object.assign(goal, updateData);
    return await this.goalRepository.save(goal);
  }

  async remove(id: string): Promise<void> {
    const goal = await this.findOne(id);
    await this.goalRepository.remove(goal);
  }
}
