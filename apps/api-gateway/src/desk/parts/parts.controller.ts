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
import { PartsService, PaginatedPartsResult } from './parts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartResponseDto } from './dto/part-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdatePartDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  create(
    @Body() createPartDto: CreatePartDto,
    @Request() req: any,
  ): Observable<PartResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.partsService.createPart(createPartDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedPartsResult> {
    return this.partsService.findAllParts(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<PartResponseDto> {
    return this.partsService.findOnePart(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdatePartDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.partsService.bulkUpdateParts(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePartDto: UpdatePartDto,
    @Request() req: any,
  ): Observable<PartResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.partsService.updatePart(id, updatePartDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.partsService.bulkRemoveParts(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.partsService.removePart(id);
  }
}

