import { HttpException, HttpStatus } from '@nestjs/common';


/**
 * Improved Error Handling Strategy (HIGH-029)
 *
 * Domain-specific exceptions with:
 * - Error codes
 * - User-friendly messages
 * - Additional context
 * - I18n support ready
 */

export enum ErrorCode {
  // Authentication errors (1000-1099)
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  TOKEN_INVALID = 'AUTH_003',
  UNAUTHORIZED = 'AUTH_004',
  SESSION_EXPIRED = 'AUTH_005',

  // Wallet errors (2000-2099)
  INSUFFICIENT_BALANCE = 'WALLET_001',
  WALLET_NOT_FOUND = 'WALLET_002',
  WALLET_FROZEN = 'WALLET_003',
  INVALID_AMOUNT = 'WALLET_004',

  // Escrow errors (3000-3099)
  ESCROW_NOT_FOUND = 'ESCROW_001',
  ESCROW_ALREADY_COMPLETED = 'ESCROW_002',
  ESCROW_EXPIRED = 'ESCROW_003',
  UNAUTHORIZED_ESCROW_ACTION = 'ESCROW_004',
  INVALID_ESCROW_STATUS = 'ESCROW_005',

  // Transaction errors (4000-4099)
  TRANSACTION_FAILED = 'TXN_001',
  DUPLICATE_TRANSACTION = 'TXN_002',
  TRANSACTION_TIMEOUT = 'TXN_003',

  // Validation errors (5000-5099)
  VALIDATION_ERROR = 'VAL_001',
  INVALID_INPUT = 'VAL_002',
  REQUIRED_FIELD_MISSING = 'VAL_003',

  // Business logic errors (6000-6099)
  BUSINESS_RULE_VIOLATION = 'BIZ_001',
  OPERATION_NOT_ALLOWED = 'BIZ_002',
  RESOURCE_LOCKED = 'BIZ_003',

  // System errors (9000-9099)
  INTERNAL_SERVER_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  DATABASE_ERROR = 'SYS_003',
  EXTERNAL_API_ERROR = 'SYS_004',
}

export interface ErrorContext {
  [key: string]: any;
}

/**
 * Base domain exception
 */
export class DomainException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly context?: ErrorContext,
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        context,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

/**
 * Authentication exceptions
 */
export class InvalidCredentialsException extends DomainException {
  constructor(context?: ErrorContext) {
    super(
      ErrorCode.INVALID_CREDENTIALS,
      'Email atau password salah',
      HttpStatus.UNAUTHORIZED,
      context,
    );
  }
}

export class TokenExpiredException extends DomainException {
  constructor(context?: ErrorContext) {
    super(
      ErrorCode.TOKEN_EXPIRED,
      'Token telah kadaluarsa. Silakan login kembali.',
      HttpStatus.UNAUTHORIZED,
      context,
    );
  }
}

/**
 * Wallet exceptions
 */
export class InsufficientBalanceException extends DomainException {
  constructor(required: number, available: number, context?: ErrorContext) {
    super(
      ErrorCode.INSUFFICIENT_BALANCE,
      `Saldo tidak mencukupi. Dibutuhkan: Rp ${required.toLocaleString('id-ID')}, Tersedia: Rp ${available.toLocaleString('id-ID')}`,
      HttpStatus.BAD_REQUEST,
      { required, available, ...context },
    );
  }
}

export class WalletFrozenException extends DomainException {
  constructor(reason?: string, context?: ErrorContext) {
    super(
      ErrorCode.WALLET_FROZEN,
      `Wallet Anda telah dibekukan${reason ? `: ${reason}` : ''}. Hubungi customer service.`,
      HttpStatus.FORBIDDEN,
      { reason, ...context },
    );
  }
}

/**
 * Escrow exceptions
 */
export class EscrowNotFoundException extends DomainException {
  constructor(escrowId: string, context?: ErrorContext) {
    super(
      ErrorCode.ESCROW_NOT_FOUND,
      'Escrow tidak ditemukan',
      HttpStatus.NOT_FOUND,
      { escrowId, ...context },
    );
  }
}

export class EscrowAlreadyCompletedException extends DomainException {
  constructor(escrowId: string, context?: ErrorContext) {
    super(
      ErrorCode.ESCROW_ALREADY_COMPLETED,
      'Escrow sudah selesai dan tidak dapat diubah',
      HttpStatus.BAD_REQUEST,
      { escrowId, ...context },
    );
  }
}

export class UnauthorizedEscrowActionException extends DomainException {
  constructor(action: string, context?: ErrorContext) {
    super(
      ErrorCode.UNAUTHORIZED_ESCROW_ACTION,
      `Anda tidak memiliki izin untuk ${action} escrow ini`,
      HttpStatus.FORBIDDEN,
      { action, ...context },
    );
  }
}

/**
 * Transaction exceptions
 */
export class DuplicateTransactionException extends DomainException {
  constructor(transactionId: string, context?: ErrorContext) {
    super(
      ErrorCode.DUPLICATE_TRANSACTION,
      'Transaksi duplikat terdeteksi',
      HttpStatus.CONFLICT,
      { transactionId, ...context },
    );
  }
}

/**
 * Business logic exceptions
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(rule: string, context?: ErrorContext) {
    super(
      ErrorCode.BUSINESS_RULE_VIOLATION,
      `Pelanggaran aturan bisnis: ${rule}`,
      HttpStatus.BAD_REQUEST,
      { rule, ...context },
    );
  }
}

export class ResourceLockedException extends DomainException {
  constructor(resource: string, context?: ErrorContext) {
    super(
      ErrorCode.RESOURCE_LOCKED,
      `Resource ${resource} sedang digunakan. Silakan coba lagi nanti.`,
      HttpStatus.CONFLICT,
      { resource, ...context },
    );
  }
}

/**
 * System exceptions
 */
export class ExternalApiException extends DomainException {
  constructor(service: string, originalError?: any, context?: ErrorContext) {
    super(
      ErrorCode.EXTERNAL_API_ERROR,
      `Layanan ${service} sedang tidak tersedia. Silakan coba lagi nanti.`,
      HttpStatus.SERVICE_UNAVAILABLE,
      { service, originalError: originalError?.message, ...context },
    );
  }
}
