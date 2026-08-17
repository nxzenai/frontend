export type SemanticType = "numeric" | "categorical" | "boolean" | "datetime" | "text" | "unknown";

export interface EDAProject {
  id: string;
  original_filename: string;
  extension: string;
  size: number;
  rows: number;
  columns: number;
  missing_values: number;
  duplicate_rows: number;
  analysis_status: string;
  source_eda_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EDAList { items: EDAProject[]; total: number; page: number; limit: number; pages: number; }
export interface EDAColumn { name: string; dtype: string; semantic_type: SemanticType; }
export interface EDAOverview {
  project: EDAProject;
  file_size: number;
  memory_usage: string;
  duplicate_rows: number;
  missing_values: number;
  missing_percentage: number;
  column_names: string[];
  columns: EDAColumn[];
  semantic_counts: Record<string, number>;
}
export interface EDAPreview { columns: string[]; rows: Record<string, unknown>[]; total_rows: number; page: number; page_size: number; pages: number; }
export interface EDAProfile extends Record<string, unknown> { name: string; dtype: string; semantic_type: SemanticType; total_rows: number; non_null_count: number; null_count: number; missing_percentage: number; unique_count: number; unique_percentage: number; }
export interface EDAProfiles { profiles: EDAProfile[]; analysis_version: string; }
export interface EDAQuality { summary: Record<string, number>; findings: Record<string, unknown>; rules: Record<string, string>; analysis_version: string; }
export interface ChartDatum { label?: string; value?: number; count?: number; from?: number; to?: number; x?: number; y?: number; [key: string]: unknown; }
export interface EDAChartResult { kind: string; title?: string; data?: ChartDatum[]; columns?: string[]; rows?: string[]; matrix?: Array<Array<number | null>>; sampled?: boolean; sampled_rows?: number; total_rows?: number; method?: string; }

export type VisualizationKind = "histogram" | "box_plot" | "frequency" | "missing" | "datetime";
export interface VisualizationRequest { kind: VisualizationKind; column?: string; bins?: number; limit?: number; sort?: "count_desc" | "count_asc" | "value_asc" | "value_desc"; granularity?: "auto" | "day" | "week" | "month" | "quarter" | "year"; }
export interface RelationshipRequest { kind: "correlation" | "scatter" | "grouped_distribution" | "crosstab" | "grouped_aggregation" | "datetime_trend"; method?: "pearson" | "spearman"; x?: string; y?: string; category?: string; numeric?: string; datetime_column?: string; aggregation?: "mean" | "median" | "sum" | "count" | "min" | "max"; granularity?: "day" | "week" | "month" | "quarter" | "year"; limit?: number; }
export interface FilterCondition { column: string; operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "starts_with" | "ends_with" | "is_null" | "not_null" | "in"; value?: unknown; }
export interface TransformationOperation { operation: "drop_columns" | "rename_columns" | "remove_duplicates" | "drop_missing_rows" | "fill_numeric_mean" | "fill_numeric_median" | "fill_value" | "fill_categorical_mode" | "cast" | "filter" | "sort" | "remove_outliers"; columns?: string[]; mapping?: Record<string, string>; value?: unknown; dtypes?: Record<string, "string" | "integer" | "float" | "boolean" | "datetime">; conditions?: FilterCondition[]; mode?: "all" | "any"; ascending?: boolean; }
export interface TransformationRequest { operations: TransformationOperation[]; }
export interface TransformationPreview { rows_before: number; rows_after: number; columns_before: number; columns_after: number; columns: string[]; preview: Record<string, unknown>[]; warnings: string[]; }
export interface EDAReport { id: string; format: "html"; created_at: string; download_url: string; }
