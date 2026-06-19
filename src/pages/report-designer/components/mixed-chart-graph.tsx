import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

export default function MixedChartGraph({ config }: { config: any }) {
  if (!config?.rows || !config?.xAxis || !config?.yAxis?.length) return null;
  const map: Record<string, any> = {};
  config.rows.forEach((r: any) => {
    const key = String(r[config.xAxis]);
    if (!map[key]) {
      map[key] = { name: key };
      config.yAxis.forEach((col: string) => {
        map[key][col] = 0;
      });
    }
    config.yAxis.forEach((col: string) => {
      if (r[col] !== null && r[col] !== undefined) {
        map[key][col] += 1;
      }
    });
  });
  const data = Object.values(map);
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={config.yAxis[0]} fill="#6366F1" />
          {config.yAxis.slice(1).map((col: string, i: number) => (
            <Line
              key={col}
              type="monotone"
              dataKey={col}
              stroke={["#EF4444", "#10B981", "#F59E0B"][i % 3]}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
