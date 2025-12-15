import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../users.entity';

export const ADMIN_PROFILE_NAME = 'Administrator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User & { profile?: { name: string; permissions: any } } = request.user;

    // If no user, deny access (shouldn't happen if JwtAuthGuard is used first)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Simplified authorization - profiles are managed in CRM
    // For now, allow all authenticated users
    // In production, you might want to check roleId or other fields

    // Extract module name from route
    // Try to get the base route path from the controller
    const routePath = request.route?.path || request.url.split('?')[0];
    const moduleName = this.extractModuleName(routePath);

    if (!moduleName) {
      // If we can't determine the module, deny access for safety
      throw new ForbiddenException('Unable to determine required permissions');
    }

    // Map HTTP method to permission type
    const httpMethod = request.method;
    const permissionType = this.mapHttpMethodToPermission(httpMethod);

    if (!permissionType) {
      // If method doesn't map to a permission, allow it (e.g., OPTIONS)
      return true;
    }

    // Simplified permission check - allow all authenticated users for now
    // In production, implement proper permission checking based on roleId
    return true;
  }

  /**
   * Extracts module name from route path
   * Examples: /leads -> leads, /contacts/:id -> contacts, /orchestrator/account-creation-form -> orchestrator
   */
  private extractModuleName(route: string): string | null {
    // Remove leading slash and query parameters, then split by /
    const cleanRoute = route.replace(/^\//, '').split('?')[0];
    const parts = cleanRoute.split('/');
    
    if (parts.length === 0 || parts[0] === '') {
      return null;
    }

    const moduleName = parts[0].toLowerCase();

    // Map known routes to module names
    const moduleMap: Record<string, string> = {
      leads: 'leads',
      contacts: 'contacts',
      accounts: 'accounts',
      orchestrator: 'orchestrator',
      users: 'users',
      profiles: 'profiles',
      roles: 'roles',
      deals: 'deals',
    };

    return moduleMap[moduleName] || null;
  }

  /**
   * Maps HTTP method to permission type
   */
  private mapHttpMethodToPermission(method: string): string | null {
    const methodMap: Record<string, string> = {
      POST: 'create',
      GET: 'read',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };

    return methodMap[method] || null;
  }

  /**
   * Checks if the user has the required permission for the module
   */
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

