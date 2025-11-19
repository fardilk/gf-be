import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
  @IsOptional() @IsString() name?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsNotEmpty() password!: string;
}

export class RefreshDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
