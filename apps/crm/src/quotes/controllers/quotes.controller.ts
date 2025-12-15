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
import { QuotesService } from '../services/quotes.service';
import { JwtAuthGuard } from '../../auth/jwt.authguard';
import { AuthorizationGuard } from '../../auth/authorization.guard';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { UpdateQuoteDto } from '../dto/update-quote.dto';
import { PaginationQueryDto } from '../../leads/dto/pagination.dto';
import { User } from '../../users/users.entity';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto, @Request() req: any) {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.quotesService.create(createQuoteDto, currentUser);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.quotesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotesService.remove(id);
  }
}

