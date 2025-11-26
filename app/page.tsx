import { KPICard } from "@/components/KPICard";
import { TraceProgress } from "@/components/TraceProgress";
import { TrendChart } from "@/components/TrendChart";
import { mockShipments, mockTrend, mockTrace, statusSteps } from "@/lib/mockData";
import { getState } from "@/lib/utils";

export default function Page() {
  // Static data for now; could be replaced with TanStack Query + API calls
  return (
    <div className="page px-4 pb-12">
      <Hero />
      <TrackSection />
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
        <h1 className="text-4xl font-bold text-text">Glass iOS 26 Track & Trace</h1>
        <p className="lede text-muted mt-2">
          Eén duidelijke statusbalk, iconische stappen en operator-dashboard. Modern, helder en gebouwd voor snelheid en vertrouwen.
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

function TrackSection() {
  const bag = mockTrace.bag001;
  return (
    <section id="track" className="card glass rounded-xl2 p-5 border mt-8">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="eyebrow">Track & Trace</p>
          <h2 className="text-2xl font-semibold">Zoek je zending</h2>
          <p className="muted">Voorbeeld ID&apos;s: bag001, bag002, bag003.</p>
        </div>
        <span className="live-indicator"><span className="pulse" />Live</span>
      </div>
      <div className="glass rounded-xl2 p-4 border mb-3 flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="bagInput" className="text-sm font-semibold text-muted">Zending-ID</label>
          <input id="bagInput" name="bagId" placeholder="bijv. bag001" className="rounded-xl border px-3 py-2" defaultValue="bag001" />
        </div>
        <div className="flex gap-2">
          <button className="primary-btn">Track</button>
          <button className="ghost-btn">Genereer ID</button>
        </div>
      </div>
      <div className="status-meta mb-2 flex items-center justify-between gap-3">
        <div className="status-chip">Status: {statusSteps.find((s) => s.id === bag.currentStatus)?.label}</div>
        <div className="meta-inline text-sm text-muted flex gap-3">
          <span>ID: {bag.id}</span>
          <span>Laatste update: {bag.history[bag.history.length - 1]?.time ?? "-"}</span>
        </div>
      </div>

      <TraceProgress current={bag.currentStatus} />
      <div className="timeline mt-4 flex flex-col gap-3">
        {statusSteps.map((step) => {
          const state = getState(step.id, bag.currentStatus);
          const historyItem = bag.history.find((h) => h.status === step.id);
          const descriptor = historyItem ? "Stap voltooid" : step.id === bag.currentStatus ? "Actieve stap" : "Nog niet bereikt";
          return (
            <div key={step.id} className="glass rounded-xl2 p-3 border flex gap-3 items-start">
              <div className={`badge-icon ${state}`}>
                <span className="pill">{step.label[0]}</span>
              </div>
              <div className="flex-1">
                <header className="flex justify-between gap-2 items-start">
                  <strong className="text-lg">{step.label}</strong>
                  <span className={`chip ${state}`}>{descriptor}</span>
                </header>
                <p className="text-muted mt-1">
                  {historyItem ? `Tijdstempel: ${historyItem.time}` : "Tijdstempel volgt zodra de stap is bereikt."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
        <KPICard title="Totaal in transit" value="5" tone="good" />
        <KPICard title="On time" value="96.4%" tone="good" />
        <KPICard title="Exceptions" value="24" tone="bad" hint="+4 vs gister" />
        <KPICard title="Aankomsten" value="312" tone="warn" hint="Vandaag" />
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
