import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

export const ADMIN_PROFILE_NAME = 'Administrator';

@Injectable()
export class GrpcAuthorizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = context.switchToRpc().getContext();
    const user = rpcContext.user;

    if (!user) {
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'User not authenticated',
      });
    }

    // Load profile if not already loaded
    if (!user.profile) {
      if (!user.profileId) {
        throw new RpcException({
          code: 7, // PERMISSION_DENIED
          message: 'User does not have a profile assigned',
        });
      }
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'User profile not loaded',
      });
    }

    // Administrator bypass - allow all operations
    if (user.profile.name === ADMIN_PROFILE_NAME) {
      return next.handle();
    }

    // Extract service name from gRPC context
    const serviceName = this.extractServiceName(rpcContext);
    const methodName = this.extractMethodName(rpcContext);

    if (!serviceName) {
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'Unable to determine required permissions',
      });
    }

    // Map gRPC method to permission type
    const permissionType = this.mapGrpcMethodToPermission(methodName);

    if (!permissionType) {
      // If method doesn't map to a permission, allow it
      return next.handle();
    }

    // Check if user has the required permission
    const hasPermission = this.checkPermission(
      user.profile.permissions,
      serviceName,
      permissionType,
    );

    if (!hasPermission) {
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: `You do not have permission to ${permissionType} ${serviceName}`,
      });
    }

    return next.handle();
  }

  private extractServiceName(rpcContext: any): string | null {
    // Extract service name from gRPC handler path
    const handler = rpcContext.getHandler?.();
    if (!handler) return null;

    // Try to get service name from handler metadata or path
    const handlerName = handler.name || '';
    
    // Map handler names to service names
    const serviceMap: Record<string, string> = {
      'ContactsService': 'contacts',
      'AccountsService': 'accounts',
      'LeadsService': 'leads',
      'DealsService': 'deals',
      'UsersService': 'users',
    };

    for (const [key, value] of Object.entries(serviceMap)) {
      if (handlerName.includes(key)) {
        return value;
      }
    }

    return null;
  }

  private extractMethodName(rpcContext: any): string {
    const handler = rpcContext.getHandler?.();
    return handler?.name || '';
  }

  private mapGrpcMethodToPermission(methodName: string): string | null {
    const methodMap: Record<string, string> = {
      'Create': 'create',
      'Get': 'read',
      'GetAll': 'read',
      'Update': 'update',
      'Delete': 'delete',
      'BulkDelete': 'delete',
      'BulkUpdate': 'update',
    };

    for (const [key, value] of Object.entries(methodMap)) {
      if (methodName.includes(key)) {
        return value;
      }
    }

    return null;
  }

  private checkPermission(
    permissions: any,
    moduleName: string,
    permissionType: string,
  ): boolean {
    if (!permissions || typeof permissions !== 'object') {
      return false;
    }

    const modulePermissions = permissions[moduleName];

    if (!modulePermissions || typeof modulePermissions !== 'object') {
      return false;
    }

    return modulePermissions[permissionType] === true;
  }
}

