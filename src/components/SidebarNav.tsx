"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Summary", icon: LayoutDashboard, exact: true },
  { href: "/bracket", label: "Bracket", icon: Activity },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/agent-log", label: "Agent Log", icon: ListChecks },
  { href: "/bracket", label: "Teams", icon: Users, inactiveAlias: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          !item.inactiveAlias &&
          (item.exact ? pathname === item.href : pathname.startsWith(item.href));

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={
              isActive
                ? "inline-flex h-11 shrink-0 items-center gap-3 rounded-md border border-blue-300/30 bg-gradient-to-r from-blue-600/80 to-blue-500/35 px-4 text-sm font-semibold text-blue-50 shadow-lg shadow-blue-950/30"
                : "inline-flex h-11 shrink-0 items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-blue-100"
            }
          >
            <Icon
              aria-hidden="true"
              className={isActive ? "text-blue-100" : "text-slate-400"}
              size={17}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
