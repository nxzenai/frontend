"use client";

interface TrainingConfigProps {

  targetColumn: string;

  setTargetColumn: (value: string) => void;

  availableColumns: string[];

  randomState: number;

  setRandomState: (value: number) => void;

  testSize: number;

  setTestSize: (value: number) => void;

  rankingMetric: string;

  setRankingMetric: (value: string) => void;

}

export default function TrainingConfig({

  targetColumn,

  setTargetColumn,

  availableColumns,

  randomState,

  setRandomState,

  testSize,

  setTestSize,

  rankingMetric,

  setRankingMetric,

}: TrainingConfigProps) {

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <h2 className="text-2xl font-bold text-white">

        Training Configuration

      </h2>

      <p className="mt-2 text-sm text-slate-400">

        Configure the AutoML training parameters.

      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Target Column */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Target Column

          </label>

          <select

            value={targetColumn}

            onChange={(e) =>

              setTargetColumn(e.target.value)

            }

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-3
              text-white
              focus:border-blue-500
              focus:outline-none
            "

          >

            <option value="">

              Select Target Column

            </option>

            {availableColumns.map((column) => (

              <option

                key={column}

                value={column}

              >

                {column}

              </option>

            ))}

          </select>

        </div>

        {/* Ranking Metric */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Ranking Metric

          </label>

          <select

            value={rankingMetric}

            onChange={(e) =>

              setRankingMetric(e.target.value)

            }

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-3
              text-white
              focus:border-blue-500
              focus:outline-none
            "

          >

            <option value="">

              Default

            </option>

            <option value="accuracy">

              Accuracy

            </option>

            <option value="f1">

              F1 Score

            </option>

            <option value="precision">

              Precision

            </option>

            <option value="recall">

              Recall

            </option>

            <option value="roc_auc">

              ROC AUC

            </option>

            <option value="r2">

              R² Score

            </option>

          </select>

        </div>

        {/* Test Size */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Test Size

          </label>

          <input

            type="number"

            step="0.05"

            min="0.1"

            max="0.5"

            value={testSize}

            onChange={(e) =>

              setTestSize(Number(e.target.value))

            }

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-3
              text-white
              focus:border-blue-500
              focus:outline-none
            "

          />

        </div>

        {/* Random State */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Random State

          </label>

          <input

            type="number"

            value={randomState}

            onChange={(e) =>

              setRandomState(Number(e.target.value))

            }

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-3
              text-white
              focus:border-blue-500
              focus:outline-none
            "

          />

        </div>

      </div>

      <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">

        <h3 className="font-semibold text-blue-300">

          Current Configuration

        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">

          <div>

            <span className="font-medium">

              Target:

            </span>{" "}

            {targetColumn || "-"}

          </div>

          <div>

            <span className="font-medium">

              Test Size:

            </span>{" "}

            {testSize}

          </div>

          <div>

            <span className="font-medium">

              Random State:

            </span>{" "}

            {randomState}

          </div>

          <div>

            <span className="font-medium">

              Ranking:

            </span>{" "}

            {rankingMetric || "Default"}

          </div>

        </div>

      </div>

    </div>

  );

}