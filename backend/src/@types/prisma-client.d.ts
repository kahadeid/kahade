/**
 * Prisma Client stub types.
 * These will be superseded by the real generated @prisma/client after running:
 *   npm install && npx prisma generate
 */

declare module "@prisma/client" {
  interface PrismaDelegate<T = any> {
    findUnique(args: any): Promise<T | null>;
    findFirst(args?: any): Promise<T | null>;
    findMany(args?: any): Promise<T[]>;
    create(args: any): Promise<T>;
    createMany(args: any): Promise<{ count: number }>;
    update(args: any): Promise<T>;
    updateMany(args: any): Promise<{ count: number }>;
    upsert(args: any): Promise<T>;
    delete(args: any): Promise<T>;
    deleteMany(args?: any): Promise<{ count: number }>;
    count(args?: any): Promise<number>;
    aggregate(args?: any): Promise<any>;
    groupBy(args?: any): Promise<any[]>;
  }

  class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    // SECURITY: Ensure input is properly sanitized
    $queryRaw<T = any>(query: TemplateStringsArray | any, ...values: unknown[]): Promise<T>;
    // SECURITY: Ensure input is properly sanitized
    $executeRaw(query: TemplateStringsArray | any, ...values: unknown[]): Promise<number>;
    // SECURITY: Ensure input is properly sanitized
    $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
    $transaction<T>(fn: (client: any) => Promise<T>, options?: any): Promise<T>;
    $transaction<T>(queries: Promise<any>[]): Promise<T[]>;
    $use(middleware: any): void;
    $on(event: string, callback: (e: any) => void): void;
    $extends(extension: any): any;
    readonly auditLog: PrismaDelegate<any>;
    readonly badge: PrismaDelegate<any>;
    readonly bankAccount: PrismaDelegate<any>;
    readonly cannedResponse: PrismaDelegate<any>;
    readonly conversation: PrismaDelegate<any>;
    readonly conversationParticipant: PrismaDelegate<any>;
    readonly deliveryProof: PrismaDelegate<any>;
    readonly deposit: PrismaDelegate<any>;
    readonly deviceFingerprint: PrismaDelegate<any>;
    readonly dispute: PrismaDelegate<any>;
    readonly disputeEvidence: PrismaDelegate<any>;
    readonly disputeTimeline: PrismaDelegate<any>;
    readonly escrowHold: PrismaDelegate<any>;
    readonly feeConfig: PrismaDelegate<any>;
    readonly fraudAlert: PrismaDelegate<any>;
    readonly fraudRule: PrismaDelegate<any>;
    readonly idempotencyRecord: PrismaDelegate<any>;
    readonly ipReputation: PrismaDelegate<any>;
    readonly kYCSubmission: PrismaDelegate<any>;
    readonly ledgerAccount: PrismaDelegate<any>;
    readonly ledgerEntry: PrismaDelegate<any>;
    readonly ledgerJournal: PrismaDelegate<any>;
    readonly mFAChallenge: PrismaDelegate<any>;
    readonly mFALog: PrismaDelegate<any>;
    readonly message: PrismaDelegate<any>;
    readonly messageReadReceipt: PrismaDelegate<any>;
    readonly mfaBackupCode: PrismaDelegate<any>;
    readonly notification: PrismaDelegate<any>;
    readonly notificationLog: PrismaDelegate<any>;
    readonly notificationQueue: PrismaDelegate<any>;
    readonly notificationTemplate: PrismaDelegate<any>;
    readonly order: PrismaDelegate<any>;
    readonly orderComment: PrismaDelegate<any>;
    readonly orderSettlement: PrismaDelegate<any>;
    readonly passwordHistory: PrismaDelegate<any>;
    readonly payment: PrismaDelegate<any>;
    readonly paymentStatusHistory: PrismaDelegate<any>;
    readonly platformAccountKey: PrismaDelegate<any>;
    readonly promo: PrismaDelegate<any>;
    readonly promoAssignment: PrismaDelegate<any>;
    readonly pushSubscription: PrismaDelegate<any>;
    readonly rating: PrismaDelegate<any>;
    readonly referralCode: PrismaDelegate<any>;
    readonly referralReward: PrismaDelegate<any>;
    readonly referralUsage: PrismaDelegate<any>;
    readonly reputationHistory: PrismaDelegate<any>;
    readonly scheduledJob: PrismaDelegate<any>;
    readonly securityEvent: PrismaDelegate<any>;
    readonly session: PrismaDelegate<any>;
    readonly supportAgent: PrismaDelegate<any>;
    readonly supportTicket: PrismaDelegate<any>;
    readonly systemConfig: PrismaDelegate<any>;
    readonly ticketAttachment: PrismaDelegate<any>;
    readonly ticketHistory: PrismaDelegate<any>;
    readonly ticketResponse: PrismaDelegate<any>;
    readonly transactionLimit: PrismaDelegate<any>;
    readonly transactionRiskAssessment: PrismaDelegate<any>;
    readonly trustedDevice: PrismaDelegate<any>;
    readonly user: PrismaDelegate<any>;
    readonly userAchievement: PrismaDelegate<any>;
    readonly userActivity: PrismaDelegate<any>;
    readonly userBadge: PrismaDelegate<any>;
    readonly userLevel: PrismaDelegate<any>;
    readonly userMFA: PrismaDelegate<any>;
    readonly userNotificationPreference: PrismaDelegate<any>;
    readonly userRiskProfile: PrismaDelegate<any>;
    readonly voucher: PrismaDelegate<any>;
    readonly voucherUsage: PrismaDelegate<any>;
    readonly wallet: PrismaDelegate<any>;
    readonly walletAdjustment: PrismaDelegate<any>;
    readonly webAuthnCredential: PrismaDelegate<any>;
    readonly webhookEvent: PrismaDelegate<any>;
    readonly whatsappSession: PrismaDelegate<any>;
    readonly withdrawal: PrismaDelegate<any>;
    readonly withdrawalApproval: PrismaDelegate<any>;
  }

  const ActivityType: Record<string, string> & {
    [key: string]: string;
  };
  type ActivityType = string;

  const AuditAction: Record<string, string> & {
    [key: string]: string;
  };
  type AuditAction = string;

  const BadgeCategory: Record<string, string> & {
    [key: string]: string;
  };
  type BadgeCategory = string;

  const BadgeRarity: Record<string, string> & {
    [key: string]: string;
  };
  type BadgeRarity = string;

  const BankAccountType: Record<string, string> & {
    [key: string]: string;
  };
  type BankAccountType = string;

  const ConversationType: Record<string, string> & {
    [key: string]: string;
  };
  type ConversationType = string;

  const Currency: Record<string, string> & {
    [key: string]: string;
  };
  type Currency = string;

  const DepositStatus: Record<string, string> & {
    [key: string]: string;
  };
  type DepositStatus = string;

  const DisputeDecision: Record<string, string> & {
    [key: string]: string;
  };
  type DisputeDecision = string;

  const DisputeStatus: Record<string, string> & {
    [key: string]: string;
  };
  type DisputeStatus = string;

  const EscrowHoldStatus: Record<string, string> & {
    [key: string]: string;
  };
  type EscrowHoldStatus = string;

  const FeePayer: Record<string, string> & {
    [key: string]: string;
  };
  type FeePayer = string;

  const FraudAlertStatus: Record<string, string> & {
    [key: string]: string;
  };
  type FraudAlertStatus = string;

  const FraudRuleType: Record<string, string> & {
    [key: string]: string;
  };
  type FraudRuleType = string;

  const InitiatorRole: Record<string, string> & {
    [key: string]: string;
  };
  type InitiatorRole = string;

  const JournalType: Record<string, string> & {
    [key: string]: string;
  };
  type JournalType = string;

  const KYCStatus: Record<string, string> & {
    [key: string]: string;
  };
  type KYCStatus = string;

  const LedgerAccountType: Record<string, string> & {
    [key: string]: string;
  };
  type LedgerAccountType = string;

  const MFAMethod: Record<string, string> & {
    [key: string]: string;
  };
  type MFAMethod = string;

  const MFAStatus: Record<string, string> & {
    [key: string]: string;
  };
  type MFAStatus = string;

  const MessageStatus: Record<string, string> & {
    [key: string]: string;
  };
  type MessageStatus = string;

  const MessageType: Record<string, string> & {
    [key: string]: string;
  };
  type MessageType = string;

  const NotificationChannel: Record<string, string> & {
    [key: string]: string;
  };
  type NotificationChannel = string;

  const NotificationPriority: Record<string, string> & {
    [key: string]: string;
  };
  type NotificationPriority = string;

  const NotificationStatus: Record<string, string> & {
    [key: string]: string;
  };
  type NotificationStatus = string;

  const NotificationType: Record<string, string> & {
    [key: string]: string;
  };
  type NotificationType = string;

  const OrderCategory: Record<string, string> & {
    [key: string]: string;
  };
  type OrderCategory = string;

  const OrderStatus: Record<string, string> & {
    [key: string]: string;
  };
  type OrderStatus = string;

  const PaymentMethod: Record<string, string> & {
    [key: string]: string;
  };
  type PaymentMethod = string;

  const PaymentProvider: Record<string, string> & {
    [key: string]: string;
  };
  type PaymentProvider = string;

  const PaymentStatus: Record<string, string> & {
    [key: string]: string;
  };
  type PaymentStatus = string;

  const PaymentType: Record<string, string> & {
    [key: string]: string;
  };
  type PaymentType = string;

  const PromoTargetType: Record<string, string> & {
    [key: string]: string;
  };
  type PromoTargetType = string;

  const ReferralRewardStatus: Record<string, string> & {
    [key: string]: string;
  };
  type ReferralRewardStatus = string;

  const ReferralRewardType: Record<string, string> & {
    [key: string]: string;
  };
  type ReferralRewardType = string;

  const ReferralStatus: Record<string, string> & {
    [key: string]: string;
  };
  type ReferralStatus = string;

  const RiskLevel: Record<string, string> & {
    [key: string]: string;
  };
  type RiskLevel = string;

  const ScheduledJobStatus: Record<string, string> & {
    [key: string]: string;
  };
  type ScheduledJobStatus = string;

  const SecurityEventSeverity: Record<string, string> & {
    [key: string]: string;
  };
  type SecurityEventSeverity = string;

  const SecurityEventType: Record<string, string> & {
    [key: string]: string;
  };
  type SecurityEventType = string;

  const TicketCategory: Record<string, string> & {
    [key: string]: string;
  };
  type TicketCategory = string;

  const TicketPriority: Record<string, string> & {
    [key: string]: string;
  };
  type TicketPriority = string;

  const TicketStatus: Record<string, string> & {
    [key: string]: string;
  };
  type TicketStatus = string;

  const TransactionStatus: Record<string, string> & {
    [key: string]: string;
  };
  type TransactionStatus = string;

  const UserRole: Record<string, string> & {
    [key: string]: string;
  };
  type UserRole = string;

  const UserStatus: Record<string, string> & {
    [key: string]: string;
  };
  type UserStatus = string;

  const VoucherStatus: Record<string, string> & {
    [key: string]: string;
  };
  type VoucherStatus = string;

  const VoucherType: Record<string, string> & {
    [key: string]: string;
  };
  type VoucherType = string;

  const WalletAdjustmentStatus: Record<string, string> & {
    [key: string]: string;
  };
  type WalletAdjustmentStatus = string;

  const WalletAdjustmentType: Record<string, string> & {
    [key: string]: string;
  };
  type WalletAdjustmentType = string;

  const WalletTransactionType: Record<string, string> & {
    [key: string]: string;
  };
  type WalletTransactionType = string;

  const WebhookStatus: Record<string, string> & {
    [key: string]: string;
  };
  type WebhookStatus = string;

  const WithdrawalStatus: Record<string, string> & {
    [key: string]: string;
  };
  type WithdrawalStatus = string;

  export {
    ActivityType,
    AuditAction,
    BadgeCategory,
    BadgeRarity,
    BankAccountType,
    ConversationType,
    Currency,
    DepositStatus,
    DisputeDecision,
    DisputeStatus,
    EscrowHoldStatus,
    FeePayer,
    FraudAlertStatus,
    FraudRuleType,
    InitiatorRole,
    JournalType,
    KYCStatus,
    LedgerAccountType,
    MFAMethod,
    MFAStatus,
    MessageStatus,
    MessageType,
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
    OrderCategory,
    OrderStatus,
    PaymentMethod,
    PaymentProvider,
    PaymentStatus,
    PaymentType,
    PromoTargetType,
    ReferralRewardStatus,
    ReferralRewardType,
    ReferralStatus,
    RiskLevel,
    ScheduledJobStatus,
    SecurityEventSeverity,
    SecurityEventType,
    TicketCategory,
    TicketPriority,
    TicketStatus,
    TransactionStatus,
    UserRole,
    UserStatus,
    VoucherStatus,
    VoucherType,
    WalletAdjustmentStatus,
    WalletAdjustmentType,
    WalletTransactionType,
    WebhookStatus,
    WithdrawalStatus,
  };
}
