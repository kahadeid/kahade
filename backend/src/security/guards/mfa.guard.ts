import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MfaService } from '@core/auth/mfa.service';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { Request } from 'express';



// Decorator for requiring MFA
export const RequireMFA = () => SetMetadata('requireMfa', true);

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private mfaService: MfaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireMfa = this.reflector.get<boolean>('requireMfa', context.getHandler());
    if (!requireMfa) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        mfaEnabled: true,
        totpSecretEnc: true,
      },
    });

    if (!userRecord?.mfaEnabled) {
      return true;
    }

    const mfaToken = request.headers['x-mfa-token'] as string;
    if (!mfaToken) {
      throw new UnauthorizedException('MFA token required');
    }

    const isValid = this.mfaService.verifyToken(mfaToken, userRecord.totpSecretEnc || '');
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    return true;
  }
}
