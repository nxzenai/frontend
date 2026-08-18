"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { resolveProtectedRouteState } from "./protectedRouteState";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const state = resolveProtectedRouteState(loading, Boolean(user));

  useEffect(() => {
    if (state === "redirect") {
      router.replace("/login");
    }
  }, [state, router]);

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (state === "redirect") return null;

  return <>{children}</>;
}
