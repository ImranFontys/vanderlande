"use client";

import { TraceProgress } from "@/components/TraceProgress";
import { mockTrace, statusSteps } from "@/lib/mockData";
import { buildTraceRecord, getState, sanitizeId } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

type TraceRecord = (typeof mockTrace)[keyof typeof mockTrace];

const stepDescriptions: Record<number, { title: string; body: string }> = {
  1: { title: "Check-in", body: "Je bagage is geregistreerd bij de balie. Je ontvangt updates zodra er nieuwe scans zijn." },
  2: { title: "Sorteercentrum", body: "De koffer beweegt door het automatische systeem. Operators bewaken uitzonderingen." },
  3: { title: "Boarding", body: "Je bagage staat klaar bij het vliegtuig en wordt geladen." },
  4: { title: "Aankomst", body: "Het vliegtuig is geland en de bagage gaat richting band." },
  5: { title: "Bagageband", body: "De koffer verschijnt zo op de band. Houd je boardingpass gereed." },
  6: { title: "Afgehaald", body: "De bagage is opgehaald. Neem contact op met support als dit niet klopt." },
};

export default function PassengerPage() {
  const [records, setRecords] = useState<Record<string, TraceRecord>>(() => ({ ...mockTrace }));
  const [bagInput, setBagInput] = useState("bag001");
  const [selectedBagId, setSelectedBagId] = useState("bag001");
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const stepEtaMap: Record<number, number> = {
    1: 35,
    2: 30,
    3: 20,
    4: 12,
    5: 5,
    6: 0,
  };

  const activeBag = records[selectedBagId] ?? records.bag001;
  const suggestions = useMemo(() => Object.keys(records).slice(0, 4), [records]);
  const etaMinutes = stepEtaMap[activeBag.currentStatus] ?? 0;
  const etaTime = new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const etaTip =
    etaMinutes === 0
      ? "Je bagage staat op de band of is al opgehaald."
      : etaMinutes > 20
        ? "Door drukte op de sortering kan dit iets langer duren."
        : "Blijf in de buurt van de band, je bagage komt bijna.";

  const handleTrack = () => {
    const sanitized = sanitizeId(bagInput);
    if (!sanitized) {
      setError("Voer een geldig ID in");
      return;
    }
    setError(null);
    if (!records[sanitized]) {
      const generated = buildTraceRecord(sanitized);
      setRecords((prev) => ({ ...prev, [sanitized]: generated }));
    }
    setSelectedBagId(sanitized);
    setTimeout(() => inputRef.current?.blur(), 100);
  };

  return (
    <main className="page px-4 py-10 space-y-8">
      <header className="text-center space-y-3">
        <p className="eyebrow">Passagier</p>
        <h1 className="text-4xl font-semibold text-slate-900">Volg je bagage</h1>
        <p className="text-sm text-muted">
          Alleen de belangrijkste informatie voor reizigers. Operators vinden hun dashboard op <a href="/operator" className="text-accent font-semibold">/operator</a>.
        </p>
      </header>

      <section className="glass rounded-3xl p-5 border space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="bagInput" className="text-sm font-semibold text-muted">Zending-ID</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="bagInput"
              name="bagId"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="bijv. bag001"
              value={bagInput}
              onChange={(event) => setBagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleTrack();
                }
              }}
            />
            <button className="primary-btn" onClick={handleTrack}>Bekijk</button>
          </div>
          {error && <span className="text-xs text-rose-600">{error}</span>}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted">
          {suggestions.map((id) => (
            <button
              key={id}
              className={`chip ${id === activeBag.id ? "chip-active" : ""}`}
              onClick={() => {
                setSelectedBagId(id);
                setBagInput(id);
                setError(null);
              }}
            >
              {id}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Tip: nummer niet bij de hand? Kies een voorbeeld-ID om de demo te zien.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 space-y-3">
        <div className="flex flex-wrap justify-between gap-3 text-sm text-muted">
          <span>Status: <strong className="text-slate-900">{statusSteps.find((s) => s.id === activeBag.currentStatus)?.label}</strong></span>
          <span>Laatste update: <strong className="text-slate-900">{activeBag.history[activeBag.history.length - 1]?.time ?? "-"}</strong></span>
          <span>ID: <strong className="text-slate-900">{activeBag.id}</strong></span>
          <span>ETA: <strong className="text-slate-900">{etaTime}</strong></span>
        </div>
        <TraceProgress current={activeBag.currentStatus} />
        <p className="text-xs text-muted">
          {etaMinutes === 0 ? "Geen wachttijd meer." : `Nog ongeveer ${etaMinutes} min.`} {etaTip}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-[0.3em]">Route</h2>
        <ol className="space-y-2">
          {statusSteps.map((step) => {
            const state = getState(step.id, activeBag.currentStatus);
            const historyItem = activeBag.history.find((h) => h.status === step.id);
            const isOpen = expandedStep === step.id;
            const info = stepDescriptions[step.id];
            const detail = historyItem
              ? `${info.title}: ${info.body}`
              : state === "active"
                ? `${info.title}: Je bagage is onderweg naar dit punt.`
                : `${info.title}: Deze stap volgt zodra het traject zover is.`;
            return (
              <li key={step.id} className="rounded-2xl border border-slate-200">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
                  onClick={() => setExpandedStep((prev) => (prev === step.id ? null : step.id))}
                >
                  <span className="font-semibold text-slate-900">{step.label}</span>
                  <span className="flex items-center gap-2 text-muted">
                    {historyItem ? historyItem.time : state === "active" ? "Onderweg" : "Nog niet"}
                    <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>&rsaquo;</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 text-sm text-muted">
                    {detail}
                    {historyItem && <div className="mt-1 text-xs text-slate-500">Laatste scan om {historyItem.time}</div>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
