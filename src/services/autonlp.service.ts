import api from "@/lib/studioApi";
import type {
  AutoNLPBatchPredictionResponse, AutoNLPDatasetInspection, AutoNLPModelSummary,
  AutoNLPPredictResponse, AutoNLPTrainRequest, AutoNLPTrainResponse,
} from "@/types/autonlp";


class AutoNLPService {
  async inspect(file: File, textColumn?: string, targetColumn?: string): Promise<AutoNLPDatasetInspection> {
    const data = new FormData();
    data.append("file", file);
    if (textColumn) data.append("text_column", textColumn);
    if (targetColumn) data.append("target_column", targetColumn);
    return (await api.post<AutoNLPDatasetInspection>("/autonlp/inspect", data)).data;
  }

  async train(request: AutoNLPTrainRequest): Promise<AutoNLPTrainResponse> {
    const data = new FormData();
    data.append("file", request.file, request.file.name);
    data.append("text_column", request.text_column);
    data.append("target_column", request.target_column);
    data.append("task", request.task);
    data.append("max_epochs", String(request.max_epochs));
    data.append("strategy", request.strategy);
    data.append("confirmed", String(request.confirmed));
    data.append("label_display_mapping", JSON.stringify(request.label_display_mapping));
    if (request.candidate_architectures?.length) data.append("candidate_architectures", request.candidate_architectures.join(","));
    return (await api.post<AutoNLPTrainResponse>("/autonlp/train", data)).data;
  }

  async predict(modelId: string, text: string): Promise<AutoNLPPredictResponse> {
    return (await api.post<AutoNLPPredictResponse>("/autonlp/predict", { model_id: modelId, text })).data;
  }

  async predictBatch(modelId: string, file: File, textColumn: string): Promise<AutoNLPBatchPredictionResponse> {
    const data = new FormData();
    data.append("model_id", modelId);
    data.append("file", file);
    data.append("text_column", textColumn);
    return (await api.post<AutoNLPBatchPredictionResponse>("/autonlp/predict/csv", data)).data;
  }

  async listModels(): Promise<AutoNLPModelSummary[]> {
    return (await api.get<AutoNLPModelSummary[]>("/autonlp/models")).data;
  }

  async monitoring(): Promise<Record<string, unknown>> {
    return (await api.get<Record<string, unknown>>("/autonlp/monitoring")).data;
  }
}

export default new AutoNLPService();
