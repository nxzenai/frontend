export type ModelTier = "auto" | "fast" | "balanced" | "deep";
export type ReasoningLevel = "quick" | "standard" | "deep";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  generation_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  selected_tier: ModelTier;
  reasoning_level: ReasoningLevel;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessage[];
  active_attachment_ids?: string[];
  pending_prediction?: {
    tool: string; action?: string; attachment_ids?: string[];
    arguments?: Record<string, unknown>; original_action?: string;
    candidates?: Array<Record<string, unknown>>; missing_fields?: string[]; prompt?: string;
  } | null;
  pending_confirmation?: {
    id: string; tool: string; action?: string; attachment_ids?: string[];
    arguments?: Record<string, unknown>; message?: string;
  } | null;
  active_lab_resources?: Record<string, {
    tool?: string; run_id?: string; model_id?: string; model_filename?: string;
    status?: string; task?: string; target_column?: string; text_column?: string;
  }>;
}

export interface ChatRequest {
  conversation_id?: string | null;
  message: string;
  tier: ModelTier;
  reasoning: ReasoningLevel;
  regenerate?: boolean;
  tools?: string[];
  attachment_ids?: string[];
  project_id?: string | null;
  use_project_documents_only?: boolean;
  confirmed_tools?: string[];
  confirmation_id?: string;
  tool_arguments?: Record<string, Record<string, unknown>>;
}

export type StreamEvent =
  | { type: "metadata"; conversation_id: string; generation_id: string; requested_tier: ModelTier; model_tier: ModelTier; model_name: string; reasoning: ReasoningLevel; route_reason: string }
  | { type: "delta"; content: string }
  | { type: "tool"; tool: string; status: "running" | "completed" | "failed"; message?: string; citations?: Citation[] }
  | { type: "confirmation_required"; conversation_id?: string; confirmation_id: string; tool: string; action?: string; message: string; attachment_ids: string[]; arguments: Record<string, unknown> }
  | { type: "done"; status: "completed" | "cancelled"; message?: ChatMessage; duration_ms: number }
  | { type: "error"; code: string; message: string; details?: {
      candidates?: Array<Record<string, unknown>>;
      missing_fields?: string[];
      conversation_id?: string;
      prompt?: string;
      resume?: {
        tool: string; action?: string; attachment_ids: string[];
        arguments: Record<string, unknown>; query: string;
      };
    } };

export interface TierStatus {
  tier: Exclude<ModelTier, "auto">;
  configured: boolean;
  available: boolean;
  model_name: string;
  context_limit: number;
  max_output_tokens: number;
  message?: string | null;
}

export interface GenAIHealth {
  status: "healthy" | "degraded";
  tiers: TierStatus[];
  tools: string[];
}

export interface Citation {
  title: string;
  url: string;
  date?: string;
}

export interface ToolStatus {
  name: string;
  description: string;
  available: boolean;
  permissions: string[];
  schema: Record<string, unknown>;
  requires_confirmation: boolean;
  message?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  tech_stack: string[];
  goals: string[];
  instructions: string;
  created_at: string;
  updated_at: string;
}

export type ProjectInput = Omit<Project, "id" | "created_at" | "updated_at">;

export interface Attachment {
  id: string;
  conversation_id?: string | null;
  project_id?: string | null;
  filename: string;
  content_type: string;
  size_bytes: number;
  chunk_count: number;
  extraction: Record<string, unknown>;
  created_at: string;
}

export interface ProjectDocument extends Attachment {
  selected: boolean;
  status: string;
}

export interface PromptTemplate {
  id: string;
  project_id: string | null;
  name: string;
  system_prompt: string;
  user_prompt: string;
  default_model: string;
  variables: string[];
  version_number: number;
  created_at: string;
  updated_at: string;
}

export interface PromptVersion {
  id: string;
  version_number: number;
  created_at: string;
  system_prompt: string;
  user_prompt: string;
}

export interface PromptCitation {
  title: string;
  url: string;
  document_id: string;
  filename: string;
  chunk_index?: number;
  page_start?: number;
  page_end?: number;
  section?: string;
  paragraph?: number;
  sheet?: string;
  row_start?: number;
  row_end?: number;
}

export interface PromptRun {
  id: string;
  template_id: string;
  version_id: string;
  version_number?: number;
  model: string;
  output: string;
  status: string;
  latency_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  project_id?: string | null;
  resolved_system_prompt?: string;
  resolved_user_prompt?: string;
  variable_values?: Record<string, string>;
  knowledge_document_ids?: string[];
  generation_settings?: { temperature?: number; max_tokens?: number; reasoning?: ReasoningLevel; tier?: ModelTier };
  comparison_run_id?: string | null;
  citations?: PromptCitation[];
  created_at: string;
}

export interface PromptPracticeAttempt {
  id: string;
  project_id?: string | null;
  lesson_id: string;
  exercise_id: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  system_prompt: string;
  prompt_text: string;
  model: string;
  knowledge_document_ids: string[];
  output: string;
  status: string;
  citations: PromptCitation[];
  latency_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  evaluation_score: number | null;
  evaluation_breakdown: Record<string, number> | null;
  deterministic_checks: Array<{ label: string; passed: boolean; detail: string }>;
  ai_feedback?: string | null;
  created_at: string;
}

export interface Preferences {
  display_name?: string | null;
  response_style?: string | null;
  language?: string | null;
  custom_preferences?: Record<string, string>;
  updated_at?: string | null;
}

export interface Memory {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
}
