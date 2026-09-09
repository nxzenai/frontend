import api from "@/lib/studioApi";
import type {
  AgenticPlan,
  AgenticProject,
  AgenticProjectInput,
} from "@/types/agentic";

class AgenticService {
  async projects(): Promise<AgenticProject[]> {
    return (await api.get<AgenticProject[]>("/agentic/projects")).data;
  }

  async project(id: string): Promise<AgenticProject> {
    return (await api.get<AgenticProject>(`/agentic/projects/${id}`)).data;
  }

  async createProject(input: AgenticProjectInput): Promise<AgenticProject> {
    return (await api.post<AgenticProject>("/agentic/projects", input)).data;
  }

  async generatePlan(projectId: string): Promise<AgenticPlan> {
    return (await api.post<AgenticPlan>(`/agentic/projects/${projectId}/plan`)).data;
  }

  async plans(projectId: string): Promise<AgenticPlan[]> {
    return (await api.get<AgenticPlan[]>(`/agentic/projects/${projectId}/plans`)).data;
  }

  async revisePlan(projectId: string, instruction: string): Promise<AgenticPlan> {
    return (
      await api.post<AgenticPlan>(`/agentic/projects/${projectId}/plan/revise`, {
        instruction,
      })
    ).data;
  }

  async approvePlan(projectId: string): Promise<AgenticPlan> {
    return (
      await api.post<AgenticPlan>(`/agentic/projects/${projectId}/plan/approve`)
    ).data;
  }

  async uploadSupportingFile(file: File): Promise<{ id: string; filename: string }> {
    const body = new FormData();
    body.append("file", file);
    return (
      await api.post<{ id: string; filename: string }>("/genai/attachments", body)
    ).data;
  }
}

const agenticService = new AgenticService();

export default agenticService;
