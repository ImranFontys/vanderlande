type Props = {
  title: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "bad";
};

const toneMap = {
  good: "bg-green-50 text-green-900 border-green-200",
  warn: "bg-orange-50 text-orange-900 border-orange-200",
  bad: "bg-rose-50 text-rose-900 border-rose-200",
};

export function KPICard({ title, value, hint, tone = "good" }: Props) {
  return (
    <article
      className={`glass w-full text-left rounded-xl2 border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-glass ${
        toneMap[tone]
      }`}
    >
      <p className="text-sm text-muted">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </article>
  );
}
