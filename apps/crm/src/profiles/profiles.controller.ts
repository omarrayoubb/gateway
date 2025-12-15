import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { User } from '../users/users.entity';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateProfileDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Check if the current user is an administrator
   */
  private checkAdmin(user: Omit<User, 'password'> & { profile?: { name: string } }): void {
    if (!user.profile || user.profile.name !== 'Administrator') {
      throw new ForbiddenException('Only administrators can manage profiles');
    }
  }

  @Post()
  create(@Body() createProfileDto: CreateProfileDto, @Request() req: any) {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  findAll(@Request() req: any) {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.findOne(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateProfileDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.bulkUpdate(bulkUpdateDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: any,
  ) {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.update(id, updateProfileDto);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @Request() req: any,
  ): Promise<BulkDeleteResponse> {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const currentUser: Omit<User, 'password'> & { profile?: { name: string } } = req.user;
    this.checkAdmin(currentUser);
    return this.profilesService.remove(id);
  }
}

