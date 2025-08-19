import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import type { SeniorityLevel } from '../types/cv-builder.types';
import { StandardResponseDto } from '../../auth/dto/auth.dto';

// Core Value DTO for nested validation
export class CoreValueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  value: string;
}

// CV Section DTOs
export class UpdateCVSectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  display_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

export class CVSectionResponseDto {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Personal Info DTOs
export class CreateCVPersonalInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profile_picture?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  github?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoreValueDto)
  core_values?: Array<{ label: string; value: string }>;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  experience?: string;
}

export class UpdateCVPersonalInfoDto extends CreateCVPersonalInfoDto {}

export class CVPersonalInfoResponseDto {
  id: string;
  user_id: string;
  name?: string;
  job_title?: string;
  summary?: string;
  profile_picture?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  core_values?: Array<{ label: string; value: string }>;
  birthday?: string;
  experience?: string;
  created_at: string;
  updated_at: string;
}

// Skills DTOs
export class CreateCVSkillDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  level: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

export class UpdateCVSkillDto extends CreateCVSkillDto {}

export class CVSkillResponseDto {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

// Experience DTOs
export class CreateCVExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  project_name?: string;

  @IsString()
  @IsNotEmpty()
  seniority_level: SeniorityLevel;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsBoolean()
  is_current: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  key_achievements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];
}

export class UpdateCVExperienceDto extends CreateCVExperienceDto {}

export class CVExperienceResponseDto {
  id: string;
  user_id: string;
  title: string;
  company: string;
  project_name?: string;
  seniority_level: SeniorityLevel;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  key_achievements?: string[];
  technologies?: string[];
  created_at: string;
  updated_at: string;
}

// Education DTOs
export class CreateCVEducationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  degree: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institution: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsBoolean()
  is_current: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCVEducationDto extends CreateCVEducationDto {}

export class CVEducationResponseDto {
  id: string;
  user_id: string;
  degree: string;
  institution: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Certifications DTOs
export class CreateCVCertificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  issuer: string;

  @IsDateString()
  issue_date: string;

  @IsOptional()
  @IsDateString()
  expiration_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  credential_id?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  credential_url?: string;
}

export class UpdateCVCertificationDto extends CreateCVCertificationDto {}

export class CVCertificationResponseDto {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  created_at: string;
  updated_at: string;
}

// Awards DTOs
export class CreateCVAwardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  issuer: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCVAwardDto extends CreateCVAwardDto {}

export class CVAwardResponseDto {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Interests DTOs
export class CreateCVInterestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateCVInterestDto extends CreateCVInterestDto {}

export class CVInterestResponseDto {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// References DTOs
export class CreateCVReferenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateCVReferenceDto extends CreateCVReferenceDto {}

export class CVReferenceResponseDto {
  id: string;
  user_id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Query DTOs
export class CVQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  institution?: string;
}

// Response DTOs
export class CVSectionsListDto {
  data: CVSectionResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVSkillsListDto {
  data: CVSkillResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVExperienceListDto {
  data: CVExperienceResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVEducationListDto {
  data: CVEducationResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVCertificationsListDto {
  data: CVCertificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVAwardsListDto {
  data: CVAwardResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVInterestsListDto {
  data: CVInterestResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

export class CVReferencesListDto {
  data: CVReferenceResponseDto[];
  total: number;
  page: number;
  limit: number;
  next: number | null;
  prev: number | null;
}

// Envelope DTOs for API responses
export class CVSectionsListEnvelopeDto extends StandardResponseDto<CVSectionsListDto> {}
export class SingleCVSectionResponseDto extends StandardResponseDto<CVSectionResponseDto> {}
export class CVPersonalInfoResponseEnvelopeDto extends StandardResponseDto<CVPersonalInfoResponseDto> {}
export class CVSkillsListEnvelopeDto extends StandardResponseDto<CVSkillsListDto> {}
export class SingleCVSkillResponseDto extends StandardResponseDto<CVSkillResponseDto> {}
export class CVExperienceListEnvelopeDto extends StandardResponseDto<CVExperienceListDto> {}
export class SingleCVExperienceResponseDto extends StandardResponseDto<CVExperienceResponseDto> {}
export class CVEducationListEnvelopeDto extends StandardResponseDto<CVEducationListDto> {}
export class SingleCVEducationResponseDto extends StandardResponseDto<CVEducationResponseDto> {}
export class CVCertificationsListEnvelopeDto extends StandardResponseDto<CVCertificationsListDto> {}
export class SingleCVCertificationResponseDto extends StandardResponseDto<CVCertificationResponseDto> {}
export class CVAwardsListEnvelopeDto extends StandardResponseDto<CVAwardsListDto> {}
export class SingleCVAwardResponseDto extends StandardResponseDto<CVAwardResponseDto> {}
export class CVInterestsListEnvelopeDto extends StandardResponseDto<CVInterestsListDto> {}
export class SingleCVInterestResponseDto extends StandardResponseDto<CVInterestResponseDto> {}
export class CVReferencesListEnvelopeDto extends StandardResponseDto<CVReferencesListDto> {}
export class SingleCVReferenceResponseDto extends StandardResponseDto<CVReferenceResponseDto> {}
