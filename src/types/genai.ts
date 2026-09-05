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
  pending_prediction?: {
    tool: string; action?: string; attachment_ids?: string[];
    arguments?: Record<string, unknown>; original_action?: string;
    candidates?: Array<Record<string, unknown>>; missing_fields?: string[]; prompt?: string;
  } | null;
  pending_confirmation?: {
    id: string; tool: string; action?: string; attachment_ids?: string[];
    arguments?: Record<string, unknown>;
  } | null;
  active_lab_resources?: Record<string, { run_id?: string; status?: string; task?: string }>;
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
