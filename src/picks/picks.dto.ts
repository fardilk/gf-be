import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreatePickDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cost?: string;

  @IsUrl()
  url!: string;
}

export class UpdatePickDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cost?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
