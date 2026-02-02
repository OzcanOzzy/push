import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ListingCategory, ListingStatus } from '@prisma/client';

export class CreateListingDto {
  // İlan numarası (opsiyonel - boş bırakılırsa otomatik üretilir)
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/, { message: 'İlan numarası 5 haneli rakam olmalı (örn: 00001)' })
  listingNo?: string;

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

  // Alt kategori (DAIRE, APART, KONUT_ARSASI, DUKKAN vb.)
  @IsOptional()
  @IsString()
  subPropertyType?: string;

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

  // Konum bilgileri
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hideLocation?: boolean;

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
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

  // SEO Alanları (opsiyonel - boş bırakılırsa otomatik üretilir)
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  seoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  // Video & Sanal Tur
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  virtualTourUrl?: string;

  @IsOptional()
  @IsString()
  virtualTourType?: string;
}
