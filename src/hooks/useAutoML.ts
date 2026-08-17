"use client";

import { useState } from "react";

import * as AutoMLService from "@/services/automl.service";

import type {
  AutoMLResult,
  AutoMLTask,
  AutoMLOptimizationMetric,
  BestModel,
  DatasetInspectResponse,
  DatasetPreviewResponse,
  LeaderboardEntry,
} from "@/types/automl";

/* ============================================================
   HOOK
============================================================ */

export default function useAutoML() {
  const [loading, setLoading] =
    useState(false);

  const [inspecting, setInspecting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [datasetInfo, setDatasetInfo] =
    useState<DatasetInspectResponse | null>(
      null
    );

  const [datasetPreview, setDatasetPreview] =
    useState<Record<string, any>[]>([]);

  const [datasetColumns, setDatasetColumns] =
    useState<string[]>([]);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [bestModel, setBestModel] =
    useState<BestModel | null>(null);

  const [statistics, setStatistics] =
    useState<any>(null);

  const [recommendations, setRecommendations] =
    useState<string[]>([]);

  const [result, setResult] =
    useState<AutoMLResult | null>(null);

  /* ============================================================
     ERROR MESSAGE
  ============================================================ */

  function getErrorMessage(
    err: any
  ): string {
    const responseData =
      err?.response?.data;

    const detail =
      responseData?.detail;

    if (
      typeof detail ===
      "string"
    ) {
      return detail;
    }

    if (
      Array.isArray(detail)
    ) {
      return detail
        .map(
          (item: any) =>
            item?.msg ??
            JSON.stringify(item)
        )
        .join(", ");
    }

    if (
      responseData?.message
    ) {
      return String(
        responseData.message
      );
    }

    if (
      responseData?.error
    ) {
      return String(
        responseData.error
      );
    }

    if (err?.message) {
      return String(
        err.message
      );
    }

    return (
      "An unexpected AutoML error occurred."
    );
  }

  /* ============================================================
     EXTRACT COLUMNS
  ============================================================ */

  function extractColumns(
    data: any
  ): string[] {
    if (!data) {
      return [];
    }

    /*
     * Direct columns array.
     */
    if (
      Array.isArray(
        data.columns
      )
    ) {
      return data.columns
        .map(
          (column: any) => {
            if (
              typeof column ===
              "string"
            ) {
              return column;
            }

            return (
              column?.name ??
              column?.column ??
              column?.column_name
            );
          }
        )
        .filter(
          (
            column: any
          ): column is string =>
            typeof column ===
            "string"
        );
    }

    /*
     * columns_info.
     */
    if (
      data.columns_info &&
      typeof data.columns_info ===
        "object"
    ) {
      return Object.keys(
        data.columns_info
      );
    }

    /*
     * dataset_summary.columns_info.
     */
    if (
      data.dataset_summary
        ?.columns_info
    ) {
      return Object.keys(
        data.dataset_summary
          .columns_info
      );
    }

    /*
     * IMPORTANT:
     *
     * dataset_summary.columns is a NUMBER.
     *
     * Never use it as column names.
     */

    /*
     * Nested dataset.
     */
    if (
      data.dataset
    ) {
      const nested =
        extractColumns(
          data.dataset
        );

      if (
        nested.length
      ) {
        return nested;
      }
    }

    /*
     * Nested data.
     */
    if (
      data.data &&
      !Array.isArray(data.data)
    ) {
      const nested =
        extractColumns(
          data.data
        );

      if (
        nested.length
      ) {
        return nested;
      }
    }

    /*
     * Derive from preview rows.
     */
    const rows =
      Array.isArray(
        data.preview
      )
        ? data.preview
        : Array.isArray(
            data.rows
          )
        ? data.rows
        : Array.isArray(
            data.data
          )
        ? data.data
        : [];

    if (
      rows.length > 0 &&
      typeof rows[0] ===
        "object"
    ) {
      return Object.keys(
        rows[0]
      );
    }

    return [];
  }

  /* ============================================================
     NORMALIZE TRAINING SUMMARY
  ============================================================ */

  function updateDatasetInfoFromResult(
    data: AutoMLResult
  ) {
    const summary =
      data.dataset_summary;

    if (!summary) {
      return;
    }

    const columnsFromInfo =
      summary.columns_info &&
      typeof summary.columns_info ===
        "object"
        ? Object.keys(
            summary.columns_info
          )
        : [];

    /*
     * IMPORTANT:
     *
     * Do NOT assign:
     *
     * columns: summary.columns
     *
     * because summary.columns is a number.
     *
     * DatasetInspectResponse.columns
     * expects string[].
     */

    const normalized: DatasetInspectResponse =
      {
        task: data.task,

        rows:
          summary.rows,

        memory_usage_bytes:
          summary.memory_usage_bytes,

        missing_values:
          summary.missing_values,

        target_column:
          summary.target_column,

        columns:
          columnsFromInfo,

        columns_info:
          summary.columns_info,

        dataset_summary:
          summary,
      };

    setDatasetInfo(
      normalized
    );

    if (
      columnsFromInfo.length > 0
    ) {
      setDatasetColumns(
        columnsFromInfo
      );
    }
  }

  /* ============================================================
     CLEAR
  ============================================================ */

  function clear() {
    setLoading(false);

    setInspecting(false);

    setError(null);

    setDatasetInfo(null);

    setDatasetPreview([]);

    setDatasetColumns([]);

    setLeaderboard([]);

    setBestModel(null);

    setStatistics(null);

    setRecommendations([]);

    setResult(null);
  }

  /* ============================================================
     INSPECT
  ============================================================ */

  async function inspect(
    file: File
  ) {
    setInspecting(true);

    setError(null);

    try {
      const data =
        await AutoMLService.inspectDataset(
          file
        );

      setDatasetInfo(
        data
      );

      const columns =
        extractColumns(data);

      if (
        columns.length > 0
      ) {
        setDatasetColumns(
          columns
        );
      }

      return data;
    } catch (err) {
      const message =
        getErrorMessage(err);

      console.error(
        "AutoML inspect failed:",
        err
      );

      setError(
        message
      );

      throw err;
    } finally {
      setInspecting(false);
    }
  }

  /* ============================================================
     PREVIEW
  ============================================================ */

  async function preview(
    file: File
  ): Promise<DatasetPreviewResponse> {
    setError(null);

    try {
      const data =
        await AutoMLService.previewDataset(
          file
        );

      let rows:
        Record<
          string,
          any
        >[] = [];

      if (
        Array.isArray(data)
      ) {
        rows =
          data as any;
      } else if (
        Array.isArray(
          data?.preview
        )
      ) {
        rows =
          data.preview;
      } else if (
        Array.isArray(
          data?.rows
        )
      ) {
        rows =
          data.rows;
      } else if (
        Array.isArray(
          data?.data
        )
      ) {
        rows =
          data.data;
      }

      setDatasetPreview(
        rows
      );

      /*
       * Only derive columns if inspect
       * didn't provide them.
       */
      if (
        datasetColumns.length ===
          0 &&
        rows.length > 0
      ) {
        setDatasetColumns(
          Object.keys(
            rows[0]
          )
        );
      }

      return data;
    } catch (err) {
      const message =
        getErrorMessage(err);

      console.error(
        "AutoML preview failed:",
        err
      );

      setError(
        message
      );

      throw err;
    }
  }

  /* ============================================================
     TRAIN
  ============================================================ */

  async function train(
    file: File,
    targetColumn?: string,
    task?: AutoMLTask,
    optimizationMetric?: AutoMLOptimizationMetric
  ): Promise<AutoMLResult> {
    setLoading(true);

    setError(null);

    try {
      const data =
        await AutoMLService.trainFromFile(
          file,
          targetColumn,
          task,
          optimizationMetric
        );

      console.log(
        "AUTOML TRAIN RESPONSE:",
        data
      );

      setResult(
        data
      );

      setLeaderboard(
        Array.isArray(
          data?.leaderboard
        )
          ? data.leaderboard
          : []
      );

      setBestModel(
        data?.best_model ??
          null
      );

      setStatistics(
        data?.training_statistics ??
          data?.statistics ??
          null
      );

      setRecommendations(
        Array.isArray(
          data?.recommendations
        )
          ? data.recommendations
          : []
      );

      /*
       * Safely normalize dataset summary.
       */
      updateDatasetInfoFromResult(
        data
      );

      return data;
    } catch (err) {
      const message =
        getErrorMessage(err);

      console.error(
        "AutoML training failed:",
        err
      );

      setError(
        message
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    inspecting,

    error,

    result,

    datasetInfo,

    datasetPreview,

    datasetColumns,

    leaderboard,

    bestModel,

    statistics,

    recommendations,

    clear,

    inspect,

    preview,

    train,
  };
}