import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';
import { SkillsGrpcController } from './skills.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill]),
  ],
  providers: [SkillsService],
  controllers: [SkillsGrpcController],
  exports: [SkillsService],
})
export class SkillsModule {}
