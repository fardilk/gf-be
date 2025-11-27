import { IsString, IsOptional, IsInt, IsBoolean, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
