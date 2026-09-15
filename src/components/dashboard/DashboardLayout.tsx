"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

interface Props {
  children: React.ReactNode;
  compactSidebar?: boolean;
}

export default function DashboardLayout({
  children,
  compactSidebar = false,
}: Props) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* Sidebar */}
      <aside className={compactSidebar ? "hidden w-72 flex-shrink-0 lg:block" : "w-72 flex-shrink-0"}>
        <Sidebar />
      </aside>

      {/* Right Section */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className={compactSidebar ? "mx-auto max-w-7xl p-4 sm:p-8" : "mx-auto max-w-7xl p-8"}>
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
