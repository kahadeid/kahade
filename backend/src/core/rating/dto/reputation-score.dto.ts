import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export class ReputationScoreDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr-123456789',
  })
  userId: string;

  @ApiProperty({
    description: 'Average rating score',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  averageRating: number;

  @ApiProperty({
    description: 'Total number of ratings received',
    example: 150,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalRatings: number;

  @ApiProperty({
    description: 'Number of completed transactions',
    example: 200,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  completedTransactions: number;

  @ApiProperty({
    description: 'Reputation score (0-100)',
    example: 85,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  reputationScore: number;
}
