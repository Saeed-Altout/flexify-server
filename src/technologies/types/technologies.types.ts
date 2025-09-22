import { TechnologyCategory } from '../enums/technologies.enums';

export interface Technology {
  id: string;
  name: string;
  description?: string;
  category: TechnologyCategory;
  icon_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TechnologiesQuery {
  category?: TechnologyCategory;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TechnologiesResponse {
  technologies: Technology[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
