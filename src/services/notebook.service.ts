import api from "@/lib/studioApi";
import {
  NotebookResponse,
  CreateNotebookRequest,
  UpdateNotebookRequest,
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
}

export default new NotebookService();
