"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-slate-800">
        <Sidebar />
      </aside>

      {/* Right Section */}
      <div className="flex flex-1 flex-col overflow-hidden">

        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="mx-auto max-w-7xl p-8">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}