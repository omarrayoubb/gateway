import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './assets.service';
import { AssetsGrpcController } from './assets.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Account]),
    OrganizationsModule,
  ],
  controllers: [AssetsGrpcController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}

