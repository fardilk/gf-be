import { IsString, IsOptional, IsUUID } from 'class-validator';

// DTOs for MasterRelation (relation types)
export class CreateMasterRelationDto {
  @IsString()
  relationName!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMasterRelationDto {
  @IsOptional()
  @IsString()
  relationName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// DTOs for TrxRelation (actual person-to-person relations)
export class CreateTrxRelationDto {
  @IsUUID()
  relationId!: string; // FK to MasterRelation

  @IsOptional()
  @IsUUID()
  personGifter?: string; // FK to existing Person

  @IsOptional()
  @IsString()
  gifterName?: string; // Create new person with just name

  @IsOptional()
  @IsUUID()
  personReceiver?: string; // FK to existing Person

  @IsOptional()
  @IsString()
  receiverName?: string; // Create new person with just name
}

export class UpdateTrxRelationDto {
  @IsOptional()
  @IsUUID()
  relationId?: string;

  @IsOptional()
  @IsUUID()
  personGifter?: string;

  @IsOptional()
  @IsUUID()
  personReceiver?: string;
}
