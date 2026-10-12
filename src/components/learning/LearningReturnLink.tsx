"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LearningReturnLink() {
  const [href, setHref] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("returnTo") || "";
    if (/^\/(learn(?:\/|$)|practice(?:\/|$)|assessments(?:\/|$))/.test(value) && !value.startsWith("//")) setHref(value);
  }, []);
  return href ? <Link href={href} className="mb-4 inline-block rounded-lg border border-slate-700 px-3 py-2 text-sm text-blue-300 hover:bg-slate-800">Return to Learning</Link> : null;
}
