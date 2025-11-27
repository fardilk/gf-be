import { IsString, IsOptional, IsInt, IsBoolean, IsUUID } from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
