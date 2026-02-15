import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';


/**
 * Email Verification Guard (CRIT-008)
 *
 * Ensures that users have verified their email before accessing protected resources.
 * Prevents unverified accounts from performing sensitive operations.
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(EmailVerifiedGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route explicitly allows unverified users
    const allowUnverified = this.reflector.get<boolean>(
      'allowUnverified',
      context.getHandler(),
    );

    if (allowUnverified) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    if (!user.emailVerifiedAt && !user.emailVerified) {
      this.logger.warn(`Unverified user attempted access: userId=${user.id}`);
      throw new ForbiddenException(
        'Please verify your email address before accessing this resource. Check your inbox for the verification link.'
      );
    }

    return true;
  }
}

/**
 * Decorator to allow unverified users to access a route
 * Use sparingly - only for routes like resend verification email
 */
export const AllowUnverified = () => SetMetadata('allowUnverified', true);
