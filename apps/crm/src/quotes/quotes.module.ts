import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RFQsController } from './controllers/rfqs.controller';
import { QuotesController } from './controllers/quotes.controller';
import { ProductsController } from './controllers/products.controller';
import { ManufacturersController } from './controllers/manufacturers.controller';
import { ProductLinesController } from './controllers/product-lines.controller';
import { QuoteTemplatesController } from './controllers/quote-templates.controller';
import { UploadController } from './controllers/upload.controller';
import { RFQsService } from './services/rfqs.service';
import { QuotesService } from './services/quotes.service';
import { ProductsService } from './services/products.service';
import { ManufacturersService } from './services/manufacturers.service';
import { ProductLinesService } from './services/product-lines.service';
import { QuoteTemplatesService } from './services/quote-templates.service';
import { RFQ } from './entities/rfq.entity';
import { RFQLineItem } from './entities/rfq-line-item.entity';
import { Quote } from './entities/quote.entity';
import { QuoteLineItem } from './entities/quote-line-item.entity';
import { Product } from './entities/product.entity';
import { Manufacturer } from './entities/manufacturer.entity';
import { ProductLine } from './entities/product-line.entity';
import { QuoteTemplate } from './entities/quote-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RFQ,
      RFQLineItem,
      Quote,
      QuoteLineItem,
      Product,
      Manufacturer,
      ProductLine,
      QuoteTemplate,
    ]),
    forwardRef(() => AuthModule), // For AuthorizationGuard
  ],
  controllers: [
    RFQsController,
    QuotesController,
    ProductsController,
    ManufacturersController,
    ProductLinesController,
    QuoteTemplatesController,
    UploadController,
  ],
  providers: [
    RFQsService,
    QuotesService,
    ProductsService,
    ManufacturersService,
    ProductLinesService,
    QuoteTemplatesService,
  ],
  exports: [
    RFQsService,
    QuotesService,
    ProductsService,
    ManufacturersService,
    ProductLinesService,
    QuoteTemplatesService,
  ],
})
export class QuotesModule {}

