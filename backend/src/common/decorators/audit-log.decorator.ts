import { SetMetadata } from '@nestjs/common';


/**
 * Audit logging metadata key
 */
export const AUDIT_LOG_KEY = 'audit_log';

/**
 * Audit log action types for categorization
 */
export enum AuditAction {
  // Authentication
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGE = 'auth.password_change',
  PASSWORD_RESET = 'auth.password_reset',
  MFA_ENABLE = 'auth.mfa_enable',
  MFA_DISABLE = 'auth.mfa_disable',

  // User Management
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_SUSPEND = 'user.suspend',
  USER_ACTIVATE = 'user.activate',

  // KYC
  KYC_SUBMIT = 'kyc.submit',
  KYC_APPROVE = 'kyc.approve',
  KYC_REJECT = 'kyc.reject',
  KYC_DOCUMENT_UPLOAD = 'kyc.document_upload',

  // Wallet
  WALLET_CREATE = 'wallet.create',
  WALLET_TOPUP = 'wallet.topup',
  WALLET_WITHDRAW = 'wallet.withdraw',
  WALLET_FREEZE = 'wallet.freeze',
  WALLET_UNFREEZE = 'wallet.unfreeze',

  // Escrow
  ESCROW_CREATE = 'escrow.create',
  ESCROW_FUND = 'escrow.fund',
  ESCROW_RELEASE = 'escrow.release',
  ESCROW_REFUND = 'escrow.refund',
  ESCROW_CANCEL = 'escrow.cancel',

  // Payment
  PAYMENT_INITIATE = 'payment.initiate',
  PAYMENT_CONFIRM = 'payment.confirm',
  PAYMENT_FAIL = 'payment.fail',
  PAYMENT_REFUND = 'payment.refund',

  // Dispute
  DISPUTE_CREATE = 'dispute.create',
  DISPUTE_RESOLVE = 'dispute.resolve',
  DISPUTE_ESCALATE = 'dispute.escalate',
  DISPUTE_CLOSE = 'dispute.close',

  // Admin
  ADMIN_GRANT_ROLE = 'admin.grant_role',
  ADMIN_REVOKE_ROLE = 'admin.revoke_role',
  ADMIN_CONFIG_CHANGE = 'admin.config_change',
  ADMIN_FEATURE_TOGGLE = 'admin.feature_toggle',

  // Security
  SECURITY_IP_BLOCK = 'security.ip_block',
  SECURITY_IP_UNBLOCK = 'security.ip_unblock',
  SECURITY_RATE_LIMIT_EXCEED = 'security.rate_limit_exceed',
  SECURITY_SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
}

/**
 * Audit log metadata interface
 */
export interface AuditLogMetadata {
  /**
   * Action being performed
   */
  action: AuditAction | string;

  /**
   * Resource being acted upon (e.g., 'escrow:123', 'user:456')
   */
  resource?: string;

  /**
   * Optional description of the action
   */
  description?: string;

  /**
   * Whether this is a high-risk operation
   */
  highRisk?: boolean;

  /**
   * Custom metadata to include in audit log
   */
  metadata?: Record<string, unknown>;
}

/**
 * Decorator to mark methods that should be audit logged
 *
 * @example
 * ```typescript
 * @AuditLog({
 *   action: AuditAction.ESCROW_RELEASE,
 *   resource: 'escrow',
 *   description: 'Release funds from escrow to seller',
 *   highRisk: true,
 * })
 * async releaseEscrow(@Param('id') id: string) {
 *   // Implementation
 * }
 * ```
 *
 * @param metadata - Audit log configuration
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_KEY, metadata);
