
import { IsString, IsOptional, IsBoolean, MaxLength } from "class-validator";

export class CreateResponseDto {
  @IsString()
  @MaxLength(10000)
  message: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
