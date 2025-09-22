export type ProjectStatus = 'active' | 'in_progress' | 'completed' | 'planning';

export interface Project {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: ProjectStatus;
  user_id: string;
  technologies: string[];
  images: string[];
  demo_url?: string;
  github_url?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  content?: string;
  status?: ProjectStatus;
  technologies?: string[];
  images?: string[];
  demo_url?: string;
  github_url?: string;
  is_public?: boolean;
  is_featured?: boolean;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  content?: string;
  status?: ProjectStatus;
  technologies?: string[];
  images?: string[];
  demo_url?: string;
  github_url?: string;
  is_public?: boolean;
  is_featured?: boolean;
}

export interface ProjectQuery {
  status?: ProjectStatus;
  is_public?: boolean;
  is_featured?: boolean;
  user_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'title' | 'status' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProjectWithTechnologies extends Project {
  technology_details?: Array<{
    id: string;
    name: string;
    category?: string;
    icon_url?: string;
  }>;
}

// Like/Dislike types
export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  is_like: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectLikesStats {
  likes_count: number;
  dislikes_count: number;
  user_liked?: boolean;
  user_disliked?: boolean;
}

export interface LikeProjectRequest {
  project_id: string;
}

export interface DislikeProjectRequest {
  project_id: string;
}
