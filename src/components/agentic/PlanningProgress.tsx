import { LoaderCircle } from "lucide-react";

export default function PlanningProgress() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-10 text-center">
      <div className="mb-5 rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-white">Designing your AI solution</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
        The architecture planner is analyzing your requirement and supplied context, then
        preparing a validated application architecture. This can take a moment.
      </p>
    </div>
  );
}
