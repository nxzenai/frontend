export type CellType = "code" | "markdown";

export interface RichOutputContent {
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  text?: string;
  name?: string;
  ename?: string;
  evalue?: string;
  traceback?: string[];
  execution_count?: number | null;
}

export interface CellOutputValue {
  output_type: "stream" | "error" | "display_data" | "execute_result" | string;
  content: string | RichOutputContent;
  metadata?: Record<string, unknown>;
}

export interface Cell {
  id: string;
  cell_type: CellType;
  source: string;
  outputs: CellOutputValue[];
  execution_count: number | null;
  metadata: Record<string, unknown>;
  position: number;
  created_at: string;
  updated_at: string;
  execution_state: "idle" | "running" | "succeeded" | "failed";
  execution_duration_ms: number | null;
}

export interface CreateCellRequest {
  cell_type: CellType;
  source: string;
  position?: number;
}

export interface UpdateCellRequest {
  source?: string;
  metadata?: Record<string, unknown>;
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

export interface NotebookFile {
  id: string;
  original_filename: string;
  runtime_path: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface RuntimePackage {
  name: string;
  installed: boolean;
  version: string | null;
  error: string | null;
}

export interface RuntimeInfo {
  notebook_id: string;
  status: string;
  python_version: string;
  packages: RuntimePackage[];
  cpu_available: boolean;
  gpu_available: boolean;
  gpu_details: string | null;
  execution_boundary: string;
}
