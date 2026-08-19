"use client";

import { useCallback, useState } from "react";

import AutoNLPService from "@/services/autonlp.service";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
} from "@/types/autonlp";


export default function useAutoNLPJob() {

    ////////////////////////////////////////////////////////////
    // State
    ////////////////////////////////////////////////////////////

    const [job, setJob] =
        useState<AutoNLPJobResponse | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    ////////////////////////////////////////////////////////////
    // Start Training
    ////////////////////////////////////////////////////////////

    const startTraining =
        useCallback(
            async (
                request: AutoNLPJobCreateRequest,
            ) => {

                try {

                    setLoading(true);

                    setError(null);

                    setJob(null);


                    ////////////////////////////////////////////////////
                    // Start Backend Job
                    ////////////////////////////////////////////////////

                    const newJob =
                        await AutoNLPService.startJob(
                            request,
                        );


                    ////////////////////////////////////////////////////
                    // Store Result
                    ////////////////////////////////////////////////////

                    setJob(newJob);

                    return newJob;

                } catch (err: any) {

                    console.error(
                        "AutoNLP training error:",
                        err,
                    );


                    ////////////////////////////////////////////////////
                    // FastAPI Error Extraction
                    ////////////////////////////////////////////////////

                    const detail =
                        err?.response?.data?.detail;

                    let errorMessage =
                        "Failed to start AutoNLP training job.";


                    if (typeof detail === "string") {

                        errorMessage = detail;

                    } else if (Array.isArray(detail)) {

                        errorMessage = detail
                            .map((item: any) => item?.msg)
                            .filter(Boolean)
                            .join(", ");

                    } else if (
                        typeof err?.response?.data?.message ===
                        "string"
                    ) {

                        errorMessage =
                            err.response.data.message;

                    } else if (
                        typeof err?.message === "string"
                    ) {

                        errorMessage = err.message;
                    }


                    ////////////////////////////////////////////////////
                    // Store Error
                    ////////////////////////////////////////////////////

                    setError(errorMessage);

                    throw err;

                } finally {

                    setLoading(false);
                }
            },
            [],
        );


    ////////////////////////////////////////////////////////////
    // Reset
    ////////////////////////////////////////////////////////////

    const resetJob =
        useCallback(() => {

            setJob(null);

            setError(null);

            setLoading(false);

        }, []);


    ////////////////////////////////////////////////////////////
    // Return
    ////////////////////////////////////////////////////////////

    return {
        job,

        loading,

        error,

        startTraining,

        resetJob,
    };
}