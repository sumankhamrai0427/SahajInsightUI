import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from "recharts";

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  return {
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1]
  };
}

export default function BoxPlotGraph({ config }: { config: any }) {
  if (!config?.rows || !config?.xAxis) return null;

  // 1️⃣ Count per category
  const map: Record<string, number> = {};

  config.rows.forEach((r: any) => {
    const key = String(r[config.xAxis]);
    map[key] = (map[key] || 0) + 1;
  });

  const counts = Object.values(map);
  if (!counts.length) return null;

  // 2️⃣ Calculate box stats
  const s = stats(counts);

  const data = [
    { name: "Min", value: s.min },
    { name: "Q1", value: s.q1 },
    { name: "Median", value: s.median },
    { name: "Q3", value: s.q3 },
    { name: "Max", value: s.max }
  ];

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <Tooltip />
          <Bar dataKey="value" fill="#818CF8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
