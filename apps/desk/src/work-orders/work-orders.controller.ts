import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    return await this.workOrdersService.create(createWorkOrderDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
  ) {
    return await this.workOrdersService.update(id, updateWorkOrderDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.workOrdersService.findOne(id);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.workOrdersService.findAll(page, limit);
  }
}

