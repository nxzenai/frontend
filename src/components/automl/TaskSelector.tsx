"use client";

import { BrainCircuit, BarChart3, Activity, ShieldAlert, Layers, Sparkles } from "lucide-react";

import type { AutoMLTask } from "@/types/automl";

interface TaskSelectorProps {
  value: AutoMLTask;
  onChange: (value: AutoMLTask) => void;
}

const TASKS = [
  {
    id: "auto",
    title: "Auto Detect",
    description: "Automatically detect Classification or Regression.",
    icon: Sparkles,
  },
  {
    id: "classification",
    title: "Classification",
    description: "Predict categorical values.",
    icon: BrainCircuit,
  },
  {
    id: "regression",
    title: "Regression",
    description: "Predict continuous numerical values.",
    icon: BarChart3,
  },
  {
    id: "clustering",
    title: "Clustering",
    description: "Discover hidden groups in the dataset.",
    icon: Layers,
  },
  {
    id: "anomaly",
    title: "Anomaly Detection",
    description: "Detect unusual observations.",
    icon: ShieldAlert,
  },
  {
    id: "dimensionality",
    title: "Dimensionality Reduction",
    description: "Reduce feature space.",
    icon: Activity,
  },
] as const;

export default function TaskSelector({
  value,
  onChange,
}: TaskSelectorProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <h2 className="text-2xl font-bold text-white">
        AutoML Task
      </h2>

      <p className="mt-2 text-slate-400">
        Select the machine learning task.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        {TASKS.map((task) => {

          const Icon = task.icon;

          const selected = value === task.id;

          return (

            <button
              key={task.id}
              type="button"
              onClick={() =>
                onChange(task.id as AutoMLTask)
              }
              className={`
                rounded-2xl
                border
                p-6
                text-left
                transition-all
                duration-200

                ${
                  selected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 bg-slate-950 hover:border-blue-500 hover:bg-slate-800"
                }
              `}
            >

              <div className="flex items-center gap-4">

                <div
                  className={`
                    rounded-xl
                    p-3

                    ${
                      selected
                        ? "bg-blue-600"
                        : "bg-slate-800"
                    }
                  `}
                >
                  <Icon
                    size={24}
                    className="text-white"
                  />
                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {task.description}
                  </p>

                </div>

              </div>

            </button>

          );

        })}

      </div>

      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">

        <p className="text-sm text-blue-300">

          <strong>Selected Task:</strong>{" "}

          {TASKS.find((t) => t.id === value)?.title}

        </p>

      </div>

    </div>
  );
}