import { useEffect, useState } from "react";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import { useTheme } from "../../../theme";
import ProductDataTable from "../../query-designer/components/DataTable";
import { MultiSelect } from "primereact/multiselect";
import ChartSidebar from "./ChartSidebar";
import RenderCharts from "./render-charts";
import ReportDesignerChatSidebar from "./Report-chat-sidebar";
import { MdChat } from "react-icons/md";
import ApiServices from "../../../services/ApiServices";
import { useAuth } from "../../Auth/AuthContext";

interface DataViewTableProps {
  allData: { [key: string]: any };
  selectedTables: string[];
  globalFilter: string;

  selectedGroupBy: string[];
  setSelectedGroupBy: (v: string[]) => void;

  selectedFilters: { column: string; operator: string }[];
  setSelectedFilters: (v: { column: string; operator: string }[]) => void;

  filterValues: Record<string, any>;
  setFilterValues: (v: Record<string, any>) => void;

  aggregations: { column: string; agg: string }[];
  setAggregations: React.Dispatch<
    React.SetStateAction<{ column: string; agg: string }[]>
  >;

  selectedChartColumns: string[];
  setSelectedChartColumns: (v: string[]) => void;

  charts: ChartConfig[];
  setCharts: React.Dispatch<React.SetStateAction<ChartConfig[]>>;
  columnRenames: Record<string, string>;
  setColumnRenames: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}
export interface ChartConfig {
  order: any;
  id: string;
  type:
  | "line"
  | "bar"
  | "pie"
  | "kpi"
  | "box"
  | "mixed"
  | "bubble"
  | "waterfall";
  xAxis?: string;
  yAxis?: string | string[]; //  IMPORTANT
  value?: string;
  size?: string;
  label?: string;
  agg?: "count" | "sum";
  rows: any[];
  style?: Record<string, any>;
  customTitle?: string;
}

const calculateAggregation = (
  rows: any[],
  aggregations: { column: string; agg: string }[]
) => {
  const map: Record<string, Record<string, number>> = {};

  aggregations.forEach(({ column, agg }) => {
    if (!map[column]) map[column] = {};

    switch (agg) {
      case "count":
        map[column]["COUNT"] = rows.length;
        break;

      case "sum":
        map[column]["SUM"] = rows.reduce(
          (a, r) => a + Number(r[column] || 0),
          0
        );
        break;

      case "avg":
        map[column]["AVG"] =
          rows.reduce((a, r) => a + Number(r[column] || 0), 0) /
          (rows.length || 1);
        break;

      case "min":
        map[column]["MIN"] = Math.min(
          ...rows.map((r) => Number(r[column] || 0))
        );
        break;

      case "max":
        map[column]["MAX"] = Math.max(
          ...rows.map((r) => Number(r[column] || 0))
        );
        break;
    }
  });

  return map;
};
const groupRows = (
  rows: any[],
  groupCols: string[],
  aggregations: { column: string; agg: string }[],
  aggregationOrder: string[]
) => {
  if (!groupCols.length) return rows;

  const map: Record<string, any[]> = {};
  const finalRows: any[] = [];

  rows.forEach((row) => {
    const key = groupCols.map((col) => row[col]).join(" | ");
    if (!map[key]) map[key] = [];
    map[key].push(row);
  });

  Object.entries(map).forEach(([groupKey, items]) => {
    //  GROUP HEADER
    finalRows.push({
      __isGroup: true,
      __groupKey: groupKey,
      __groupLabel: `${groupCols.join(", ").toUpperCase()}: ${groupKey}`,
      __count: items.length,
    });

    //  CHILD ROWS
    items.forEach((item) =>
      finalRows.push({
        ...item,
        __parentGroup: groupKey,
      })
    );

    //  GROUP AGGREGATION ROW
    finalRows.push({
      __isGroupAgg: true,
      __parentGroup: groupKey,
      __aggregationMap: calculateAggregation(items, aggregations),
      __aggregationOrder: aggregationOrder,
    });
  });

  return finalRows;
};

export default function DataViewTable({
  allData,
  selectedTables,
  globalFilter,

  selectedGroupBy,
  setSelectedGroupBy,

  selectedFilters,
  setSelectedFilters,

  filterValues,
  setFilterValues,

  aggregations,
  setAggregations,

  selectedChartColumns,
  setSelectedChartColumns,

  charts,
  setCharts,
  columnRenames,
  setColumnRenames,
}: DataViewTableProps) {
  const { theme } = useTheme();
  const [viewType, setViewType] = useState<"table" | "chart">("table");
  const [showChartSidebar, setShowChartSidebar] = useState(false);
  const primaryTableKey = selectedTables[0];
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const { chatHistory, setChatHistory } = useAuth();

  useEffect(() => {
    if (!selectedGroupBy.length) return;
    if (!allData || selectedTables.length === 0) return;

    const tableKey = selectedTables[0];
    const table = allData[tableKey];
    if (!table) return;

    const rows = table.rows || [];

    const collapsed: Record<string, boolean> = {};

    rows.forEach((row) => {
      const key = selectedGroupBy.map((col) => row[col]).join(" | ");
      collapsed[key] = true; // 🔥 DEFAULT COLLAPSED
    });

    setCollapsedGroups(collapsed);
  }, [selectedGroupBy, allData]);

  const applyFilters = (rows: any[]) => {
    if (!selectedFilters.length) return rows;

    return rows.filter((row) => {
      return selectedFilters.every((f) => {
        const key = `${f.column}|${f.operator}`;
        const value = filterValues[key];
        const cell = row[f.column];

        if (value === undefined || value === "" || value === null) return true;

        // TEXT filters
        if (["equals", "like", "in"].includes(f.operator)) {
          const cellStr = String(cell ?? "").toLowerCase();
          const valStr = String(value).toLowerCase();

          if (f.operator === "equals") return cellStr === valStr;
          if (f.operator === "like") return cellStr.includes(valStr);
          if (f.operator === "in")
            return valStr
              .split(",")
              .map((v) => v.trim())
              .includes(cellStr);
        }

        // NUMBER filters
        if (["=", ">", "<"].includes(f.operator)) {
          if (f.operator === "=") return Number(cell) === Number(value);
          if (f.operator === ">") return Number(cell) > Number(value);
          if (f.operator === "<") return Number(cell) < Number(value);
        }

        if (f.operator === "between" && typeof value === "object") {
          const { from, to } = value;
          if (from != null && to != null) {
            return Number(cell) >= Number(from) && Number(cell) <= Number(to);
          }
        }

        // DATE filters
        if (["before", "after"].includes(f.operator)) {
          const cellDate = new Date(cell).getTime();
          const valDate = new Date(value).getTime();

          if (f.operator === "before") return cellDate < valDate;
          if (f.operator === "after") return cellDate > valDate;
        }

        if (f.operator === "between" && typeof value === "object") {
          const from = new Date(value.from).getTime();
          const to = new Date(value.to).getTime();
          const cellDate = new Date(cell).getTime();
          return cellDate >= from && cellDate <= to;
        }

        return true;
      });
    });
  };
  const baseRows =
    primaryTableKey && allData[primaryTableKey]
      ? allData[primaryTableKey].rows || []
      : [];
  const filteredRows = applyFilters(baseRows);
  const aggregationOrder = Array.from(
    new Set(aggregations.map((a) => a.agg.toUpperCase()))
  );

  const aggregationMap: Record<string, Record<string, number>> = {};

  aggregations.forEach(({ column, agg }) => {
    if (!aggregationMap[column]) {
      aggregationMap[column] = {};
    }

    switch (agg) {
      case "count":
        aggregationMap[column]["COUNT"] = filteredRows.length;
        break;

      case "sum":
        aggregationMap[column]["SUM"] = filteredRows.reduce(
          (acc, row) => acc + Number(row[column] || 0),
          0
        );
        break;

      case "avg":
        aggregationMap[column]["AVG"] =
          filteredRows.reduce((acc, row) => acc + Number(row[column] || 0), 0) /
          (filteredRows.length || 1);
        break;

      case "min":
        aggregationMap[column]["MIN"] = Math.min(
          ...filteredRows.map((r) => Number(r[column] || 0))
        );
        break;

      case "max":
        aggregationMap[column]["MAX"] = Math.max(
          ...filteredRows.map((r) => Number(r[column] || 0))
        );
        break;
    }
  });

  const grouped =
    selectedGroupBy.length > 0
      ? groupRows(filteredRows, selectedGroupBy, aggregations, aggregationOrder)
      : filteredRows;

  const displayRows = grouped.filter((row) => {
    if (row.__isGroup || row.__isGroupAgg) return true;
    return !collapsedGroups[row.__parentGroup];
  });

  //  Charts should NEVER use grouped rows
  const chartRows = filteredRows;

  const getColumnType = (table: any, column: string) => {
    const type = table?.visualization?.column_types?.[column];

    if (!type) return "text";

    if (type === "varchar") return "text";
    if (type === "int" || type === "decimal") return "number";
    if (type === "datetime") return "date";

    return "text";
  };

  const removeChart = (id: string) => {
    setCharts((prevCharts) => {
      const updatedCharts = prevCharts.filter((c) => c.id !== id);

      //  recalc columns still in use
      const stillUsedColumns = getColumnsUsedByCharts(updatedCharts);

      //  update selected columns accordingly
      setSelectedChartColumns(stillUsedColumns);

      return updatedCharts;
    });
  };

  const renameChart = (id: string, newName: string) => {
    setCharts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, customTitle: newName } : c))
    );
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const removeChartsByColumns = (activeColumns: string[]) => {
    setCharts((prev) =>
      prev.filter((chart) => {
        const usedColumns = [
          chart.xAxis,
          ...(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis]),
          chart.value,
          chart.size,
          chart.label,
        ].filter(Boolean) as string[];

        return usedColumns.every((col) => activeColumns.includes(col));
      })
    );
  };
  const getColumnsUsedByCharts = (charts: ChartConfig[]) => {
    const cols = new Set<string>();

    charts.forEach((chart) => {
      if (chart.xAxis) cols.add(chart.xAxis);

      if (Array.isArray(chart.yAxis)) {
        chart.yAxis.forEach((c) => cols.add(c));
      } else if (chart.yAxis) {
        cols.add(chart.yAxis);
      }

      if (chart.value) cols.add(chart.value);
      if (chart.size) cols.add(chart.size);
      if (chart.label) cols.add(chart.label);
    });

    return Array.from(cols);
  };

  const isSameChart = (a: ChartConfig, b: Partial<ChartConfig>) => {
    const normalize = (v: any) => (Array.isArray(v) ? v.join("|") : v ?? "");

    return (
      a.type === b.type &&
      normalize(a.xAxis) === normalize(b.xAxis) &&
      normalize(a.yAxis) === normalize(b.yAxis) &&
      normalize(a.value) === normalize(b.value) &&
      normalize(a.size) === normalize(b.size) &&
      normalize(a.label) === normalize(b.label)
    );
  };
  const buildAvailableColumns = () => {
    const tableKey = selectedTables[0];
    const table = allData[tableKey];

    if (!table) return [];

    return table.columns.map((col: any) => ({
      name: col.column_name,
      type: table.visualization?.column_types?.[col.column_name] || "text",
    }));
  };

  const normalizeStyle = (chart: ChartConfig) => {
    if (!chart.style) return chart;

    if (chart.type === "bar" && chart.style.color) {
      return {
        ...chart,
        style: { ...chart.style, barColor: chart.style.color },
      };
    }

    if (chart.type === "line" && chart.style.color) {
      return {
        ...chart,
        style: { ...chart.style, lineColor: chart.style.color },
      };
    }

    if (chart.type === "pie") {
      return {
        ...chart,
        style: {
          ...chart.style,
          colors:
            chart.style.colors ||
              chart.style.pieColor || 
              chart.style.color
              ? [chart.style.color]
              : undefined,
        },
      };
    }

    return chart;
  };
  //  build payload & call backend
  const getXAxisValues = (chart: ChartConfig) => {
    if (!chart.xAxis) return [];

    const values = new Set<string>();

    chartRows.forEach((row) => {
      const v = row[chart.xAxis!];
      if (v !== undefined && v !== null) {
        values.add(String(v));
      }
    });

    return Array.from(values);
  };

  const handleChatSend = async (message: string) => {
    try {
      const payload = {
        charts: charts.map((c) => ({
          id: c.id,
          type: c.type,
          xAxis: c.xAxis,
          yAxis: c.yAxis,
          agg: c.agg,
          style: c.style || {},
          xAxis_values: getXAxisValues(c),
        })),
        available_columns: buildAvailableColumns(),
        user_message: message,
      };

      const res = await ApiServices.modifyChart(payload);

      const ai = res.data?.data;
      const aiMessage = res.data?.message; 

      if (!ai || ai.blocked) {
        return ai?.assistant_message || "I couldn’t apply that change.";
      }

      setCharts((prev) => {
        // existing charts update
        let updatedCharts = prev.map((chart) => {
          const update = ai.updates?.find((u) => u.chart_id === chart.id);
          if (!update) return chart;

          return normalizeStyle({
            ...chart,
            ...update.updated_fields,
          });
        });

        // new charts add
        if (ai.new_charts?.length) {
          updatedCharts = [
            ...updatedCharts,
            ...ai.new_charts.map((c: any, index: number) => ({
              ...c,
              id: Date.now().toString() + "_" + index,
              rows: chartRows,
            })),
          ];
        }

        return updatedCharts;
      });

      return aiMessage;
    } catch (e) {
      console.error(e);
      return "Something went wrong while updating the chart.";
    }
  };

  return (
    <div>
      {selectedTables.map((tableKey) => {
        const table = allData[tableKey];
        if (!table) return null;
const columns =
  table.columns?.map((col: { column_name: string }) => ({
    column_name: col.column_name,
    header:
      columnRenames[col.column_name] ||
      col.column_name
        .replace(/_/g, " ")
        .toLowerCase()     
        .split(" ")        
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),       
    sortable: false,
  })) || [];
        const groupByColumns = table.visualization?.group_by || [];
        const filters = table.visualization?.filters || {};
        const chartColumns =
          table.columns?.map((col: { column_name: string }) => ({
            column_name: col.column_name,
            label: col.column_name.replace(/_/g, " ").toUpperCase(),
          })) || [];

        const chartColumnTypes = table.visualization?.column_types || {};

        const chartsWithRows = charts.map((c) => ({
          ...c,
          rows: chartRows,
        }));

        return (
          <div key={tableKey} className="px-4 py-6">
            <div className="rounded-xl shadow-xs bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: theme.primaryText }}
                  >
                    <GridViewRoundedIcon sx={{ fontSize: "1rem" }} />
                    {table.title}
                  </h2>
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.secondaryText }}
                  >
                    This displays {table.title.toLowerCase()} details.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {groupByColumns.length > 0 && (
                    <MultiSelect
                      appendTo="self"
                      filter
                      showClear={false}
                      value={selectedGroupBy}
                      options={groupByColumns.map((col: string) => ({
                        label: col.replace(/_/g, " ").toUpperCase(),
                        value: col,
                      }))}
                      onChange={(e) => {
                        const newGroups = e.value;
                        setSelectedGroupBy(newGroups);
                        if (newGroups.length === 0) {
                          // setAggregations([]);
                          setCollapsedGroups({});
                          return;
                        }
                        const groups = groupRows(
                          filteredRows,
                          newGroups,
                          aggregations,
                          aggregationOrder
                        );

                        const collapsed = groups
                          .filter((r) => r.__isGroup)
                          .reduce((acc: any, g: any) => {
                            acc[g.__groupKey] = true;
                            return acc;
                          }, {});

                        setCollapsedGroups(collapsed);
                      }}
                      placeholder="Group By"
                      display="chip"
                      className="w-64 border border-gray-300 rounded-xl text-sm min-h-[40px] flex items-center ps-2"
                      panelClassName="fixed-multiselect-panel shadow-lg"
                      pt={{
                        filterContainer: {
                          className: "multiselect-filter-fix",
                        },
                        list: {
                          className: "multiselect-list-fix",
                        },
                      }}
                    />
                  )}

                  {Object.keys(filters).length > 0 && (
                    <MultiSelect
                      appendTo="self"
                      filter
                      value={selectedFilters.map(
                        (f) => `${f.column}|${f.operator}`
                      )}
                      options={Object.entries(filters).flatMap(([col, ops]) =>
                        (ops as string[]).map((op) => ({
                          label: `${col.toUpperCase()} ${op}`,
                          value: `${col}|${op}`,
                        }))
                      )}
                      onChange={(e) => {
                        const parsed = e.value.map((v: string) => {
                          const [column, operator] = v.split("|");
                          return { column, operator };
                        });

                        setSelectedFilters(parsed);
                      }}
                      placeholder="Filter"
                      display="chip"
                      className="w-64 border border-gray-300 rounded-xl text-sm min-h-[40px] flex items-center ps-2"
                      panelClassName="fixed-multiselect-panel shadow-lg"
                      pt={{
                        filterContainer: {
                          className: "multiselect-filter-fix",
                        },
                        list: {
                          className: "multiselect-list-fix",
                        },
                      }}
                    />
                  )}
                  {selectedFilters.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedFilters.map((f) => {
                        const key = `${f.column}|${f.operator}`;
                        const type = getColumnType(table, f.column);

                        const inputBaseClass = `
      h-9
      border border-gray-300
      rounded-xl
      px-3
      text-sm
      text-gray-700
      bg-white
      shadow-sm
      transition-all duration-200
      focus:outline-none
      focus:ring-2 focus:ring-blue-500/30
      focus:border-blue-500
      hover:border-gray-400
    `;

                        return (
                          <div
                            key={key}
                            className="
          flex items-center gap-2
          bg-gray-50
          border border-gray-200
          rounded-xl
          px-3 py-1.5
          shadow-sm
          hover:shadow-md
          transition
        "
                          >
                            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                              {f.column.replace(/_/g, " ").toUpperCase()}
                              <span className="mx-1 text-gray-400">
                                {f.operator}
                              </span>
                            </span>
                            {type === "text" && (
                              <input
                                type="text"
                                placeholder="Enter value"
                                className={`${inputBaseClass} w-40`}
                                value={filterValues[key] || ""}
                                onChange={(e) =>
                                  setFilterValues({
                                    ...filterValues,
                                    [key]: e.target.value,
                                  })
                                }
                              />
                            )}
                            {type === "number" && f.operator !== "between" && (
                              <input
                                type="number"
                                className={`${inputBaseClass} w-28`}
                                value={filterValues[key] ?? ""}
                                onChange={(e) =>
                                  setFilterValues({
                                    ...filterValues,
                                    [key]: Number(e.target.value),
                                  })
                                }
                              />
                            )}
                            {type === "date" && f.operator !== "between" && (
                              <input
                                type="date"
                                className={`${inputBaseClass} w-[150px]`}
                                value={filterValues[key] || ""}
                                onChange={(e) =>
                                  setFilterValues({
                                    ...filterValues,
                                    [key]: e.target.value,
                                  })
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex border rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        setViewType("table");
                        setShowChartSidebar(false);
                      }}
                      className={`px-2 py-2 ${viewType === "table"
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <TableRowsRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button
                      onClick={() => {
                        setViewType("chart");
                        setShowChartSidebar(true);
                      }}
                      className={`px-2 py-1 ${viewType === "chart"
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <BarChartRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    {/* Chat */}
                    <button
                      onClick={() => {
                        setShowChatSidebar(true);
                        setShowChartSidebar(false);
                      }}
                      className={`px-2 py-2 ${showChatSidebar ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                    >
                      <MdChat />
                    </button>
                  </div>
                </div>
              </div>
              {showChartSidebar && charts.length > 0 && (
                <div className="mb-6">
                  <RenderCharts
                    exportMode={true}
                    charts={chartsWithRows}
                    onRemoveChart={removeChart}
                    onReorderCharts={setCharts}
                    onRenameChart={renameChart}
                  />
                </div>
              )}
              {!(showChartSidebar && charts.length > 0) && (
                <ProductDataTable
                  data={displayRows}
                  globalFilter={globalFilter}
                  showPagination={true}
                  columns={columns}
                  columnAggregations={table.visualization?.aggregations}
                  aggregationMap={aggregationMap}
                  aggregationOrder={aggregationOrder}
                  isGrouped={selectedGroupBy.length > 0}
                  onAggregationSelect={(column, agg) => {
                    setAggregations((prev) => {
                      const exists = prev.some(
                        (a) => a.column === column && a.agg === agg
                      );

                      // TOGGLE OFF (remove)
                      if (exists) {
                        return prev.filter(
                          (a) => !(a.column === column && a.agg === agg)
                        );
                      }
                      return [...prev, { column, agg }];
                    });
                  }}

                  enableRowGrouping={selectedGroupBy.length > 0}
                  collapsedGroups={collapsedGroups}
                  onToggleGroup={toggleGroup}
                  onColumnRename={(original, newName) => {
                    setColumnRenames((prev) => ({
                      ...prev,
                      [original]: newName,
                    }));
                  }}
                />
              )}
              {showChartSidebar && (
                <ChartSidebar
                  columns={chartColumns}
                  rows={chartRows}
                  columnTypes={chartColumnTypes}
                  selectedColumns={selectedChartColumns}
                  onSelectedColumnsChange={(cols) => {
                    setSelectedChartColumns(cols);
                    removeChartsByColumns(cols);
                  }}
                  onChartSelect={(config) => {
                    setCharts((prev) => {
                      const exists = prev.some((chart) =>
                        isSameChart(chart, config)
                      );

                      if (exists) {
                        return prev;
                      }

                      return [
                        ...prev,
                        { ...config, id: Date.now().toString() },
                      ];
                    });
                  }}
                  onClose={() => setShowChartSidebar(false)}
                />
              )}

              {!showChartSidebar && charts.length > 0 && (
                <div className="mt-6">
                  <RenderCharts
                    charts={chartsWithRows}
                    onRemoveChart={removeChart}
                    onReorderCharts={setCharts}
                    onRenameChart={renameChart}
                  />
                </div>
              )}
              {showChatSidebar && (
                <ReportDesignerChatSidebar
                  onClose={() => setShowChatSidebar(false)}
                  userName={
                    JSON.parse(localStorage.getItem("ig_user"))?.full_name ||
                    "User"
                  }
                  charts={charts}
                  onSend={handleChatSend}
                  messages={chatHistory}
                  setMessages={setChatHistory}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
