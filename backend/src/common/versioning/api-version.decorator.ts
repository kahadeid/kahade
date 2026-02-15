import { SetMetadata } from '@nestjs/common';


/**
 * API Versioning Support (HIGH-025)
 *
 * Supports:
 * - URI versioning (/v1/users, /v2/users)
 * - Header versioning (X-API-Version: 1)
 * - Deprecation warnings
 * - Version negotiation
 */

export const API_VERSION_KEY = 'api_version';
export const API_DEPRECATED_KEY = 'api_deprecated';

/**
 * Mark controller/route with API version
 */
export const ApiVersion = (...versions: string[]) =>
  SetMetadata(API_VERSION_KEY, versions);

/**
 * Mark controller/route as deprecated
 */
export const ApiDeprecated = (deprecatedSince?: string, removeIn?: string) =>
  SetMetadata(API_DEPRECATED_KEY, { deprecatedSince, removeIn });

/**
 * Example usage:
 *
 * @Controller('users')
 * @ApiVersion('1', '2')
 * export class UsersController {
 *   @Get()
 *   @ApiVersion('1')
 *   @ApiDeprecated('2024-01-01', '2025-01-01')
 *   findAllV1() {
 *     return this.usersService.findAllV1();
 *   }
 *
 *   @Get()
 *   @ApiVersion('2')
 *   findAllV2() {
 *     return this.usersService.findAllV2();
 *   }
 * }
 */
