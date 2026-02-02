import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LeaveTypesSeedService } from './leave-types.seed';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const leaveTypesSeedService = app.get(LeaveTypesSeedService);
    await leaveTypesSeedService.seed();
    console.log('✓ Leave types seeded successfully');
  } catch (error) {
    console.error('⚠ Failed to seed leave types:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();

