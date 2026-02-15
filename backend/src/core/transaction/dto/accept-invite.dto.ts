import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class AcceptInviteDto {
  @ApiProperty({
    description: "Invite token received from the transaction creator",
    example: "abc123xyz789",
  })
  @IsString()
  @IsNotEmpty({ message: "Invite token is required" })
  @Transform(({ value }) => value?.trim())
  inviteToken: string;

  @ApiPropertyOptional({
    description: "Optional message to the transaction creator",
    example: "I accept this transaction. Looking forward to working together.",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Message must not exceed 500 characters" })
  @Transform(({ value }) => value?.trim())
  message?: string;
}
