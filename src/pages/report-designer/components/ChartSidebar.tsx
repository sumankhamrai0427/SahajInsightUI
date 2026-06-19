import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import SpeedIcon from "@mui/icons-material/Speed";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import WaterfallChartIcon from "@mui/icons-material/WaterfallChart";
import { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
interface ChartSidebarProps {
  columns: { column_name: string; label: string }[];
  rows: any[];
  columnTypes: Record<string, string>;
  onChartSelect: (config: any) => void;
  onClose?: () => void;
  selectedColumns: string[];
  onSelectedColumnsChange: (cols: string[]) => void;
}
interface ChartOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  subtitle: string;
}
export default function ChartSidebar({
  onChartSelect,
  onClose,
  columns,
  columnTypes,
  rows,
  selectedColumns,
  onSelectedColumnsChange,
}: ChartSidebarProps) {
  const chartOptions: ChartOption[] = [
    {
      id: "bar",
      name: "Bar Chart",
      icon: <BarChartIcon sx={{ fontSize: "2rem" }} />,
      subtitle: "Compare Value",
    },
  
    {
      id: "line",
      name: "Line Chart",
      icon: <TrendingUpIcon sx={{ fontSize: "2rem" }} />,
      subtitle: "Trend Over Time",
    },


    {
      id: "pie",
      name: "Pie Chart",
      icon: <PieChartIcon sx={{ fontSize: "2rem" }} />,
      subtitle: "Compare Value",
    },
  
  ];
  const normalizeType = (t?: string, colName?: string) => {
    if (!t) return "text";
    const col = colName?.toLowerCase() || "";
    if (col.endsWith("_year") || col === "year") {
      return "date";
    }
    if (
      ["int", "decimal"].includes(t) ||
      colName?.toLowerCase().endsWith("_id")
    ) {
      return "number";
    }

    if (t === "datetime") return "date";
    return "text";
  };
  const orderedSelected = selectedColumns.map((col) => ({
    name: col,
    type: normalizeType(columnTypes?.[col], col),
  }));

  const typedSelected = selectedColumns.map((c) => ({
    name: c,
    type: normalizeType(columnTypes?.[c]),
  }));
  

  const isChartDisabled = (chartId: string) => {
    const cols = orderedSelected;

    if (cols.length === 0) return true;

    switch (chartId) {
      case "bar":
      case "pie":
        return !(cols.length >= 1);

      case "kpi":
        return !(cols.length === 1);

      case "box":
        return !(cols.length === 1);

      case "mixed":
        return !(cols.length >= 2);

      case "bubble":
        return !(cols.length >= 2 && cols.every((c) => c.type === "number"));

      case "waterfall":
        return !(cols.length >= 1);
      case "line":
        return !(
          cols.length >= 2 &&
          (cols[0].type === "text" || cols[0].type === "date") &&
          cols[1].type === "number"
        );

      default:
        return true;
    }
  };

  const autoAssignColumns = (chartType: string) => {
    const cols = orderedSelected;

    switch (chartType) {

      case "bar":
      case "pie":
        // ✅ 2 columns selected → X + Y
        if (cols.length >= 2) {
          return {
            xAxis: cols[0].name,
            yAxis: cols[1].name,
            agg: "sum",
          };
        }

        // ✅ 1 column → COUNT
        return {
          xAxis: cols[0].name,
          yAxis: cols[0].name,
          agg: "count",
        };

      case "line":
        return {
          xAxis: cols[0].name,
          yAxis: cols[1].name,
          agg: "sum",
        };

      case "kpi":
        return {
          value: cols[0].name,
          agg: "count",
        };

      default:
        return null;
    }
  };

  const handleChartClick = (chartType: string) => {
    if (chartType !== "kpi" && selectedColumns.length === 0) return;
    const mapping = autoAssignColumns(chartType);
    if (!mapping) return;
    onChartSelect({
      type: chartType,
      ...mapping,
      rows,
    });
  };
  return (
    <div className="fixed top-0 right-0 w-80 bg-white shadow-lg h-screen border-l overflow-y-auto z-50">
      <div className="sticky top-0 bg-white z-10 p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Graph
            </h3>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-xl transition"
              aria-label="Close sidebar"
            >
              <CloseIcon
                sx={{ fontSize: "1.25rem" }}
                className="text-gray-500"
              />
            </button>
          )}
        </div>
        <MultiSelect
          options={columns.map((c) => ({
            label: c.label,
            value: c.column_name,
          }))}
          value={selectedColumns}
          onChange={(e) => onSelectedColumnsChange(e.value)}
          placeholder="Select Column"
          display="chip"
          filter
          pt={{
            root: {
              className:
                "w-full bg-gray-50 border border-gray-200 rounded-xl min-h-[46px] flex items-center hover:border-gray-300 focus-within:border-indigo-500",
            },

            label: {
              className: "text-gray-400 text-base px-4",
            },

            trigger: {
              className: "text-gray-500 px-4",
            },
            panel: {
              className:
                "rounded-xl border border-gray-200 shadow-lg mt-2 bg-white",
            },

            filterContainer: {
              className:
                "sticky top-0 z-10 px-3 pt-3 pb-2 border-b border-gray-200 bg-white",
            },

            filterInput: {
              className:
                "w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-sm " +
                "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
            },
            list: {
              className: "pt-10 pb-3 bg-gray-50 pl-2",
            },

            item: {
              className:
                "flex items-center gap-2 text-sm px-4 py-2 cursor-pointer hover:bg-gray-200 rounded-xl",
            },

            token: {
              className:
                "bg-indigo-50 text-indigo-700 rounded-xl text-xs px-2 py-1",
            },
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2">
          {chartOptions.map((chart) => {
            const disabled = isChartDisabled(chart.id);
            return (
              <button
                key={chart.id}
                disabled={disabled}
                onClick={() => handleChartClick(chart.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition text-left
          ${disabled
                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                    : "bg-white hover:bg-blue-50 hover:border-blue-500"
                  }`}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl">
                  {chart.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {chart.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chart.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
