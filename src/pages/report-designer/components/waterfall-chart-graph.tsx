import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from "recharts";

export default function WaterfallChartGraph({ config }: { config: any }) {
  if (!config?.rows || !config?.xAxis) return null;
  const grouped: Record<string, number> = {};
  config.rows.forEach((r: any) => {
    const key = String(r[config.xAxis]);
    grouped[key] = (grouped[key] || 0) + 1;
  });
  let cumulative = 0;
  const data = Object.entries(grouped).map(([name, count]) => {
    const start = cumulative;
    cumulative += count;
    return {
      name,
      start,
      value: count
    };
  });

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <Tooltip />
          <Bar dataKey="start" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
