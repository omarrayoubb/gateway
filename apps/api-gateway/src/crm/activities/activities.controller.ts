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
import { ActivitiesService, PaginatedActivitiesResult } from './activities.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateActivityDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Request() req: any,
  ): Observable<ActivityResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.activitiesService.createActivity(createActivityDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedActivitiesResult> {
    return this.activitiesService.findAllActivities(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<ActivityResponseDto> {
    return this.activitiesService.findOneActivity(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateActivityDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.activitiesService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() req: any,
  ): Observable<ActivityResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.activitiesService.updateActivity(id, updateActivityDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.activitiesService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.activitiesService.remove(id);
  }
}

