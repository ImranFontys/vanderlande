import { statusSteps } from "@/lib/mockData";
import { getState } from "@/lib/utils";
import { LucideIcon, BaggageClaim, Cog, PlaneTakeoff, PlaneLanding, Luggage, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  BaggageClaim,
  Cog,
  PlaneTakeoff,
  PlaneLanding,
  Luggage,
  CheckCircle2,
};

type Step = { id: number; label: string; icon: keyof typeof iconMap };
type Props = { current: number; steps?: ReadonlyArray<Step> };

export function TraceProgress({ current, steps = statusSteps }: Props) {
  const total = steps.length - 1;
  const completed = Math.max(0, current - 1);
  const percent = (completed / total) * 100;
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setFill(percent / 100);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [percent, current]);

  return (
    <div className="progress-shell glass mt-3">
      <div className="progress-rail relative h-2 rounded-full bg-slate-100 shadow-inner shadow-slate-200/70 overflow-hidden">
        <div
          className="progress-fill absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 shadow-[0_6px_18px_rgba(249,115,22,0.35)] transition-transform duration-800 ease-out will-change-transform"
          style={{ transform: `scaleX(${fill})`, transformOrigin: "left center" }}
        />
      </div>
      <div className="status-markers flex flex-wrap justify-between gap-2 pt-3">
        {steps.map((step) => {
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
