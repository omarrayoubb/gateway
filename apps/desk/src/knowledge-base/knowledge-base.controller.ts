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
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(
    private readonly knowledgeBaseService: KnowledgeBaseService,
  ) {}

  @Get()
  findAll(
    @Query('sort') sort?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.knowledgeBaseService.findAll(sort, category, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeBaseService.findOne(id);
  }

  @Post()
  create(@Body() createKnowledgeBaseDto: CreateKnowledgeBaseDto) {
    return this.knowledgeBaseService.create(createKnowledgeBaseDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateKnowledgeBaseDto: UpdateKnowledgeBaseDto,
  ) {
    return this.knowledgeBaseService.update(id, updateKnowledgeBaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.knowledgeBaseService.remove(id);
  }
}

