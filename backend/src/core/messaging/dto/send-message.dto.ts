
import {

  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsObject,
} from "class-validator";

export enum MessageTypeDto {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  DELIVERY_UPDATE = "DELIVERY_UPDATE",
}

export class SendMessageDto {
  @IsOptional()
  @IsEnum(MessageTypeDto)
  type?: MessageTypeDto = MessageTypeDto.TEXT;

  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsObject()
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: Record<string, any>;

  @IsOptional()
  @IsUUID("4")
  replyToId?: string;
}

export class EditMessageDto {
  @IsString()
  @MaxLength(5000)
  content: string;
}
