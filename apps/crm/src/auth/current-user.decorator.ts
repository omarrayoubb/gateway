import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const rpcContext = ctx.switchToRpc().getContext();
    const user = rpcContext.user;
    
    if (!user) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'User not authenticated',
      });
    }
    
    return user;
  },
);

