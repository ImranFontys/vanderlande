"use client";

import { ExceptionBarChart, HubLoadChart, OnTimeChart, ThroughputChart, UptimeGauge } from "@/components/KpiCharts";
import { TraceProgress } from "@/components/TraceProgress";
import { TrendChart } from "@/components/TrendChart";
import {
  mockExceptionBreakdown,
  mockHubLoad,
  mockKpiTrends,
  mockShipments,
  mockTrend,
  mockTrace,
  mockKpis,
  statusSteps,
} from "@/lib/mockData";
import { buildTraceRecord, getState, sanitizeId } from "@/lib/utils";
import type { ReactNode, RefObject } from "react";
import { forwardRef, useMemo, useRef, useState } from "react";

type TraceRecord = (typeof mockTrace)[keyof typeof mockTrace];

type HeroStats = {
  liveShipments: number;
  watchlist: number;
  exceptions: number;
  onTime: number;
  uptime: number;
  avgTime: number;
};

export default function Page() {
  const [records, setRecords] = useState<Record<string, TraceRecord>>(() => ({ ...mockTrace }));
  const [selectedBagId, setSelectedBagId] = useState<string>("bag001");
  const [bagInput, setBagInput] = useState("bag001");
  const [trackError, setTrackError] = useState<string | null>(null);
  const [shipments, setShipments] = useState(mockShipments);
  const [trendData, setTrendData] = useState(mockTrend);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);
  const trackSectionRef = useRef<HTMLElement | null>(null);
  const bagInputRef = useRef<HTMLInputElement | null>(null);

  const activeBag = records[selectedBagId] ?? records.bag001;
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
      onTime: mockKpis.ontime,
      uptime: mockKpis.uptime,
      avgTime: mockKpis.avgTime,
    };
  }, [shipments, availableIds]);

  const opsCounts = useMemo(() => {
    const inTransit = shipments.filter((row) => row.status === "intransit").length;
    const arrived = shipments.filter((row) => row.status === "arrived").length;
    return { inTransit, arrived };
  }, [shipments]);

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

  const handleRefreshDashboard = () => {
    setTrendData((prev) =>
      prev.map((value) => {
        const delta = Math.floor(Math.random() * 10) - 5;
        return Math.max(25, Math.min(95, value + delta));
      }),
    );
    showToast("Dashboard ververst");
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

  const handleExportShipments = async () => {
    try {
      const csv = shipments.map((row) => `${row.id};${row.status};${row.eta};${row.hub};${row.label}`).join("\n");
      await navigator.clipboard.writeText(csv);
      showToast("Lijst gekopieerd naar klembord");
    } catch {
      showToast("Kopiëren mislukt, probeer later opnieuw");
    }
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
    <div className="page px-4 pb-16 space-y-8">
      <OperatorNav />
      <Hero stats={heroStats} spotlight={activeBag} onStartTracking={handleStartTracking} onViewOps={handleViewOps} />
      <OpsToolbar stats={heroStats} onRefresh={handleRefreshDashboard} inTransit={opsCounts.inTransit} />
      <TrackSection
        ref={trackSectionRef}
        bag={activeBag}
        bagInput={bagInput}
        bagOptions={availableIds}
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
        onRefresh={handleRefreshDashboard}
        onScan={handleScanShipment}
        onExport={handleExportShipments}
        trend={trendData}
        throughputTrend={mockKpiTrends.throughput}
        ontimeTrend={mockKpiTrends.ontime}
        uptimeTrend={mockKpiTrends.uptime}
        exceptionsBreakdown={mockExceptionBreakdown}
        hubLoad={mockHubLoad}
        toast={toast}
        totalShipments={shipments.length}
        exceptions={heroStats.exceptions}
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
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 text-sm text-slate-600">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-slate-900 text-lg">Glass Ops</span>
        <a href="/" className="hover:text-slate-900">Passagier</a>
        <a href="#track" className="hover:text-slate-900">Track</a>
        <a href="#ops" className="hover:text-slate-900">Dashboard</a>
        <a href="#support" className="hover:text-slate-900">Support</a>
      </div>
      <div className="flex items-center gap-3">
        <span>{now}</span>
        <button className="ghost-btn small">Shift log</button>
      </div>
    </nav>
  );
}

type OpsToolbarProps = { stats: HeroStats; onRefresh: () => void; inTransit: number };

function OpsToolbar({ stats, onRefresh, inTransit }: OpsToolbarProps) {
  const openCases = stats.exceptions;
  const escalations = Math.max(0, openCases - 2);
  const waitTime = `${Math.max(5, Math.round(stats.avgTime / 2))} min`;
  const cards = [
    { label: "Open klantcases", value: openCases, detail: "Helpdesk tickets" },
    { label: "In escalatie", value: escalations, detail: "Direct opvolgen" },
    { label: "Gem. wachttijd", value: waitTime, detail: "Contact center" },
    { label: "Bags in transit", value: inTransit, detail: "Live beweging" },
  ];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/70 p-4 flex flex-wrap items-center gap-4 justify-between">
      <div className="flex gap-2">
        <button className="ghost-btn small" onClick={onRefresh}>Refresh</button>
        <button className="ghost-btn small">Escalatie log</button>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-muted">
        {cards.map((card) => (
          <div key={card.label}>
            <p className="uppercase tracking-[0.2em] text-xs">{card.label}</p>
            <p className="text-lg font-semibold text-slate-900">{card.value}</p>
            <p className="text-xs">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Hero({ onStartTracking, onViewOps, stats, spotlight }: HeroProps) {
  const highlightCards = [
    { label: "Open cases", value: stats.exceptions, detail: "Passagiers hulp" },
    { label: "Service level", value: `${Math.round(stats.onTime * 100)}%`, detail: "SLA" },
    { label: "Gem. afhandelduur", value: `${stats.avgTime} min`, detail: "Bagage & helpdesk" },
    { label: "System uptime", value: `${(stats.uptime * 100).toFixed(1)}%`, detail: "Platform" },
  ];
  const upcoming = statusSteps.find((step) => step.id === spotlight.currentStatus + 1);

  return (
    <header className="hero space-y-6 mt-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8">
          <p className="eyebrow text-slate-500">Control room</p>
          <h1 className="text-4xl font-semibold leading-snug text-slate-900">Track & Trace voor operators</h1>
          <p className="lede text-muted mt-4 max-w-2xl">
            Live overzicht van bagage en klantcases, ontworpen voor overzicht en snelle opvolging.
          </p>
          <div className="hero-ctas mt-6 flex flex-wrap gap-3">
            <button className="primary-btn" onClick={onStartTracking}>Ga naar track</button>
            <button className="ghost-btn" onClick={onViewOps}>Dashboard</button>
          </div>
        </div>
        <div className="glass rounded-3xl p-6 border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-slate-500">Spotlight zending</p>
              <h3 className="text-2xl font-semibold text-slate-900">{spotlight.id}</h3>
            </div>
            <span className="status-chip bg-emerald-100 text-emerald-900 border-emerald-200">
              {statusSteps.find((s) => s.id === spotlight.currentStatus)?.label}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Volgende stap: {upcoming ? upcoming.label : "Compleet"}</p>
          <div className="mt-4 space-y-3">
            {spotlight.history.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-muted text-xs">Status {item.status}</p>
                </div>
                <span className="text-slate-900 font-semibold">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted uppercase tracking-[0.2em]">Live feed</div>
          <div className="mt-2 rounded-2xl bg-slate-900/90 text-white p-4 font-mono text-xs space-y-1">
            <p>&gt; watch {spotlight.id}</p>
            <p>&gt; step {spotlight.currentStatus} acknowledged</p>
            <p>&gt; awaiting {upcoming ? upcoming.label : "handover"}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlightCards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-4 border">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
            <p className="text-xs text-muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </header>
  );
}

type TrackSectionProps = {
  bag: TraceRecord;
  bagInput: string;
  bagOptions: string[];
  error: string | null;
  onBagInputChange: (value: string) => void;
  onSelectBag: (value: string) => void;
  onTrack: () => void;
  onGenerateId: () => void;
  inputRef: RefObject<HTMLInputElement>;
  onCopyShare: (id: string) => void;
};

const TrackSection = forwardRef<HTMLElement, TrackSectionProps>(function TrackSectionComponent(
  { bag, bagInput, bagOptions, error, onBagInputChange, onSelectBag, onTrack, onGenerateId, inputRef, onCopyShare },
  ref,
) {
  const suggestionOptions = bagOptions.slice(0, 6);
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
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
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
        <div className="glass rounded-3xl p-5 border flex flex-col gap-4">
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
              <p className="text-muted">Laatst gescand door</p>
              <p className="font-semibold text-slate-900">AMS sorteer 04</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <p className="text-muted">Volgende checkpoint</p>
              <p className="font-semibold text-slate-900">
                {statusSteps.find((step) => step.id === bag.currentStatus + 1)?.label ?? "Compleet"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 border-l border-slate-200 pl-5">
        {statusSteps.map((step) => {
          const state = getState(step.id, bag.currentStatus);
          const historyItem = bag.history.find((h) => h.status === step.id);
          const descriptor = historyItem ? "Voltooid" : step.id === bag.currentStatus ? "Actief" : "In afwachting";
          return (
            <div key={step.id} className="relative pl-4">
              <span className={`absolute -left-[11px] top-1 flex h-3 w-3 rounded-full ${state === "complete" ? "bg-emerald-500" : state === "active" ? "bg-amber-400" : "bg-slate-200"}`} />
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-slate-900">{step.label}</strong>
                <span className="text-xs text-muted">{descriptor}</span>
              </div>
              <p className="text-xs text-muted">
                {historyItem ? `Scan: ${historyItem.time}` : "Nog geen scan"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
});

type DashboardProps = {
  shipments: typeof mockShipments;
  statusFilter: string;
  onFilterChange: (value: string) => void;
  onRefresh: () => void;
  onScan: () => void;
  onExport: () => void;
  trend: number[];
  throughputTrend: typeof mockKpiTrends.throughput;
  ontimeTrend: typeof mockKpiTrends.ontime;
  uptimeTrend: typeof mockKpiTrends.uptime;
  exceptionsBreakdown: typeof mockExceptionBreakdown;
  hubLoad: typeof mockHubLoad;
  toast: string | null;
  totalShipments: number;
  exceptions: number;
};

function DashboardSection({
  shipments,
  statusFilter,
  onFilterChange,
  onRefresh,
  onScan,
  onExport,
  trend,
  throughputTrend,
  ontimeTrend,
  uptimeTrend,
  exceptionsBreakdown,
  hubLoad,
  toast,
  totalShipments,
  exceptions,
}: DashboardProps) {
  const inTransit = shipments.filter((row) => row.status === "intransit").length;
  const arrived = shipments.filter((row) => row.status === "arrived").length;
  const summary = [
    { label: "Live bags", value: totalShipments, hint: "Realtime" },
    { label: "In transit", value: inTransit, hint: "Onderweg" },
    { label: "Aangekomen", value: arrived, hint: "Laatste uur" },
    { label: "Open cases", value: exceptions, hint: "Support" },
  ];
  const peakTraffic = trend.length ? Math.max(...trend) : 0;
  const throughputNow = throughputTrend[throughputTrend.length - 1];
  const onTimeNow = ontimeTrend[ontimeTrend.length - 1];
  const uptimeNow = uptimeTrend[uptimeTrend.length - 1];
  const exceptionTotal = exceptionsBreakdown.reduce((sum, entry) => sum + entry.value, 0);
  const busiestHub = hubLoad.reduce<{ label: string; total: number }>(
    (acc, hub) => {
      const total = hub.inbound + hub.outbound;
      return total > acc.total ? { label: hub.hub, total } : acc;
    },
    hubLoad.length > 0
      ? { label: hubLoad[0].hub, total: hubLoad[0].inbound + hubLoad[0].outbound }
      : { label: "-", total: 0 },
  );

  return (
    <section id="ops" className="mt-16 space-y-6 w-full max-w-7xl mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Operator view</p>
            <h2 className="text-3xl font-semibold text-slate-900">Monitor</h2>
            <p className="text-muted">Gebruik filters, scan nieuwe labels en houd het netwerk gezond.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="ghost-select"
              value={statusFilter}
              onChange={(event) => onFilterChange(event.target.value)}
              aria-label="Filter op status"
            >
              <option value="all">Alle status</option>
              <option value="intransit">In transit</option>
              <option value="arrived">Aangekomen</option>
              <option value="exception">Exception</option>
            </select>
            <button className="ghost-btn small" onClick={onRefresh}>Refresh</button>
            {statusFilter !== "all" && (
              <button className="ghost-btn small" onClick={() => onFilterChange("all")}>Reset</button>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{item.value}</p>
              <p className="text-xs text-muted">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Netwerkvolume</h3>
                <p className="text-sm text-muted">Laatste 7 dagen verkeersdata</p>
              </div>
              <div className="text-right text-sm text-muted">
                <p>Piek</p>
                <p className="text-lg font-semibold text-slate-900">{peakTraffic} bags</p>
              </div>
            </div>
            <div className="px-4 pb-4 pt-2">
              <TrendChart data={trend} />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Live shipments</h3>
                <p className="text-sm text-muted">Klik voor details of scan nieuw label.</p>
              </div>
              <div className="flex gap-2">
                <button className="ghost-btn small" onClick={onScan}>Scan</button>
                <button className="ghost-btn small" onClick={onExport}>Export</button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-5 gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted bg-slate-50">
                <span>ID</span>
                <span>Status</span>
                <span>ETA</span>
                <span>Hub</span>
                <span className="text-right">Actie</span>
              </div>
              {shipments.length === 0 ? (
                <div className="px-5 py-6 text-sm text-muted">
                  Geen zendingen in deze filter. Gebruik reset om alles te tonen.
                </div>
              ) : (
                shipments.map((row) => (
                  <div key={row.id} className="grid grid-cols-5 gap-2 px-5 py-4 items-center text-sm text-slate-900 hover:bg-slate-50">
                    <span className="font-mono">{row.id}</span>
                    <span className={`pill font-semibold ${getShipmentTone(row.status)}`}>{row.label}</span>
                    <span>{row.eta}</span>
                    <span>{row.hub}</span>
                    <span className="text-right text-accent font-semibold"><a href="#track">Open</a></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <KpiChartCard
                title="Doorvoer per uur"
                description="Laatste 6 tijdsloten"
                highlight={throughputNow ? `${throughputNow.value} bags/u` : "-"}
              >
              <ThroughputChart data={throughputTrend} />
            </KpiChartCard>
            <KpiChartCard
              title="On-time performance"
              description="Doel 97%"
              highlight={onTimeNow ? `${onTimeNow.value.toFixed(1)}%` : "-"}
            >
              <OnTimeChart data={ontimeTrend} />
            </KpiChartCard>
            <KpiChartCard
              title="Systeem uptime"
              description="Laatste week"
              highlight={uptimeNow ? `${uptimeNow.value.toFixed(2)}%` : "-"}
            >
              <UptimeGauge data={uptimeTrend} />
            </KpiChartCard>
            <KpiChartCard
              title="Exception oorzaken"
              description="Laatste 24 uur"
              highlight={`${exceptionTotal} meldingen`}
            >
              <ExceptionBarChart data={exceptionsBreakdown} />
            </KpiChartCard>
              <KpiChartCard
                title="Hub belasting"
                description="Inbound + outbound"
                highlight={`${busiestHub.label} · ${busiestHub.total} bags`}
              >
                <HubLoadChart data={hubLoad} />
              </KpiChartCard>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>
            <p className="text-sm text-muted">Automatische meldingen vanuit hubs.</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-900">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Hub AMS running smooth</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />Check exception queue</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" />RTM band 2 vertraagd</li>
            </ul>
          </div>
        </div>
      </div>
      <div aria-live="polite" role="status">
        {toast && <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-900">{toast}</div>}
      </div>
    </section>
  );
}

type KpiChartCardProps = {
  title: string;
  description?: string;
  highlight?: string;
  children: ReactNode;
};

function KpiChartCard({ title, description, highlight, children }: KpiChartCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{title}</p>
          {description && <p className="text-sm text-muted normal-case tracking-normal">{description}</p>}
        </div>
        {highlight && <p className="text-lg font-semibold text-slate-900 text-right break-words">{highlight}</p>}
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </article>
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
