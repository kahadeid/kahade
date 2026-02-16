
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsArray,
} from "class-validator";

export enum TicketCategoryDto {
  GENERAL_INQUIRY = "GENERAL_INQUIRY",
  ACCOUNT_ISSUE = "ACCOUNT_ISSUE",
  TRANSACTION_ISSUE = "TRANSACTION_ISSUE",
  PAYMENT_ISSUE = "PAYMENT_ISSUE",
  WITHDRAWAL_ISSUE = "WITHDRAWAL_ISSUE",
  KYC_VERIFICATION = "KYC_VERIFICATION",
  DISPUTE_HELP = "DISPUTE_HELP",
  SECURITY_CONCERN = "SECURITY_CONCERN",
  BUG_REPORT = "BUG_REPORT",
  FEATURE_REQUEST = "FEATURE_REQUEST",
  REFUND_REQUEST = "REFUND_REQUEST",
  OTHER = "OTHER",
}

export enum TicketPriorityDto {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL",
}

export class CreateTicketDto {
  @IsString()
  @MaxLength(200)
  subject: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsEnum(TicketCategoryDto)
  category: TicketCategoryDto;

  @IsOptional()
  @IsEnum(TicketPriorityDto)
  priority?: TicketPriorityDto;

  @IsOptional()
  @IsUUID("4")
  orderId?: string;

  @IsOptional()
  @IsUUID("4")
  disputeId?: string;

  @IsOptional()
  @IsUUID("4")
  withdrawalId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
