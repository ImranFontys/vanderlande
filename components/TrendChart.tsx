"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = { data: number[] };

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
};

export function TrendChart({ data }: Props) {
  const rows = data.map((v, i) => ({ x: `d${i + 1}`, y: v }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.replace("d", "Dag ")}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value} bags`, "Traffic"]}
          labelFormatter={(label) => `Dag ${label.replace("d", "")}`}
        />
        <Line type="monotone" dataKey="y" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
