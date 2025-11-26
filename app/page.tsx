import { KPICard } from "@/components/KPICard";
import { TrendChart } from "@/components/TrendChart";
import { TrackSection } from "@/components/TrackSection";
import { CommandBar } from "@/components/CommandBar";
import { mockKpis, mockShipments, mockTrend, mockTrace } from "@/lib/mockData";

export default function Page() {
  return (
    <div className="page px-4 pb-12 space-y-10">
      <CommandBar />
      <Hero />
      <TrackSection traceData={mockTrace} />
      <DashboardSection />
      <SupportSection />
    </div>
  );
}

function Hero() {
  return (
    <header className="hero grid gap-6 lg:grid-cols-2 mt-4">
      <div className="glass rounded-xl2 p-6 border">
        <p className="eyebrow">Logistiek · Realtime</p>
        <h1 className="text-4xl font-bold text-text">Vanderlande Track & Trace</h1>
        <p className="lede text-muted mt-2">
          Eén duidelijke statusbalk, heldere workflow en operator-dashboard. Minimal, professioneel en klaar voor live use-cases.
        </p>
        <div className="hero-ctas mt-4 flex gap-3 flex-wrap">
          <a className="primary-btn" href="#track">Start tracking</a>
          <a className="ghost-btn" href="#ops">Bekijk operations</a>
        </div>
      </div>
      <div className="hero-metric glass rounded-xl2 p-5 border flex items-center gap-6 justify-between">
        <div>
          <p className="muted text-sm">Gem. afhandelduur</p>
          <h2 className="text-3xl font-semibold">18m <span className="muted text-sm">/ zending</span></h2>
        </div>
        <div className="divider h-16 w-px bg-slate-200" />
        <div>
          <p className="muted text-sm">Betrouwbaarheid</p>
          <h2 className="text-3xl font-semibold">99.2%</h2>
        </div>
      </div>
    </header>
  );
}

function DashboardSection() {
  return (
    <section id="ops" className="dashboard glass rounded-xl2 p-5 border mt-10 bg-slate-900 text-slate-100">
      <div className="dashboard-head flex items-center justify-between">
        <div>
          <p className="eyebrow text-slate-300">Operator view</p>
          <h2 className="text-2xl font-semibold text-white">Business dashboard</h2>
          <p className="text-slate-300">Dark header met glasaccenten en snelle filters.</p>
        </div>
        <div className="filters flex gap-2">
          <select className="ghost-select bg-white/10 border border-white/20 rounded-lg px-2 py-1">
            <option>Alle status</option>
            <option>In transit</option>
            <option>Aangekomen</option>
            <option>Exception</option>
          </select>
          <button className="ghost-btn small bg-white/10 border border-white/20 text-white">Refresh</button>
        </div>
      </div>

      <div className="kpi-grid grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <KPICard title="Gem. afhandelduur" value={`${mockKpis.avgTime}m`} tone="good" />
        <KPICard title="On time" value={`${Math.round(mockKpis.ontime * 100)}%`} tone="good" />
        <KPICard title="Exceptions" value={String(mockKpis.exceptions)} tone="bad" hint="+4 vs gister" />
        <KPICard title="Aankomsten" value={String(mockKpis.arrivals)} tone="warn" hint="Vandaag" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="table-card glass rounded-xl2 border p-3">
          <div className="table-head flex items-center justify-between mb-2 text-white">
            <h3 className="text-lg font-semibold">Live shipments</h3>
            <div className="table-actions flex gap-2">
              <button className="ghost-btn small bg-white/10 border border-white/20 text-white">Scan</button>
              <button className="ghost-btn small bg-white/10 border border-white/20 text-white">Export</button>
            </div>
          </div>
          <div className="table grid gap-2">
            <div className="table-row table-row-head grid grid-cols-5 gap-2 text-xs font-semibold text-slate-200 bg-white/10 rounded-lg px-2 py-2">
              <span>ID</span><span>Status</span><span>ETA</span><span>Hub</span><span>Actie</span>
            </div>
            {mockShipments.map((row) => (
              <div key={row.id} className="table-row grid grid-cols-5 gap-2 bg-white/5 rounded-lg px-2 py-2 text-sm">
                <span>{row.id}</span>
                <span className="pill pill-yellow">{row.label}</span>
                <span>{row.eta}</span>
                <span>{row.hub}</span>
                <span><a href="#track" className="text-accent-2 font-semibold">Open</a></span>
              </div>
            ))}
          </div>
        </div>
        <TrendChart data={mockTrend} />
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section id="support" className="mobile-cta glass rounded-xl2 p-5 border mt-10">
      <div>
        <p className="eyebrow">Mobile-first</p>
        <h2 className="text-2xl font-semibold">Track & Trace op mobiel</h2>
        <p className="muted">QR/barcode-scan, compacte kaarten, één-tap acties.</p>
      </div>
      <div className="mobile-actions flex gap-3 mt-3 flex-wrap">
        <button className="primary-btn">Scan label</button>
        <button className="ghost-btn">Download app</button>
      </div>
    </section>
  );
}
