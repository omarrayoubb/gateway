import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface TaskGrpcService {
  createTask(data: CreateTaskRequest, metadata?: Metadata): Observable<TaskResponse>;
  findAllTasks(data: PaginationRequest): Observable<PaginatedTasksResponse>;
  findOneTask(data: FindOneTaskRequest): Observable<TaskResponse>;
  updateTask(data: UpdateTaskRequest, metadata?: Metadata): Observable<TaskResponse>;
  deleteTask(data: DeleteTaskRequest): Observable<DeleteTaskResponse>;
  bulkDeleteTasks(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateTasks(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedTasksResult {
  data: TaskResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class TasksService implements OnModuleInit {
  private taskGrpcService: TaskGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.taskGrpcService = this.client.getService<TaskGrpcService>('TaskService');
  }

  createTask(createTaskDto: CreateTaskDto, currentUser: { id: string; name: string; email: string }): Observable<TaskResponseDto> {
    const request: CreateTaskRequest = this.mapCreateDtoToRequest(createTaskDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.taskGrpcService.createTask(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createTask gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllTasks(paginationQuery: PaginationQueryDto): Observable<PaginatedTasksResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.taskGrpcService.findAllTasks(request).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from CRM microservice');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure from CRM:', JSON.stringify(response, null, 2));
          return {
            data: [],
            total: response.total || 0,
            page: response.page || page,
            last_page: response.lastPage || 0,
          };
        }
        return {
          data: response.data.map(item => this.mapResponseToDto(item)),
          total: response.total || 0,
          page: response.page || page,
          last_page: response.lastPage || 0,
        };
      }),
      catchError(error => {
        console.error('Error fetching tasks from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneTask(id: string): Observable<TaskResponseDto> {
    const request: FindOneTaskRequest = { id };
    return this.taskGrpcService.findOneTask(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateTask(id: string, updateTaskDto: UpdateTaskDto, currentUser: { id: string; name: string; email: string }): Observable<TaskResponseDto> {
    const request: UpdateTaskRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateTaskDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.taskGrpcService.updateTask(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteTaskRequest = { id };
    return this.taskGrpcService.deleteTask(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.taskGrpcService.bulkDeleteTasks(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateTaskDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.taskGrpcService.bulkUpdateTasks(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updatedCount,
        failedItems: response.failedItems || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('user-name', user.name);
    metadata.add('user-email', user.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateTaskDto): CreateTaskRequest {
    return {
      ownerId: dto.ownerId,
      subject: dto.subject,
      dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : undefined,
      description: dto.description,
      notes: dto.notes,
      links: dto.links || [],
      priority: dto.priority,
      status: dto.status,
      rfqId: dto.rfqId || undefined,
      currency: dto.currency,
      exchangeRate: dto.exchangeRate,
      closedTime: dto.closedTime ? new Date(dto.closedTime).toISOString() : undefined,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateTaskDto | Partial<UpdateTaskDto>): Partial<UpdateTaskRequest> {
    const request: Partial<UpdateTaskRequest> = {};

    if (dto.ownerId !== undefined) request.ownerId = dto.ownerId;
    if (dto.subject !== undefined) request.subject = dto.subject;
    if (dto.dueDate !== undefined) request.dueDate = dto.dueDate ? new Date(dto.dueDate).toISOString() : undefined;
    if (dto.description !== undefined) request.description = dto.description;
    if (dto.notes !== undefined) request.notes = dto.notes;
    if (dto.links !== undefined) request.links = dto.links || [];
    if (dto.priority !== undefined) request.priority = dto.priority;
    if (dto.status !== undefined) request.status = dto.status;
    if (dto.rfqId !== undefined) request.rfqId = dto.rfqId || undefined;
    if (dto.currency !== undefined) request.currency = dto.currency;
    if (dto.exchangeRate !== undefined) request.exchangeRate = dto.exchangeRate;
    if (dto.closedTime !== undefined) request.closedTime = dto.closedTime ? new Date(dto.closedTime).toISOString() : undefined;

    return request;
  }

  private mapResponseToDto(response: TaskResponse): TaskResponseDto {
    return {
      id: response.id,
      taskNumber: response.taskNumber ?? null,
      ownerId: response.ownerId ?? null,
      subject: response.subject,
      dueDate: response.dueDate ? new Date(response.dueDate) : null,
      description: response.description ?? null,
      notes: response.notes ?? null,
      links: response.links || [],
      priority: (response.priority as any) ?? null,
      status: (response.status as any) ?? null,
      currency: response.currency ?? null,
      exchangeRate: response.exchangeRate ?? null,
      closedTime: response.closedTime ? new Date(response.closedTime) : null,
      createdBy: response.createdBy,
      modifiedBy: response.modifiedBy,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      Owner: response.owner ? {
        id: response.owner.id,
        name: response.owner.name,
      } : null,
    };
  }
}

