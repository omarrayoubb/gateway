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
import { KnowledgeBaseService, PaginatedKnowledgeBasesResult } from './knowledge-base.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { KnowledgeBaseResponseDto } from './dto/knowledge-base-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateKnowledgeBaseDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post()
  create(
    @Body() createKnowledgeBaseDto: CreateKnowledgeBaseDto,
    @Request() req: any,
  ): Observable<KnowledgeBaseResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.knowledgeBaseService.createKnowledgeBase(createKnowledgeBaseDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedKnowledgeBasesResult> {
    return this.knowledgeBaseService.findAllKnowledgeBases(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<KnowledgeBaseResponseDto> {
    return this.knowledgeBaseService.findOneKnowledgeBase(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateKnowledgeBaseDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.knowledgeBaseService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKnowledgeBaseDto: UpdateKnowledgeBaseDto,
    @Request() req: any,
  ): Observable<KnowledgeBaseResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.knowledgeBaseService.updateKnowledgeBase(id, updateKnowledgeBaseDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.knowledgeBaseService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.knowledgeBaseService.remove(id);
  }
}

