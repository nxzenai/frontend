export interface ClassificationSelectionQuality {
  optimization_metric?: string; optimization_winner_model?: string | null; recommended_model?: string | null;
  recommendation_status: string; recommendation_reason: string;
  quality_warnings: Array<{ code: string; severity: string; blocks_recommendation?: boolean; message: string; [key: string]: unknown }>;
  winner_quality?: { recommendation_eligible?: boolean; metrics?: Record<string, number | null> };
  recommended_metrics?: Record<string, number | null> | null; recommended_optimization_score?: number | null;
  observed_positive_rate?: number | null; predicted_positive_rate?: number | null; evaluation_positive_support?: number | null;
}
export type ResearchStatus = "NOT_REQUESTED" | "READY" | "LOADING" | "AVAILABLE" | "FAILED";
export type EvidenceAgreement = "SUPPORTED" | "PARTIALLY_SUPPORTED" | "MIXED" | "CONTEXTUALLY_RELEVANT" | "NOT_FOUND" | "CONTRADICTORY";
export interface EvidenceItem {
  rank: number; feature: string; value: number; raw_value: number | number[];
  method: string; source: string; direction?: string | null; class_label?: string; opposing_class?: string | null;
}
export interface EvidenceSource { id: string; title: string; source: string; url: string; publication_date?: string | null; evidence_statement: string; source_screen: string; quality_rank?: number; quality_category?: string; quality_note?: string }
export interface EvidenceRecord {
  id: string; conversation_id: string; project_id?: string | null; native_module: string; native_reference: string;
  task?: string; target?: string; created_at: string; native_status: string; disclaimer: string; research_error?: string; research_failure_stage?: "SEARCH" | "NORMALIZATION" | "COMPARISON" | "PERSISTENCE"; research_error_code?: string; comparison_status?: "PENDING" | "AVAILABLE" | "FAILED"; research_status?: ResearchStatus; research_requested_at?: string; research_failed_at?: string;
  native_evidence: {
    label: string; method: string; ranked_items: EvidenceItem[]; metrics_used: Record<string, number>; limitations: string[];
    model_selection?: ClassificationSelectionQuality | null;
    positive_label?: string | number | boolean | null; best_model?: string; optimization_metric?: string; optimization_score?: number | null; prediction_supported?: boolean;
    original_features?: string[]; class_label_mapping?: Record<string, string>;
    labels?: Array<string | number>; confusion_matrix?: number[][]; class_metrics?: Array<Record<string, string | number>>;
    class_metrics_method?: string; misclassified_samples?: Array<Record<string, unknown>>; low_confidence_samples?: Array<Record<string, unknown>>;
    class_distribution?: Record<string, number>; confidence_distribution?: Array<{ name: string; value: number }>;
    training_history?: Record<string, number[]>; latest_prediction?: unknown; evaluation_visualization?: unknown;
    spatial_explanation?: { status: string; message?: string; image?: string; method?: string };
    cluster_patterns?: Array<{ cluster_id: string; cluster_name: string; profile_summary: string; cluster_size?: number | null; differentiators: Array<{ feature: string; direction: string; relative_strength?: number | null; display_meaning: string; native_statement: string; strength_method: string }> }>;
    cluster_profiles?: Record<string, { segment_label: string; profile: string; characteristics: string[] }>;
    cluster_centroids?: Record<string, Record<string, number>>;
    data_views?: Record<string, { distribution: Array<{ name: string; value: number }>; class_comparison: Array<{ name: string; value: number }>; class_comparison_method: string; sample_count: number; dataset_count: number }>;
    research_findings?: Array<{ id: string; feature: string; model_rank?: number; native_statement?: string }>;
  };
  research_evidence?: {
    comparison_status?: "PENDING" | "AVAILABLE" | "FAILED"; query: string; generated_at: string; evidence_status: string; recency: string; sources: EvidenceSource[];
    feature_theme_mappings: Array<{ finding_id: string; feature: string; model_rank?: number; agreement: EvidenceAgreement; evidence_statement: string; cluster_id?: string; business_interpretation?: string;
      source_matches?: Array<{ cluster_id: string; source_id: string; matched_differentiators: string[]; match_status: EvidenceAgreement; rationale: string; citation: { source_id: string; title: string; url: string; date?: string | null; quote: string } }>;
      citations: Array<{ source_id: string; title: string; url: string; date?: string | null; quote: string }> }>;
  } | null;
}
