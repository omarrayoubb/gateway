import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcErrorMapper } from '../common';
import { TasksService } from './tasks.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  PaginationRequest,
  FindOneTaskRequest,
  DeleteTaskRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  TaskResponse,
  PaginatedTasksResponse,
  DeleteTaskResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/tasks';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  async createTask(
    data: CreateTaskRequest,
    metadata: Metadata,
  ): Promise<TaskResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createTaskDto = this.mapCreateRequestToDto(data);
      const result = await this.tasksService.create(createTaskDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM TasksController.createTask:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('TaskService', 'FindAllTasks')
  async findAllTasks(data: PaginationRequest): Promise<PaginatedTasksResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.tasksService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from TasksService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(task => this.mapResponseDtoToProto(task)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllTasks:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('TaskService', 'FindOneTask')
  async findOneTask(data: FindOneTaskRequest): Promise<TaskResponse> {
    try {
      const result = await this.tasksService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM TasksController.findOneTask for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneTask for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  async updateTask(
    data: UpdateTaskRequest,
    metadata: Metadata,
  ): Promise<TaskResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateTaskDto = this.mapUpdateRequestToDto(data);
      const result = await this.tasksService.update(data.id, updateTaskDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM TasksController.updateTask for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateTask for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TaskService', 'DeleteTask')
  async deleteTask(data: DeleteTaskRequest): Promise<DeleteTaskResponse> {
    try {
      await this.tasksService.remove(data.id);
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      console.error(`Error in CRM TasksController.deleteTask for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteTask for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TaskService', 'BulkDeleteTasks')
  async bulkDeleteTasks(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.tasksService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM TasksController.bulkDeleteTasks:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteTasks',
      });
    }
  }

  @GrpcMethod('TaskService', 'BulkUpdateTasks')
  async bulkUpdateTasks(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateTaskDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.tasksService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM TasksController.bulkUpdateTasks:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateTasks',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16,
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateTaskRequest): CreateTaskDto {
    if (!data.ownerId || !data.subject) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: ownerId and subject are required',
      });
    }

    return {
      ownerId: data.ownerId,
      subject: data.subject,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      description: data.description,
      notes: data.notes,
      links: data.links || [],
      priority: data.priority as any,
      status: data.status as any,
      rfqId: data.rfqId || null,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      closedTime: data.closedTime ? new Date(data.closedTime) : undefined,
    };
  }

  private mapUpdateRequestToDto(data: UpdateTaskRequest): UpdateTaskDto {
    const dto: UpdateTaskDto = {};

    if (data.ownerId !== undefined) dto.ownerId = data.ownerId;
    if (data.subject !== undefined) dto.subject = data.subject;
    if (data.dueDate !== undefined) dto.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    if (data.description !== undefined) dto.description = data.description;
    if (data.notes !== undefined) dto.notes = data.notes;
    if (data.links !== undefined) dto.links = data.links || [];
    if (data.priority !== undefined) dto.priority = data.priority as any;
    if (data.status !== undefined) dto.status = data.status as any;
    if (data.rfqId !== undefined) dto.rfqId = data.rfqId || null;
    if (data.currency !== undefined) dto.currency = data.currency;
    if (data.exchangeRate !== undefined) dto.exchangeRate = data.exchangeRate;
    if (data.closedTime !== undefined) dto.closedTime = data.closedTime ? new Date(data.closedTime) : undefined;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateTaskDto {
    const dto: UpdateTaskDto = {};

    if (fields.ownerId !== undefined) dto.ownerId = fields.ownerId;
    if (fields.subject !== undefined) dto.subject = fields.subject;
    if (fields.dueDate !== undefined) dto.dueDate = fields.dueDate ? new Date(fields.dueDate) : undefined;
    if (fields.description !== undefined) dto.description = fields.description;
    if (fields.notes !== undefined) dto.notes = fields.notes;
    if (fields.links !== undefined) dto.links = fields.links || [];
    if (fields.priority !== undefined) dto.priority = fields.priority as any;
    if (fields.status !== undefined) dto.status = fields.status as any;
    if (fields.rfqId !== undefined) dto.rfqId = fields.rfqId || null;
    if (fields.currency !== undefined) dto.currency = fields.currency;
    if (fields.exchangeRate !== undefined) dto.exchangeRate = fields.exchangeRate;
    if (fields.closedTime !== undefined) dto.closedTime = fields.closedTime ? new Date(fields.closedTime) : undefined;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): TaskResponse {
    return {
      id: dto.id,
      taskNumber: dto.taskNumber ?? undefined,
      ownerId: dto.ownerId ?? undefined,
      subject: dto.subject,
      dueDate: dto.dueDate ? dto.dueDate.toISOString() : undefined,
      description: dto.description ?? undefined,
      notes: dto.notes ?? undefined,
      links: dto.links || [],
      priority: dto.priority ?? undefined,
      status: dto.status ?? undefined,
      currency: dto.currency ?? undefined,
      exchangeRate: dto.exchangeRate ?? undefined,
      closedTime: dto.closedTime ? dto.closedTime.toISOString() : undefined,
      createdBy: dto.createdBy,
      modifiedBy: dto.modifiedBy,
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dto.updatedAt?.toISOString() || new Date().toISOString(),
      owner: dto.Owner ? {
        id: dto.Owner.id,
        name: dto.Owner.name,
      } : undefined,
    };
  }
}
