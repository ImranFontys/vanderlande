"use client";

import { useState } from "react";

type Props = {
  onRefresh?: () => void;
};

export function CommandBar({ onRefresh }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  };

  const handleRefresh = () => {
    onRefresh?.();
    showToast("Data refreshed (mock)");
  };

  const handleExport = () => showToast("Exported CSV (mock)");
  const handleHelp = () => showToast("Help panel opened (mock)");
  const handleIncidents = () => showToast("Incidents loaded (mock)");

  return (
    <div className="command-bar glass border rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="status-dot" aria-hidden />
        <div className="text-sm font-semibold text-text leading-tight">
          Vanderlande Control Tower
          <div className="text-xs font-normal text-muted">Operational · EU-West</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 ml-auto">
        <button type="button" className="ghost-btn small" onClick={handleRefresh}>
          Refresh
        </button>
        <button type="button" className="ghost-btn small" onClick={handleExport}>
          Export CSV
        </button>
        <button type="button" className="ghost-btn small" onClick={handleIncidents}>
          Incidents
        </button>
        <button type="button" className="primary-btn small" onClick={handleHelp}>
          Help
        </button>
      </div>
      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
