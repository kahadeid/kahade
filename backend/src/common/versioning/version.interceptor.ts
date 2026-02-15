import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


import {
import {

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
  API_VERSION_KEY,
  API_DEPRECATED_KEY,
} from './api-version.decorator';

/**
 * API Version Interceptor (HIGH-025)
 *
 * Handles:
 * - Version validation
 * - Deprecation warnings
 * - Version negotiation
 */
@Injectable()
export class VersionInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get requested version from path or header
    const requestedVersion = this.getRequestedVersion(request);

    // Get supported versions from metadata
    const supportedVersions = this.reflector.getAllAndOverride<string[]>(
      API_VERSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Check if endpoint supports versioning
    if (supportedVersions && supportedVersions.length > 0) {
      // Validate version
      if (
        requestedVersion &&
        !supportedVersions.includes(requestedVersion)
      ) {
        throw new NotFoundException(
          `API version ${requestedVersion} not supported for this endpoint. Supported versions: ${supportedVersions.join(', ')}`,
        );
      }
    }

    // Check for deprecation
    const deprecationInfo = this.reflector.getAllAndOverride<any>(
      API_DEPRECATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (deprecationInfo) {
      // Add deprecation warning header
      const warning = `This API version is deprecated${deprecationInfo.deprecatedSince ? ` since ${deprecationInfo.deprecatedSince}` : ''}${deprecationInfo.removeIn ? ` and will be removed in ${deprecationInfo.removeIn}` : ''}`;

      response.setHeader('Warning', `299 - "${warning}"`);
      response.setHeader('X-API-Deprecated', 'true');
      if (deprecationInfo.removeIn) {
        response.setHeader('X-API-Remove-Date', deprecationInfo.removeIn);
      }
    }

    // Add version header to response
    if (requestedVersion) {
      response.setHeader('X-API-Version', requestedVersion);
    }

    return next.handle().pipe(
      tap(() => {
        // Additional processing if needed
      }),
    );
  }

  /**
   * Extract version from request
   */
  private _getRequestedVersion(request: any): string | null {
    // Try URI versioning first (/v1/users)
    const pathMatch = request.path.match(/^\/v(\d+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Try header versioning
    const headerVersion = request.headers['x-api-version'];
    if (headerVersion) {
      return headerVersion;
    }

    // Default to v1
    return '1';
  }
}
