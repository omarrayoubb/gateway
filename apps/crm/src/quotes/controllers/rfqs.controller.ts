import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RFQsService } from '../services/rfqs.service';
import { JwtAuthGuard } from '../../auth/jwt.authguard';
import { AuthorizationGuard } from '../../auth/authorization.guard';
import { CreateRFQDto } from '../dto/create-rfq.dto';
import { UpdateRFQDto } from '../dto/update-rfq.dto';
import { PaginationQueryDto } from '../../leads/dto/pagination.dto';
import { User } from '../../users/users.entity';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('rfqs')
export class RFQsController {
  constructor(private readonly rfqsService: RFQsService) {}

  @Post()
  create(@Body() createRFQDto: CreateRFQDto, @Request() req: any) {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.rfqsService.create(createRFQDto, currentUser);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.rfqsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rfqsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRFQDto: UpdateRFQDto,
  ) {
    return this.rfqsService.update(id, updateRFQDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rfqsService.remove(id);
  }
}

