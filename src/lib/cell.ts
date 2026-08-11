export interface Cell {
  id: string;
  notebook_id: string;

  cell_type: "code" | "markdown";

  source: string;

  position: number;

  outputs: any[];

  execution_count: number;

  metadata: Record<string, any>;

  created_at: string;

  updated_at: string;
}

export interface CellResponse {
  success: boolean;
  message: string;
  data: Cell;
}

export interface CellListResponse {
  success: boolean;
  message: string;
  data: Cell[];
}

export interface CreateCellRequest {
  cell_type: "code" | "markdown";
  source: string;
}

export interface UpdateCellRequest {
  source?: string;
  metadata?: Record<string, any>;
}

export interface ReorderCellsRequest {
  cell_ids: string[];
}