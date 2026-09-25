"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(compactSidebar);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`
          hidden flex-shrink-0 border-r border-slate-800 bg-[#020617]
          md:block
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px]
          transform border-r border-slate-800 bg-[#020617]
          transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          mobile
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            <Menu size={20} />
          </button>

          <span className="ml-3 text-sm font-semibold text-slate-200">
            NxZenAI Studio
          </span>
        </div>

        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Close Button */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed left-[232px] top-5 z-[60] inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 md:hidden"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}