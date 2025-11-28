"use client";

import { TraceProgress } from "@/components/TraceProgress";
import { mockShipments, mockTrace, statusSteps } from "@/lib/mockData";
import { buildTraceRecord, sanitizeId, type TraceRecord } from "@/lib/utils";
import type { RefObject } from "react";
import { forwardRef, useMemo, useRef, useState } from "react";

type HeroStats = {
  liveShipments: number;
  watchlist: number;
  exceptions: number;
};

type Shipment = typeof mockShipments[number];

export default function Page() {
  const [records, setRecords] = useState<Record<string, TraceRecord>>(() => ({ ...mockTrace }));
  const [selectedBagId, setSelectedBagId] = useState<string>("bag001");
  const [bagInput, setBagInput] = useState("bag001");
  const [trackError, setTrackError] = useState<string | null>(null);
  const [shipments, setShipments] = useState(mockShipments);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);
  const trackSectionRef = useRef<HTMLElement | null>(null);
  const bagInputRef = useRef<HTMLInputElement | null>(null);

  const activeBag = records[selectedBagId] ?? records.bag001;
  const activeShipment = useMemo(() => shipments.find((row) => row.id === selectedBagId), [shipments, selectedBagId]);
  const availableIds = useMemo(() => Object.keys(records).sort(), [records]);
  const filteredShipments = useMemo(() => {
    if (statusFilter === "all") return shipments;
    return shipments.filter((row) => row.status === statusFilter);
  }, [shipments, statusFilter]);

  const heroStats = useMemo<HeroStats>(() => {
    const exceptionCount = shipments.filter((row) => row.status === "exception").length;
    return {
      liveShipments: shipments.length,
      watchlist: availableIds.length,
      exceptions: exceptionCount,
    };
  }, [shipments, availableIds]);

  const showToast = (message: string) => {
    setToast(message);
    dismissToast();
  };

  const handleTrack = () => {
    const sanitized = sanitizeId(bagInput);
    if (!sanitized) {
      setTrackError("Voer een geldig ID in.");
      return;
    }
    setBagInput(sanitized);
    if (!records[sanitized]) {
      const generated = buildTraceRecord(sanitized);
      setRecords((prev) => ({ ...prev, [sanitized]: generated }));
    }
    setSelectedBagId(sanitized);
    setTrackError(null);
    focusBagInput();
  };

  const handleGenerateId = () => {
    const newId = `bag${Math.floor(Math.random() * 9000 + 1000)}`;
    const generated = buildTraceRecord(newId);
    setRecords((prev) => ({ ...prev, [newId]: generated }));
    setSelectedBagId(newId);
    setBagInput(newId);
    setTrackError(null);
    focusBagInput();
  };

  const handleStartTracking = () => {
    trackSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    focusBagInput();
  };

  const handleViewOps = () => {
    document.querySelector("#ops")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScanShipment = () => {
    const newId = `bag${Math.floor(Math.random() * 800 + 200)}`;
    const statuses = ["intransit", "arrived", "exception"] as const;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const shipment = {
      id: newId,
      status,
      eta: new Date(Date.now() + Math.random() * 60 * 60000).toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      hub: ["AMS", "EIN", "RTM"][Math.floor(Math.random() * 3)],
      label: status === "arrived" ? "Binnen" : status === "exception" ? "Check" : "Onderweg",
    };
    setShipments((prev) => [shipment, ...prev].slice(0, 6));
    const generated = buildTraceRecord(newId);
    setRecords((prev) => ({ ...prev, [newId]: generated }));
    showToast(`Nieuw label ${newId} gescand`);
  };

  const handleResolveException = (id: string) => {
    setShipments((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: "intransit", label: "Herstart", eta: row.eta ?? "-" }
          : row,
      ),
    );
    showToast(`Exception ${id} gemarkeerd als opgepakt`);
  };

  const handleExportShipments = () => {
    const csv = shipments.map((row) => `${row.id};${row.status};${row.eta};${row.hub};${row.label}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("CSV gedownload");
  };

  const handleCopyLink = async (id: string) => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${base}/?bag=${id}`;
      await navigator.clipboard.writeText(url);
      showToast("Deeplink gekopieerd");
    } catch {
      showToast("Kopiëren mislukt, probeer later opnieuw");
    }
  };

  const focusBagInput = () => {
    setTimeout(() => bagInputRef.current?.focus(), 150);
  };

  const dismissToast = () => {
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="page px-4 pb-16 space-y-10 max-w-7xl mx-auto">
      <OperatorNav />
      <Hero stats={heroStats} spotlight={activeBag} onStartTracking={handleStartTracking} onViewOps={handleViewOps} />
      <TrackSection
        ref={trackSectionRef}
        bag={activeBag}
        bagInput={bagInput}
        bagOptions={availableIds}
        shipment={activeShipment}
        error={trackError}
        inputRef={bagInputRef}
        onBagInputChange={setBagInput}
        onSelectBag={(id) => {
          setSelectedBagId(id);
          setBagInput(id);
          setTrackError(null);
        }}
        onTrack={handleTrack}
        onGenerateId={handleGenerateId}
        onCopyShare={handleCopyLink}
      />
      <DashboardSection
        shipments={filteredShipments}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onScan={handleScanShipment}
        onExport={handleExportShipments}
        toast={toast}
        activeShipment={activeShipment}
        activeBag={activeBag}
        totalShipments={shipments.length}
        exceptions={heroStats.exceptions}
        onResolveException={handleResolveException}
      />
      <SupportSection onGenerateDemo={handleGenerateId} />
    </div>
  );
}

type HeroProps = {
  onStartTracking: () => void;
  onViewOps: () => void;
  stats: HeroStats;
  spotlight: TraceRecord;
};

function OperatorNav() {
  const now = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  return (
    <nav
      className="rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3"
      aria-label="Operator navigatie"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 font-semibold text-slate-900 text-base">
          <img src="/vanderlande-logo.png" alt="Vanderlande" className="h-6 w-auto" />
          Ops Desk
        </span>
        <span className="hidden sm:flex h-4 w-px bg-slate-200" aria-hidden />
        <div className="flex items-center gap-3" role="list">
          <a href="/" className="hover:text-slate-900" role="listitem">Passagier</a>
          <a href="#track" className="hover:text-slate-900" role="listitem">Track</a>
          <a href="#ops" className="hover:text-slate-900" role="listitem">Dashboard</a>
          <a href="#support" className="hover:text-slate-900" role="listitem">Support</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted" aria-label="Huidige tijd">{now}</span>
        <a className="ghost-btn small" href="#ops">Exceptions</a>
      </div>
    </nav>
  );
}

function Hero({ onStartTracking, onViewOps, stats, spotlight }: HeroProps) {
  const highlightCards = [
    { label: "Actieve zendingen", value: stats.liveShipments, detail: "Nu in het netwerk" },
    { label: "Exceptions open", value: stats.exceptions, detail: "Direct opvolgen" },
    { label: "Watchlist", value: stats.watchlist, detail: "Handmatig gemonitord" },
  ];
  const upcoming = statusSteps.find((step) => step.id === spotlight.currentStatus + 1);

  return (
    <header className="hero space-y-8 mt-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-7 lg:p-8 flex flex-col gap-6">
        <div className="space-y-3">
          <p className="eyebrow text-slate-500">Control room</p>
          <h1 className="text-4xl font-semibold leading-snug text-slate-900">Beantwoord klantvragen snel</h1>
          <p className="lede text-muted max-w-2xl">
            Zoek een label, lees laatste scan, ETA en volgende stap. Zet uitzonderingen direct door naar het team.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {highlightCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{card.label}</p>
              <p className="text-2xl font-semibold mt-1 text-slate-900">{card.value}</p>
              <p className="text-xs text-muted">{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="primary-btn" onClick={onStartTracking}>Zoek bagage</button>
          <button className="ghost-btn" onClick={onViewOps}>Open overzicht</button>
        </div>
      </div>
    </header>
  );
}

type TrackSectionProps = {
  bag: TraceRecord;
  bagInput: string;
  bagOptions: string[];
  shipment?: Shipment;
  error: string | null;
  onBagInputChange: (value: string) => void;
  onSelectBag: (value: string) => void;
  onTrack: () => void;
  onGenerateId: () => void;
  inputRef: RefObject<HTMLInputElement>;
  onCopyShare: (id: string) => void;
};

const TrackSection = forwardRef<HTMLElement, TrackSectionProps>(function TrackSectionComponent(
  { bag, bagInput, bagOptions, shipment, error, onBagInputChange, onSelectBag, onTrack, onGenerateId, inputRef, onCopyShare },
  ref,
) {
  const suggestionOptions = bagOptions.slice(0, 6);
  const lastHistory = bag.history[bag.history.length - 1];
  const nextStep = statusSteps.find((step) => step.id === bag.currentStatus + 1);
  return (
    <section id="track" className="mt-14 space-y-6" ref={ref}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Realtime tracking</p>
          <h2 className="text-3xl font-semibold text-slate-900">Zoek of voeg een zending toe</h2>
          <p className="text-muted">Werk met live data, druk op track en zie direct waar de bagage is.</p>
        </div>
        <span className="live-indicator"><span className="pulse" />Live feed</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="glass rounded-3xl p-5 border space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1.2fr,auto]">
            <div className="flex flex-col gap-2">
              <label htmlFor="bagInput" className="text-sm font-semibold text-muted">Zending-ID</label>
              <input
                id="bagInput"
                ref={inputRef}
                name="bagId"
                placeholder="bijv. bag001"
                aria-describedby="bagInputHelp"
                aria-invalid={error ? "true" : "false"}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={bagInput}
                onChange={(event) => onBagInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onTrack();
                  }
                }}
              />
              {error && <span className="text-xs text-rose-600">{error}</span>}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <p id="bagInputHelp">Voorbeeld: bag001 · bag002 · bag003</p>
                <button
                  type="button"
                  className="text-accent font-semibold underline underline-offset-4"
                  onClick={() => onCopyShare(bag.id)}
                >
                  Deel huidige zending
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="primary-btn" onClick={onTrack}>Track</button>
              <button className="ghost-btn" onClick={onGenerateId}>Genereer ID</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestionOptions.map((id) => (
              <button key={id} className={`chip ${id === bag.id ? "chip-active" : ""}`} onClick={() => onSelectBag(id)}>
                {id}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Geselecteerd</p>
              <p className="text-lg font-semibold text-slate-900">{bag.id}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Laatste update</p>
              <p className="text-lg font-semibold text-slate-900">{bag.history[bag.history.length - 1]?.time ?? "-"}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-3xl p-6 border flex flex-col gap-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Status</p>
              <h3 className="text-2xl font-semibold text-slate-900">
                {statusSteps.find((step) => step.id === bag.currentStatus)?.label}
              </h3>
            </div>
            <div className="text-right text-sm text-muted">
              <p className="font-semibold text-slate-900">Flow</p>
              <p>{bag.history.length} / {statusSteps.length}</p>
            </div>
          </div>
          <TraceProgress current={bag.currentStatus} />
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-3">
              <p className="text-muted">Laatste scan</p>
              <p className="font-semibold text-slate-900">{lastHistory?.time ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <p className="text-muted">Volgende checkpoint</p>
              <p className="font-semibold text-slate-900">
                {nextStep?.label ?? "Compleet"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Klantantwoord</p>
            <h3 className="text-lg font-semibold text-slate-900">Wat vertel je aan de klant?</h3>
          </div>
          {shipment?.status === "exception" && (
            <span className="pill pill-orange">Exception · opvolgen</span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-muted">Huidige status</p>
            <p className="font-semibold text-slate-900">
              {statusSteps.find((step) => step.id === bag.currentStatus)?.label ?? "Onbekend"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-muted">ETA</p>
            <p className="font-semibold text-slate-900">{shipment?.eta ?? "Nog niet bekend"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-muted">Hub / route</p>
            <p className="font-semibold text-slate-900">{shipment?.hub ?? "Nog niet toegewezen"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-muted">Volgende stap</p>
            <p className="font-semibold text-slate-900">{nextStep?.label ?? "Afronden"}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
          Geef door: "{statusSteps.find((step) => step.id === bag.currentStatus)?.label ?? "We volgen uw bagage"}".
          Laatste scan om {lastHistory?.time ?? "-"} in {shipment?.hub ?? "het systeem"}. Volgende stap: {nextStep?.label ?? "Afronden"}.
        </div>
      </div>
    </section>
  );
});

type DashboardProps = {
  shipments: typeof mockShipments;
  statusFilter: string;
  onFilterChange: (value: string) => void;
  onScan: () => void;
  onExport: () => void;
  toast: string | null;
  activeShipment?: Shipment;
  activeBag: TraceRecord;
  totalShipments: number;
  exceptions: number;
  onResolveException: (id: string) => void;
};

function DashboardSection({
  shipments,
  statusFilter,
  onFilterChange,
  onScan,
  onExport,
  toast,
  activeShipment,
  activeBag,
  totalShipments,
  exceptions,
  onResolveException,
}: DashboardProps) {
  const inTransit = shipments.filter((row) => row.status === "intransit").length;
  const arrived = shipments.filter((row) => row.status === "arrived").length;
  const exceptionList = shipments.filter((row) => row.status === "exception");
  const activeState = statusSteps.find((step) => step.id === activeBag.currentStatus);

  return (
    <section id="ops" className="mt-16 space-y-6 w-full max-w-7xl mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="eyebrow">Operator view</p>
            <h2 className="text-3xl font-semibold text-slate-900">Overzicht & acties</h2>
            <p className="text-muted text-sm">Filter zendingen, pak exceptions op en geef klanten direct antwoord.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="statusFilter" className="sr-only">Filter op status</label>
            <select
              id="statusFilter"
              className="ghost-select"
              value={statusFilter}
              onChange={(event) => onFilterChange(event.target.value)}
            >
              <option value="all">Alle status</option>
              <option value="intransit">In transit</option>
              <option value="arrived">Aangekomen</option>
              <option value="exception">Exception</option>
            </select>
            {statusFilter !== "all" && (
              <button className="ghost-btn small" onClick={() => onFilterChange("all")}>Reset</button>
            )}
            <button className="ghost-btn small" onClick={onScan}>Scan</button>
            <button className="ghost-btn small" onClick={onExport}>Export</button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Live</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{totalShipments}</p>
            <p className="text-xs text-muted">Actieve labels</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">In transit</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{inTransit}</p>
            <p className="text-xs text-muted">Onderweg</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Aangekomen</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{arrived}</p>
            <p className="text-xs text-muted">Klaar voor band/afhaal</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-rose-50 p-4 border-rose-100">
            <p className="text-[11px] uppercase tracking-[0.2em] text-rose-700">Exceptions</p>
            <p className="text-2xl font-semibold text-rose-900 mt-1">{exceptions}</p>
            <p className="text-xs text-rose-700">Pak direct op</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Live zendingen</h3>
              <p className="text-sm text-muted">Klik voor details of scan nieuw label.</p>
            </div>
            <div className="flex gap-2">
              <button className="ghost-btn small" onClick={onScan}>Scan</button>
              <button className="ghost-btn small" onClick={onExport}>Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-900">
              <caption className="sr-only">Actieve zendingen</caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr className="[&>th]:px-5 [&>th]:py-3 [&>th]:text-left">
                  <th scope="col">ID</th>
                  <th scope="col">Status</th>
                  <th scope="col">ETA</th>
                  <th scope="col">Hub</th>
                  <th scope="col" className="text-right">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100" aria-live="polite">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-muted">
                      Geen zendingen in deze filter. Gebruik reset om alles te tonen.
                    </td>
                  </tr>
                ) : (
                  shipments.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono align-middle">{row.id}</td>
                      <td className="px-5 py-3 align-middle">
                        <span className={`pill font-semibold ${getShipmentTone(row.status)}`}>{row.label}</span>
                      </td>
                      <td className="px-5 py-3 align-middle">{row.eta}</td>
                      <td className="px-5 py-3 align-middle">{row.hub}</td>
                      <td className="px-5 py-3 text-right align-middle">
                        <a href="#track" className="text-accent font-semibold">Open</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Exception wachtrij</h3>
                <p className="text-sm text-muted">Markeer opgepakt of start communicatie.</p>
              </div>
              <span className="pill pill-orange">Open: {exceptionList.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {exceptionList.length === 0 ? (
                <p className="text-sm text-muted">Geen exceptions nu.</p>
              ) : (
                exceptionList.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2">
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-900">{row.id} · {row.hub}</p>
                      <p className="text-xs text-rose-800">ETA {row.eta} · {row.label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="ghost-btn small" onClick={() => onResolveException(row.id)}>Opgepakt</button>
                      <a href="#support" className="ghost-btn small">Escaleren</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Geselecteerd</p>
            <h3 className="text-lg font-semibold text-slate-900">{activeBag.id}</h3>
            <p className="text-sm text-muted">Status: {activeState?.label ?? "Onbekend"}</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span className="text-muted">Laatste scan</span>
                <span className="font-semibold text-slate-900">{activeBag.history[activeBag.history.length - 1]?.time ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span className="text-muted">ETA</span>
                <span className="font-semibold text-slate-900">{activeShipment?.eta ?? "Nog niet bekend"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span className="text-muted">Hub</span>
                <span className="font-semibold text-slate-900">{activeShipment?.hub ?? "n.t.b."}</span>
              </div>
            </div>
            <a href="#track" className="text-accent font-semibold text-sm underline underline-offset-4">Open in tracker</a>
          </div>
        </div>
      </div>
      <div aria-live="polite" role="status">
        {toast && <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-900">{toast}</div>}
      </div>
    </section>
  );
}

function SupportSection({ onGenerateDemo }: { onGenerateDemo: () => void }) {
  return (
    <section id="support" className="mt-16 rounded-3xl border border-slate-200 bg-white/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Support</p>
          <h2 className="text-2xl font-semibold text-slate-900">Bereikbaar voor operators</h2>
          <p className="text-sm text-muted">Schakel direct over naar het supportteam of plan een demo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="primary-btn" onClick={onGenerateDemo}>Simuleer label</button>
          <button className="ghost-btn" onClick={() => window.open("https://www.vanderlande.com", "_blank", "noreferrer")}>
            Plan demo
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-900">
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-muted">Hotline</p>
          <p className="font-semibold">+31 40 123 4567</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-muted">E-mail</p>
          <p className="font-semibold">ops@vanderlande.com</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-muted">Chat</p>
          <p className="font-semibold">Live via operator app</p>
        </div>
      </div>
    </section>
  );
}

function getShipmentTone(status: string) {
  if (status === "arrived") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (status === "exception") return "bg-rose-100 text-rose-900 border-rose-200";
  return "bg-amber-100 text-amber-900 border-amber-200";
}
