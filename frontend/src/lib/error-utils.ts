/**
 * CENTRALIZED ERROR MESSAGE UTILITIES
 * Consistent error handling across the application
 */

import { ErrorCode } from '@/types';

export interface ErrorMessageResult {
  title: string;
  description: string;
  action?: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      code?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

/**
 * Extract user-friendly error message from API error
 */
export function getApiErrorMessage(error: unknown): ErrorMessageResult {
  // Default error
  const defaultError: ErrorMessageResult = {
    title: 'Error',
    description: 'An unexpected error occurred. Please try again.',
  };

  // Not an error object
  if (typeof error !== 'object' || error === null) {
    return defaultError;
  }

  const err = error as ErrorResponse;

  // Check for response data
  if (err.response?.data) {
    const { code, message, errors } = err.response.data;

    // Handle validation errors
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      return {
        title: 'Validation Error',
        description: Array.isArray(firstError) ? firstError[0] : 'Please check your input',
      };
    }

    // Handle known error codes
    if (code) {
      return getErrorByCode(code as ErrorCode);
    }

    // Use message from response
    if (message) {
      return {
        title: 'Error',
        description: message,
      };
    }
  }

  // Use generic error message
  if (err.message) {
    return {
      title: 'Error',
      description: err.message,
    };
  }

  return defaultError;
}

/**
 * Get specific error message based on error code
 */
function getErrorByCode(code: ErrorCode): ErrorMessageResult {
  const errorMap: Record<ErrorCode, ErrorMessageResult> = {
    [ErrorCode.UNAUTHORIZED]: {
      title: 'Unauthorized',
      description: 'You need to be logged in to perform this action.',
      action: 'Please log in again',
    },
    [ErrorCode.INVALID_CREDENTIALS]: {
      title: 'Invalid Credentials',
      description: 'The email or password you entered is incorrect.',
      action: 'Please check and try again',
    },
    [ErrorCode.TOKEN_EXPIRED]: {
      title: 'Session Expired',
      description: 'Your session has expired.',
      action: 'Please log in again',
    },
    [ErrorCode.MFA_REQUIRED]: {
      title: 'MFA Required',
      description: 'Multi-factor authentication is required.',
    },
    [ErrorCode.ACCOUNT_LOCKED]: {
      title: 'Account Locked',
      description: 'Your account has been locked due to multiple failed login attempts.',
      action: 'Please contact support or reset your password',
    },
    [ErrorCode.SESSION_EXPIRED]: {
      title: 'Session Expired',
      description: 'Your session has expired.',
      action: 'Please log in again',
    },
    [ErrorCode.VALIDATION_ERROR]: {
      title: 'Validation Error',
      description: 'Please check your input and try again.',
    },
    [ErrorCode.INVALID_INPUT]: {
      title: 'Invalid Input',
      description: 'Some of the information you provided is invalid.',
    },
    [ErrorCode.MISSING_REQUIRED_FIELD]: {
      title: 'Missing Information',
      description: 'Please fill in all required fields.',
    },
    [ErrorCode.INVALID_FORMAT]: {
      title: 'Invalid Format',
      description: 'The format of your input is incorrect.',
    },
    [ErrorCode.NOT_FOUND]: {
      title: 'Not Found',
      description: 'The requested resource could not be found.',
    },
    [ErrorCode.ALREADY_EXISTS]: {
      title: 'Already Exists',
      description: 'This resource already exists.',
    },
    [ErrorCode.CONFLICT]: {
      title: 'Conflict',
      description: 'There is a conflict with the current state.',
    },
    [ErrorCode.INSUFFICIENT_BALANCE]: {
      title: 'Insufficient Balance',
      description: 'You do not have enough balance for this transaction.',
    },
    [ErrorCode.TRANSACTION_LIMIT_EXCEEDED]: {
      title: 'Limit Exceeded',
      description: 'You have exceeded your transaction limit.',
    },
    [ErrorCode.KYC_REQUIRED]: {
      title: 'KYC Required',
      description: 'Please complete KYC verification to proceed.',
      action: 'Complete KYC verification',
    },
    [ErrorCode.OPERATION_NOT_ALLOWED]: {
      title: 'Operation Not Allowed',
      description: 'This operation is not permitted.',
    },
    [ErrorCode.CONCURRENT_MODIFICATION]: {
      title: 'Concurrent Modification',
      description: 'This resource was modified by another process.',
      action: 'Please refresh and try again',
    },
    [ErrorCode.WALLET_FROZEN]: {
      title: 'Wallet Frozen',
      description: 'Your wallet has been frozen.',
      action: 'Please contact support',
    },
    [ErrorCode.INTERNAL_ERROR]: {
      title: 'Server Error',
      description: 'An internal server error occurred.',
      action: 'Please try again later',
    },
    [ErrorCode.RATE_LIMIT_EXCEEDED]: {
      title: 'Too Many Requests',
      description: 'You have made too many requests.',
      action: 'Please wait and try again',
    },
    [ErrorCode.SERVICE_UNAVAILABLE]: {
      title: 'Service Unavailable',
      description: 'The service is temporarily unavailable.',
      action: 'Please try again later',
    },
  };

  return errorMap[code] || {
    title: 'Error',
    description: 'An error occurred. Please try again.',
  };
}

/**
 * Extract simple error message string
 */
export function getSimpleErrorMessage(error: unknown): string {
  const result = getApiErrorMessage(error);
  return result.description;
}
