import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MaintenanceContractService } from './maintenance-contract.service';
import { CreateMaintenanceContractDto } from './dto/create-maintenance-contract.dto';
import { UpdateMaintenanceContractDto } from './dto/update-maintenance-contract.dto';

@Controller('maintenance-contracts')
export class MaintenanceContractController {
  constructor(
    private readonly maintenanceContractService: MaintenanceContractService,
  ) {}

  @Get()
  findAll(
    @Query('account_id') account_id?: string,
    @Query('status') status?: string,
  ) {
    return this.maintenanceContractService.findAll(account_id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceContractService.findOne(id);
  }

  @Post()
  create(@Body() createMaintenanceContractDto: CreateMaintenanceContractDto) {
    return this.maintenanceContractService.create(createMaintenanceContractDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceContractDto: UpdateMaintenanceContractDto,
  ) {
    return this.maintenanceContractService.update(
      id,
      updateMaintenanceContractDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.maintenanceContractService.remove(id);
  }
}

