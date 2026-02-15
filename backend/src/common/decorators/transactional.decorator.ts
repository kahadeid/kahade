import { SetMetadata } from '@nestjs/common';


export const TRANSACTIONAL_KEY = 'transactional';

export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

/**
 * Decorator to mark methods that should run in a database transaction
 * Automatically rolls back on errors
 */
export const Transactional = (options?: TransactionOptions) =>
  SetMetadata(TRANSACTIONAL_KEY, options || {});
