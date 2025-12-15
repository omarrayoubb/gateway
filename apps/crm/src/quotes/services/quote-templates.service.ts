import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteTemplate } from '../entities/quote-template.entity';
import { CreateQuoteTemplateDto } from '../dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from '../dto/update-quote-template.dto';

@Injectable()
export class QuoteTemplatesService {
  constructor(
    @InjectRepository(QuoteTemplate)
    private readonly templateRepository: Repository<QuoteTemplate>,
  ) {}

  async findAll(): Promise<QuoteTemplate[]> {
    return this.templateRepository.find({
      order: { createdDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<QuoteTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Quote Template with ID ${id} not found`);
    }

    return template;
  }

  async create(createTemplateDto: CreateQuoteTemplateDto): Promise<QuoteTemplate> {
    // If setting as active, deactivate all others
    if (createTemplateDto.isActive) {
      await this.templateRepository.update({ isActive: true }, { isActive: false });
    }

    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async update(id: string, updateTemplateDto: UpdateQuoteTemplateDto): Promise<QuoteTemplate> {
    // If setting as active, deactivate all others
    if (updateTemplateDto.isActive === true) {
      await this.templateRepository.update({ isActive: true }, { isActive: false });
    }

    const template = await this.templateRepository.preload({
      id,
      ...updateTemplateDto,
    });

    if (!template) {
      throw new NotFoundException(`Quote Template with ID ${id} not found`);
    }

    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}

