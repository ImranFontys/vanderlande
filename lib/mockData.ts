export const statusSteps = [
  { id: 1, label: "Ingecheckt", icon: "BaggageClaim" },
  { id: 2, label: "In sorteercentrum", icon: "Cog" },
  { id: 3, label: "Geladen op vliegtuig", icon: "PlaneTakeoff" },
  { id: 4, label: "Aangekomen", icon: "PlaneLanding" },
  { id: 5, label: "Op bagageband", icon: "Luggage" },
  { id: 6, label: "Opgehaald", icon: "CheckCircle2" },
] as const;

export const mockTrace = {
  bag001: {
    id: "bag001",
    currentStatus: 3,
    history: [
      { status: 1, label: "Ingecheckt", time: "09:12" },
      { status: 2, label: "In sorteercentrum", time: "09:30" },
      { status: 3, label: "Geladen op vliegtuig", time: "10:15" },
    ],
  },
  bag002: {
    id: "bag002",
    currentStatus: 5,
    history: [
      { status: 1, label: "Ingecheckt", time: "07:05" },
      { status: 2, label: "In sorteercentrum", time: "07:18" },
      { status: 3, label: "Geladen op vliegtuig", time: "07:55" },
      { status: 4, label: "Aangekomen", time: "09:25" },
      { status: 5, label: "Op bagageband", time: "09:40" },
    ],
  },
  bag003: {
    id: "bag003",
    currentStatus: 2,
    history: [
      { status: 1, label: "Ingecheckt", time: "11:02" },
      { status: 2, label: "In sorteercentrum", time: "11:20" },
    ],
  },
  bag004: {
    id: "bag004",
    currentStatus: 6,
    history: [
      { status: 1, label: "Ingecheckt", time: "08:42" },
      { status: 2, label: "In sorteercentrum", time: "08:58" },
      { status: 3, label: "Geladen op vliegtuig", time: "09:35" },
      { status: 4, label: "Aangekomen", time: "11:00" },
      { status: 5, label: "Op bagageband", time: "11:20" },
      { status: 6, label: "Opgehaald", time: "11:32" },
    ],
  },
} as const;

export const mockKpis = {
  avgTime: 18,
  ontime: 0.964,
  exceptions: 24,
  arrivals: 312,
  uptime: 0.999,
};

export const mockShipments = [
  {
    id: "bag001",
    status: "intransit",
    eta: "10:15",
    hub: "AMS",
    label: "Geladen",
    flight: "HV123",
    belt: "B05",
    sorter: "Noord",
    position: "Lane 2 · scanner 14",
    incident: null,
    lastUpdateMinutes: 8,
  },
  {
    id: "bag002",
    status: "arrived",
    eta: "09:40",
    hub: "AMS",
    label: "Op band",
    flight: "KL987",
    belt: "B08",
    sorter: "Band 8",
    position: "Band 8 · 32m",
    incident: null,
    lastUpdateMinutes: 4,
  },
  {
    id: "bag003",
    status: "exception",
    eta: "11:20",
    hub: "RTM",
    label: "Sorteer",
    flight: "HV555",
    belt: "B03",
    sorter: "West",
    position: "Chute 4 · label mismatch",
    incident: "Label mismatch",
    lastUpdateMinutes: 12,
  },
  {
    id: "bag004",
    status: "arrived",
    eta: "11:32",
    hub: "EIN",
    label: "Afgehaald",
    flight: "HV123",
    belt: "B02",
    sorter: "Band 2",
    position: "Band 2 · 6m",
    incident: null,
    lastUpdateMinutes: 2,
  },
  {
    id: "bag005",
    status: "intransit",
    eta: "12:05",
    hub: "AMS",
    label: "Onderweg",
    flight: "KL987",
    belt: "B07",
    sorter: "Noord",
    position: "Lane 1 · camera 3",
    incident: null,
    lastUpdateMinutes: 22,
  },
];

export const mockSorters = [
  { name: "Sorter Noord", utilization: 0.82, state: "warning", alerts: 2, belt: "Lane 2", detail: "Label leesproblemen" },
  { name: "Sorter West", utilization: 0.64, state: "stable", alerts: 0, belt: "Chute 4", detail: "Flow normaal" },
  { name: "Band 8", utilization: 0.55, state: "stable", alerts: 0, belt: "Gate D", detail: "Aankomst binnen" },
] as const;

export const mockBelts = [
  { belt: "Band 2", flight: "KL987", gate: "D2", load: 0.64, status: "running", bags: 36 },
  { belt: "Band 5", flight: "HV123", gate: "E5", load: 0.78, status: "holding", bags: 42 },
  { belt: "Band 7", flight: "HV555", gate: "B7", load: 0.32, status: "running", bags: 18 },
  { belt: "Band 8", flight: "KL987", gate: "C1", load: 0.9, status: "jam", bags: 54 },
] as const;

export const mockAlerts = [
  { id: "AL-204", severity: "critical", title: "JAM · lane 2", detail: "Sorter Noord · chute geblokkeerd", time: "1m" },
  { id: "AL-198", severity: "warning", title: "Scanner drift", detail: "Band 5 · camera 3 uitlijning", time: "4m" },
  { id: "AL-186", severity: "info", title: "Preventief onderhoud", detail: "Band 8 · service in 30 min", time: "30m" },
] as const;

export const mockTrend = [40, 52, 48, 60, 70, 68, 82];

export const mockKpiTrends = {
  throughput: [
    { label: "06:00", value: 124 },
    { label: "07:00", value: 142 },
    { label: "08:00", value: 168 },
    { label: "09:00", value: 176 },
    { label: "10:00", value: 162 },
    { label: "11:00", value: 150 },
  ],
  ontime: [
    { label: "ma", value: 95.2 },
    { label: "di", value: 96.1 },
    { label: "wo", value: 94.7 },
    { label: "do", value: 97.5 },
    { label: "vr", value: 96.8 },
    { label: "za", value: 95.9 },
    { label: "zo", value: 94.4 },
  ],
  uptime: [
    { label: "ma", value: 99.5 },
    { label: "di", value: 99.7 },
    { label: "wo", value: 99.3 },
    { label: "do", value: 99.8 },
    { label: "vr", value: 99.9 },
    { label: "za", value: 99.6 },
    { label: "zo", value: 99.4 },
  ],
};

export const mockExceptionBreakdown = [
  { label: "Security check", value: 12 },
  { label: "Sorteer vertraging", value: 8 },
  { label: "Transfer", value: 6 },
  { label: "Label mismatch", value: 4 },
];

export const mockHubLoad = [
  { hub: "AMS", inbound: 182, outbound: 174 },
  { hub: "RTM", inbound: 74, outbound: 69 },
  { hub: "EIN", inbound: 58, outbound: 64 },
];

export const mockFlights = ["HV123", "KL987", "HV555"];

export const mockIncidentSeries = [
  { label: "ma", value: 6 },
  { label: "di", value: 4 },
  { label: "wo", value: 5 },
  { label: "do", value: 3 },
  { label: "vr", value: 4 },
  { label: "za", value: 2 },
  { label: "zo", value: 3 },
];

export const mockHourlyLoad = [
  { hour: "06:00", load: 0.54, exceptions: 1 },
  { hour: "08:00", load: 0.68, exceptions: 2 },
  { hour: "10:00", load: 0.81, exceptions: 3 },
  { hour: "12:00", load: 0.77, exceptions: 2 },
  { hour: "14:00", load: 0.63, exceptions: 1 },
  { hour: "16:00", load: 0.71, exceptions: 2 },
  { hour: "18:00", load: 0.52, exceptions: 1 },
  { hour: "20:00", load: 0.45, exceptions: 0 },
];

export const mockFinanceSummary = {
  incidents: 42,
  avoidedIncidents: 18,
  handledCases: 320,
  deflectedCalls: 260,
  avoidedPenalties: 4,
  totalOpsCost: 120_000,
  totalBagsProcessed: 8_600,
  incidentCost: 6_300,
  avoidedIncidentCost: 2_700,
  timeSavedHours: 533.33,
  fteSaved: 0.31,
  laborSavings: 22_386,
  callDeflectionSavings: 1_560,
  slaPenaltyAvoided: 3_200,
  costPerBag: 13.95,
  totalSavings: 34_546,
  roiPercent: 19.12,
  paybackMonths: 6.67,
};
