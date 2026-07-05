import type { ReactNode } from "react";

type TopMetricCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: "green" | "red" | "blue" | "violet" | "amber";
};

const accentClasses = {
  green: "text-emerald-300",
  red: "text-red-300",
  blue: "text-blue-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
};

export function TopMetricCard({
  label,
  value,
  detail,
  accent = "green",
}: TopMetricCardProps) {
  return (
    <section className="min-h-[130px] min-w-0 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/85 p-[18px] shadow-xl shadow-black/20 backdrop-blur">
      <div className="text-xs font-black uppercase tracking-normal text-slate-400">
        {label}
      </div>
      <div className={`mt-3 text-[28px] font-black leading-tight text-slate-50 ${accentClasses[accent]}`}>
        {value}
      </div>
      {detail ? <div className="mt-3 text-sm leading-snug text-slate-300">{detail}</div> : null}
    </section>
  );
}
