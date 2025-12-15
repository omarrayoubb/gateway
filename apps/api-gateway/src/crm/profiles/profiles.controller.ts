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
import { ProfilesService, PaginatedProfilesResult } from './profiles.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateProfileDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(
    @Body() createProfileDto: CreateProfileDto,
    @Request() req: any,
  ): Observable<ProfileResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.profilesService.createProfile(createProfileDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedProfilesResult> {
    return this.profilesService.findAllProfiles(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<ProfileResponseDto> {
    return this.profilesService.findOneProfile(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateProfileDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.profilesService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: any,
  ): Observable<ProfileResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.profilesService.updateProfile(id, updateProfileDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.profilesService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.profilesService.remove(id);
  }
}
