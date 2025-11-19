import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  // Person fields (optional)
  @IsOptional()
  @IsString()
  personName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Access IDs to link, e.g., ['ac02'] or ['ac01'] or ['ac03']
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  accessIds!: string[];
}

export class PersonUpdateDto {
  @IsOptional()
  @IsString()
  personName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  salutation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  birthDttm?: string; // Accept ISO or DD/MM/YYYY formats

  // New schema: Use *Id UUID fields instead of *Code
  @IsOptional()
  @IsString()
  genderId?: string; // UUID reference to Gender.genderId

  @IsOptional()
  @IsString()
  cityId?: string; // UUID reference to City.cityId (birth place)

  @IsOptional()
  @IsString()
  jobId?: string; // UUID reference to Job.jobId

  @IsOptional()
  @IsString()
  ethnicityId?: string; // UUID reference to Ethnicity.ethnicityId

  @IsOptional()
  @IsString()
  maritalStatusId?: string; // String reference to MaritalStatus (ms1, ms2, ms3, ms4)

  @IsOptional()
  @IsString()
  organizationLevelId?: string; // UUID reference to OrganizationLevel.organizationLevelId

  @IsOptional()
  isFree?: boolean; // New field for free status
}

