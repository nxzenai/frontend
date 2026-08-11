"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Search notebooks..."
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none"
    />
  );
}