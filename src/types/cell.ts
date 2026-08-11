export type CellType = "code" | "markdown";

export interface Cell {
  id: string;
  cell_type: CellType;
  source: string;
  outputs: any[];
  execution_count: number | null;
  metadata: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCellRequest {
  cell_type: CellType;
  source: string;
}

export interface UpdateCellRequest {
  source?: string;
  metadata?: Record<string, any>;
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

export interface CellPosition {
  cell_id: string;
  position: number;
}

export interface ReorderCellsRequest {
  cells: CellPosition[];
}