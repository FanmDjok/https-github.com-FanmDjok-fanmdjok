"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
export type LeadsPerWeek = { week: string; leads: number };

export function LeadsChart({ data }: { data: LeadsPerWeek[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 12 }}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "var(--color-emerald)", opacity: 0.06 }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              borderRadius: 8,
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--color-ink)" }}
            formatter={(value) => [`${value} prospects`, ""]}
          />
          <Bar dataKey="leads" fill="var(--color-emerald)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
