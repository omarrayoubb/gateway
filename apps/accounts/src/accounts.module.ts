import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { User } from './users.entity';

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
        entities: [User],
        synchronize: configService.get('ACCOUNTS_DB_SYNCHRONIZE') === 'true',
      }),
    }),
    // Register User entity for dependency injection
    TypeOrmModule.forFeature([User]),
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
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
