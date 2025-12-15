import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. Check if this is actually a gRPC call
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    // 2. Extract Data (Deserialized) & Metadata
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData(); // <--- THIS IS YOUR JSON PAYLOAD
    const metadata = rpcContext.getContext(); // <--- These are your Headers/Metadata
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    // 3. Log Incoming Request
    console.log(`\n--- 🟢 gRPC Incoming: ${className}.${handlerName} ---`);
    console.log('Payload:', JSON.stringify(data, null, 2));
    console.log('Metadata:', metadata); // Shows Authorization tokens, userIds, etc.

    // 4. INTERRUPT HERE (Optional)
    // if (!data.first_name) {
    //    throw new RpcException('Interrupted: first_name is missing!');
    // }

    // 5. Handle the stream (Wait for response)
    const now = Date.now();
    return next.handle().pipe(
      tap((response) => {
        // 6. Log Outgoing Response
        console.log(`--- 🔴 gRPC Response (${Date.now() - now}ms) ---`);
        console.log('Response:', JSON.stringify(response, null, 2));
      }),
    );
  }
}