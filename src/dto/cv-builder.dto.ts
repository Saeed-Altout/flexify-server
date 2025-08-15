import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StandardResponseDto } from './auth.dto';
import type { SeniorityLevel } from '../types/cv-builder.types';

// CV Section DTOs
export class UpdateCVSectionDto {
  @ApiPropertyOptional({
    description: 'Section display name',
    example: 'Skills',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  display_name?: string;

  @ApiPropertyOptional({
    description: 'Section description',
    example: 'Technical and soft skills with proficiency levels',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the section is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the section is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for the section',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

export class CVSectionResponseDto {
  @ApiProperty({ description: 'Section unique identifier' })
  id: string;

  @ApiProperty({ description: 'Section name (internal identifier)' })
  name: string;

  @ApiProperty({ description: 'Section display name' })
  display_name: string;

  @ApiProperty({ description: 'Section description' })
  description?: string;

  @ApiProperty({ description: 'Whether the section is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether the section is required' })
  is_required: boolean;

  @ApiProperty({ description: 'Sort order for the section' })
  sort_order: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Personal Info DTOs
export class CreateCVPersonalInfoDto {
  @ApiPropertyOptional({
    description: 'Job title',
    example: 'Senior Full Stack Developer',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @ApiPropertyOptional({
    description: 'Professional summary',
    example: 'Experienced developer with 5+ years in web development',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  profile_picture?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, City, State 12345',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description: 'Personal website',
    example: 'https://example.com',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile',
    example: 'https://linkedin.com/in/username',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'GitHub profile',
    example: 'https://github.com/username',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  github?: string;
}

export class UpdateCVPersonalInfoDto extends CreateCVPersonalInfoDto {}

export class CVPersonalInfoResponseDto {
  @ApiProperty({ description: 'Personal info unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Job title' })
  job_title?: string;

  @ApiProperty({ description: 'Professional summary' })
  summary?: string;

  @ApiProperty({ description: 'Profile picture URL' })
  profile_picture?: string;

  @ApiProperty({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({ description: 'Address' })
  address?: string;

  @ApiProperty({ description: 'Personal website' })
  website?: string;

  @ApiProperty({ description: 'LinkedIn profile' })
  linkedin?: string;

  @ApiProperty({ description: 'GitHub profile' })
  github?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Skills DTOs
export class CreateCVSkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'React.js',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Skill description',
    example: 'Frontend framework for building user interfaces',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Skill proficiency level (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  level: number;

  @ApiPropertyOptional({
    description: 'Skill category',
    example: 'Frontend',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

export class UpdateCVSkillDto extends CreateCVSkillDto {}

export class CVSkillResponseDto {
  @ApiProperty({ description: 'Skill unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Skill name' })
  name: string;

  @ApiProperty({ description: 'Skill description' })
  description?: string;

  @ApiProperty({ description: 'Skill proficiency level (0-100)' })
  level: number;

  @ApiProperty({ description: 'Skill category' })
  category?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Experience DTOs
export class CreateCVExperienceDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @ApiPropertyOptional({
    description: 'Project name',
    example: 'E-commerce Platform',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  project_name?: string;

  @ApiProperty({
    description: 'Seniority level',
    example: 'SENIOR',
    enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'CTO'],
  })
  @IsString()
  @IsNotEmpty()
  seniority_level: SeniorityLevel;

  @ApiPropertyOptional({
    description: 'Job location',
    example: 'San Francisco, CA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2022-01-15',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD)',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Whether this is the current position',
    example: false,
  })
  @IsBoolean()
  is_current: boolean;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Led development of web applications using React and Node.js',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Key achievements',
    example: ['Increased performance by 40%', 'Led team of 5 developers'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  key_achievements?: string[];

  @ApiPropertyOptional({
    description: 'Technologies used (technology values)',
    example: ['react', 'nodejs', 'postgresql'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];
}

export class UpdateCVExperienceDto extends CreateCVExperienceDto {}

export class CVExperienceResponseDto {
  @ApiProperty({ description: 'Experience unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Company name' })
  company: string;

  @ApiProperty({ description: 'Project name' })
  project_name?: string;

  @ApiProperty({ description: 'Seniority level' })
  seniority_level: SeniorityLevel;

  @ApiProperty({ description: 'Job location' })
  location?: string;

  @ApiProperty({ description: 'Start date' })
  start_date: string;

  @ApiProperty({ description: 'End date' })
  end_date?: string;

  @ApiProperty({ description: 'Whether this is the current position' })
  is_current: boolean;

  @ApiProperty({ description: 'Job description' })
  description?: string;

  @ApiProperty({ description: 'Key achievements' })
  key_achievements?: string[];

  @ApiProperty({ description: 'Technologies used' })
  technologies?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Education DTOs
export class CreateCVEducationDto {
  @ApiProperty({
    description: 'Degree name',
    example: 'Bachelor of Science in Computer Science',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  degree: string;

  @ApiProperty({
    description: 'Institution name',
    example: 'University of Technology',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institution: string;

  @ApiPropertyOptional({
    description: 'Institution location',
    example: 'New York, NY',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2018-09-01',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD)',
    example: '2022-05-15',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Whether this is the current education',
    example: false,
  })
  @IsBoolean()
  is_current: boolean;

  @ApiPropertyOptional({
    description: 'Education description',
    example: 'Focused on software engineering and algorithms',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCVEducationDto extends CreateCVEducationDto {}

export class CVEducationResponseDto {
  @ApiProperty({ description: 'Education unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Degree name' })
  degree: string;

  @ApiProperty({ description: 'Institution name' })
  institution: string;

  @ApiProperty({ description: 'Institution location' })
  location?: string;

  @ApiProperty({ description: 'Start date' })
  start_date: string;

  @ApiProperty({ description: 'End date' })
  end_date?: string;

  @ApiProperty({ description: 'Whether this is the current education' })
  is_current: boolean;

  @ApiProperty({ description: 'Education description' })
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Certifications DTOs
export class CreateCVCertificationDto {
  @ApiProperty({
    description: 'Certification name',
    example: 'AWS Certified Solutions Architect',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Issuing organization',
    example: 'Amazon Web Services',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  issuer: string;

  @ApiProperty({
    description: 'Issue date (YYYY-MM-DD)',
    example: '2023-06-15',
  })
  @IsDateString()
  issue_date: string;

  @ApiPropertyOptional({
    description: 'Expiration date (YYYY-MM-DD)',
    example: '2026-06-15',
  })
  @IsOptional()
  @IsDateString()
  expiration_date?: string;

  @ApiPropertyOptional({
    description: 'Credential ID',
    example: 'AWS-12345',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  credential_id?: string;

  @ApiPropertyOptional({
    description: 'Credential verification URL',
    example: 'https://aws.amazon.com/verification',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  credential_url?: string;
}

export class UpdateCVCertificationDto extends CreateCVCertificationDto {}

export class CVCertificationResponseDto {
  @ApiProperty({ description: 'Certification unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Certification name' })
  name: string;

  @ApiProperty({ description: 'Issuing organization' })
  issuer: string;

  @ApiProperty({ description: 'Issue date' })
  issue_date: string;

  @ApiProperty({ description: 'Expiration date' })
  expiration_date?: string;

  @ApiProperty({ description: 'Credential ID' })
  credential_id?: string;

  @ApiProperty({ description: 'Credential verification URL' })
  credential_url?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Awards DTOs
export class CreateCVAwardDto {
  @ApiProperty({
    description: 'Award name',
    example: 'Employee of the Year',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Awarding organization',
    example: 'Tech Corp',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  issuer: string;

  @ApiProperty({
    description: 'Award date (YYYY-MM-DD)',
    example: '2023-12-15',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Award description',
    example: 'Recognized for outstanding contributions to project success',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCVAwardDto extends CreateCVAwardDto {}

export class CVAwardResponseDto {
  @ApiProperty({ description: 'Award unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Award name' })
  name: string;

  @ApiProperty({ description: 'Awarding organization' })
  issuer: string;

  @ApiProperty({ description: 'Award date' })
  date: string;

  @ApiProperty({ description: 'Award description' })
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Interests DTOs
export class CreateCVInterestDto {
  @ApiProperty({
    description: 'Interest name',
    example: 'Machine Learning',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateCVInterestDto extends CreateCVInterestDto {}

export class CVInterestResponseDto {
  @ApiProperty({ description: 'Interest unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Interest name' })
  name: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// References DTOs
export class CreateCVReferenceDto {
  @ApiProperty({
    description: 'Reference name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Reference position',
    example: 'Senior Manager',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @ApiProperty({
    description: 'Reference company',
    example: 'Tech Corp',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @ApiProperty({
    description: 'Reference email',
    example: 'john.doe@techcorp.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Reference phone',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateCVReferenceDto extends CreateCVReferenceDto {}

export class CVReferenceResponseDto {
  @ApiProperty({ description: 'Reference unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Reference name' })
  name: string;

  @ApiProperty({ description: 'Reference position' })
  position: string;

  @ApiProperty({ description: 'Reference company' })
  company: string;

  @ApiProperty({ description: 'Reference email' })
  email: string;

  @ApiProperty({ description: 'Reference phone' })
  phone?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

// Query DTOs
export class CVQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category (for skills)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by company (for experience)' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Filter by institution (for education)' })
  @IsOptional()
  @IsString()
  institution?: string;
}

// Response DTOs
export class CVSectionsListDto {
  @ApiProperty({ type: [CVSectionResponseDto] })
  data: CVSectionResponseDto[];

  @ApiProperty({ description: 'Total count of sections' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVSkillsListDto {
  @ApiProperty({ type: [CVSkillResponseDto] })
  data: CVSkillResponseDto[];

  @ApiProperty({ description: 'Total count of skills' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVExperienceListDto {
  @ApiProperty({ type: [CVExperienceResponseDto] })
  data: CVExperienceResponseDto[];

  @ApiProperty({ description: 'Total count of experiences' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVEducationListDto {
  @ApiProperty({ type: [CVEducationResponseDto] })
  data: CVEducationResponseDto[];

  @ApiProperty({ description: 'Total count of education entries' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVCertificationsListDto {
  @ApiProperty({ type: [CVCertificationResponseDto] })
  data: CVCertificationResponseDto[];

  @ApiProperty({ description: 'Total count of certifications' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVAwardsListDto {
  @ApiProperty({ type: [CVAwardResponseDto] })
  data: CVAwardResponseDto[];

  @ApiProperty({ description: 'Total count of awards' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVInterestsListDto {
  @ApiProperty({ type: [CVInterestResponseDto] })
  data: CVInterestResponseDto[];

  @ApiProperty({ description: 'Total count of interests' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev: number | null;
}

export class CVReferencesListDto {
  @ApiProperty({ type: [CVReferenceResponseDto] })
  data: CVReferenceResponseDto[];

  @ApiProperty({ description: 'Total count of references' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
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
