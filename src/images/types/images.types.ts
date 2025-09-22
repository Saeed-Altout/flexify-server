export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploaded_at: string;
}

export interface ImageListResponse {
  images: ImageUploadResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ImageDeleteResponse {
  deleted_id: string;
  deleted_url: string;
}
