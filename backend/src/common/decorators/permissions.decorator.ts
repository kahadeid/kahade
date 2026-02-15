import { SetMetadata } from '@nestjs/common';


/**
 * Roles Decorator
 *
 * Restricts endpoint access to specific user roles.
 * Must be used with RolesGuard.
 *
 * Usage:
 * ```typescript
 * @Roles('ADMIN', 'SUPER_ADMIN')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Post('admin/action')
 * async adminAction() {
 *   // Only ADMIN or SUPER_ADMIN can access
 * }
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Permissions Decorator
 *
 * Restricts endpoint access based on fine-grained permissions.
 * Must be used with PermissionsGuard.
 *
 * Usage:
 * ```typescript
 * @Permissions('transactions:create', 'wallet:read')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Post('transaction')
 * async createTransaction() {
 *   // Only users with specified permissions can access
 * }
 * ```
 */
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Require All Permissions (AND logic)
 *
 * User must have ALL specified permissions.
 */
export const REQUIRE_ALL_PERMISSIONS_KEY = 'requireAllPermissions';
export const RequireAllPermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
    SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, true)(target, propertyKey, descriptor);
  };
};

/**
 * Resource Owner Decorator
 *
 * Allows access if user is the owner of the resource.
 * Must be used with ResourceOwnerGuard.
 *
 * Usage:
 * ```typescript
 * @ResourceOwner('userId') // Parameter name that contains the resource owner ID
 * @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
 * @Get('profile/:userId')
 * async getProfile(@Param('userId') userId: string) {
 *   // Only the owner or admins can access
 * }
 * ```
 */
export const RESOURCE_OWNER_KEY = 'resourceOwner';
export const ResourceOwner = (paramName: string = 'id') =>
  SetMetadata(RESOURCE_OWNER_KEY, paramName);

/**
 * Allow Self or Admin
 *
 * Allows access if user is accessing their own resource or is an admin.
 */
export const ALLOW_SELF_OR_ADMIN_KEY = 'allowSelfOrAdmin';
export const AllowSelfOrAdmin = (paramName: string = 'id') => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(RESOURCE_OWNER_KEY, paramName)(target, propertyKey, descriptor);
    SetMetadata(ALLOW_SELF_OR_ADMIN_KEY, true)(target, propertyKey, descriptor);
  };
};

/**
 * KYC Required Decorator
 *
 * Requires user to have completed KYC verification.
 *
 * Usage:
 * ```typescript
 * @KycRequired()
 * @Post('withdrawal')
 * async createWithdrawal() {
 *   // Only KYC-verified users can access
 * }
 * ```
 */
export const KYC_REQUIRED_KEY = 'kycRequired';
export const KycRequired = () => SetMetadata(KYC_REQUIRED_KEY, true);

/**
 * Common Role Constants
 */
export enum UserRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
}

/**
 * Common Permission Constants
 */
export enum Permission {
  // User permissions
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // Transaction permissions
  TRANSACTION_CREATE = 'transaction:create',
  TRANSACTION_READ = 'transaction:read',
  TRANSACTION_UPDATE = 'transaction:update',
  TRANSACTION_DELETE = 'transaction:delete',

  // Wallet permissions
  WALLET_READ = 'wallet:read',
  WALLET_WITHDRAW = 'wallet:withdraw',
  WALLET_TRANSFER = 'wallet:transfer',

  // Escrow permissions
  ESCROW_CREATE = 'escrow:create',
  ESCROW_RELEASE = 'escrow:release',
  ESCROW_CANCEL = 'escrow:cancel',

  // Admin permissions
  ADMIN_USER_MANAGE = 'admin:user:manage',
  ADMIN_TRANSACTION_MANAGE = 'admin:transaction:manage',
  ADMIN_SYSTEM_CONFIG = 'admin:system:config',
  ADMIN_REPORTS = 'admin:reports',

  // KYC permissions
  KYC_SUBMIT = 'kyc:submit',
  KYC_APPROVE = 'kyc:approve',
  KYC_REJECT = 'kyc:reject',
}

/**
 * Role to Permissions Mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.USER_READ,
    Permission.TRANSACTION_CREATE,
    Permission.TRANSACTION_READ,
    Permission.WALLET_READ,
    Permission.WALLET_WITHDRAW,
    Permission.WALLET_TRANSFER,
    Permission.ESCROW_CREATE,
    Permission.KYC_SUBMIT,
  ],
  [UserRole.MERCHANT]: [
    Permission.USER_READ,
    Permission.TRANSACTION_CREATE,
    Permission.TRANSACTION_READ,
    Permission.WALLET_READ,
    Permission.WALLET_WITHDRAW,
    Permission.WALLET_TRANSFER,
    Permission.ESCROW_CREATE,
    Permission.ESCROW_RELEASE,
    Permission.KYC_SUBMIT,
  ],
  [UserRole.MODERATOR]: [
    Permission.USER_READ,
    Permission.TRANSACTION_READ,
    Permission.TRANSACTION_UPDATE,
    Permission.WALLET_READ,
    Permission.ESCROW_CREATE,
    Permission.ESCROW_RELEASE,
    Permission.ESCROW_CANCEL,
    Permission.KYC_APPROVE,
    Permission.KYC_REJECT,
  ],
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.TRANSACTION_CREATE,
    Permission.TRANSACTION_READ,
    Permission.TRANSACTION_UPDATE,
    Permission.TRANSACTION_DELETE,
    Permission.WALLET_READ,
    Permission.WALLET_WITHDRAW,
    Permission.WALLET_TRANSFER,
    Permission.ESCROW_CREATE,
    Permission.ESCROW_RELEASE,
    Permission.ESCROW_CANCEL,
    Permission.ADMIN_USER_MANAGE,
    Permission.ADMIN_TRANSACTION_MANAGE,
    Permission.ADMIN_REPORTS,
    Permission.KYC_APPROVE,
    Permission.KYC_REJECT,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // All permissions
};

/**
 * Helper function to check if user has permission
 */
export function hasPermission(
  userRole: UserRole,
  requiredPermission: Permission,
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(requiredPermission);
}

/**
 * Helper function to check if user has any of the required permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(userRole, permission),
  );
}

/**
 * Helper function to check if user has all required permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(userRole, permission),
  );
}
