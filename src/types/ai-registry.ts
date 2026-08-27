export type AIModelStage = "draft" | "validated" | "production" | "archived";

export interface AIRegisteredModel {
  id: string;
  model_group_id: string;
  version: number;
  model_version_id: string;
  module: "autodl" | "autonlp";
  task: string;
  model_type: string;
  winning_job_id: string;
  artifact_hash: string;
  dataset_hash: string;
  lifecycle_stage: AIModelStage;
  artifact_available: boolean;
  created_at: string;
}

export interface AIMonitoringSummary {
  queue: { depth: number; failure_count: number; average_queue_latency_seconds: number };
  models: { total: number; by_stage: Record<AIModelStage, number> };
  predictions: { count: number; errors: number; average_latency_ms: number };
}
