import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ListChecks, Rows3, Trophy } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Stage Monitor",
  description: "Monitor World Cup 2026 stage progress with maker/checker validation.",
};

const navItems = [
  { href: "/", label: "Summary", icon: Trophy },
  { href: "/matches", label: "Matches", icon: Rows3 },
  { href: "/bracket", label: "Bracket", icon: Activity },
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
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Trophy aria-hidden="true" size={21} />
              </span>
              <span>
                <span className="block text-lg font-semibold">
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
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                  >
                    <Icon aria-hidden="true" size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
