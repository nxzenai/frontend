"use client";

import { useState } from "react";

import * as AutoMLService from "@/services/automl.service";

import type {
  AutoMLResult,
  BestModel,
  LeaderboardEntry,
  DatasetColumnResponse,
} from "@/types/automl";

export default function useAutoML() {
  // =========================================================
  // State
  // =========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [datasetInfo, setDatasetInfo] = useState<any>(null);

  const [datasetShape, setDatasetShape] = useState<any>(null);

  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);

  const [datasetPreview, setDatasetPreview] = useState<any[]>([]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [bestModel, setBestModel] = useState<BestModel | null>(null);

  const [summary, setSummary] = useState<any>(null);

  const [statistics, setStatistics] = useState<any>(null);

  const [recommendations, setRecommendations] = useState<string[]>([]);

  const [result, setResult] = useState<AutoMLResult | null>(null);

  // =========================================================
  // Clear
  // =========================================================

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

  // =========================================================
  // Error Handler
  // =========================================================

  function getErrorMessage(error: any): string {
    if (error?.response?.data?.detail) {
      return String(error.response.data.detail);
    }

    if (error?.response?.data?.message) {
      return String(error.response.data.message);
    }

    if (error?.message) {
      return String(error.message);
    }

    return "An unexpected AutoML error occurred.";
  }

  // =========================================================
  // Dataset Information
  // =========================================================

  async function loadDatasetInfo(file: File) {
    try {
      const data = await AutoMLService.getDatasetInfo(file);

      setDatasetInfo(data);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Dataset Shape
  // =========================================================

  async function loadDatasetShape(file: File) {
    try {
      const data = await AutoMLService.getDatasetShape(file);

      setDatasetShape(data);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Dataset Columns
  // =========================================================

  async function loadDatasetColumns(file: File): Promise<string[]> {
    try {
      const data: DatasetColumnResponse =
        await AutoMLService.getDatasetColumns(file);

      const columns = Array.isArray(data?.columns)
        ? data.columns
        : [];

      setDatasetColumns(columns);

      return columns;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Dataset Preview
  // =========================================================

  async function loadDatasetPreview(file: File) {
    try {
      const data = await AutoMLService.getDatasetPreview(file);

      const preview = Array.isArray(data)
        ? data
        : Array.isArray(data?.preview)
        ? data.preview
        : [];

      setDatasetPreview(preview);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Train AutoML
  // =========================================================

  async function train(
    file: File,
    targetColumn: string
  ): Promise<AutoMLResult> {
    setLoading(true);
    setError(null);

    try {
      const response = await AutoMLService.trainAutoML(
        file,
        targetColumn
      );

      setResult(response);

      return response;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // Leaderboard
  // =========================================================

  async function loadLeaderboard(
    file: File,
    targetColumn: string
  ): Promise<LeaderboardEntry[]> {
    try {
      const data = await AutoMLService.getLeaderboard(
        file,
        targetColumn
      );

      const models: LeaderboardEntry[] = Array.isArray(data)
        ? data
        : [];

      setLeaderboard(models);

      return models;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Best Model
  // =========================================================

  async function loadBestModel(
    file: File,
    targetColumn: string
  ): Promise<BestModel> {
    try {
      const data = await AutoMLService.getBestModel(
        file,
        targetColumn
      );

      setBestModel(data);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Executive Summary
  // =========================================================

  async function loadSummary(
    file: File,
    targetColumn: string
  ) {
    try {
      const data = await AutoMLService.getSummary(
        file,
        targetColumn
      );

      setSummary(data);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Statistics
  // =========================================================

  async function loadStatistics(
    file: File,
    targetColumn: string
  ) {
    try {
      const data = await AutoMLService.getStatistics(
        file,
        targetColumn
      );

      setStatistics(data);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Recommendations
  // =========================================================

  async function loadRecommendations(
    file: File,
    targetColumn: string
  ) {
    try {
      const data =
        await AutoMLService.getRecommendations(
          file,
          targetColumn
        );

      const items: string[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

      setRecommendations(items);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    }
  }

  // =========================================================
  // Complete AutoML Response
  //
  // IMPORTANT:
  // This calls:
  //
  // POST /api/v1/automl/complete
  //
  // No /jobs endpoint is used.
  // =========================================================

  async function loadCompleteResponse(
    file: File,
    targetColumn: string
  ): Promise<AutoMLResult> {
    setLoading(true);
    setError(null);

    try {
      const data =
        await AutoMLService.getCompleteResponse(
          file,
          targetColumn
        );

      // -----------------------------------------------------
      // Save complete response
      // -----------------------------------------------------

      setResult(data);

      // -----------------------------------------------------
      // Dataset Summary
      // -----------------------------------------------------

      setDatasetInfo(
        data?.dataset_summary ?? null
      );

      // -----------------------------------------------------
      // Leaderboard
      // -----------------------------------------------------

      const leaderboardData: LeaderboardEntry[] =
        Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : [];

      setLeaderboard(leaderboardData);

      // -----------------------------------------------------
      // Best Model
      // -----------------------------------------------------

      setBestModel(
        data?.best_model ?? null
      );

      // -----------------------------------------------------
      // Statistics
      //
      // Backend may return:
      //
      // statistics
      //
      // or:
      //
      // training_statistics
      // -----------------------------------------------------

      setStatistics(
        data?.statistics ??
        data?.training_statistics ??
        null
      );

      // -----------------------------------------------------
      // Executive Summary
      //
      // Supports:
      //
      // analysis.summary
      //
      // or:
      //
      // summary
      // -----------------------------------------------------

      setSummary(
        data?.analysis?.summary ??
        data?.summary ??
        null
      );

      // -----------------------------------------------------
      // Recommendations
      //
      // Supports:
      //
      // analysis.recommendations
      //
      // or:
      //
      // recommendations
      // -----------------------------------------------------

      const recommendationData: string[] =
        Array.isArray(data?.analysis?.recommendations)
          ? data.analysis.recommendations
          : Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];

      setRecommendations(recommendationData);

      return data;
    } catch (error) {
      const message = getErrorMessage(error);

      console.error(
        "AutoML complete response failed:",
        error
      );

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // Return
  // =========================================================

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