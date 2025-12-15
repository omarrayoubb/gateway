import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Post,
  Body,
  Request,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService, PaginatedTasksResult } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/users.entity';
import { TaskResponseDto } from './dto/task-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * POST /tasks
   * Creates a new task.
   * Requires: ownerId, subject
   */
  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.tasksService.create(createTaskDto, currentUser);
  }

  /**
   * GET /tasks
   * Finds all tasks with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedTasksResult> {
    return this.tasksService.findAll(paginationQuery);
  }

  /**
   * GET /tasks/:id
   * Finds a single task by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  /**
   * PATCH /tasks/bulk
   * Bulk update tasks.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateTaskDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.tasksService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /tasks/:id
   * Updates an existing task.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.tasksService.update(id, updateTaskDto, currentUser);
  }

  /**
   * POST /tasks/bulk-delete
   * Bulk delete tasks.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<BulkDeleteResponse> {
    return this.tasksService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /tasks/:id
   * Deletes an existing task.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}

