import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuoteTemplatesService } from '../services/quote-templates.service';
import { JwtAuthGuard } from '../../auth/jwt.authguard';
import { AuthorizationGuard } from '../../auth/authorization.guard';
import { CreateQuoteTemplateDto } from '../dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from '../dto/update-quote-template.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('quote-templates')
export class QuoteTemplatesController {
  constructor(private readonly templatesService: QuoteTemplatesService) {}

  @Post()
  create(@Body() createTemplateDto: CreateQuoteTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateQuoteTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.remove(id);
  }
}

