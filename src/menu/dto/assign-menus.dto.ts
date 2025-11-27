import { IsArray, IsUUID, IsString } from 'class-validator';

export class AssignMenusToAccessDto {
  @IsString()
  accessId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  menuIds: string[];
}
