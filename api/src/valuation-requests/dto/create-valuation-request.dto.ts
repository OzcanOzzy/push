import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ListingStatus, ListingCategory } from '@prisma/client';

export class CreateValuationRequestDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  cityId: string;

  @IsString()
  districtId: string;

  @IsString()
  neighborhoodId: string;

  @IsEnum(ListingStatus)
  listingStatus: ListingStatus;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsOptional()
  @IsString()
  subPropertyType?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateValuationRequestStatusDto {
  @IsString()
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  estimatedValue?: number;
}
