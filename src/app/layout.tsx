import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, LayoutDashboard, ListChecks, Trophy } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Stage Monitor",
  description: "Monitor World Cup 2026 stage progress with maker/checker validation.",
};

const navItems = [
  { href: "/", label: "Summary", icon: LayoutDashboard },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/bracket", label: "Tournament Path", icon: Activity },
  { href: "/agent-log", label: "Agent Log", icon: ListChecks },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="relative border-b border-slate-200 bg-white shadow-sm">
          <div className="absolute left-0 top-0 hidden h-full w-10 bg-emerald-700 sm:block" />
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Trophy aria-hidden="true" size={24} />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">
                  World Cup 2026 Stage Monitor
                </span>
                <span className="block text-sm text-slate-500">
                  Maker/checker tournament state
                </span>
              </span>
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon aria-hidden="true" size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
