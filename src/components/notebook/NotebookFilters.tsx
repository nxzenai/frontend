"use client";

interface Props {
  filter: string;
  setFilter: (value: string) => void;
}

export default function NotebookFilters({
  filter,
  setFilter,
}: Props) {
  return (
    <div className="flex gap-3">

      {["All", "Private", "Public"].map((item) => (
        <button
          key={item}
          onClick={() => setFilter(item)}
          className={`rounded-lg px-5 py-2 ${
            filter === item
              ? "bg-blue-600"
              : "bg-slate-800"
          }`}
        >
          {item}
        </button>
      ))}

    </div>
  );
}