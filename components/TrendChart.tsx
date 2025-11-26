"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = { data: number[] };

export function TrendChart({ data }: Props) {
  const rows = data.map((v, i) => ({ x: `d${i + 1}`, y: v }));
  return (
    <div className="glass rounded-xl2 border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Trend</h3>
        <span className="text-xs text-muted">Laatste 7 dagen</span>
      </div>
      <div className="h-40">
        <ResponsiveContainer>
          <LineChart data={rows}>
            <XAxis dataKey="x" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#ff7a1a" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
