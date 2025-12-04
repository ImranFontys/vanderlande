"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  mockExceptionBreakdown,
  mockFinanceSummary,
  mockFlights,
  mockHourlyLoad,
  mockHubLoad,
  mockIncidentSeries,
  mockKpiTrends,
  mockKpis,
} from "@/lib/mockData";
import { useMemo, useState } from "react";

const periodOptions = [
  { value: "day", label: "Dag" },
  { value: "week", label: "Week" },
  { value: "month", label: "Maand" },
];

const hubOptions = ["all", ...mockHubLoad.map((row) => row.hub)];

const numberFormat = (value: number) => value.toLocaleString("nl-NL");
const euroFormat = (value: number) => `€ ${numberFormat(Math.round(value))}`;
const percentFormat = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function InsightsPage() {
  const [period, setPeriod] = useState("week");
  const [flight, setFlight] = useState<string>("all");
  const [hub, setHub] = useState<string>("all");

  const incidentsPerDay = useMemo(
    () => Math.round(mockIncidentSeries.reduce((sum, row) => sum + row.value, 0) / mockIncidentSeries.length),
    []
  );

  const kpiTiles = useMemo(
    () => [
      {
        label: "Koffers op tijd",
        value: percentFormat(mockKpis.ontime),
        helper: "Laatste 7 dagen",
        tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
      },
      {
        label: "Gem. doorlooptijd",
        value: `${mockKpis.avgTime} min`,
        helper: "Check-in → band",
        tone: "bg-slate-900 text-white",
      },
      {
        label: "Open uitzonderingen",
        value: numberFormat(mockKpis.exceptions),
        helper: "Direct oppakken",
        tone: "bg-amber-50 text-amber-900 border-amber-200",
      },
      {
        label: "Beschikbaarheid sorteer",
        value: percentFormat(mockKpis.uptime),
        helper: "Systeem-uptime",
        tone: "bg-blue-50 text-blue-900 border-blue-200",
      },
      {
        label: "Bags verwerkt (24u)",
        value: numberFormat(mockKpis.arrivals),
        helper: "Afgehandeld afgelopen dag",
        tone: "bg-white text-slate-900 border-slate-200",
      },
      {
        label: "Doorvoer (p/u)",
        value: `${Math.round(mockKpis.arrivals / 4)} p/u`,
        helper: "Gemiddelde van live meetpunt",
        tone: "bg-slate-50 text-slate-900 border-slate-200",
      },
    ],
    []
  );

  const financeTiles = useMemo(
    () => [
      { label: "Totale besparing", value: euroFormat(mockFinanceSummary.totalSavings), tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      { label: "Labor savings", value: euroFormat(mockFinanceSummary.laborSavings), tone: "bg-slate-50 text-slate-900 border-slate-200" },
      { label: "Call deflection", value: euroFormat(mockFinanceSummary.callDeflectionSavings), tone: "bg-blue-50 text-blue-900 border-blue-200" },
      { label: "Avoided incident cost", value: euroFormat(mockFinanceSummary.avoidedIncidentCost), tone: "bg-amber-50 text-amber-900 border-amber-200" },
      { label: "Cost per bag", value: `€ ${mockFinanceSummary.costPerBag.toFixed(2)}`, tone: "bg-white text-slate-900 border-slate-200" },
      { label: "ROI", value: `${mockFinanceSummary.roiPercent.toFixed(1)}%`, tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      { label: "Payback", value: `${mockFinanceSummary.paybackMonths.toFixed(1)} mnd`, tone: "bg-white text-slate-900 border-slate-200" },
    ],
    []
  );

  const filteredHubLoad = useMemo(
    () => (hub === "all" ? mockHubLoad : mockHubLoad.filter((row) => row.hub === hub)),
    [hub]
  );

  const throughputData = useMemo(
    () => mockKpiTrends.throughput.map((row) => ({ ...row, baseline: 150 })),
    []
  );

  const kpiFramework = useMemo(
    () => ({
      operational: [
        { label: "Doorlooptijd per koffer", value: `${mockKpis.avgTime} min`, helper: "Check-in → band" },
        { label: "Incidenten per dag", value: `${incidentsPerDay} / dag`, helper: "Gem. laatste 7 dagen" },
        { label: "Oplostijd incidenten", value: "18 min", helper: "Gemiddeld oppakken en oplossen" },
        { label: "Realtime gevolgd", value: "96%", helper: "Labels met live updates" },
      ],
      customer: [
        { label: "Klantvragen over bagage", value: "48 / dag", helper: "Contactmomenten over status" },
        { label: "Tevredenheid info", value: "4.6 / 5", helper: "Score op duidelijkheid updates" },
      ],
      technical: [
        { label: "Uptime", value: percentFormat(mockKpis.uptime), helper: "Beschikbaarheid sorteer & data" },
        { label: "Foutpercentage datastromen", value: "0,3%", helper: "Mismatch of ontbrekende scans" },
        { label: "Dataverwerking", value: "320 ms", helper: "Gemiddelde latency ingest → dashboard" },
      ],
    }),
    [incidentsPerDay]
  );

  return (
    <main className="page px-4 py-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Insights</p>
            <h1 className="text-4xl font-semibold text-slate-900">Operations & service in één oogopslag</h1>
            <p className="text-muted text-sm">
              Duidelijke KPI&apos;s: op tijd, doorlooptijd, uitzonderingen en financiële impact. Filter om te verdiepen.
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/" className="ghost-btn">Passagier</a>
            <a href="/operator" className="ghost-btn">Operator</a>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm text-muted">
            Periode
            <select
              className="ghost-select ml-2"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Filter periode"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            Vlucht
            <select
              className="ghost-select ml-2"
              value={flight}
              onChange={(event) => setFlight(event.target.value)}
              aria-label="Filter vlucht"
            >
              <option value="all">Alle vluchten</option>
              {mockFlights.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            Hub
            <select
              className="ghost-select ml-2"
              value={hub}
              onChange={(event) => setHub(event.target.value)}
              aria-label="Filter hub"
            >
              {hubOptions.map((option) => (
                <option key={option} value={option}>{option === "all" ? "Alle hubs" : option}</option>
              ))}
            </select>
          </label>
          <span className="text-xs text-muted">Demo-data · visuele trends voor uitleg</span>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">KPI-set</p>
            <h2 className="text-2xl font-semibold text-slate-900">Effectiviteit meten</h2>
            <p className="text-sm text-muted">Operationeel, klantgericht en technisch — in één overzicht.</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Operationeel</p>
            <ul className="space-y-2 text-sm">
              {kpiFramework.operational.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-muted">{item.helper}</p>
                  </div>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Klantgericht</p>
            <ul className="space-y-2 text-sm">
              {kpiFramework.customer.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-muted">{item.helper}</p>
                  </div>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Technisch</p>
            <ul className="space-y-2 text-sm">
              {kpiFramework.technical.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-muted">{item.helper}</p>
                  </div>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpiTiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-3xl border p-4 shadow-soft ${tile.tone}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{tile.label}</p>
            <p className="text-2xl font-semibold mt-2">{tile.value}</p>
            {tile.helper && <p className="text-xs text-muted mt-1">{tile.helper}</p>}
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr] items-start">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Doorstroom per uur vs target</h2>
            <span className="pill pill-green">Live</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Doorstroom (p/u)" stroke="#f97316" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted mt-2">Kijk of de live doorvoer de target (grijs) haalt en piekmomenten zichtbaar zijn.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Top redenen voor uitzonderingen</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockExceptionBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Aantal" fill="#f97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted mt-2">Focus op de grootste oorzaken om wachttijd en klantimpact te verlagen.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr] items-start">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Exceptions per dag (laatste week)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockIncidentSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Afwijkingen" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted mt-2">Trend per dag helpt pieken in bemensing of herconfiguratie te plannen.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">In- en outbound per hub</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredHubLoad} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="hub" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" name="Inbound" fill="#6366f1" radius={[0, 10, 10, 0]} />
                <Bar dataKey="outbound" name="Outbound" fill="#f97316" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted mt-2">Vergelijk hubs om capaciteit te sturen of rotaties te plannen.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Financiële impact (model)</h2>
          <span className="pill pill-orange">Demo-data</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            financeTiles.find((t) => t.label === "Totale besparing"),
            financeTiles.find((t) => t.label === "Cost per bag"),
            financeTiles.find((t) => t.label === "ROI"),
            financeTiles.find((t) => t.label === "Payback"),
          ]
            .filter(Boolean)
            .map((tile) => (
              <div
                key={tile!.label}
                className={`rounded-3xl border p-4 shadow-soft ${tile!.tone}`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{tile!.label}</p>
                <p className="text-xl font-semibold mt-1">{tile!.value}</p>
                <p className="text-xs text-muted mt-1">
                  {tile!.label === "Totale besparing" && "Som van arbeid, calls en penalties."}
                  {tile!.label === "Cost per bag" && "Gemiddelde kosten voor verwerking."}
                  {tile!.label === "ROI" && "Op basis van projectkosten."}
                  {tile!.label === "Payback" && "Maanden tot terugverdiend."}
                </p>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Waarom deze besparing?</h2>
          <span className="pill pill-green">Uitleg</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr,1fr,1fr]">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">Drivers (maand)</p>
            <ul className="text-sm text-muted space-y-2">
              <li className="flex justify-between"><span>Vermeden incidenten</span><span className="font-semibold text-slate-900">{mockFinanceSummary.avoidedIncidents}</span></li>
              <li className="flex justify-between"><span>Afgehandelde cases</span><span className="font-semibold text-slate-900">{mockFinanceSummary.handledCases}</span></li>
              <li className="flex justify-between"><span>Deflected calls</span><span className="font-semibold text-slate-900">{mockFinanceSummary.deflectedCalls}</span></li>
              <li className="flex justify-between"><span>Uren bespaard</span><span className="font-semibold text-slate-900">{mockFinanceSummary.timeSavedHours.toFixed(1)} u</span></li>
            </ul>
            <p className="text-xs text-muted">Impact gevoed door minder incidenten, minder calls en sneller afhandelen.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">Hoe berekend</p>
            <ul className="text-sm text-muted space-y-2">
              <li>Incidentkosten: incidenten × avg_cost_per_incident → <span className="font-semibold text-slate-900">{euroFormat(mockFinanceSummary.incidentCost)}</span></li>
              <li>Call deflection: deflected_calls × cost_per_call → <span className="font-semibold text-slate-900">{euroFormat(mockFinanceSummary.callDeflectionSavings)}</span></li>
              <li>Arbeid: (baseline - nieuw) × cases → <span className="font-semibold text-slate-900">{euroFormat(mockFinanceSummary.laborSavings)}</span></li>
              <li>SLA/penalties vermeden → <span className="font-semibold text-slate-900">{euroFormat(mockFinanceSummary.slaPenaltyAvoided)}</span></li>
            </ul>
            <p className="text-xs text-muted">Som = totale besparing. ROI/payback volgen direct uit projectkosten.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">Per label & marges</p>
            <ul className="text-sm text-muted space-y-2">
              <li className="flex justify-between"><span>Cost per bag</span><span className="font-semibold text-slate-900">€ {mockFinanceSummary.costPerBag.toFixed(2)}</span></li>
              <li className="flex justify-between"><span>ROI</span><span className="font-semibold text-emerald-700">{mockFinanceSummary.roiPercent.toFixed(1)}%</span></li>
              <li className="flex justify-between"><span>Payback</span><span className="font-semibold text-slate-900">{mockFinanceSummary.paybackMonths.toFixed(1)} mnd</span></li>
              <li className="flex justify-between"><span>Totaal besparing</span><span className="font-semibold text-emerald-700">{euroFormat(mockFinanceSummary.totalSavings)}</span></li>
            </ul>
            <p className="text-xs text-muted">Gebruik filters bovenaan om per periode of hub te analyseren.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Heatmap drukte per uur</h2>
          <span className="text-xs text-muted">Hogere kleur = meer load</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {mockHourlyLoad.map((slot) => (
            <div key={slot.hour} className="rounded-2xl border border-slate-100 p-3 bg-slate-50">
              <p className="text-xs text-muted">{slot.hour}</p>
              <div
                className="mt-2 h-10 rounded-xl"
                style={{
                  background: `linear-gradient(90deg, rgba(249,115,22,0.2) ${slot.load * 100}%, rgba(226,232,240,0.8) ${slot.load * 100}%)`,
                }}
                aria-hidden
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>Load</span>
                <span className="font-semibold text-slate-900">{Math.round(slot.load * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Exceptions</span>
                <span className="font-semibold text-amber-800">{slot.exceptions}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
