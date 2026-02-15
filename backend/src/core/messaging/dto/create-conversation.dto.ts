
import { IsString, IsOptional, IsArray, IsEnum, IsUUID } from "class-validator";

export enum ConversationTypeDto {
  DIRECT = "DIRECT",
  ORDER = "ORDER",
  SUPPORT = "SUPPORT",
  GROUP = "GROUP",
}

export class CreateConversationDto {
  @IsEnum(ConversationTypeDto)
  type: ConversationTypeDto;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @IsUUID("4", { each: true })
  participantIds: string[];

  @IsOptional()
  @IsUUID("4")
  orderId?: string;

  @IsOptional()
  @IsUUID("4")
  supportTicketId?: string;
}
