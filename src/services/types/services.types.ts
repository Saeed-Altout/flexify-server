export interface Service {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  href?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
