import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { ContactsModule } from './contacts/contacts.module';
import { AccountsModule } from './accounts/accounts.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RolesModule } from './roles/roles.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { QuotesModule } from './quotes/quotes.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcJwtInterceptor } from './auth/grpc-jwt.interceptor';
import { GrpcAuthorizationInterceptor } from './auth/grpc-authorization.interceptor';
import { UserSync } from './users/users-sync.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Disabled to use migrations,
        //dropSchema: true,
        //migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        //migrationsRun: true, // Automatically run migrations on startup
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSync]),
    UsersModule,
    RabbitMQModule,
    AuthModule,
    LeadsModule,
    ContactsModule,
    AccountsModule,
    OrchestratorModule,
    ProfilesModule,
    RolesModule,
    DealsModule,
    TasksModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcJwtInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcAuthorizationInterceptor,
    },
  ],
})
export class AppModule {}
