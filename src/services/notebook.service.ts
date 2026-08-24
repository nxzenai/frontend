import api from "@/lib/studioApi";
import {
  NotebookResponse,
  CreateNotebookRequest,
  UpdateNotebookRequest,
  NotebookExample,
} from "@/types/notebook";

class NotebookService {
  async getAll() {
    const response =
      await api.get<NotebookResponse>("/notebooks");

    return response.data.data;
  }

  async get(id: string) {
    const response =
      await api.get(`/notebooks/${id}`);

    return response.data.data;
  }

  async create(payload: CreateNotebookRequest) {
    const response =
      await api.post("/notebooks", payload);

    return response.data.data;
  }

  async update(
    id: string,
    payload: UpdateNotebookRequest
  ) {
    const response =
      await api.patch(
        `/notebooks/${id}`,
        payload
      );

    return response.data.data;
  }

  async delete(id: string) {
    await api.delete(`/notebooks/${id}`);
  }

  async examples(): Promise<NotebookExample[]> {
    const response = await api.get<{ data: NotebookExample[] }>("/notebooks/examples");
    return response.data.data;
  }

  async createExample(slug: string) {
    const response = await api.post(`/notebooks/examples/${encodeURIComponent(slug)}`);
    return response.data.data;
  }

  async importIPYNB(file: File) {
    const form = new FormData();
    form.append("upload", file);
    const response = await api.post("/notebooks/import/ipynb", form);
    return response.data.data;
  }
}

export default new NotebookService();
