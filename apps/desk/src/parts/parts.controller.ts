import { Controller, Get } from '@nestjs/common';
import { PartsService } from './parts.service';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  async findAll() {
    return await this.partsService.findAll();
  }
}

