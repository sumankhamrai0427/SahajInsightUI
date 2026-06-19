import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis
} from "recharts";

export default function BubbleChartGraph({ config }: { config: any }) {
  if (!config?.rows || !config?.xAxis || !config?.yAxis) return null;

  // 1️⃣ Group by X + Y
  const map: Record<string, number> = {};

  config.rows.forEach((r: any) => {
    const x = String(r[config.xAxis]);
    const y = String(r[config.yAxis]);
    const key = `${x}__${y}`;
    map[key] = (map[key] || 0) + 1;
  });

  // 2️⃣ Convert to bubble points
  const data = Object.entries(map).map(([key, count]) => {
    const [x, y] = key.split("__");
    return {
      x,
      y,
      z: count
    };
  });

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis type="category" dataKey="x" name={config.xAxis} />
          <YAxis type="category" dataKey="y" name={config.yAxis} />
          <ZAxis dataKey="z" range={[60, 400]} />
          <Tooltip />
          <Scatter data={data} fill="#6366F1" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
