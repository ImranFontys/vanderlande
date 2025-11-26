"use client";

import { useMemo, useState, type FormEvent } from "react";
import { statusSteps } from "@/lib/mockData";
import { getState, sanitizeId } from "@/lib/utils";
import { TraceProgress } from "./TraceProgress";

type TraceRecord = {
  id: string;
  currentStatus: number;
  history: { status: number; label: string; time: string }[];
};

type Props = {
  traceData: Record<string, TraceRecord>;
};

export function TrackSection({ traceData }: Props) {
  const ids = useMemo(() => Object.keys(traceData), [traceData]);
  const [inputId, setInputId] = useState(ids[0] ?? "");
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  const active = activeId ? traceData[activeId] : undefined;

  const handleLookup = (rawId: string) => {
    const normalized = sanitizeId(rawId);
    if (!normalized) {
      setError("Voer een ID in (bijv. bag001).");
      return;
    }
    const record = traceData[normalized];
    if (!record) {
      setError("Onbekend ID. Probeer bag001, bag002 of bag003.");
      return;
    }
    setActiveId(normalized);
    setInputId(normalized);
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLookup(inputId);
  };

  const handleGenerate = () => {
    if (!ids.length) return;
    const random = ids[Math.floor(Math.random() * ids.length)];
    handleLookup(random);
  };

  return (
    <section id="track" className="card glass rounded-xl2 p-5 border mt-8 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Track & Trace</p>
          <h2 className="text-2xl font-semibold text-text">Zoek je zending</h2>
          <p className="muted">Voorbeeld ID&apos;s: bag001, bag002, bag003.</p>
        </div>
        <span className="live-indicator">
          <span className="pulse" />
          Live
        </span>
      </div>

      <form
        className="glass rounded-xl2 p-4 border flex flex-wrap items-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="bagInput" className="text-sm font-semibold text-muted">
            Zending-ID
          </label>
          <input
            id="bagInput"
            name="bagId"
            placeholder="bijv. bag001"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="primary-btn">
            Track
          </button>
          <button type="button" onClick={handleGenerate} className="ghost-btn">
            Genereer ID
          </button>
        </div>
        {error ? (
          <div className="alert error" role="alert">
            {error}
          </div>
        ) : null}
      </form>

      {active ? (
        <>
          <div className="status-meta mb-2 flex items-center justify-between gap-3">
            <div className="status-chip">
              Status: {statusSteps.find((s) => s.id === active.currentStatus)?.label}
            </div>
            <div className="meta-inline text-sm text-muted flex gap-3">
              <span>ID: {active.id}</span>
              <span>Laatste update: {active.history[active.history.length - 1]?.time ?? "-"}</span>
            </div>
          </div>

          <TraceProgress current={active.currentStatus} />

          <div className="timeline mt-4 flex flex-col gap-3">
            {statusSteps.map((step) => {
              const state = getState(step.id, active.currentStatus);
              const historyItem = active.history.find((h) => h.status === step.id);
              const descriptor = historyItem
                ? "Stap voltooid"
                : step.id === active.currentStatus
                  ? "Actieve stap"
                  : "Nog niet bereikt";
              return (
                <div key={step.id} className="timeline-item glass border rounded-xl2 flex gap-3">
                  <div className={`badge-icon ${state}`}>
                    <span className="pill">{step.label[0]}</span>
                  </div>
                  <div className="flex-1">
                    <header className="flex justify-between gap-2 items-start">
                      <strong className="text-lg text-text">{step.label}</strong>
                      <span className={`chip ${state}`}>{descriptor}</span>
                    </header>
                    <p className="text-muted mt-1">
                      {historyItem
                        ? `Tijdstempel: ${historyItem.time}`
                        : "Tijdstempel volgt zodra de stap is bereikt."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="alert">Geen data gevonden. Probeer een ander ID.</div>
      )}
    </section>
  );
}
