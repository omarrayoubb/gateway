import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AccountsModule } from './accounts/accounts.module';
import { CrmModule } from './crm/crm.module';
import { DeskModule } from './desk/desk.module';
import { SupplyChainModule } from './supplychain/supplychain.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AccountsModule, CrmModule, DeskModule, SupplyChainModule, AuthModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}

