export interface Technology {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon_url?: string;
  icon_filename?: string;
  icon_size?: number;
  icon_uploaded_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTechnologyRequest {
  name: string;
  description?: string;
  category?: string;
  icon_url?: string;
}

export interface UpdateTechnologyRequest {
  name?: string;
  description?: string;
  category?: string;
  icon_url?: string;
  is_active?: boolean;
}

export interface TechnologyQuery {
  category?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'category' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface TechnologyListResponse {
  technologies: Technology[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
