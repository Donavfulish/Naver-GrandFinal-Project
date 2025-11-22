export interface Background {
  id: string;
  background_url: string;
  emotion: string[];
  tags: string[];
  source: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  success: boolean;
  data: Background[];
}