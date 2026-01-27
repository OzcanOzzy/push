import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ListingAttributeType, ListingCategory } from '@prisma/client';

export class CreateListingAttributeDto {
  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsString()
  @MaxLength(60)
  key: string;

  @IsString()
  @MaxLength(120)
  label: string;

  @IsEnum(ListingAttributeType)
  type: ListingAttributeType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
