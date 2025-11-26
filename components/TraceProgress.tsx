import { statusSteps } from "@/lib/mockData";
import { getState } from "@/lib/utils";
import { LucideIcon, BaggageClaim, Cog, PlaneTakeoff, PlaneLanding, Luggage, CheckCircle2 } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BaggageClaim,
  Cog,
  PlaneTakeoff,
  PlaneLanding,
  Luggage,
  CheckCircle2,
};

type Props = { current: number };

export function TraceProgress({ current }: Props) {
  const total = statusSteps.length - 1;
  const completed = Math.max(0, current - 1);
  const percent = (completed / total) * 100;

  return (
    <div className="progress-shell glass mt-3">
      <div className="progress-rail relative h-2 rounded-full bg-slate-200">
        <div
          className="progress-fill absolute inset-0 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="status-markers flex flex-wrap justify-between gap-2 pt-3">
        {statusSteps.map((step) => {
          const state = getState(step.id, current);
          const Icon = iconMap[step.icon];
          return (
            <div key={step.id} className="marker grid justify-items-center gap-2 w-24 text-center">
              <div
                className={`marker-icon ${
                  state === "complete"
                    ? "bg-green-100 text-green-900 border-green-200"
                    : state === "active"
                      ? "bg-orange-100 text-orange-900 border-orange-200"
                      : "bg-white/70 text-slate-600 border-slate-200"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="text-xs text-muted leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
