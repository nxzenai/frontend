import { Loader2 } from "lucide-react";
export default function Loading() { return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={42} /><span className="sr-only">Loading EDA Hub</span></div>; }
