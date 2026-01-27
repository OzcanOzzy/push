import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  cityId: string;

  @IsOptional()
  @IsString()
  address?: string;
}
