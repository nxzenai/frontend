"use client";

import { useState } from "react";

import * as AutoMLService from "@/services/automl.service";

import type {
  AutoMLResult,
  BestModel,
  LeaderboardEntry,
} from "@/types/automl";

export default function useAutoML() {
  // ============================================================
  // STATE
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [datasetInfo, setDatasetInfo] = useState<any>(null);

  const [datasetShape, setDatasetShape] = useState<any>(null);

  const [datasetColumns, setDatasetColumns] =
    useState<string[]>([]);

  const [datasetPreview, setDatasetPreview] =
    useState<any[]>([]);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [bestModel, setBestModel] =
    useState<BestModel | null>(null);

  const [summary, setSummary] = useState<any>(null);

  const [statistics, setStatistics] = useState<any>(null);

  const [recommendations, setRecommendations] =
    useState<string[]>([]);

  const [result, setResult] =
    useState<AutoMLResult | null>(null);

  // ============================================================
  // CLEAR / RESET
  // ============================================================

  function clear() {
    setLoading(false);
    setError(null);

    setDatasetInfo(null);
    setDatasetShape(null);
    setDatasetColumns([]);
    setDatasetPreview([]);

    setLeaderboard([]);
    setBestModel(null);

    setSummary(null);
    setStatistics(null);
    setRecommendations([]);

    setResult(null);
  }

  // ============================================================
  // DATASET INFORMATION
  // ============================================================

  async function loadDatasetInfo(file: File) {
    try {
      setError(null);

      const data =
        await AutoMLService.getDatasetInfo(file);

      setDatasetInfo(data);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load dataset information.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // DATASET SHAPE
  // ============================================================

  async function loadDatasetShape(file: File) {
    try {
      setError(null);

      const data =
        await AutoMLService.getDatasetShape(file);

      setDatasetShape(data);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load dataset shape.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // DATASET COLUMNS
  // ============================================================

  async function loadDatasetColumns(file: File) {
    try {
      setError(null);

      const data =
        await AutoMLService.getDatasetColumns(file);

      console.log(
        "AutoML Dataset Columns:",
        data
      );

      const columns =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.columns)
          ? data.columns
          : [];

      setDatasetColumns(columns);

      return columns;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load dataset columns.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // DATASET PREVIEW
  // ============================================================

  async function loadDatasetPreview(file: File) {
    try {
      setError(null);

      const data =
        await AutoMLService.getDatasetPreview(file);

      const preview =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.preview)
          ? data.preview
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setDatasetPreview(preview);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load dataset preview.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // TRAIN AUTO ML
  //
  // IMPORTANT:
  // The current backend exposes:
  //
  // POST /api/v1/automl/train
  // POST /api/v1/automl/train/file
  // POST /api/v1/automl/complete
  //
  // There is NO:
  //
  // POST /api/v1/automl/jobs
  //
  // Therefore this hook does NOT call /jobs.
  // ============================================================

  async function train(
    file: File,
    targetColumn: string
  ) {
    setLoading(true);
    setError(null);

    try {
      const response =
        await AutoMLService.trainAutoML(
          file,
          targetColumn
        );

      setResult(response);

      return response;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "AutoML training failed.";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LEADERBOARD
  // ============================================================

  async function loadLeaderboard(
    file: File,
    targetColumn: string
  ) {
    try {
      setError(null);

      const data =
        await AutoMLService.getLeaderboard(
          file,
          targetColumn
        );

      const leaderboardData =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : [];

      setLeaderboard(leaderboardData);

      return leaderboardData;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load leaderboard.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // BEST MODEL
  // ============================================================

  async function loadBestModel(
    file: File,
    targetColumn: string
  ) {
    try {
      setError(null);

      const data =
        await AutoMLService.getBestModel(
          file,
          targetColumn
        );

      setBestModel(data);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load best model.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // EXECUTIVE SUMMARY
  // ============================================================

  async function loadSummary(
    file: File,
    targetColumn: string
  ) {
    try {
      setError(null);

      const data =
        await AutoMLService.getSummary(
          file,
          targetColumn
        );

      setSummary(data);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load executive summary.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // TRAINING STATISTICS
  // ============================================================

  async function loadStatistics(
    file: File,
    targetColumn: string
  ) {
    try {
      setError(null);

      const data =
        await AutoMLService.getStatistics(
          file,
          targetColumn
        );

      setStatistics(data);

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load training statistics.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  async function loadRecommendations(
    file: File,
    targetColumn: string
  ) {
    try {
      setError(null);

      const data =
        await AutoMLService.getRecommendations(
          file,
          targetColumn
        );

      const recommendationsData =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

      setRecommendations(
        recommendationsData
      );

      return recommendationsData;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load recommendations.";

      setError(message);

      throw err;
    }
  }

  // ============================================================
  // COMPLETE AUTO ML RESPONSE
  //
  // BACKEND:
  //
  // POST /api/v1/automl/complete
  //
  // This should be the primary function used by
  // AutoMLWorkspace.
  // ============================================================

  async function loadCompleteResponse(
    file: File,
    targetColumn: string
  ) {
    setLoading(true);
    setError(null);

    try {
      console.log(
        "Starting AutoML complete request..."
      );

      console.log(
        "Target Column:",
        targetColumn
      );

      console.log(
        "File:",
        file.name
      );

      const data =
        await AutoMLService.getCompleteResponse(
          file,
          targetColumn
        );

      console.log(
        "AutoML Complete Response:",
        data
      );

      // ========================================================
      // COMPLETE RAW RESPONSE
      // ========================================================

      setResult(data);

      // ========================================================
      // DATASET SUMMARY
      //
      // Backend documentation indicates:
      // dataset_summary
      // ========================================================

      setDatasetInfo(
        data?.dataset_summary ??
        null
      );

      // ========================================================
      // LEADERBOARD
      // ========================================================

      setLeaderboard(
        Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : []
      );

      // ========================================================
      // BEST MODEL
      // ========================================================

      setBestModel(
        data?.best_model ??
        null
      );

      // ========================================================
      // TRAINING STATISTICS
      //
      // Your backend's response may expose this as:
      // statistics
      //
      // Your previous code expected:
      // training_statistics
      //
      // Support both so the frontend does not break
      // if the response uses either field.
      // ========================================================

      setStatistics(
        data?.training_statistics ??
        data?.statistics ??
        null
      );

      // ========================================================
      // EXECUTIVE SUMMARY
      //
      // Support the current analysis structure as well
      // as a direct summary field.
      // ========================================================

      setSummary(
        data?.analysis?.summary ??
        data?.summary ??
        null
      );

      // ========================================================
      // RECOMMENDATIONS
      // ========================================================

      const recommendationData =
        Array.isArray(
          data?.analysis?.recommendations
        )
          ? data.analysis.recommendations
          : Array.isArray(
              data?.recommendations
            )
          ? data.recommendations
          : [];

      setRecommendations(
        recommendationData
      );

      return data;
    } catch (err: any) {
      console.error(
        "AutoML Complete Error:",
        err
      );

      const message =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "AutoML training failed.";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // State
    loading,
    error,
    result,

    datasetInfo,
    datasetShape,
    datasetColumns,
    datasetPreview,

    leaderboard,
    bestModel,

    summary,
    statistics,
    recommendations,

    // Actions
    clear,

    loadDatasetInfo,
    loadDatasetShape,
    loadDatasetColumns,
    loadDatasetPreview,

    train,

    loadLeaderboard,
    loadBestModel,
    loadSummary,
    loadStatistics,
    loadRecommendations,

    loadCompleteResponse,
  };
}