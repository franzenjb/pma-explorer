"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = [
  "var(--red, #c4302b)",
  "oklch(0.45 0.05 60)",
  "oklch(0.6 0.04 80)",
  "oklch(0.7 0.03 90)",
  "oklch(0.32 0.02 70)",
  "oklch(0.55 0.06 40)",
  "oklch(0.5 0.04 100)",
  "oklch(0.65 0.05 50)",
];

type Datum = { name: string; value: number };

export function DecadeBars({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            color: "var(--popover-foreground)",
            fontSize: 12,
            borderRadius: 4,
          }}
        />
        <Bar dataKey="value" fill="var(--primary)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          stroke="var(--background)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            color: "var(--popover-foreground)",
            fontSize: 12,
            borderRadius: 4,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MediumBars({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 30)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            color: "var(--popover-foreground)",
            fontSize: 12,
            borderRadius: 4,
          }}
        />
        <Bar dataKey="value" fill="var(--primary)" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
