import { ApiPropertyOptional } from "@nestjs/swagger";

import { IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class ReleaseEscrowDto {
  @ApiPropertyOptional({
    description: "Platform fee in minor units (deducted from escrow)",
    example: 250000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  platformFeeMinor?: number;
}
