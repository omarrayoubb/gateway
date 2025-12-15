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
  HttpCode
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TasksService, PaginatedTasksResult } from './tasks.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update.dto';
import { BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ): Observable<TaskResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.tasksService.createTask(createTaskDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedTasksResult> {
    return this.tasksService.findAllTasks(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<TaskResponseDto> {
    return this.tasksService.findOneTask(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateTaskDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.tasksService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ): Observable<TaskResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.tasksService.updateTask(id, updateTaskDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponseDto> {
    return this.tasksService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.tasksService.remove(id);
  }
}

