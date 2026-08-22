"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function StageValueChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8D6CD" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#333F5C", fontSize: 12 }} />
        <YAxis tick={{ fill: "#333F5C", fontSize: 12 }} />
        <Tooltip
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
          contentStyle={{ borderRadius: 8, borderColor: "#D8D6CD" }}
        />
        <Bar dataKey="value" fill="#3F6659" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
