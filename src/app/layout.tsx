import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Trophy,
  Users,
} from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Stage Monitor",
  description: "Monitor World Cup 2026 stage progress with maker/checker validation.",
};

const navItems = [
  { href: "/", label: "Summary", icon: LayoutDashboard },
  { href: "/bracket", label: "Bracket", icon: Activity },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/agent-log", label: "Agent Log", icon: ListChecks },
  { href: "/bracket", label: "Teams", icon: Users },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:pl-60">
          <aside className="border-b border-white/10 bg-slate-950/80 p-4 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-60 lg:border-b-0 lg:border-r lg:p-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-300/30">
                <Trophy aria-hidden="true" size={28} />
              </span>
              <span>
                <span className="block text-xl font-black uppercase leading-none tracking-normal text-slate-50">
                  World Cup 2026
                </span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Stage Monitor
                </span>
              </span>
            </Link>

            <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="inline-flex h-11 shrink-0 items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-blue-100"
                  >
                    <Icon aria-hidden="true" size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 hidden text-xs text-slate-500 lg:absolute lg:bottom-6 lg:left-5 lg:right-5 lg:block">
              <div>Kyiv time</div>
              <div>Europe/Kyiv</div>
            </div>
          </aside>

          <main className="min-w-0 px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
            <div className="w-full max-w-none">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
