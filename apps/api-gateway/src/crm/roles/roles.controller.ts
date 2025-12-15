import { 
  Controller, 
  Get, 
  Param, 
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
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateRoleDto } from './dto/bulk-update.dto';
import { BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req: any,
  ): Observable<RoleResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.rolesService.createRole(createRoleDto, currentUser);
  }

  @Get()
  findAll(): Observable<RoleResponseDto[]> {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<RoleResponseDto> {
    return this.rolesService.findOneRole(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateRoleDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.rolesService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: any,
  ): Observable<RoleResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.rolesService.updateRole(id, updateRoleDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponseDto> {
    return this.rolesService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.rolesService.remove(id);
  }
}

