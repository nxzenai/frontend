import api from "@/lib/studioApi";
import type {
  AgenticPlan,
  AgenticProject,
  AgenticProjectInput,
  AgenticVersion,
  GeneratedFile,
  SourceTreeNode,
  AgenticBuild,
  AgenticBuildEvent,
  AgenticPreview,
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

  async generateApplication(projectId: string): Promise<AgenticVersion> {
    return (
      await api.post<AgenticVersion>(`/agentic/projects/${projectId}/generate`)
    ).data;
  }

  async versions(projectId: string): Promise<AgenticVersion[]> {
    return (
      await api.get<AgenticVersion[]>(`/agentic/projects/${projectId}/versions`)
    ).data;
  }

  async sourceTree(projectId: string, versionId: string): Promise<SourceTreeNode[]> {
    return (
      await api.get<SourceTreeNode[]>(
        `/agentic/projects/${projectId}/versions/${versionId}/tree`,
      )
    ).data;
  }

  async sourceFile(projectId: string, versionId: string, path: string): Promise<GeneratedFile> {
    return (
      await api.get<GeneratedFile>(
        `/agentic/projects/${projectId}/versions/${versionId}/file`,
        { params: { path } },
      )
    ).data;
  }

  async downloadSource(projectId: string, version: AgenticVersion): Promise<void> {
    const response = await api.get<Blob>(
      `/agentic/projects/${projectId}/versions/${version.id}/download`,
      { responseType: "blob" },
    );
    const disposition = String(response.headers["content-disposition"] ?? "");
    const matched = disposition.match(/filename="([^"]+)"/);
    const filename = matched?.[1] ?? `agentic-application-v${version.version_number}.zip`;
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async createBuild(projectId: string, versionId: string): Promise<AgenticBuild> {
    return (
      await api.post<AgenticBuild>(
        `/agentic/projects/${projectId}/versions/${versionId}/builds`,
      )
    ).data;
  }

  async builds(projectId: string): Promise<AgenticBuild[]> {
    return (await api.get<AgenticBuild[]>(`/agentic/projects/${projectId}/builds`)).data;
  }

  async build(projectId: string, buildId: string): Promise<AgenticBuild> {
    return (
      await api.get<AgenticBuild>(`/agentic/projects/${projectId}/builds/${buildId}`)
    ).data;
  }

  async buildEvents(projectId: string, buildId: string): Promise<AgenticBuildEvent[]> {
    return (
      await api.get<AgenticBuildEvent[]>(
        `/agentic/projects/${projectId}/builds/${buildId}/events`,
      )
    ).data;
  }

  async cancelBuild(projectId: string, buildId: string): Promise<AgenticBuild> {
    return (
      await api.post<AgenticBuild>(
        `/agentic/projects/${projectId}/builds/${buildId}/cancel`,
      )
    ).data;
  }

  async startPreview(projectId: string, versionId: string): Promise<AgenticPreview> {
    return (
      await api.post<AgenticPreview>(
        `/agentic/projects/${projectId}/versions/${versionId}/preview`,
      )
    ).data;
  }

  async previews(projectId: string): Promise<AgenticPreview[]> {
    return (
      await api.get<AgenticPreview[]>(`/agentic/projects/${projectId}/previews`)
    ).data;
  }

  async preview(projectId: string, previewId: string): Promise<AgenticPreview> {
    return (
      await api.get<AgenticPreview>(
        `/agentic/projects/${projectId}/previews/${previewId}`,
      )
    ).data;
  }

  async stopPreview(projectId: string, previewId: string): Promise<AgenticPreview> {
    return (
      await api.post<AgenticPreview>(
        `/agentic/projects/${projectId}/previews/${previewId}/stop`,
      )
    ).data;
  }

  async restartPreview(projectId: string, previewId: string): Promise<AgenticPreview> {
    return (
      await api.post<AgenticPreview>(
        `/agentic/projects/${projectId}/previews/${previewId}/restart`,
      )
    ).data;
  }
}

const agenticService = new AgenticService();

export default agenticService;
