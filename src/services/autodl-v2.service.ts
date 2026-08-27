import api from "@/lib/studioApi";
import {
  V2AdvancedDetails,
  V2Capability,
  V2Inspection,
  V2ModelSummary,
  V2Monitoring,
  V2Prediction,
  V2PredictionHistory,
  V2Readiness,
  V2Result,
  V2TrainingStatus,
} from "@/types/autodl-v2";

const AUTODL_API = "/autodl";

class AutoDLV2Service {
  async capabilities(): Promise<V2Capability[]> {
    return (await api.get(`${AUTODL_API}/capabilities`)).data.capabilities;
  }

  async inspect(
    file: File,
    options: { datasetKind: string; target?: string; timestamp?: string; sequentialConfirmed: boolean },
  ): Promise<V2Inspection> {
    const data = new FormData();
    data.append("file", file);
    data.append("dataset_kind", options.datasetKind);
    if (options.target) data.append("target_column", options.target);
    if (options.timestamp) data.append("timestamp_column", options.timestamp);
    data.append("sequential_signal_confirmed", String(options.sequentialConfirmed));
    return (await api.post<V2Inspection>(`${AUTODL_API}/inspect`, data)).data;
  }

  async train(
    runId: string,
    file: File,
    options: {
      strategy: "auto" | "custom";
      models: string[];
      epochs: number;
      confirmedTask: string;
      confirmedTarget?: string;
      confirmedTimestamp?: string;
      rowsAreOrdered: boolean;
      timestampHandling: "strict" | "clean" | "row_order";
      usePretrainedWeights: boolean;
      horizontalFlipSafe: boolean;
    },
  ): Promise<void> {
    const data = new FormData();
    data.append("file", file);
    data.append("strategy", options.strategy);
    data.append("models", options.models.join(","));
    data.append("max_epochs", String(options.epochs));
    data.append("confirmed_task", options.confirmedTask);
    if (options.confirmedTarget) data.append("confirmed_target", options.confirmedTarget);
    if (options.confirmedTimestamp) data.append("confirmed_timestamp", options.confirmedTimestamp);
    data.append("rows_are_ordered", String(options.rowsAreOrdered));
    data.append("timestamp_handling", options.timestampHandling);
    data.append("use_pretrained_weights", String(options.usePretrainedWeights));
    data.append("horizontal_flip_safe", String(options.horizontalFlipSafe));
    await api.post(`${AUTODL_API}/runs/${runId}/train`, data);
  }

  async status(runId: string): Promise<V2TrainingStatus> {
    return (await api.get<V2TrainingStatus>(`${AUTODL_API}/runs/${runId}/training`)).data;
  }

  async result(runId: string): Promise<V2Result> {
    return (await api.get<V2Result>(`${AUTODL_API}/runs/${runId}/result`)).data;
  }

  async advanced(runId: string): Promise<V2AdvancedDetails> {
    return (await api.get<V2AdvancedDetails>(`${AUTODL_API}/runs/${runId}/advanced`)).data;
  }

  async predict(
    runId: string,
    options: { file?: File | null; manual?: string; explain?: boolean; groundTruth?: string },
  ): Promise<V2Prediction> {
    const data = new FormData();
    if (options.file) data.append("file", options.file);
    if (options.manual?.trim()) data.append("manual_json", options.manual.trim());
    if (options.groundTruth?.trim()) data.append("ground_truth_json", options.groundTruth.trim());
    data.append("include_explanation", String(Boolean(options.explain)));
    return (await api.post<V2Prediction>(`${AUTODL_API}/runs/${runId}/predict`, data)).data;
  }

  async history(runId?: string): Promise<V2PredictionHistory[]> {
    return (await api.get(`${AUTODL_API}/predictions`, { params: { run_id: runId, limit: 25 } })).data.predictions;
  }

  async deleteHistory(predictionId: string): Promise<void> {
    await api.delete(`${AUTODL_API}/predictions/${predictionId}`);
  }

  async downloadExport(predictionId: string): Promise<void> {
    const response = await api.get(`${AUTODL_API}/predictions/${predictionId}/export`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `autodl-prediction-${predictionId}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async models(runId: string): Promise<V2ModelSummary[]> {
    return (await api.get(`${AUTODL_API}/runs/${runId}/models`)).data.models;
  }

  async changeStage(modelId: string, stage: V2ModelSummary["stage"]): Promise<void> {
    await api.patch(`${AUTODL_API}/models/${modelId}/stage`, { stage });
  }

  async monitoring(runId?: string): Promise<V2Monitoring> {
    return (await api.get(`${AUTODL_API}/monitoring`, { params: { run_id: runId } })).data;
  }

  async readiness(): Promise<V2Readiness> {
    return (await api.get<V2Readiness>(`${AUTODL_API}/readiness`)).data;
  }
}

export default new AutoDLV2Service();
