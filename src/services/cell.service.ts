import api from "@/lib/studioApi";

import type {
  Cell,
  CellListResponse,
  CellResponse,
  CreateCellRequest,
  UpdateCellRequest,
  ReorderCellsRequest,
} from "@/types/cell";

//////////////////////////////////////////////////////////
// Execution Response
//////////////////////////////////////////////////////////

export interface ExecuteCellResponse {
  notebook_id: string;
  cell_id: string;
  execution_count: number;
  outputs: any[];
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

    console.log("========== CELLS ==========");
    console.log(response.data.data);

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

    console.log("========== EXECUTE ==========");
    console.log(response.data);

    return response.data;
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

export default new CellService();
