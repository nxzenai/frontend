import api from "@/lib/studioApi";
import type { AIMonitoringSummary, AIModelStage, AIRegisteredModel } from "@/types/ai-registry";

class AIRegistryService {
  async list(module: "autodl" | "autonlp", includeArchived = true) {
    if (module === "autodl") {
      try {
        return (await api.get<AIRegisteredModel[]>("/autodl/models", {
          params: { include_archived: includeArchived },
        })).data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status !== 409) throw error;
      }
    }
    return (await api.get<AIRegisteredModel[]>("/ai-models", {
      params: { module, include_archived: includeArchived },
    })).data;
  }

  async versions(modelId: string) {
    return (await api.get<AIRegisteredModel[]>(`/ai-models/${modelId}/versions`)).data;
  }

  async changeStage(module: "autodl" | "autonlp", modelId: string, stage: AIModelStage) {
    if (module === "autodl") {
      try {
        return (await api.patch<AIRegisteredModel>(`/autodl/models/${modelId}/stage`, { stage })).data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status !== 409) throw error;
      }
    }
    return (await api.patch<AIRegisteredModel>(`/ai-models/${modelId}/stage`, { stage })).data;
  }

  async retrain(module: "autodl" | "autonlp", modelId: string, file: File) {
    const data = new FormData();
    data.append("file", file);
    if (module === "autodl") {
      try {
        return (await api.post(`/autodl/models/${modelId}/retrain`, data)).data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status !== 409) throw error;
      }
    }
    return (await api.post(`/ai-models/${modelId}/retrain`, data)).data;
  }

  async monitoring(module: "autodl" | "autonlp") {
    if (module === "autodl") {
      try {
        return (await api.get<AIMonitoringSummary>("/autodl/models/monitoring")).data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status !== 409) throw error;
      }
    }
    return (await api.get<AIMonitoringSummary>("/ai-models/monitoring/summary")).data;
  }
}

export default new AIRegistryService();
