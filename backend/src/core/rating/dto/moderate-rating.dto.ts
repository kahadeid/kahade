import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';



export enum ModerationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FLAG = 'FLAG',
  DELETE = 'DELETE',
}

export class ModerateRatingDto {
  @ApiProperty({
    description: 'Rating ID to moderate',
    example: 'rat-123456789',
  })
  @IsString()
  ratingId: string;

  @ApiProperty({
    description: 'Moderation action',
    enum: ModerationAction,
    example: ModerationAction.APPROVE,
  })
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @ApiPropertyOptional({
    description: 'Reason for moderation action',
    example: 'Inappropriate language',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
