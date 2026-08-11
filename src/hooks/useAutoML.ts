"use client";

import { useState } from "react";

import * as AutoMLService from "@/services/automl.service";

import type {
  AutoMLResult,
  BestModel,
  LeaderboardEntry,
} from "@/types/automl";

export default function useAutoML() {
  //////////////////////////////////////////////////////
  // States
  //////////////////////////////////////////////////////

  const [loading, setLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [datasetInfo, setDatasetInfo] =
    useState<any>(null);

  const [datasetShape, setDatasetShape] =
    useState<any>(null);

  const [datasetColumns, setDatasetColumns] =
    useState<string[]>([]);

  const [datasetPreview, setDatasetPreview] =
    useState<any[]>([]);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [bestModel, setBestModel] =
    useState<BestModel | null>(null);

  const [summary, setSummary] =
    useState<any>(null);

  const [statistics, setStatistics] =
    useState<any>(null);

  const [recommendations, setRecommendations] =
    useState<any>(null);

  const [result, setResult] =
    useState<AutoMLResult | null>(null);

  //////////////////////////////////////////////////////
  // Reset
  //////////////////////////////////////////////////////

  function clear() {
    setError(null);

    setDatasetInfo(null);

    setDatasetShape(null);

    setDatasetColumns([]);

    setDatasetPreview([]);

    setLeaderboard([]);

    setBestModel(null);

    setSummary(null);

    setStatistics(null);

    setRecommendations(null);

    setResult(null);
  }

  //////////////////////////////////////////////////////
  // Dataset Info
  //////////////////////////////////////////////////////

  async function loadDatasetInfo(file: File) {
    const data =
      await AutoMLService.getDatasetInfo(file);

    setDatasetInfo(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Dataset Shape
  //////////////////////////////////////////////////////

  async function loadDatasetShape(file: File) {
    const data =
      await AutoMLService.getDatasetShape(file);

    setDatasetShape(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Dataset Columns
  //////////////////////////////////////////////////////

async function loadDatasetColumns(file: File) {

  const data =
    await AutoMLService.getDatasetColumns(file);

  console.log("Columns API");

  console.log(data);

  setDatasetColumns(data.columns);

  return data.columns;

}

  //////////////////////////////////////////////////////
  // Dataset Preview
  //////////////////////////////////////////////////////

  async function loadDatasetPreview(
    file: File
  ) {
    const data =
      await AutoMLService.getDatasetPreview(file);

    setDatasetPreview(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Train AutoML
  //////////////////////////////////////////////////////

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
      setError(
        err?.response?.data?.detail ??
          err.message
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }

  //////////////////////////////////////////////////////
  // Leaderboard
  //////////////////////////////////////////////////////

  async function loadLeaderboard(
    file: File,
    targetColumn: string
  ) {
    const data =
      await AutoMLService.getLeaderboard(
        file,
        targetColumn
      );

    setLeaderboard(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Best Model
  //////////////////////////////////////////////////////

  async function loadBestModel(
    file: File,
    targetColumn: string
  ) {
    const data =
      await AutoMLService.getBestModel(
        file,
        targetColumn
      );

    setBestModel(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Summary
  //////////////////////////////////////////////////////

  async function loadSummary(
    file: File,
    targetColumn: string
  ) {
    const data =
      await AutoMLService.getSummary(
        file,
        targetColumn
      );

    setSummary(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Statistics
  //////////////////////////////////////////////////////

  async function loadStatistics(
    file: File,
    targetColumn: string
  ) {
    const data =
      await AutoMLService.getStatistics(
        file,
        targetColumn
      );

    setStatistics(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Recommendations
  //////////////////////////////////////////////////////

  async function loadRecommendations(
    file: File,
    targetColumn: string
  ) {
    const data =
      await AutoMLService.getRecommendations(
        file,
        targetColumn
      );

    setRecommendations(data);

    return data;
  }

  //////////////////////////////////////////////////////
  // Complete Response
  //////////////////////////////////////////////////////

  //////////////////////////////////////////////////////
// Complete Response
//////////////////////////////////////////////////////

async function loadCompleteResponse(
  file: File,
  targetColumn: string,
) {

  try {

    setLoading(true);

    setError(null);

    const data =
      await AutoMLService.getCompleteResponse(
        file,
        targetColumn,
      );

    console.log(data);

    // Save complete response
    setResult(data);

    // Dataset Summary
    setDatasetInfo(
      data.dataset_summary ?? null
    );

    // Leaderboard
    setLeaderboard(
      data.leaderboard ?? []
    );

    // Best Model
    setBestModel(
      data.best_model ?? null
    );

    // Statistics
    setStatistics(
      data.training_statistics ?? null
    );

    // Executive Summary
    setSummary(
      data.analysis?.summary ?? null
    );

    // Recommendations
    setRecommendations(
      data.analysis?.recommendations ?? []
    );

    return data;

  } catch (err: any) {

    console.error(err);

    setError(
      err.response?.data?.detail ??
      err.message
    );

    throw err;

  } finally {

    setLoading(false);

  }

}
  //////////////////////////////////////////////////////
  // Return
  //////////////////////////////////////////////////////

  return {

loading,

error,

result,

datasetInfo,

leaderboard,

bestModel,

statistics,

summary,

recommendations,

datasetShape,

datasetColumns,

datasetPreview,

loadDatasetInfo,

loadDatasetShape,

loadDatasetColumns,

loadDatasetPreview,

loadCompleteResponse,

};
}