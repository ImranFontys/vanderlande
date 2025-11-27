"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; value: number };
type HubPoint = { hub: string; inbound: number; outbound: number };
type ExceptionPoint = { label: string; value: number };

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
};

export function ThroughputChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id="throughput" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="#ea580c" fill="url(#throughput)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OnTimeChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis domain={[92, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={40} />
        <ReferenceLine y={97} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "SLA", position: "insideTopRight", fill: "#94a3b8" }} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(1)}%`, "On-time"]} />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 3, strokeWidth: 2, stroke: "#fff" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function UptimeGauge({ data }: { data: Point[] }) {
  const latest = data[data.length - 1];
  const gaugeData = [{ name: "Uptime", value: latest.value, fill: "#059669" }];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadialBarChart
        endAngle={-90}
        startAngle={270}
        data={gaugeData}
        innerRadius="70%"
        outerRadius="100%"
        barSize={14}
        cx="50%"
        cy="55%"
      >
        <RadialBar dataKey="value" cornerRadius={50} />
        <Tooltip
          cursor={false}
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value.toFixed(2)}%`, "Uptime"]}
        />
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#0f172a"
          fontSize={18}
          fontWeight={600}
        >
          {latest.value.toFixed(2)}%
        </text>
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#64748b"
          fontSize={11}
        >
          Laatste 7 dagen
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export function ExceptionBarChart({ data }: { data: ExceptionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, top: 10, bottom: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={120} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#f43f5e" radius={6} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HubLoadChart({ data }: { data: HubPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="hub" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="inbound" stackId="a" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        <Bar dataKey="outbound" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
