import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class AddListingImageDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
