import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { User } from './users.entity';
import { Department } from './department.entity';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('ACCOUNTS_DB_HOST'),
        port: configService.get('ACCOUNTS_DB_PORT'),
        username: configService.get('ACCOUNTS_DB_USERNAME'),
        password: configService.get('ACCOUNTS_DB_PASSWORD'),
        database: configService.get('ACCOUNTS_DB_DATABASE'),
        entities: [User, Department],
        synchronize: configService.get('ACCOUNTS_DB_SYNCHRONIZE') === 'true',
      }),
    }),
    // Register User entity for dependency injection
    TypeOrmModule.forFeature([User, Department]),
    // Configure JWT Module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
    // Configure RabbitMQ clients: one queue per consumer so both People and CRM receive user.created
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_PEOPLE_QUEUE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
            queue: 'user_created_people',
            queueOptions: { durable: true },
            socketOptions: {
              heartbeatIntervalInSeconds: 60,
              reconnectTimeInSeconds: 5,
            },
          },
        }),
      },
      {
        name: 'RABBITMQ_CRM_QUEUE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
            queue: 'user_created_crm',
            queueOptions: { durable: true },
            socketOptions: {
              heartbeatIntervalInSeconds: 60,
              reconnectTimeInSeconds: 5,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
