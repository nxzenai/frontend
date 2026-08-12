"use client";

import { useCallback, useState } from "react";

import AutoDLService from "@/services/autodl.service";

import {
    AutoDLJobResponse,
    Modality,
    DLArchitecture,
} from "@/types/autodl";

export default function useAutoDLJob() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const [job, setJob] =
        useState<AutoDLJobResponse | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    //////////////////////////////////////////////////////////
    // Start Training
    //////////////////////////////////////////////////////////

    const startTraining =
        useCallback(async (

            file: File,

            modality: Modality,

            architecture: DLArchitecture,

            maxEpochs: number,

        ) => {

            try {

                setLoading(true);

                setError(null);

                const newJob =
                    await AutoDLService.startJob(
                        file,
                        modality,
                        architecture,
                        maxEpochs,
                    );

                setJob(newJob);

                return newJob;

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Failed to start AutoDL training job."
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
