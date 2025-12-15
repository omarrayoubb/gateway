import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLine } from '../entities/product-line.entity';

async function seedProductLines() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productLineRepository = app.get<Repository<ProductLine>>(getRepositoryToken(ProductLine));

  const productLines = [
    { name: 'pathology' },
    { name: 'molecular Biology' },
    { name: 'life sciences' },
  ];

  console.log('🌱 Seeding product lines...');

  for (const lineData of productLines) {
    // Check if product line already exists
    const existing = await productLineRepository.findOne({
      where: { name: lineData.name },
    });

    if (existing) {
      console.log(`✓ Product line "${lineData.name}" already exists`);
    } else {
      const productLine = productLineRepository.create(lineData);
      await productLineRepository.save(productLine);
      console.log(`✓ Created product line: "${lineData.name}"`);
    }
  }

  console.log('✅ Product lines seeding completed!');
  await app.close();
}

seedProductLines();

