"use client";

import Editor from "@monaco-editor/react";

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export default function SQLEditor({
  query,
  onChange,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
      "
    >
      <Editor
    height="350px"
    defaultLanguage="sql"
    value={query}
    theme="vs-dark"
    onChange={(value) => onChange(value ?? "")}
    onMount={(editor, monaco) => {

        editor.addCommand(

            monaco.KeyMod.CtrlCmd |
            monaco.KeyCode.Enter,

            () => {

                const event = new CustomEvent(
                    "sql-execute",
                );

                window.dispatchEvent(event);

            },

        );

    }}
    options={{
        fontSize: 15,
        minimap: {
            enabled: false,
        },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
    }}
/>
    </div>
  );
}
