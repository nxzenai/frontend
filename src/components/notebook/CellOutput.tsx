"use client";

interface Props {
  outputs: any[];
  executionCount?: number | null;
}

export default function CellOutput({
  outputs,
  executionCount,
}: Props) {
  if (!outputs || outputs.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-700 bg-[#020617]">
      {/* Output Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3">
        <span className="rounded bg-green-700 px-2 py-1 text-xs font-bold text-white">
          Out [{executionCount ?? "-"}]
        </span>
      </div>

      {/* Outputs */}
      <div className="space-y-4 p-5">
        {outputs.map((output, index) => {
          //////////////////////////////////////////////////////
// STREAM OUTPUT
//////////////////////////////////////////////////////

if (output.output_type === "stream") {

  const stream =
    typeof output.content === "string"
      ? output.content
      : output.content?.text ?? "";

  return (
    <pre
      key={index}
      className="
        whitespace-pre-wrap
        rounded-lg
        bg-slate-900
        p-4
        font-mono
        text-sm
        text-green-300
      "
    >
      {stream}
    </pre>
  );
}
          //////////////////////////////////////////////////////
          // ERROR OUTPUT
          //////////////////////////////////////////////////////

          if (output.output_type === "error") {
            const error = output.content ?? {};

            return (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-red-700
                  bg-red-950/30
                "
              >
                <div className="border-b border-red-700 bg-red-900/50 px-5 py-4">
                  <div className="text-lg font-semibold text-red-300">
                    ❌ {error.ename ?? "Execution Error"}
                  </div>

                  {error.evalue && (
                    <div className="mt-2 text-sm text-red-200">
                      {error.evalue}
                    </div>
                  )}
                </div>

                <pre
                  className="
                    overflow-x-auto
                    whitespace-pre-wrap
                    p-5
                    font-mono
                    text-xs
                    leading-6
                    text-red-100
                  "
                >
                  {Array.isArray(error.traceback)
                    ? error.traceback.join("\n")
                    : JSON.stringify(error, null, 2)}
                </pre>
              </div>
            );
          }

          //////////////////////////////////////////////////////
          // IMAGE OUTPUT
          //////////////////////////////////////////////////////

          const image =
            output.content?.data?.["image/png"];

          if (image) {
            return (
              <img
                key={index}
                src={`data:image/png;base64,${image}`}
                alt="Notebook Output"
                className="
                  max-w-full
                  rounded-lg
                  border
                  border-slate-700
                  shadow-lg
                "
              />
            );
          }

          //////////////////////////////////////////////////////
          // HTML OUTPUT (Pandas DataFrame)
          //////////////////////////////////////////////////////

          const htmlRaw =
            output.content?.data?.["text/html"];

          const html = Array.isArray(htmlRaw)
            ? htmlRaw.join("")
            : htmlRaw;

          if (
            typeof html === "string" &&
            html.trim().length > 0
          ) {
            return (
              <div
                key={index}
                className="
                  overflow-x-auto
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  p-4
                "
                dangerouslySetInnerHTML={{
                  __html: html,
                }}
              />
            );
          }

          //////////////////////////////////////////////////////
          // TEXT OUTPUT
          //////////////////////////////////////////////////////

          const textRaw =
            output.content?.data?.["text/plain"];

          const text = Array.isArray(textRaw)
            ? textRaw.join("")
            : textRaw;

          if (
            typeof text === "string" &&
            text.trim().length > 0
          ) {
            return (
              <pre
                key={index}
                className="
                  whitespace-pre-wrap
                  rounded-lg
                  bg-slate-900
                  p-4
                  font-mono
                  text-sm
                  text-slate-100
                "
              >
                {text}
              </pre>
            );
          }

          //////////////////////////////////////////////////////
          // FALLBACK
          //////////////////////////////////////////////////////

          return (
            <pre
              key={index}
              className="
                whitespace-pre-wrap
                rounded-lg
                bg-slate-900
                p-4
                font-mono
                text-xs
                text-slate-300
              "
            >
              {JSON.stringify(output, null, 2)}
            </pre>
          );
        })}
      </div>
    </div>
  );
}