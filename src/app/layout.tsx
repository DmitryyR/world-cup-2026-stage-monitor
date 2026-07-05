import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Stage Monitor",
  description: "Monitor World Cup 2026 stage progress with maker/checker validation.",
};

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

            <SidebarNav />

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
