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
import {
  SalesOrdersService,
  PaginatedSalesOrdersResult,
} from './sales-orders.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  create(
    @Body() createDto: CreateSalesOrderDto,
    @Request() req: any,
  ): Observable<SalesOrderResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.salesOrdersService.createSalesOrder(createDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedSalesOrdersResult> {
    return this.salesOrdersService.findAllSalesOrders(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<SalesOrderResponseDto> {
    return this.salesOrdersService.findOneSalesOrder(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSalesOrderDto,
    @Request() req: any,
  ): Observable<SalesOrderResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.salesOrdersService.updateSalesOrder(id, updateDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.salesOrdersService.deleteSalesOrder(id);
  }
}

