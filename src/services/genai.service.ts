import api from "@/lib/studioApi";

import type {
  Attachment,
  ChatRequest,
  ConversationDetail,
  ConversationSummary,
  GenAIHealth,
  Memory,
  Preferences,
  Project,
  ProjectInput,
  ProjectDocument,
  PromptTemplate,
  PromptVersion,
  PromptRun,
  PromptPracticeAttempt,
  StreamEvent,
  ToolStatus,
} from "@/types/genai";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

class GenAIService {
  async projectDocuments(projectId: string): Promise<ProjectDocument[]> {
    return (await api.get<ProjectDocument[]>(`/genai/projects/${projectId}/documents`)).data;
  }

  async uploadProjectDocument(projectId: string, file: File): Promise<ProjectDocument> {
    const body = new FormData(); body.append("file", file);
    return (await api.post<ProjectDocument>(`/genai/projects/${projectId}/documents`, body)).data;
  }

  async selectProjectDocuments(projectId: string, ids: string[]): Promise<void> {
    await api.put(`/genai/projects/${projectId}/documents/selection`, { document_ids: ids });
  }

  async removeProjectDocument(projectId: string, documentId: string): Promise<void> {
    await api.delete(`/genai/projects/${projectId}/documents/${documentId}`);
  }

  async promptTemplates(projectId: string | null): Promise<PromptTemplate[]> {
    return (await api.get<PromptTemplate[]>("/genai/prompt-lab/templates", { params: { project_id: projectId ?? undefined } })).data;
  }

  async createPromptTemplate(value: Pick<PromptTemplate, "name" | "system_prompt" | "user_prompt" | "default_model" | "project_id">): Promise<PromptTemplate> {
    return (await api.post<PromptTemplate>("/genai/prompt-lab/templates", value)).data;
  }

  async updatePromptTemplate(id: string, value: Pick<PromptTemplate, "name" | "system_prompt" | "user_prompt" | "default_model" | "project_id">): Promise<PromptTemplate> {
    return (await api.patch<PromptTemplate>(`/genai/prompt-lab/templates/${id}`, value)).data;
  }

  async duplicatePromptTemplate(id: string): Promise<PromptTemplate> {
    return (await api.post<PromptTemplate>(`/genai/prompt-lab/templates/${id}/duplicate`)).data;
  }

  async deletePromptTemplate(id: string): Promise<void> {
    await api.delete(`/genai/prompt-lab/templates/${id}`);
  }

  async promptVersions(id: string): Promise<PromptVersion[]> {
    return (await api.get<PromptVersion[]>(`/genai/prompt-lab/templates/${id}/versions`)).data;
  }

  async restorePromptVersion(id: string, versionId: string): Promise<PromptTemplate> {
    return (await api.post<PromptTemplate>(`/genai/prompt-lab/templates/${id}/versions/${versionId}/restore`)).data;
  }

  async promptRuns(id: string): Promise<PromptRun[]> {
    return (await api.get<PromptRun[]>("/genai/prompt-lab/runs", { params: { template_id: id } })).data;
  }

  async runPrompt(templateId: string, variableValues: Record<string, string>, models: string[], useKnowledgeBase: boolean,
                  options: { document_ids: string[]; temperature: number | null; max_tokens: number | null; reasoning: "quick" | "standard" | "deep" }): Promise<PromptRun[]> {
    return (await api.post<PromptRun[]>("/genai/prompt-lab/runs", {
      template_id: templateId, variable_values: variableValues, models, use_knowledge_base: useKnowledgeBase, ...options,
    })).data;
  }
  async practiceAttempts(): Promise<PromptPracticeAttempt[]> {
    return (await api.get<PromptPracticeAttempt[]>("/genai/prompt-lab/practice/attempts")).data;
  }
  async runPractice(value: { lesson_id: string; exercise_id: string; difficulty: string; system_prompt: string; prompt_text: string; model: string; project_id: string | null; document_ids: string[] }): Promise<PromptPracticeAttempt> {
    return (await api.post<PromptPracticeAttempt>("/genai/prompt-lab/practice/attempts", value)).data;
  }
  async evaluatePractice(id: string, value: { evaluation_score: number; evaluation_breakdown: Record<string, number>; deterministic_checks: Array<{ label: string; passed: boolean; detail: string }> }): Promise<PromptPracticeAttempt> {
    return (await api.patch<PromptPracticeAttempt>(`/genai/prompt-lab/practice/attempts/${id}/evaluation`, value)).data;
  }
  async createConversation(
    projectId?: string | null
  ): Promise<ConversationSummary> {
    return (
      await api.post<ConversationSummary>("/genai/conversations", {
        project_id: projectId ?? null,
      })
    ).data;
  }

  async listConversations(): Promise<ConversationSummary[]> {
    return (
      await api.get<ConversationSummary[]>("/genai/conversations")
    ).data;
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    return (
      await api.get<ConversationDetail>(
        `/genai/conversations/${id}`
      )
    ).data;
  }

  async renameConversation(
    id: string,
    title: string
  ): Promise<ConversationSummary> {
    return (
      await api.patch<ConversationSummary>(
        `/genai/conversations/${id}`,
        { title }
      )
    ).data;
  }

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/genai/conversations/${id}`);
  }

  async setConversationProject(
    id: string,
    projectId: string | null
  ): Promise<ConversationSummary> {
    return (
      await api.patch<ConversationSummary>(
        `/genai/conversations/${id}/project`,
        {
          project_id: projectId,
        }
      )
    ).data;
  }

  async setActiveAttachments(
    conversationId: string,
    attachmentIds: string[]
  ): Promise<string[]> {
    return (
      await api.put<{ attachment_ids: string[] }>(
        `/genai/conversations/${conversationId}/active-attachments`,
        { attachment_ids: attachmentIds }
      )
    ).data.attachment_ids;
  }

  async streamChat(
    request: ChatRequest,
    onEvent: (event: StreamEvent) => void,
    signal: AbortSignal
  ): Promise<void> {
    const baseUrl = String(
      api.defaults.baseURL ?? ""
    ).replace(/\/$/, "");

    const response = await fetch(
      `${baseUrl}/genai/chat/stream`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(request),
        signal,
      }
    );

    if (!response.ok || !response.body) {
      let message =
        "The assistant could not start a response.";

      try {
        const errorBody = await response.json();

        message =
          errorBody?.detail?.message ??
          errorBody?.detail ??
          errorBody?.message ??
          message;
      } catch {
        // Keep safe fallback message.
      }

      throw new Error(
        typeof message === "string"
          ? message
          : "The assistant could not start a response."
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        buffer += decoder.decode(value, {
          stream: !done,
        });
      }

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const dataLine = frame
          .split("\n")
          .find((line) =>
            line.startsWith("data:")
          );

        const data = dataLine
          ?.slice(5)
          .trim();

        if (!data) continue;

        try {
          onEvent(
            JSON.parse(data) as StreamEvent
          );
        } catch {
          console.warn(
            "Invalid GenAI stream event:",
            data
          );
        }
      }

      if (done) {
        break;
      }
    }
  }

  async cancelGeneration(
    id: string
  ): Promise<void> {
    await api.post(
      `/genai/generations/${id}/cancel`
    );
  }

  async health(): Promise<GenAIHealth> {
    return (
      await api.get<GenAIHealth>(
        "/genai/health"
      )
    ).data;
  }

  async preferences(): Promise<Preferences> {
    return (
      await api.get<Preferences>(
        "/genai/preferences"
      )
    ).data;
  }

  async savePreferences(
    values: Preferences
  ): Promise<Preferences> {
    return (
      await api.patch<Preferences>(
        "/genai/preferences",
        values
      )
    ).data;
  }

  async memories(): Promise<Memory[]> {
    return (
      await api.get<Memory[]>(
        "/genai/memories"
      )
    ).data;
  }

  async createMemory(
    content: string
  ): Promise<Memory> {
    return (
      await api.post<Memory>(
        "/genai/memories",
        {
          content,
          tags: [],
        }
      )
    ).data;
  }

  async deleteMemory(
    id: string
  ): Promise<void> {
    await api.delete(
      `/genai/memories/${id}`
    );
  }

  async projects(): Promise<Project[]> {
    return (
      await api.get<Project[]>(
        "/genai/projects"
      )
    ).data;
  }

  async createProject(
    values: ProjectInput
  ): Promise<Project> {
    return (
      await api.post<Project>(
        "/genai/projects",
        values
      )
    ).data;
  }

  async updateProject(
    id: string,
    values: Partial<ProjectInput>
  ): Promise<Project> {
    return (
      await api.patch<Project>(
        `/genai/projects/${id}`,
        values
      )
    ).data;
  }

  async deleteProject(
    id: string
  ): Promise<void> {
    await api.delete(
      `/genai/projects/${id}`
    );
  }

  async tools(): Promise<ToolStatus[]> {
    return (
      await api.get<ToolStatus[]>(
        "/genai/tools"
      )
    ).data;
  }

  async uploadAttachment(
    file: File,
    conversationId?: string | null,
    projectId?: string | null
  ): Promise<Attachment> {
    const body = new FormData();

    body.append("file", file);

    if (conversationId) {
      body.append(
        "conversation_id",
        conversationId
      );
    }

    if (projectId) {
      body.append(
        "project_id",
        projectId
      );
    }

    return (
      await api.post<Attachment>(
        "/genai/attachments",
        body
      )
    ).data;
  }

  async attachments(
    conversationId?: string | null,
    projectId?: string | null
  ): Promise<Attachment[]> {
    return (
      await api.get<Attachment[]>(
        "/genai/attachments",
        {
          params: {
            conversation_id:
              conversationId ?? undefined,

            project_id:
              conversationId
                ? undefined
                : projectId ?? undefined,
          },
        }
      )
    ).data;
  }

  async deleteAttachment(
    id: string
  ): Promise<void> {
    await api.delete(
      `/genai/attachments/${id}`
    );
  }

  async downloadPredictionExport(id: string, filename: string): Promise<void> {
    const response = await api.get<Blob>(`/genai/prediction-exports/${encodeURIComponent(id)}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export default new GenAIService();
