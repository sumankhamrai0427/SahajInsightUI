// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// export default function PieChartGraph({ config }: { config: any }) {
//   if (!config?.rows || !config?.xAxis || !config?.yAxis) return null;

//   const grouped: Record<string, number> = {};

//   config.rows.forEach((r: any) => {
//     const key = String(r[config.xAxis]);

//     if (config.agg === "count") {
//       grouped[key] = (grouped[key] || 0) + 1;
//     } else {
//       grouped[key] =
//         (grouped[key] || 0) + Number(r[config.yAxis] || 0);
//     }
//   });


//   const data = Object.entries(grouped).map(([name, value]) => ({
//     name,
//     value
//   }));

//   // const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];
//   const defaultColors = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];

//   const getColor = (name: string, index: number) => {
//     const colors = config.style?.colors || config.style?.pieColor;

//     // 🎯 CASE 1: axis-wise mapping
//     if (colors?.mapping && typeof colors.mapping === "object") {
//       return colors.mapping[name] || defaultColors[index % defaultColors.length];
//     }

//     // 🎯 CASE 2: array of colors
//     if (Array.isArray(colors) && colors.length > 0) {
//       return colors[index % colors.length];
//     }

//     // 🎯 fallback
//     return defaultColors[index % defaultColors.length];
//   };

//   return (
//     <div className="w-full h-[240px]">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={data}
//             dataKey="value"
//             nameKey="name"
//             outerRadius="80%"
//             label
//           >
//             {data.map((entry, i) => (
//               <Cell
//                 key={i}
//                 fill={getColor(entry.name, i)}
//               />
//             ))}

//           </Pie>
//           <Tooltip />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }




import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

export default function PieChartGraph({ config }: { config: any }) {

  const MAX_LEGEND_ITEMS = 10;

  if (!config?.rows || !config?.xAxis) return null;

  //  GROUP DATA
  const grouped: Record<string, number> = {};

  config.rows.forEach((r: any) => {
    const key = String(r[config.xAxis]);
    grouped[key] = (grouped[key] || 0) + 1;
  });

  // APPLY RESPONSE ORDER (MOST IMPORTANT)
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

  // 3️⃣ TOTAL (for percentage)
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // 4️⃣ COLORS (support style config: mapping | array | string)
  const defaultColors = [
    "#0B2C6F", // dark blue
    "#0E6EF7",
    "#5B8FF9",
    "#B1C9F1",
    "#D6DEE8",
    "#081F4D"
  ];

  const colorsConfig =
    config.style?.colors ??
    config.style?.pieColor ??
    config.style?.color ??
    config.style?.barColor;

  const getColor = (name: string, index: number) => {
    // mapping object (either shape: { mapping: { name: color } } or direct mapping)
    if (colorsConfig && typeof colorsConfig === "object" && !Array.isArray(colorsConfig)) {
      return (
        (colorsConfig.mapping && colorsConfig.mapping[name]) ||
        (colorsConfig[name] as string) ||
        defaultColors[index % defaultColors.length]
      );
    }

    // array of colors
    if (Array.isArray(colorsConfig) && colorsConfig.length > 0) {
      return colorsConfig[index % colorsConfig.length];
    }

    // single string color
    if (typeof colorsConfig === "string") return colorsConfig;

    return defaultColors[index % defaultColors.length];
  };

  // 5️⃣ PERCENT LABEL (inside slice)
  const renderLabel = ({ value }: any) =>
    `${Math.round((value / total) * 100)}%`;

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="45%"
            outerRadius="80%"
            label={renderLabel}
            labelLine={false}   
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={getColor(entry.name, i)}
              />
            ))}
          </Pie>

          <Tooltip formatter={(v: number) => [`${v}`, "Count"]} />

          {/*  LEGEND RIGHT SIDE */}
          {/* <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
          /> */}

          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            content={({ payload }) => {
              if (!payload) return null;

              return (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {payload.slice(0, MAX_LEGEND_ITEMS).map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                        fontSize: 12,
                        color: "#333"
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: entry.color,
                          display: "inline-block",
                          marginRight: 8
                        }}
                      />
                      {entry.value}
                    </li>
                  ))}
                </ul>
              );
            }}
          />


        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
