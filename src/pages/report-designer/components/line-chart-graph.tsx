// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid
// } from "recharts";

// export default function LineChartGraph({ config }: { config: any }) {
//   if (!config?.rows || !config?.xAxis || !config?.yAxis) return null;

//   // 🔹 Aggregate data
//   const grouped: Record<string, number> = {};
//   config.rows.forEach((r: any) => {
//     const key = String(r[config.xAxis]);
//     grouped[key] = (grouped[key] || 0) + Number(r[config.yAxis] || 0);
//   });

//   const data = Object.entries(grouped).map(([k, v]) => ({
//     name: k,
//     value: v
//   }));

//   const DEFAULT_PALETTE = [
//     "#6366F1",
//     "#22C55E",
//     "#F59E0B",
//     "#EF4444",
//     "#06B6D4"
//   ];

//   const lineStyle = config.style?.lineColor || config.style?.color;

//   const isSingleColor = typeof lineStyle === "string";

//   const isMapping =
//     !isSingleColor &&
//     lineStyle?.mapping &&
//     typeof lineStyle.mapping === "object";

//   const isGradient =
//     lineStyle?.gradient?.from && lineStyle?.gradient?.to;

//   /* 🔵 Colored Dot */
//   const ColoredDot = (props: any) => {
//     const { cx, cy, payload, index } = props;
//     if (cx == null || cy == null) return null;

//     const color =
//       (isMapping && lineStyle.mapping[payload.name]) ||
//       DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];

//     return (
//       <circle
//         cx={cx}
//         cy={cy}
//         r={4}
//         fill={color}
//         stroke="#fff"
//         strokeWidth={2}
//       />
//     );
//   };

//   /* 🔴 Active Dot */
//   const ColoredActiveDot = (props: any) => {
//     const { cx, cy, payload, index } = props;
//     if (cx == null || cy == null) return null;

//     const color =
//       (isMapping && lineStyle.mapping[payload.name]) ||
//       DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];

//     return (
//       <circle
//         cx={cx}
//         cy={cy}
//         r={7}
//         fill={color}
//         stroke="#fff"
//         strokeWidth={2}
//       />
//     );
//   };

//   return (
//     <div className="w-full h-[260px]">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
//           <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />

//           {/* 🌈 Gradient line */}
//           {!isMapping && isGradient && (
//             <>
//               <defs>
//                 <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
//                   <stop offset="0%" stopColor={lineStyle.gradient.from} />
//                   <stop offset="100%" stopColor={lineStyle.gradient.to} />
//                 </linearGradient>
//               </defs>

//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="url(#lineGradient)"
//                 strokeWidth={3}
//                 dot={false}
//               />
//             </>
//           )}

//           {/* ✅ CASE: SINGLE COLOR FROM AI */}
//           {isSingleColor && (
//             <Line
//               type="monotone"
//               dataKey="value"
//               stroke={lineStyle}     // 🔥 ONLY LINE COLOR
//               strokeWidth={3}
//               dot={<ColoredDot />}   // ✅ dots stay default
//               activeDot={<ColoredActiveDot />}
//             />
//           )}

//           {/* ✅ CASE: MAPPING (neutral line + colored dots) */}
//           {!isSingleColor && !isGradient && !isMapping && (
//             <Line
//               type="monotone"
//               dataKey="value"
//               stroke="#64748B"
//               strokeWidth={3}
//               dot={<ColoredDot />}
//               activeDot={<ColoredActiveDot />}
//             />
//           )}


//           <XAxis
//             dataKey="name"
//             tick={{ fontSize: 11, fill: "#6B7280" }}
//             axisLine={{ stroke: "#CBD5E1" }}
//             tickLine={false}
//           />

//           <YAxis
//             tick={{ fontSize: 11, fill: "#6B7280" }}
//             axisLine={false}
//             tickLine={false}
//           />

//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#ffffff",
//               borderRadius: 8,
//               border: "1px solid #E5E7EB",
//               fontSize: 12
//             }}
//             labelStyle={{ color: "#374151", fontWeight: 600 }}
//             formatter={(v: number) => [
//               v,
//               String(config.yAxis).replace(/_/g, " ").toUpperCase()
//             ]}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }



import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function LineChartGraph({ config }: { config: any }) {
  if (!config?.rows || !config?.xAxis || !config?.yAxis) return null;

  // 🔹 Aggregate data (LOGIC SAME)
  const grouped: Record<string, number> = {};
  config.rows.forEach((r: any) => {
    const key = String(r[config.xAxis]);
    grouped[key] = (grouped[key] || 0) + Number(r[config.yAxis] || 0);
  });

  // 🔥 RESPONSE-WISE ORDER (IMPORTANT)
  const order: string[] =
    Array.isArray(config.xAxis_values) && config.xAxis_values.length > 0
      ? config.xAxis_values
      : Object.keys(grouped);

  const data = order
    .filter(k => grouped[k] !== undefined)
    .map(k => ({
      name: k,
      value: grouped[k]
    }));

  // 🎨 COLORS
  const DEFAULT_PALETTE = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4"
  ];

  const lineStyle =
    config.style?.lineColor ??
    config.style?.color ??
    config.style?.barColor ??
    config.style?.colors ??
    null;

  const isSingleColor = typeof lineStyle === "string";
  const isMapping =
    !isSingleColor &&
    lineStyle?.mapping &&
    typeof lineStyle.mapping === "object";
  const isGradient =
    lineStyle?.gradient?.from && lineStyle?.gradient?.to;

  // allow an array palette coming from style
  const palette = Array.isArray(lineStyle) ? lineStyle : DEFAULT_PALETTE;

  // 🔵 Dot
  const ColoredDot = ({ cx, cy, payload, index }: any) => {
    if (cx == null || cy == null) return null;
    const color =
      (isMapping && lineStyle.mapping[payload.name]) ||
      palette[index % palette.length];

    return (
      <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
    );
  };

  // 🔴 Active dot
  const ColoredActiveDot = ({ cx, cy, payload, index }: any) => {
    if (cx == null || cy == null) return null;
    const color =
      (isMapping && lineStyle.mapping[payload.name]) ||
      palette[index % palette.length];

    return (
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="#fff" strokeWidth={2} />
    );
  };

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 5, bottom: 20 }}
        >
          {/* ✨ Grid */}
          <CartesianGrid
            vertical={false}
            stroke="#E5E7EB"
            strokeDasharray="3 3"
          />

          {/* 🌈 Gradient */}
          {!isMapping && isGradient && (
            <>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={lineStyle.gradient.from} />
                  <stop offset="100%" stopColor={lineStyle.gradient.to} />
                </linearGradient>
              </defs>

              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={<ColoredDot />}
                activeDot={<ColoredActiveDot />}
                isAnimationActive={false}
              />
            </>
          )}

          {/* ✅ Single color */}
          {isSingleColor && (
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineStyle}
              strokeWidth={3}
              dot={<ColoredDot />}
              activeDot={<ColoredActiveDot />}
              isAnimationActive={false}
            />
          )}

          {/* ✅ Neutral line + colored dots */}
          {!isSingleColor && !isGradient && (
            <Line
              type="monotone"
              dataKey="value"
              stroke="#64748B"
              strokeWidth={3}
              dot={<ColoredDot />}
              activeDot={<ColoredActiveDot />}
              isAnimationActive={false}
            />
          )}

          {/* ✨ X Axis */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#D1D5DB" }}
            tickLine={false}
            label={{
              value: config.xAxis.toUpperCase(),
              position: "insideBottom",
              offset: -10,
              fill: "#6B7280",
              fontSize: 12
            }}
          />

          {/* ✨ Y Axis */}
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          {/* ✨ Tooltip */}
          <Tooltip
            cursor={{ stroke: "#6366F1", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 12
            }}
            labelStyle={{ color: "#374151", fontWeight: 600 }}
            formatter={(v: number) => [
              Math.round(v),
              String(config.yAxis).replace(/_/g, " ").toUpperCase()
            ]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
