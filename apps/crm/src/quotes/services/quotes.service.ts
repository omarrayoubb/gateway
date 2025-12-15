import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from '../entities/quote.entity';
import { QuoteLineItem } from '../entities/quote-line-item.entity';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { UpdateQuoteDto } from '../dto/update-quote.dto';
import { PaginationQueryDto } from '../../leads/dto/pagination.dto';
import { User } from '../../users/users.entity';

export interface PaginatedQuotesResult {
  data: Quote[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteLineItem)
    private readonly quoteLineItemRepository: Repository<QuoteLineItem>,
  ) {}

  private generateQuoteNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QT-${year}-${random}`;
  }

  async create(createQuoteDto: CreateQuoteDto, currentUser: Omit<User, 'password'>): Promise<Quote> {
    const quoteNumber = this.generateQuoteNumber();
    
    const quoteData: any = {
      ...createQuoteDto,
      quoteNumber,
      createdByEmail: currentUser.email,
      status: 'Draft',
      approvalStatus: 'Not Submitted',
    };

    if (createQuoteDto.validUntil) {
      quoteData.validUntil = new Date(createQuoteDto.validUntil);
    }

    const quote = this.quoteRepository.create(quoteData);
    const savedQuote = await this.quoteRepository.save(quote as unknown as Quote);

    // Save line items
    if (createQuoteDto.lineItems && createQuoteDto.lineItems.length > 0) {
      const lineItems = createQuoteDto.lineItems.map(item =>
        this.quoteLineItemRepository.create({
          ...item,
          quoteId: savedQuote.id,
        })
      );
      await this.quoteLineItemRepository.save(lineItems);
    }

    return this.findOne(savedQuote.id);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedQuotesResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.quoteRepository.findAndCount({
      relations: ['account', 'contact', 'rfq', 'lineItems'],
      take: limit,
      skip: skip,
      order: { createdDate: 'DESC' },
    });

    const lastPage = Math.ceil(total / limit);

    return { data, total, page, lastPage };
  }

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['account', 'contact', 'rfq', 'lineItems'],
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.quoteRepository.preload({
      id,
      ...updateQuoteDto,
      validUntil: updateQuoteDto.validUntil ? new Date(updateQuoteDto.validUntil) : undefined,
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    // Update line items if provided
    if (updateQuoteDto.lineItems) {
      // Delete existing line items
      await this.quoteLineItemRepository.delete({ quoteId: id });
      
      // Create new line items
      const lineItems = updateQuoteDto.lineItems.map(item =>
        this.quoteLineItemRepository.create({
          ...item,
          quoteId: id,
        })
      );
      await this.quoteLineItemRepository.save(lineItems);
    }

    await this.quoteRepository.save(quote);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findOne(id);
    await this.quoteRepository.remove(quote);
  }
}

