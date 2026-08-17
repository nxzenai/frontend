import type { AxiosRequestConfig } from "axios";
import api from "@/lib/studioApi";
import type { EDAChartResult, EDAList, EDAOverview, EDAPreview, EDAProfiles, EDAProject, EDAQuality, EDAReport, RelationshipRequest, TransformationPreview, TransformationRequest, VisualizationRequest } from "@/types/eda";

interface Envelope<T> { success: boolean; message: string; data: T; }
const unwrap = <T>(response: { data: Envelope<T> }): T => response.data.data;

class EDAService {
  list(page = 1, limit = 20, search = "", config?: AxiosRequestConfig) {
    return api.get<Envelope<EDAList>>("/eda", { ...config, params: { page, limit, search: search || undefined } }).then(unwrap);
  }
  upload(file: File) {
    const data = new FormData(); data.append("file", file);
    return api.post<Envelope<EDAProject>>("/eda/upload", data, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
  }
  get(id: string) { return api.get<Envelope<EDAProject>>(`/eda/${encodeURIComponent(id)}`).then(unwrap); }
  overview(id: string, config?: AxiosRequestConfig) { return api.get<Envelope<EDAOverview>>(`/eda/${encodeURIComponent(id)}/overview`, config).then(unwrap); }
  preview(id: string, page = 1, pageSize = 25, config?: AxiosRequestConfig) { return api.get<Envelope<EDAPreview>>(`/eda/${encodeURIComponent(id)}/preview`, { ...config, params: { page, page_size: pageSize } }).then(unwrap); }
  profile(id: string) { return api.get<Envelope<EDAProfiles>>(`/eda/${encodeURIComponent(id)}/profile`).then(unwrap); }
  quality(id: string) { return api.get<Envelope<EDAQuality>>(`/eda/${encodeURIComponent(id)}/quality`).then(unwrap); }
  visualize(id: string, request: VisualizationRequest) { return api.post<Envelope<EDAChartResult>>(`/eda/${encodeURIComponent(id)}/visualizations`, request).then(unwrap); }
  relationships(id: string, request: RelationshipRequest) { return api.post<Envelope<EDAChartResult>>(`/eda/${encodeURIComponent(id)}/relationships`, request).then(unwrap); }
  previewTransformation(id: string, request: TransformationRequest) { return api.post<Envelope<TransformationPreview>>(`/eda/${encodeURIComponent(id)}/transformations/preview`, request).then(unwrap); }
  applyTransformation(id: string, request: TransformationRequest) { return api.post<Envelope<EDAProject>>(`/eda/${encodeURIComponent(id)}/transformations/apply`, request).then(unwrap); }
  createReport(id: string) { return api.post<Envelope<EDAReport>>(`/eda/${encodeURIComponent(id)}/reports`, { format: "html", include_charts: true }).then(unwrap); }
  async downloadReport(id: string, reportId: string) { return api.get(`/eda/${encodeURIComponent(id)}/reports/${encodeURIComponent(reportId)}/download`, { responseType: "blob" }); }
  delete(id: string) { return api.delete(`/eda/${encodeURIComponent(id)}`); }
}
const edaService = new EDAService();
export default edaService;
