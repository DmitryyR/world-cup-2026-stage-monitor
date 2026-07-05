"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

type MonitorFeedback =
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | null;

export function MonitorRunButton() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<MonitorFeedback>(null);

  async function runMonitor() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setFeedback(null);
    const startedAt = Date.now();

    try {
      const response = await fetch("/api/monitor/run", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        data?: { changesDetected?: number; errors?: string[] };
      };
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

      if (!response.ok) {
        const errorMessage =
          payload.data?.errors?.join("; ") ||
          "Monitor finished with checker errors. Review the agent log.";
        throw new Error(errorMessage);
      }

      setFeedback({
        status: "success",
        message: `Monitor completed - ${payload.data?.changesDetected ?? 0} changes - ${durationSeconds}s`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Monitor failed. Review the agent log for details.",
      });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-black text-white shadow-sm outline-none hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-300/60 disabled:cursor-not-allowed disabled:bg-slate-500"
        disabled={isRunning}
        onClick={runMonitor}
        title="Run monitor"
        type="button"
      >
        <Play aria-hidden="true" size={16} />
        {isRunning ? "Running..." : "Run Monitor"}
      </button>
      {feedback ? (
        <div
          className={
            feedback.status === "success"
              ? "rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
              : "rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
          }
          role={feedback.status === "error" ? "alert" : "status"}
        >
          {feedback.message}
          {feedback.status === "error" ? (
            <Link className="ml-2 underline underline-offset-2" href="/agent-log">
              Agent Log
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
