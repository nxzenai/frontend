"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import DatasetWorkspace from "@/components/datasets/DatasetWorkspace";

export default function DatasetPage() {

    return (

        <ProtectedRoute>

            <DashboardLayout>

                {/* Header */}

                <div className="mb-8">

                    <h1
                        className="
                            text-4xl
                            font-bold
                            text-white
                        "
                    >
                        Dataset Manager
                    </h1>

                    <p
                        className="
                            mt-2
                            text-slate-400
                        "
                    >
                        Upload, organize, preview and reuse
                        datasets across Python Lab, SQL Lab,
                        AutoML, AutoDL, AutoNLP and GenAI.
                    </p>

                </div>

                <DatasetWorkspace />

            </DashboardLayout>

        </ProtectedRoute>

    );

}