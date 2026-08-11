export interface Notebook {
  id: string;
  title: string;
  description: string;
  visibility: string;
  tags: string[];
  execution_count: number;
  created_at: string;
  updated_at: string;
}