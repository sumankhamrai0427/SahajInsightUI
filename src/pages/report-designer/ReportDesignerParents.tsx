import { useEffect, useState, useRef } from "react";
import DataViewHeader from "./components/ReportDesignerHeader";
import DataViewTable from "./components/ReportDesignerTable";
import { useTheme } from "../../theme";
import ApiServices from "../../services/ApiServices";
import { useLocation } from "react-router-dom";
import { MdOutlineDescription } from "react-icons/md";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import html2canvas from "html2canvas";
import { useAuth } from "../Auth/AuthContext";

export default function TableView() {
  const { chatHistory, setChatHistory } = useAuth();
  const { theme } = useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [allData, setAllData] = useState<any>({});
  const [tableOptions, setTableOptions] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportName, setReportName] = useState("");
  const [editReport, setEditReport] = useState<any>(null);
  const location = useLocation();
  const [queriesFetched, setQueriesFetched] = useState(false);
  const isFetching = useRef(false);
  const report = location.state?.report;
  const userData = JSON.parse(localStorage.getItem("ig_user"));
  const [selectedGroupBy, setSelectedGroupBy] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<
    { column: string; operator: string }[]
  >([]);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [aggregations, setAggregations] = useState<
    { column: string; agg: string }[]
  >([]);
  const [selectedChartColumns, setSelectedChartColumns] = useState<string[]>(
    []
  );
  const [charts, setCharts] = useState<any[]>([]);
  const [columnRenames, setColumnRenames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (report) {
      console.log(" Edit report received:", report);

      setEditReport(report);
      setReportName(report.report_name || "");
    }
  }, [report]);
  useEffect(() => {
    if (!report?.report_config) return;
    const config =
      typeof report.report_config === "string"
        ? JSON.parse(report.report_config)
        : report.report_config;

    setSelectedGroupBy(config.group_by || []);
    setSelectedFilters(
      (config.filters || []).map((f: any) => ({
        column: f.column,
        operator: f.operator,
      }))
    );
    const values: Record<string, any> = {};
    (config.filters || []).forEach((f: any) => {
      values[`${f.column}|${f.operator}`] = f.value;
    });
    setFilterValues(values);

    setAggregations(config.aggregations || []);
    setSelectedChartColumns(config.selected_columns || []);
    setCharts(
      (config.charts || [])
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          ...c,
          id: c.id ? c.id : crypto.randomUUID(),
        }))
    );
    setColumnRenames(config.column_renames || {});
    setChatHistory(config.chat_history || []);
  }, [report]);

  useEffect(() => {
    getSavedQueryResponse();
  }, []);
  const getSavedQueryResponse = async (forceRefresh = false) => {
    if (isFetching.current || (queriesFetched && !forceRefresh)) return;
    isFetching.current = true;
    try {
      setLoading(true);
      // const userData = JSON.parse(localStorage.getItem("ig_user"));
      const payload = {
        created_by: userData?.user_id,
        session_id: userData?.session_id,
      };
      const response = await ApiServices.getSavedQueryResponse(payload);
      const apiData = response.data.data;
      const dropdown = apiData.queries?.flatMap((q) => {
        if (!q.messages || q.messages.length === 0) return [];
        const lastMessage = q.messages[q.messages.length - 1];
        if (!lastMessage.ai_response) return [];
        return [
          {
            label: q.query_title,
            value: {
              id: lastMessage.id,
              ai_response: lastMessage.ai_response,
              query_title: q.query_title,
            },
          },
        ];
      });

      setTableOptions(dropdown || []);
      setSelectedTables([]);
      setAllData({});
      setTableOptions(dropdown);
      setQueriesFetched(true);
    } catch (err) {
      console.error("API error:", err);
      setQueriesFetched(false);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (selectedTables.length > 0) {
        await handleRunScript(selectedTables[0].ai_response);
      } else {
        await getSavedQueryResponse(true);
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    if (selectedTables.length > 0) {
      handleRunScript(selectedTables[0].ai_response);
    }
  }, [selectedTables]);

  const handleRunScript = async (sqlQuery: string) => {
    setIsRefreshing(true);
    try {
      const payload = {
        session_id: userData?.session_id,
        sql_query: sqlQuery,
      };
      const response = await ApiServices.executeSql(payload);
      const api = response.data.data;

      const formatted = {
        [sqlQuery]: {
          title: "Report Result",
          rows: api.rows,
          columns: api.columns.map((col) => ({ column_name: col })),
          procedure_sql: sqlQuery,
          visualization: api.visualization,
        },
      };

      setAllData(formatted);
    } catch (error) {
      console.error("Execute SQL API Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };


  const captureChartAsImage = async (elementId: string): Promise<string | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;
    // HIDE DELETE ICONS BEFORE CAPTURE
    const deleteButtons = element.querySelectorAll(".chart-delete-btn");
    deleteButtons.forEach(btn => {
      (btn as HTMLElement).style.visibility = "hidden";
    });

    const prevOverflow = element.style.overflow;
    const prevHeight = element.style.height;

    element.style.overflow = "visible";
    element.style.height = "auto";

    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    //  RESTORE DELETE ICONS
    deleteButtons.forEach(btn => {
      (btn as HTMLElement).style.visibility = "visible";
    });

    element.style.overflow = prevOverflow;
    element.style.height = prevHeight;

    return canvas.toDataURL("image/png");
  };
  
  const handleSaveReport = async () => {
    try {
      setIsSaving(true);
      if (!selectedTables.length) return;

      const user = JSON.parse(localStorage.getItem("ig_user"));
      const selectedQuery = selectedTables[0];

      const reportConfig = {
        group_by: selectedGroupBy,

        filters: selectedFilters.map((f) => ({
          column: f.column,
          operator: f.operator,
          value: filterValues[`${f.column}|${f.operator}`],
        })),

        aggregations,

        selected_columns: selectedChartColumns,

        // charts: charts.map((c, index) => ({
        //   type: c.type,
        //   xAxis: c.xAxis,
        //   yAxis: c.yAxis,
        //   value: c.value,
        //   size: c.size,
        //   label: c.label,
        //   agg: c.agg,
        //   id: c.id,
        //   order: index + 1,
        //   customTitle: c.customTitle,
        // })),
        charts: charts.map((c, index) => ({
          ...c,                // 🔥 FULL FINAL STATE
          order: index + 1,
          rows: undefined      // ❌ rows save করার দরকার নেই
        })),
        column_renames: columnRenames,
        chat_history: chatHistory,
      };

      const chartImages = [];

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];

     
        const elementId = `report-chart-${chart.id}`;

        const imageBase64 = await captureChartAsImage(elementId);
        if (!imageBase64) continue;

        chartImages.push({
          chart_id: chart.id,
          type: chart.type,
          order: i + 1,
          image_base64: imageBase64
        });

      }







      const payload = {
        session_id: user.session_id,
        created_by: user.user_id,
        report_id: editReport?.report_id ?? `report_${Date.now()}`,
        report_name: reportName,
        query_history_id: selectedQuery.id,
        report_config: reportConfig,
        chart_images: chartImages
      };
      await ApiServices.report_save(payload);
    } catch (err) {
      console.error(" Save report error", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // useEffect(() => {
  //   console.log('selectedAggregations', selectedAggregations)
  // }, [selectedAggregations])

  return (
    <div className="flex flex-col rounded-xl m-4 max-w-screen overflow-hidden">
      <DataViewHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        selectedTables={selectedTables}
        setSelectedTables={setSelectedTables}
        tableOptions={tableOptions}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onRunScript={() => { }}
        reportName={reportName}
        setReportName={setReportName}
        onSaveReport={handleSaveReport}
        editReport={editReport}
        setIsRefreshing={setIsRefreshing}
        isSaving={isSaving}
      />
      {loading || isRefreshing ? (
        <div className="flex flex-col items-center justify-center w-full h-96">
          <AutorenewRoundedIcon
            className="w-5 h-5 text-gray-500 animate-spin"
            fontSize="small"
          />
          <p className="text-gray-500 text-lg mt-4">Loading Data...</p>
        </div>
      ) : selectedTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[69vh] text-gray-400">
          <div className="mb-3 text-4xl">
            <span className="material-symbols-outlined text-[30px]">glass_cup</span>
          </div>
          <p className="text-sm font-medium">
            Please select a view to create report
          </p>
        </div>
      ) : (
        <DataViewTable
          allData={allData}
          selectedTables={selectedTables.map((t) => t.ai_response)}
          globalFilter={globalFilter}
          selectedGroupBy={selectedGroupBy}
          setSelectedGroupBy={setSelectedGroupBy}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          filterValues={filterValues}
          setFilterValues={setFilterValues}
          aggregations={aggregations}
          setAggregations={setAggregations}
          selectedChartColumns={selectedChartColumns}
          setSelectedChartColumns={setSelectedChartColumns}
          charts={charts}
          setCharts={setCharts}
          columnRenames={columnRenames}
          setColumnRenames={setColumnRenames}
        />
      )}
      {/* ===== Aggregation Cards ===== */}
      {/* {selectedAggregations.length > 0 && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {selectedAggregations.map((item, index) => (
              <div
                key={`${item.column}_${item.agg}_${index}`}
                className="rounded-lg border p-3 bg-gray-50"
              >
                <div className="text-xs text-gray-500 uppercase">
                  {item.agg} of {item.column}
                </div>
                <div className="text-lg font-semibold text-gray-800 mt-1">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
