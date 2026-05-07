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

export type MentionsChartPoint = {
  date: string;
  [llmId: string]: string | number;
};

type MentionsAreaChartProps = {
  data: MentionsChartPoint[];
  llmIds: string[];
};

const colors = ["#111827", "#2563eb", "#16a34a", "#d97706", "#9333ea"];

export function MentionsAreaChart({ data, llmIds }: MentionsAreaChartProps) {
  return (
    <div className="h-80 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="mb-4">
        <h2 className="font-semibold text-xl tracking-tight">Menciones diarias</h2>
        <p className="text-muted-foreground text-sm">Ultimos 30 dias por LLM.</p>
      </div>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ left: -24, right: 8, top: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          {llmIds.map((llmId, index) => (
            <Area
              dataKey={llmId}
              fill={colors[index % colors.length]}
              fillOpacity={0.16}
              key={llmId}
              name={llmId}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
