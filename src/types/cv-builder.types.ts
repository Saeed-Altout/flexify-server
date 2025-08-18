export type SeniorityLevel =
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'MANAGER'
  | 'DIRECTOR'
  | 'CTO';

export interface CVSection {
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

export interface CVPersonalInfo {
  id: string;
  user_id: string;
  name?: string;
  job_title?: string;
  summary?: string;
  profile_picture?: string; // File path/reference instead of URL
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  core_values?: Array<{ label: string; value: string }>; // Core values as array of objects
  birthday?: string; // ISO date string
  experience?: string;
  created_at: string;
  updated_at: string;
}

export interface CVSkill {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: number; // 0-100
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CVExperience {
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
  technologies?: string[]; // Technology values from technologies service
  created_at: string;
  updated_at: string;
}

export interface CVEducation {
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

export interface CVCertification {
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

export interface CVAward {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CVInterest {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CVReference {
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

export interface CVExperienceTechnology {
  id: string;
  experience_id: string;
  technology_id: string;
  created_at: string;
}

// Response DTOs for API responses
export interface CVSectionResponse {
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

export interface CVPersonalInfoResponse {
  id: string;
  user_id: string;
  name?: string;
  job_title?: string;
  summary?: string;
  profile_picture?: string; // File path/reference instead of URL
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  core_values?: Array<{ label: string; value: string }>; // Core values as array of objects
  birthday?: string; // ISO date string
  experience?: string;
  created_at: string;
  updated_at: string;
}

export interface CVSkillResponse {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CVExperienceResponse {
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

export interface CVEducationResponse {
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

export interface CVCertificationResponse {
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

export interface CVAwardResponse {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CVInterestResponse {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CVReferenceResponse {
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

// Complete CV response
export interface CompleteCVResponse {
  personal_info?: CVPersonalInfoResponse;
  skills?: CVSkillResponse[];
  experience?: CVExperienceResponse[];
  education?: CVEducationResponse[];
  certifications?: CVCertificationResponse[];
  awards?: CVAwardResponse[];
  interests?: CVInterestResponse[];
  references?: CVReferenceResponse[];
  sections: CVSectionResponse[];
}

// Database row types for internal use
export interface CVSectionRow {
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

export interface CVPersonalInfoRow {
  id: string;
  user_id: string;
  name?: string;
  job_title?: string;
  summary?: string;
  profile_picture?: string; // File path/reference instead of URL
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  core_values?: Array<{ label: string; value: string }>; // Core values as array of objects
  birthday?: string; // ISO date string
  experience?: string;
  created_at: string;
  updated_at: string;
}

export interface CVSkillRow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CVExperienceRow {
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
  created_at: string;
  updated_at: string;
}

export interface CVEducationRow {
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

export interface CVCertificationRow {
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

export interface CVAwardRow {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CVInterestRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CVReferenceRow {
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

export interface CVExperienceTechnologyRow {
  id: string;
  experience_id: string;
  technology_id: string;
  created_at: string;
}
