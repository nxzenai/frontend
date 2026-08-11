"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <h2 className="text-2xl font-bold">
          Failed to load notebook
        </h2>

        <p className="mt-4 text-gray-500">
          {error.message}
        </p>
      </div>
    </div>
  );
}