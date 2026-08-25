"use client";

import {
    useCallback,
    useState,
} from "react";

import AutoDLService from "@/services/autodl.service";

import {
    AutoDLJobResponse,
    AutoDLPredictionResponse,
    Modality,
    DLArchitecture,
} from "@/types/autodl";


export default function useAutoDLJob() {

    ////////////////////////////////////////////////////////////
    // State
    ////////////////////////////////////////////////////////////

    const [
        job,
        setJob,
    ] =
        useState<AutoDLJobResponse | null>(
            null
        );


    const [
        prediction,
        setPrediction,
    ] =
        useState<AutoDLPredictionResponse | null>(
            null
        );


    const [
        loading,
        setLoading,
    ] =
        useState(false);


    const [
        predicting,
        setPredicting,
    ] =
        useState(false);


    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null
        );


    ////////////////////////////////////////////////////////////
    // Error Helper
    ////////////////////////////////////////////////////////////

    const getErrorMessage = (
        err: any,
        fallback: string,
    ) => {

        return (
            err?.response?.data?.detail ??
            err?.response?.data?.message ??
            err?.message ??
            fallback
        );
    };


    ////////////////////////////////////////////////////////////
    // Start Training
    ////////////////////////////////////////////////////////////

    const startTraining =
        useCallback(
            async (
                file: File,
                modality: Modality,
                architecture: DLArchitecture,
                maxEpochs: number,
            ) => {

                try {

                    setLoading(true);

                    setError(null);

                    setPrediction(null);


                    const newJob =
                        await AutoDLService.startJob(
                            file,
                            modality,
                            architecture,
                            maxEpochs,
                        );


                    setJob(
                        newJob
                    );


                    return newJob;

                } catch (err: any) {

                    console.error(
                        err
                    );


                    const message =
                        getErrorMessage(
                            err,
                            "Failed to start AutoDL training job.",
                        );


                    setError(
                        message
                    );


                    throw err;

                } finally {

                    setLoading(
                        false
                    );
                }
            },
            [],
        );


    ////////////////////////////////////////////////////////////
    // Refresh Job
    ////////////////////////////////////////////////////////////

    const refreshJob =
        useCallback(
            async (
                jobId: string,
            ) => {

                try {

                    setError(null);


                    const updatedJob =
                        await AutoDLService.getJob(
                            jobId
                        );


                    setJob(
                        updatedJob
                    );


                    return updatedJob;

                } catch (err: any) {

                    console.error(
                        err
                    );


                    const message =
                        getErrorMessage(
                            err,
                            "Failed to retrieve AutoDL job.",
                        );


                    setError(
                        message
                    );


                    throw err;
                }
            },
            [],
        );


    ////////////////////////////////////////////////////////////
    // Predict
    ////////////////////////////////////////////////////////////

    const predict =
        useCallback(
            async (
                jobId: string,
                file: File,
            ) => {

                try {

                    setPredicting(
                        true
                    );

                    setError(
                        null
                    );


                    const result =
                        await AutoDLService.predict(
                            jobId,
                            file,
                        );


                    setPrediction(
                        result
                    );


                    return result;

                } catch (err: any) {

                    console.error(
                        err
                    );


                    const message =
                        getErrorMessage(
                            err,
                            "AutoDL prediction failed.",
                        );


                    setError(
                        message
                    );


                    throw err;

                } finally {

                    setPredicting(
                        false
                    );
                }
            },
            [],
        );


    ////////////////////////////////////////////////////////////
    // Clear Prediction
    ////////////////////////////////////////////////////////////

    const clearPrediction =
        useCallback(
            () => {

                setPrediction(
                    null
                );

            },
            [],
        );


    ////////////////////////////////////////////////////////////
    // Return
    ////////////////////////////////////////////////////////////

    return {

        job,

        prediction,

        loading,

        predicting,

        error,

        startTraining,

        refreshJob,

        predict,

        clearPrediction,
    };
}