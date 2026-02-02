import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { GrpcErrorInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // Register global error interceptor to transform gRPC errors to HTTP
  app.useGlobalInterceptors(new GrpcErrorInterceptor());
  
  app.enableCors({
    origin: true, // Allow all origins in development (set to specific URL in production)
    credentials: true, // Allow cookies/credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });
  
  await app.listen(process.env.port ?? 3000);
}
bootstrap();