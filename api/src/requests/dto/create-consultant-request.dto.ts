import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConsultantRequestDto {
  @IsString()
  consultantId: string;

  @IsString()
  @MinLength(2)
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  requestText?: string;

  @IsOptional()
  criteria?: Record<string, unknown>;
}
