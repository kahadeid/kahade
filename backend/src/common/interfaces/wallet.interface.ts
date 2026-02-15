
/**
 * Wallet entity with extended properties
 */
export interface IWallet {
  id: string;
  userId: string;
  balanceMinor: bigint;
  lockedMinor: bigint;
  frozenMinor?: bigint;
  currency: string;
  isFrozen?: boolean;
  frozenReason?: string | null;
  lastReconciledAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wallet balance response
 */
export interface IWalletBalance {
  available: number;
  locked: number;
  frozen: number;
  total: number;
  currency: string;
  isFrozen: boolean;
  frozenReason?: string | null;
  lastReconciledAt: Date | null;
}

/**
 * Wallet transaction record
 */
export interface IWalletTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "escrow" | "release" | "refund";
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
  referenceId?: string;
  referenceType?: string;
}

/**
 * Deposit entity
 */
export interface IDeposit {
  id: string;
  walletId: string;
  paymentId: string;
  amountMinor: bigint;
  currency: string;
  status: DepositStatus;
  createdAt: Date;
  completedAt?: Date;
  payment?: IPayment;
}

/**
 * Withdrawal entity
 */
export interface IWithdrawal {
  id: string;
  walletId: string;
  bankAccountId: string;
  amountMinor: bigint;
  feeMinor: bigint;
  netAmountMinor: bigint;
  currency: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  bankAccount?: IBankAccount;
}

/**
 * Payment entity
 */
export interface IPayment {
  id: string;
  userId: string;
  provider: string;
  providerInvoiceId?: string;
  paymentType: string;
  paymentMethod?: string;
  amountMinor: bigint;
  currency: string;
  status: string;
  expiresAt?: Date;
  paidAt?: Date;
  paymentDetails?: Record<string, unknown>;
}

/**
 * Bank account entity
 */
export interface IBankAccount {
  id: string;
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumberEnc: string;
  accountNumberLast4: string;
  accountHolderName: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: Date;
}

/**
 * Deposit status enum
 */
export enum DepositStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

/**
 * Withdrawal status enum
 */
export enum WithdrawalStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

/**
 * Options for deducting balance
 */
export interface IDeductBalanceOptions {
  userId: string;
  amount: bigint;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  maxRetries?: number;
}

/**
 * Options for crediting balance
 */
export interface ICreditBalanceOptions {
  userId: string;
  amount: bigint;
  reason: string;
  referenceId?: string;
  referenceType?: string;
}

/**
 * Options for locking balance
 */
export interface ILockBalanceOptions {
  userId: string;
  amount: bigint;
  reason: string;
  referenceId?: string;
}

/**
 * Top-up request data
 */
export interface ITopUpRequest {
  amount: number;
  method: string;
}

/**
 * Top-up response data
 */
export interface ITopUpResponse {
  id: string;
  amount: number;
  method: string;
  paymentUrl?: string;
  vaNumber?: string;
  expiresAt: Date;
}

/**
 * Withdrawal request data
 */
export interface IWithdrawRequest {
  amount: number;
  bankAccountId: string;
  pin?: string;
}

/**
 * Withdrawal response data
 */
export interface IWithdrawResponse {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  bankAccount: {
    bankName: string;
    accountNumberLast4: string;
    accountHolderName: string;
  };
  estimatedArrival: Date;
}

/**
 * Supported bank information
 */
export interface ISupportedBank {
  code: string;
  name: string;
  logo: string;
}

/**
 * Wallet query filters
 */
export interface IWalletTransactionFilters {
  type?: "deposit" | "withdrawal" | "all";
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

/**
 * Paginated wallet transactions response
 */
export interface IPaginatedWalletTransactions {
  data: IWalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
