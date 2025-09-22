import { ProjectStatus } from '../enums';

export interface Project {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: ProjectStatus;
  user_id: string;
  technologies: string[];
  likes_count: number;
  cover_url?: string;
  demo_url?: string;
  github_url?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LikeProjectResponse {
  id: string;
  project_id: string;
  user_id: string;
  is_like: boolean;
  created_at: string;
  updated_at: string;
}
