"use client";

import { useEffect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function TrainingRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return null;
}
