import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadListingImageDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
