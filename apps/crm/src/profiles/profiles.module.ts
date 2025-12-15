import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Profile } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module';
import { Global } from '@nestjs/common';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    forwardRef(() => AuthModule), // Import AuthModule to use AuthorizationGuard (forwardRef to avoid circular dependency)
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}

