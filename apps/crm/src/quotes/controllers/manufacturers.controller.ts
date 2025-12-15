import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ManufacturersService } from '../services/manufacturers.service';
import { JwtAuthGuard } from '../../auth/jwt.authguard';
import { AuthorizationGuard } from '../../auth/authorization.guard';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get()
  findAll() {
    return this.manufacturersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.manufacturersService.findOne(id);
  }
}

