import type { ReactNode } from "react";

type SummaryItem = { label: string; value: string };

type SummaryCardProps = {
  items: SummaryItem[];
  helperText?: string;
  children?: ReactNode;
  className?: string;
};

export function SummaryCard({ items, helperText, children, className = "" }: SummaryCardProps) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white/85 p-5 space-y-3 shadow-sm shadow-slate-200/70 ${className}`.trim()}>
      <div className="flex flex-wrap justify-center gap-3 text-sm text-muted text-center sm:justify-between sm:text-left leading-relaxed">
        {items.map((item) => (
          <span key={item.label}>
            {item.label}: <strong className="text-slate-900">{item.value}</strong>
          </span>
        ))}
      </div>
      {children}
      {helperText ? <p className="text-xs text-muted">{helperText}</p> : null}
    </section>
  );
}
