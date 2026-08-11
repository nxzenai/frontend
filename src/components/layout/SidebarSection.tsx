"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/lib/navigation";

interface Props {
  title: string;
  items: NavigationItem[];
}

export default function SidebarSection({
  title,
  items,
}: Props) {
  const pathname = usePathname();

  if (!items.length) return null;

  return (
    <div className="mb-8">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          //////////////////////////////////////////////////////
          // Coming Soon
          //////////////////////////////////////////////////////

          if (item.comingSoon) {
            return (
              <div
                key={item.title}
                className="
                  flex
                  cursor-not-allowed
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-slate-500
                  opacity-70
                "
              >
                <Icon size={19} />

                <span className="flex-1 font-medium">
                  {item.title}
                </span>

                <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-semibold uppercase text-amber-300">
                  Soon
                </span>
              </div>
            );
          }

          //////////////////////////////////////////////////////
          // Normal Link
          //////////////////////////////////////////////////////

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={19} />

              <span className="flex-1 font-medium">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}