"use client";

import { useCallback, useState } from "react";

import AutoNLPService from "@/services/autonlp.service";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
} from "@/types/autonlp";

export default function useAutoNLPJob() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const [job, setJob] =
        useState<AutoNLPJobResponse | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    //////////////////////////////////////////////////////////
    // Start Training
    //////////////////////////////////////////////////////////

    const startTraining =
        useCallback(async (

            request: AutoNLPJobCreateRequest,

        ) => {

            try {

                setLoading(true);

                setError(null);

                const newJob =
                    await AutoNLPService.startJob(
                        request
                    );

                setJob(newJob);

                return newJob;

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Failed to start AutoNLP training job."
                );

                throw err;

            } finally {

                setLoading(false);

            }

        }, []);

    //////////////////////////////////////////////////////////
    // Return
    //////////////////////////////////////////////////////////

    return {

        job,

        loading,

        error,

        startTraining,

    };

}
