import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';



export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class RiskAssessmentDto {
  @ApiProperty({
    description: 'Withdrawal request ID',
    example: 'wdr-123456789',
  })
  @IsString()
  withdrawalId: string;

  @ApiProperty({
    description: 'Risk level assessment',
    enum: RiskLevel,
    example: RiskLevel.LOW,
  })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({
    description: 'Risk score (0-100)',
    example: 15,
  })
  @IsInt()
  @Type(() => Number)
  riskScore: number;

  @ApiProperty({
    description: 'Whether manual review is required',
    example: false,
  })
  @IsBoolean()
  requiresManualReview: boolean;

  @ApiProperty({
    description: 'Assessment reason',
    example: 'Normal transaction pattern',
  })
  @IsString()
  reason: string;
}
