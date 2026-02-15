import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';



export class SystemConfigDto {
  @ApiProperty({
    description: 'Configuration key',
    example: 'MAINTENANCE_MODE',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Configuration value',
    example: 'false',
  })
  @IsString()
  value: string;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Enable/disable maintenance mode',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether config is editable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}

export class UpdateSystemConfigDto {
  @ApiProperty({
    description: 'Configuration key to update',
    example: 'MAX_ORDER_AMOUNT',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'New configuration value',
    example: '100000000',
  })
  @IsString()
  value: string;
}
