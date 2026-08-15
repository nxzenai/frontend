"use client";

import type { AutoMLTask } from "@/types/automl";

interface TaskOption {
  id: AutoMLTask;
  title: string;
  description: string;
  icon: string;
}

interface Props {
  tasks: TaskOption[];
  selectedTask: AutoMLTask;
  onChange: (
    task: AutoMLTask
  ) => void;
}

export default function TaskSelector({
  tasks,
  selectedTask,
  onChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {tasks.map((task) => {
        const selected =
          task.id === selectedTask;

        return (
          <button
            key={task.id}
            type="button"
            onClick={() =>
              onChange(task.id)
            }
            className={[
              "group relative rounded-xl border p-5 text-left transition-all",
              selected
                ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
            ].join(" ")}
          >
            {selected && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                ✓
              </span>
            )}

            <div
              className={[
                "mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold",
                selected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {task.icon}
            </div>

            <h3 className="text-base font-bold text-slate-950">
              {task.title}
            </h3>

            <p className="mt-2 text-sm leading-5 text-slate-600">
              {task.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}