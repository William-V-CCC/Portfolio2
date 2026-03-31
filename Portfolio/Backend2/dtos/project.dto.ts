export interface CreateProjectDTO {
  title: string;
  description: string;
  start_date: string; // ISO date
  finish_date: string; // ISO date
  images?: string[];
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
  images?: string[];
}