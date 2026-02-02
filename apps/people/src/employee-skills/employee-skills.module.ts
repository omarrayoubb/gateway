import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { EmployeeSkillsService } from './employee-skills.service';
import { EmployeeSkillsGrpcController } from './employee-skills.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeSkill]),
  ],
  providers: [EmployeeSkillsService],
  controllers: [EmployeeSkillsGrpcController],
  exports: [EmployeeSkillsService],
})
export class EmployeeSkillsModule {}
