"use client";

interface Props {
  leaderboard: any[];
  task?: string;
}

export default function Leaderboard({
  leaderboard,
  task,
}: Props) {
  if (
    !leaderboard ||
    leaderboard.length === 0
  ) {
    return null;
  }

  const isClassification =
    task === "classification";

  const isRegression =
    task === "regression";

  const isClustering =
    task === "clustering";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-950">
          Model Leaderboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Models ranked according to their
          evaluation performance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Rank
              </th>

              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Model
              </th>

              {isClassification && (
                <>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Accuracy
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Precision
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Recall
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    F1
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    ROC-AUC
                  </th>
                </>
              )}

              {isRegression && (
                <>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    R²
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    MAE
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    RMSE
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    MAPE
                  </th>
                </>
              )}

              {isClustering && (
                <>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Clusters
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Silhouette
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Calinski
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Davies-Bouldin
                  </th>
                </>
              )}

              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Time
              </th>

              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map(
              (model, index) => {
                const rank =
                  model.rank ??
                  index + 1;

                const modelName =
                  model.model_name ??
                  model.model ??
                  "Unknown";

                return (
                  <tr
                    key={`${modelName}-${index}`}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          rank === 1
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {rank}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {modelName}
                      </span>
                    </td>

                    {isClassification && (
                      <>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {formatPercent(
                            model.accuracy
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatPercent(
                            model.precision
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatPercent(
                            model.recall
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {formatPercent(
                            model.f1_score
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatPercent(
                            model.roc_auc
                          )}
                        </td>
                      </>
                    )}

                    {isRegression && (
                      <>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {formatNumber(
                            model.r2_score
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatNumber(
                            model.mae
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatNumber(
                            model.rmse
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatNumber(
                            model.mape
                          )}
                        </td>
                      </>
                    )}

                    {isClustering && (
                      <>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {model.n_clusters ??
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {formatNumber(
                            model.silhouette_score
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatNumber(
                            model.calinski_harabasz_score
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatNumber(
                            model.davies_bouldin_score
                          )}
                        </td>
                      </>
                    )}

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {model.training_time !==
                      undefined
                        ? `${Number(
                            model.training_time
                          ).toFixed(2)}s`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-bold",
                          model.success
                            ? "bg-green-100 text-green-700"
                            : model.status ===
                              "timeout"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700",
                        ].join(" ")}
                      >
                        {model.success
                          ? "Success"
                          : model.status ===
                            "timeout"
                          ? "Timeout"
                          : "Failed"}
                      </span>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatPercent(
  value: any
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return `${(
    Number(value) * 100
  ).toFixed(1)}%`;
}

function formatNumber(
  value: any
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}