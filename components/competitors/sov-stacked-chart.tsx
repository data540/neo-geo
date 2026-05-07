"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompetitorSovPoint } from "./types";

type SovStackedChartProps = {
  data: CompetitorSovPoint[];
  brandNames: string[];
};

const colors = ["#111827", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626"];

export function SovStackedChart({ data, brandNames }: SovStackedChartProps) {
  return (
    <section className="h-96 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="mb-4">
        <h2 className="font-semibold text-xl tracking-tight">Comparativa SOV</h2>
        <p className="text-muted-foreground text-sm">Share of Voice diario por marca trackeada.</p>
      </div>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart
          data={data}
          margin={{ left: -20, right: 8, top: 8, bottom: 44 }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `${Number(value) * 100}%`} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              `${(Number(value) * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`
            }
          />
          {brandNames.map((brandName, index) => (
            <Area
              dataKey={brandName}
              fill={colors[index % colors.length]}
              fillOpacity={0.72}
              key={brandName}
              name={brandName}
              stackId="1"
              stroke={colors[index % colors.length]}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
