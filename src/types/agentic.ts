export type AgenticProjectStatus =
  | "draft"
  | "planning"
  | "plan_ready"
  | "approved"
  | "planning_failed";

export type AgenticPlanStatus = "generated" | "approved" | "superseded";

export interface AgenticProject {
  id: string;
  name: string;
  problem_statement: string;
  status: AgenticProjectStatus;
  attachment_ids: string[];
  current_plan_id: string | null;
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
