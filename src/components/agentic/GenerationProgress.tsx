import { CodeXml, LoaderCircle } from "lucide-react";

export default function GenerationProgress() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-violet-500/20 bg-slate-900/70 p-10 text-center">
      <div className="relative mb-5 rounded-2xl bg-violet-500/10 p-4 text-violet-300">
        <CodeXml className="h-8 w-8" />
        <LoaderCircle className="absolute -right-2 -top-2 h-5 w-5 animate-spin text-cyan-300" />
      </div>
      <h2 className="text-xl font-semibold text-white">Generating application source</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
        NxZenAI is generating and validating the approved application source. The version
        will appear only after every file and path passes validation.
      </p>
    </div>
  );
}
