import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingCategory, ListingStatus } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(ListingStatus)
  status: ListingStatus;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  areaGross?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  areaNet?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isOpportunity?: boolean;

  @IsString()
  branchId: string;

  @IsString()
  cityId: string;

  @IsOptional()
  @IsString()
  districtId?: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  @IsOptional()
  @IsString()
  consultantId?: string;
}
