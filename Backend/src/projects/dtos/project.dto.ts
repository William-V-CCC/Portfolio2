export class CreateProjectDTO {
  title: string;
  description: string;
  start_date?: string;
  finish_date?: string;
  images?: string[];
}

export class UpdateProjectDTO {
  title?: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
  images?: string[];
}