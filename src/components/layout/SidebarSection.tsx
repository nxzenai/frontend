"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/lib/navigation";
import userManagement from "@/services/userManagement.service";

interface Props {
  title: string;
  items: NavigationItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function SidebarSection({
  title,
  items,
  collapsed = false,
  onNavigate,
}: Props) {
  const pathname = usePathname();

  if (!items.length) return null;

  return (
    <div className="mb-5">
      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          if (item.comingSoon) {
            return (
              <div
                key={item.title}
                title={collapsed ? `${item.title} - Coming Soon` : undefined}
                className={`
                  flex cursor-not-allowed items-center rounded-lg
                  text-slate-600 opacity-60
                  ${collapsed
                    ? "h-11 justify-center px-2"
                    : "gap-3 px-3 py-2.5"
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />

                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>

                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
                      Soon
                    </span>
                  </>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              title={collapsed ? item.title : undefined}
              onClick={() => {
                void userManagement.track(item.permission, "module_opened").catch(() => undefined);
                onNavigate?.();
              }}
              className={`
                group relative flex items-center rounded-lg
                transition-all duration-200
                ${collapsed
                  ? "h-11 justify-center px-2"
                  : "gap-3 px-3 py-2.5"
                }
                ${
                  active
                    ? "bg-blue-500/10 text-blue-300"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                }
              `}
            >
              {active && (
                <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-400" />
              )}

              <Icon
                size={18}
                className={`shrink-0 ${
                  active
                    ? "text-blue-300"
                    : "text-slate-500 group-hover:text-slate-200"
                }`}
              />

              {!collapsed && (
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
