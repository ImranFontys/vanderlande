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
  { id: "bag001", status: "intransit", eta: "10:15", hub: "AMS", label: "Geladen" },
  { id: "bag002", status: "arrived", eta: "09:40", hub: "AMS", label: "Op band" },
  { id: "bag003", status: "exception", eta: "11:20", hub: "RTM", label: "Sorteer" },
  { id: "bag004", status: "arrived", eta: "11:32", hub: "EIN", label: "Afgehaald" },
  { id: "bag005", status: "intransit", eta: "12:05", hub: "AMS", label: "Onderweg" },
];

export const mockTrend = [40, 52, 48, 60, 70, 68, 82];
