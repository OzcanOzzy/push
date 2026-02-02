import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  email: string; // email veya username olabilir

  @IsString()
  @MinLength(6)
  password: string;
}
