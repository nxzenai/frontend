import api from "@/lib/studioApi";

import type {
  Cell,
  CellListResponse,
  CellResponse,
  CreateCellRequest,
  UpdateCellRequest,
  ReorderCellsRequest,
  CellOutputValue,
  NotebookFile,
  RuntimeInfo,
} from "@/types/cell";

//////////////////////////////////////////////////////////
// Execution Response
//////////////////////////////////////////////////////////

export interface ExecuteCellResponse {
  notebook_id: string;
  cell_id: string;
  execution_count: number;
  outputs: CellOutputValue[];
  execution_duration_ms: number | null;
}

class CellService {
  ////////////////////////////////////////////////////////
  // List Cells
  ////////////////////////////////////////////////////////

  async list(
    notebookId: string,
  ): Promise<Cell[]> {
    const response =
      await api.get<CellListResponse>(
        `/notebooks/${notebookId}/cells`,
      );

    return response.data.data;
  }

  ////////////////////////////////////////////////////////
  // Create Cell
  ////////////////////////////////////////////////////////

  async create(
    notebookId: string,
    payload: CreateCellRequest,
  ): Promise<Cell> {
    const response =
      await api.post<CellResponse>(
        `/notebooks/${notebookId}/cells`,
        payload,
      );

    return response.data.data;
  }

  ////////////////////////////////////////////////////////
  // Update Cell
  ////////////////////////////////////////////////////////

  async update(
    notebookId: string,
    cellId: string,
    payload: UpdateCellRequest,
  ): Promise<Cell> {
    const response =
      await api.patch<CellResponse>(
        `/notebooks/${notebookId}/cells/${cellId}`,
        payload,
      );

    return response.data.data;
  }

  ////////////////////////////////////////////////////////
  // Delete Cell
  ////////////////////////////////////////////////////////

  async delete(
    notebookId: string,
    cellId: string,
  ): Promise<void> {
    await api.delete(
      `/notebooks/${notebookId}/cells/${cellId}`,
    );
  }

  ////////////////////////////////////////////////////////
  // Execute Cell
  ////////////////////////////////////////////////////////

  async execute(
    notebookId: string,
    cellId: string,
  ): Promise<ExecuteCellResponse> {
    const response =
      await api.post<ExecuteCellResponse>(
        `/notebooks/${notebookId}/cells/${cellId}/execute`,
      );

    return response.data;
  }

  async executeAll(notebookId: string): Promise<{ notebook_id: string; results: ExecuteCellResponse[] }> {
    const response = await api.post<{ notebook_id: string; results: ExecuteCellResponse[] }>(
      `/notebooks/${notebookId}/execute-all`,
    );
    return response.data;
  }

  async clearOutputs(notebookId: string, cellId: string): Promise<void> {
    await api.post(`/notebooks/${notebookId}/cells/${cellId}/clear`);
  }

  async clearAllOutputs(notebookId: string): Promise<void> {
    await api.post(`/notebooks/${notebookId}/outputs/clear`);
  }

  ////////////////////////////////////////////////////////
  // Restart Kernel
  ////////////////////////////////////////////////////////

  async restartKernel(
    notebookId: string,
  ): Promise<void> {
    await api.post(
      `/notebooks/${notebookId}/restart`,
    );
  }

  ////////////////////////////////////////////////////////
  // Interrupt Kernel
  ////////////////////////////////////////////////////////

  async interruptKernel(
    notebookId: string,
  ): Promise<void> {
    await api.post(
      `/notebooks/${notebookId}/interrupt`,
    );
  }

  ////////////////////////////////////////////////////////
  // Shutdown Kernel
  ////////////////////////////////////////////////////////

  async shutdownKernel(
    notebookId: string,
  ): Promise<void> {
    await api.post(
      `/notebooks/${notebookId}/shutdown`,
    );
  }

  ////////////////////////////////////////////////////////
  // Kernel Status
  ////////////////////////////////////////////////////////

  async kernelStatus(
    notebookId: string,
  ): Promise<{
    notebook_id: string;
    status: string;
  }> {
    const response =
      await api.get(
        `/notebooks/${notebookId}/kernel/status`,
      );

    return response.data;
  }

  async runtimeInfo(notebookId: string): Promise<RuntimeInfo> {
    const response = await api.get<RuntimeInfo>(`/notebooks/${notebookId}/runtime/info`);
    return response.data;
  }

  async listFiles(notebookId: string): Promise<NotebookFile[]> {
    const response = await api.get<{ data: NotebookFile[] }>(`/notebooks/${notebookId}/files`);
    return response.data.data;
  }

async uploadFile(
  notebookId: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<NotebookFile> {
  const form = new FormData();

  form.append("file", file);

  const response = await api.post<{ data: NotebookFile }>(
    `/notebooks/${notebookId}/files`,
    form,
    {
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(
            Math.round((event.loaded / event.total) * 100)
          );
        }
      },
    },
  );

  return response.data.data;
}

  async deleteFile(notebookId: string, fileId: string): Promise<void> {
    await api.delete(`/notebooks/${notebookId}/files/${fileId}`);
  }

  async downloadFile(notebookId: string, fileId: string): Promise<Blob> {
    const response = await api.get(`/notebooks/${notebookId}/files/${fileId}/download`, { responseType: "blob" });
    return response.data;
  }

  ////////////////////////////////////////////////////////
  // Reorder Cells
  ////////////////////////////////////////////////////////

  async reorder(
    notebookId: string,
    payload: ReorderCellsRequest,
  ): Promise<Cell[]> {
    const response =
      await api.post<CellListResponse>(
        `/notebooks/${notebookId}/cells/reorder`,
        payload,
      );

    return response.data.data;
  }
}

const cellService = new CellService();

export default cellService;
