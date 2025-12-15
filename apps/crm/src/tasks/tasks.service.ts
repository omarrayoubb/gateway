import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { User } from '../users/users.entity';
import { TaskResponseDto } from './dto/task-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

export interface PaginatedTasksResult {
  data: TaskResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generates the next task number incrementally
   */
  private async generateTaskNumber(): Promise<string> {
    // Find all task numbers that are numeric
    const tasks = await this.taskRepository.find({
      select: ['taskNumber'],
    });

    // Filter to numeric task numbers and find max
    let maxNumber = 0;
    for (const task of tasks) {
      if (task.taskNumber && /^\d+$/.test(task.taskNumber)) {
        const num = parseInt(task.taskNumber, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return nextNumber.toString().padStart(6, '0'); // Pad with zeros to 6 digits
  }

  /**
   * Creates a new task
   */
  async create(createTaskDto: CreateTaskDto, currentUser: Omit<User, 'password'>): Promise<TaskResponseDto> {
    // Validate owner exists
    const owner = await this.userRepository.findOneBy({ id: createTaskDto.ownerId });
    if (!owner) {
      throw new NotFoundException(`User with ID ${createTaskDto.ownerId} not found`);
    }

    // Generate task number
    const taskNumber = await this.generateTaskNumber();

    // Prepare task data
    const taskData: Partial<Task> = {
      ...createTaskDto,
      taskNumber,
      createdBy: currentUser.name,
      modifiedBy: currentUser.name,
      links: createTaskDto.links || [],
    };

    if (createTaskDto.dueDate) {
      taskData.dueDate = new Date(createTaskDto.dueDate);
    }

    if (createTaskDto.closedTime) {
      taskData.closedTime = new Date(createTaskDto.closedTime);
    }

    const newTask = this.taskRepository.create(taskData);
    const savedTask = await this.taskRepository.save(newTask);
    
    const fullTask = await this.getFullTaskById(savedTask.id);
    return this._transformTaskToResponse(fullTask);
  }

  /**
   * Get all tasks with pagination
   */
  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedTasksResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.taskRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: ['owner'],
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = data.map((task) => this._transformTaskToResponse(task));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.getFullTaskById(id);
    return this._transformTaskToResponse(task);
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    currentUser: Omit<User, 'password'>,
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Validate owner if provided
    if (updateTaskDto.ownerId) {
      const owner = await this.userRepository.findOneBy({ id: updateTaskDto.ownerId });
      if (!owner) {
        throw new NotFoundException(`User with ID ${updateTaskDto.ownerId} not found`);
      }
    }

    // Prepare update data
    const updateData: Partial<any> = {
      ...updateTaskDto,
      modifiedBy: currentUser.name, // Always update modifiedBy
    };

    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    if (updateTaskDto.closedTime) {
      updateData.closedTime = new Date(updateTaskDto.closedTime);
    }

    Object.assign(task, updateData);
    const savedTask = await this.taskRepository.save(task);
    
    const fullTask = await this.getFullTaskById(savedTask.id);
    return this._transformTaskToResponse(fullTask);
  }

  /**
   * Delete a task
   */
  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.taskRepository.remove(task);
  }

  /**
   * Bulk delete tasks
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all tasks that exist
    const tasks = await this.taskRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(tasks.map((t) => t.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Task not found' });
      }
    }

    // Delete all found tasks
    if (tasks.length > 0) {
      await this.taskRepository.remove(tasks);
      deletedCount = tasks.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update tasks - applies the same update fields to multiple tasks
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateTaskDto,
    currentUser: Omit<User, 'password'>,
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all tasks that exist
    const tasks = await this.taskRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(tasks.map((t) => t.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Task not found' });
      }
    }

    // Process each task
    for (const task of tasks) {
      // Skip if already failed validation
      if (failedItems.some((f) => f.id === task.id)) {
        continue;
      }

      try {
        // Validate owner if provided
        if (updateFields.ownerId) {
          const owner = await this.userRepository.findOneBy({ id: updateFields.ownerId });
          if (!owner) {
            failedItems.push({
              id: task.id,
              error: `User with ID ${updateFields.ownerId} not found`,
            });
            continue;
          }
        }

        // Prepare update data
        const updateData: Partial<any> = {
          ...updateFields,
          modifiedBy: currentUser.name,
        };

        if (updateFields.dueDate) {
          updateData.dueDate = new Date(updateFields.dueDate);
        }

        if (updateFields.closedTime) {
          updateData.closedTime = new Date(updateFields.closedTime);
        }

        Object.assign(task, updateData);
        await this.taskRepository.save(task);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: task.id,
          error: error.message || 'Failed to update task',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  /**
   * Get full task with all relations loaded
   */
  private async getFullTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Transform Task entity to TaskResponseDto
   */
  private _transformTaskToResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      taskNumber: task.taskNumber,
      ownerId: task.ownerId,
      subject: task.subject,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      description: task.description,
      notes: task.notes,
      links: task.links || [],
      priority: task.priority,
      status: task.status,
      currency: task.currency,
      exchangeRate: task.exchangeRate,
      closedTime: task.closedTime ? new Date(task.closedTime) : null,
      createdBy: task.createdBy,
      modifiedBy: task.modifiedBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      Owner: {
        id: task.owner.id,
        name: task.owner.name,
      },
    };
  }
}
