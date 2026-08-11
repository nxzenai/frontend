export interface Notebook {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  visibility: "private" | "public";
  tags: string[];
  execution_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotebookResponse {
  success: boolean;
  message: string;
  data: Notebook[];
}

export interface CreateNotebookRequest {
  title: string;
  description: string;
  visibility: "private" | "public";
  tags: string[];
}

export interface UpdateNotebookRequest {
  title?: string;
  description?: string;
  visibility?: "private" | "public";
  tags?: string[];
}