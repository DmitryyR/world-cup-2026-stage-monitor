"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function MonitorRunButton() {
  const [isRunning, setIsRunning] = useState(false);

  async function runMonitor() {
    setIsRunning(true);

    try {
      await fetch("/api/monitor/run", {
        method: "POST",
      });
      window.location.reload();
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <button
      className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={isRunning}
      onClick={runMonitor}
      title="Run monitor"
      type="button"
    >
      <Play aria-hidden="true" size={16} />
      {isRunning ? "Running" : "Run Monitor"}
    </button>
  );
}
