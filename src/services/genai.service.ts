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
}

export default new GenAIService();
