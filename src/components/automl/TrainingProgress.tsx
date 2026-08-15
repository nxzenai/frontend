interface Props {
  loading: boolean;
}

export default function TrainingProgress({
  loading,
}: Props) {
  if (!loading) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-blue-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

        <div>
          <p className="text-sm font-bold text-slate-900">
            AutoML is training models
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Evaluating multiple algorithms and
            selecting the best model...
          </p>
        </div>
      </div>
    </div>
  );
}