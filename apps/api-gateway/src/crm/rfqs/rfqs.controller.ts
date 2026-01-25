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
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RFQsService, PaginatedRFQsResult } from './rfqs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { RFQResponseDto } from './dto/rfq-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('rfqs')
export class RFQsController {
  constructor(private readonly rfqsService: RFQsService) {}

  @Post()
  create(
    @Body() createRFQDto: CreateRFQDto,
    @Request() req: any,
  ): Observable<RFQResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.rfqsService.createRFQ(createRFQDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedRFQsResult> {
    return this.rfqsService.findAllRfqs(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<RFQResponseDto> {
    return this.rfqsService.findOneRFQ(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRFQDto: UpdateRFQDto,
    @Request() req: any,
  ): Observable<RFQResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.rfqsService.updateRFQ(id, updateRFQDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<{ success: boolean; message: string }> {
    return this.rfqsService.deleteRFQ(id);
  }
}

