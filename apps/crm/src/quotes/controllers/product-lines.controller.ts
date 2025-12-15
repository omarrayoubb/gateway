import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductLinesService } from '../services/product-lines.service';
import { JwtAuthGuard } from '../../auth/jwt.authguard';
import { AuthorizationGuard } from '../../auth/authorization.guard';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('product-lines')
export class ProductLinesController {
  constructor(private readonly productLinesService: ProductLinesService) {}

  @Get()
  findAll() {
    return this.productLinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productLinesService.findOne(id);
  }
}

