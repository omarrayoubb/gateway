import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsGrpcController } from './organizations.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
  ],
  providers: [OrganizationsService],
  controllers: [OrganizationsGrpcController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}

