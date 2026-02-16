import { Reflector } from "@nestjs/core";

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

/**
 * Admin Guard
 *
 * Ensures the user has admin role.
 * Must be used after JwtAuthGuard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Check if user has admin role
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isAdmin) {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
