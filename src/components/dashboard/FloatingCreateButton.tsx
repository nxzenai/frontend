"use client";

import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function FloatingCreateButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-xl transition hover:scale-105 hover:bg-blue-700"
    >
      <Plus size={28} />
    </button>
  );
}