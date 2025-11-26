export function getState(stepId: number, currentId: number) {
  if (stepId < currentId) return "complete";
  if (stepId === currentId) return "active";
  return "upcoming";
}

export function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}
