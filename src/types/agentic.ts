export type AgenticProjectStatus =
  | "draft"
  | "planning"
  | "plan_ready"
  | "approved"
  | "planning_failed"
  | "generating"
  | "generated"
  | "generation_failed";

export type AgenticPlanStatus = "generated" | "approved" | "superseded";

export interface AgenticProject {
  id: string;
  name: string;
  problem_statement: string;
  status: AgenticProjectStatus;
  attachment_ids: string[];
  current_plan_id: string | null;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchitecturePlanData {
  application: {
    name: string;
    summary: string;
    objective: string;
    primary_users: string[];
  };
  agents: Array<{
    name: string;
    role: string;
    goal: string;
    responsibilities: string[];
  }>;
  tools: Array<{ name: string; purpose: string; type: string }>;
  workflow: Array<{ step: number; actor: string; action: string; output: string }>;
  frontend: { type: string; pages: string[]; components: string[] };
  backend: {
    framework: string;
    services: string[];
    api_endpoints: Array<{ method: string; path: string; purpose: string }>;
  };
  data: { inputs: string[]; storage: string[]; outputs: string[] };
  integrations: Array<{ name: string; purpose: string; required: boolean }>;
  security_considerations: string[];
  assumptions: string[];
}

export interface AgenticPlan {
  id: string;
  project_id: string;
  revision: number;
  status: AgenticPlanStatus;
  planner_schema_version: string;
  plan: ArchitecturePlanData;
  created_at: string;
  approved_at: string | null;
}

export interface AgenticProjectInput {
  name: string;
  problem_statement: string;
  attachment_ids: string[];
}

export type AgenticVersionStatus = "generating" | "ready" | "failed";

export interface GeneratedAgentContract {
  name: string;
  role: string;
  goal: string;
  instructions: string[];
  tools: string[];
  input_schema: Record<string, string>;
  output_schema: Record<string, string>;
}

export interface GeneratedToolContract {
  name: string;
  type: string;
  description: string;
  configuration_required: string[];
}

export interface GenerationManifest {
  frontend_framework: "Next.js";
  backend_framework: "FastAPI";
  agent_language: "Python";
  entrypoints: Record<string, string>;
  environment_variables: string[];
  run_instructions: string[];
  test_instructions: string[];
  agents: GeneratedAgentContract[];
  tools: GeneratedToolContract[];
  assumptions: string[];
}

export interface AgenticVersion {
  id: string;
  project_id: string;
  plan_id: string;
  version_number: number;
  parent_version_id: string | null;
  status: AgenticVersionStatus;
  manifest: GenerationManifest | null;
  created_at: string;
  completed_at: string | null;
  error: string | null;
}

export interface SourceTreeNode {
  name: string;
  type: "directory" | "file";
  path: string | null;
  children: SourceTreeNode[] | null;
}

export interface GeneratedFile {
  id: string;
  project_id: string;
  version_id: string;
  path: string;
  normalized_path: string;
  language: string | null;
  purpose: string;
  size_bytes: number;
  sha256: string;
  content: string;
  created_at: string;
}
