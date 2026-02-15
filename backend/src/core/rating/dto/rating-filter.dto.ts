import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export class RatingFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user who received the rating',
    example: 'usr-123',
  })
  @IsOptional()
  @IsString()
  toUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user who gave the rating',
    example: 'usr-456',
  })
  @IsOptional()
  @IsString()
  fromUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum rating score',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  minScore?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum rating score',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  maxScore?: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
