"use client";

interface Props {
  onAddCode?: () => void;
  onAddMarkdown?: () => void;
}

export default function AddCellButton({
  onAddCode,
  onAddMarkdown,
}: Props) {
  return (
    <div className="my-6 flex items-center justify-center gap-4">

      <button
        onClick={onAddCode}
        className="
          rounded-lg
          border
          border-blue-600
          px-5
          py-2
          text-sm
          text-blue-400
          transition
          hover:bg-blue-600
          hover:text-white
        "
      >
        + Code
      </button>

      <button
        onClick={onAddMarkdown}
        className="
          rounded-lg
          border
          border-green-600
          px-5
          py-2
          text-sm
          text-green-400
          transition
          hover:bg-green-600
          hover:text-white
        "
      >
        + Markdown
      </button>

    </div>
  );
}