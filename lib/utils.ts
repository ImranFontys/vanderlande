import { statusSteps } from "./mockData";

type StatusId = (typeof statusSteps)[number]["id"];

export type TraceRecord = {
  id: string;
  currentStatus: StatusId;
  history: ReadonlyArray<Readonly<{ status: StatusId; label: string; time: string }>>;
};

export function getState(stepId: number, currentId: number) {
  if (stepId < currentId) return "complete";
  if (stepId === currentId) return "active";
  return "upcoming";
}

export function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

export function buildTraceRecord(id: string): TraceRecord {
  const now = Date.now();
  const progressIndex = Math.floor(Math.random() * statusSteps.length);
  const history = statusSteps.slice(0, progressIndex + 1).map((step, index) => ({
    status: step.id,
    label: step.label,
    time: new Date(now + index * 12 * 60000).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
  }));
  return {
    id,
    currentStatus: statusSteps[progressIndex].id,
    history,
  };
}
