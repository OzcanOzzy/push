import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CustomerRequestType } from '@prisma/client';

export class CreateCustomerRequestDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(CustomerRequestType)
  type: CustomerRequestType;

  @IsOptional()
  criteria?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  districtId?: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;
}
