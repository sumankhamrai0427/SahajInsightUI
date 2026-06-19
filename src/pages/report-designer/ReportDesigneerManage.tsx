import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import DownloadView from "../../utils/download/downloadView";
import { AuthProvider, useAuth } from "../Auth/AuthContext";
import ApiServices from "../../services/ApiServices";
import { generatePDF } from "../../utils/download/function";
import Tippy from "@tippyjs/react";

const ReportDesignManage = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { downloadData, setDownloadData } = useAuth();
  const [reportsFetched, setReportsFetched] = useState(false);
  const isFetching = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem("ig_user"));
  const {
    previewChartData,
    setPreviewChartData,
    downloadChartData,
    setDownloadChartData,
  } = useAuth();
  
  const timeAgo = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return "";
    try {
      const [d, m, y] = dateStr.split("-");
      const isoDate = `${y}-${m}-${d}`;
      const cleanTime = new Date(`1970-01-01 ${timeStr}`).toLocaleTimeString(
        "en-GB",
        {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
      const fullTimestamp = `${isoDate} ${cleanTime}`;
      const created = new Date(fullTimestamp);
      const now = new Date();
      let diffMs = now.getTime() - created.getTime();
      if (diffMs < 0) return "Just now";
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      if (seconds < 5) return "Just now";
      if (seconds < 60) return `${seconds} sec ago`;
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hr ago`;
      if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
      if (days < 30)
        return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
      if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

      return `${years} year${years > 1 ? "s" : ""} ago`;
    } catch (e) {
      console.error("timeAgo parse error:", e);
      return "";
    }
  };
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("ig_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  useEffect(() => {
    fetchReportList();
  }, []);

  const fetchReportList = async (forceRefresh = false) => {
    if (isFetching.current || (reportsFetched && !forceRefresh)) return;
    isFetching.current = true;
    try {
      setLoading(true);
      const user = getStoredUser();
      if (!user?.session_id || !user?.user_id) {
        console.error("Session or User ID missing");
        return;
      }
      const payload = {
        session_id: user.session_id,
        created_by: user.user_id,
      };
      const response = await ApiServices.getReportList(payload);
      setReports(response?.data?.data?.["Report list"] || []);
      setReportsFetched(true);
    } catch (error) {
      setReportsFetched(false);
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  const filteredReports = reports.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(globalFilter.toLowerCase())
    )
  );
  const formatNumber = (value: number, decimals = 2) => {
    return Number.isFinite(value) ? value.toFixed(decimals) : "";
  };

  const buildFinalRows = (
    rawRows: any[],
    columns: string[],
    groupBy?: string,
    aggregations?: {
      column: string;
      agg: "sum" | "max" | "min" | "avg" | "count";
    }[]
  ) => {
    const hasGroup = !!groupBy;
    const hasAgg = !!aggregations?.length;
    if (!hasGroup && !hasAgg) {
      return rawRows;
    }
    if (!hasGroup && hasAgg) {
      const labelColumn = columns[0];
      const finalRows: any[] = [];
      aggregations!.forEach((agg) => {
        const values = rawRows
          .map((r) => Number(r[agg.column]))
          .filter((v) => !isNaN(v));
        let val: number | string = "";
        switch (agg.agg) {
          case "sum": {
            const total = values.reduce((a, b) => a + b, 0);
            val = formatNumber(total);
            break;
          }
          case "max": {
            const max = values.length ? Math.max(...values) : NaN;
            val = formatNumber(max);
            break;
          }
          case "min": {
            const min = values.length ? Math.min(...values) : NaN;
            val = formatNumber(min);
            break;
          }
          case "avg": {
            const avg = values.length
              ? values.reduce((a, b) => a + b, 0) / values.length
              : NaN;
            val = formatNumber(avg);
            break;
          }
          case "count":
            val = values.length.toString(); 
            break;
        }

        const row: any = {};
        columns.forEach((c) => (row[c] = ""));
        row[labelColumn] = agg.agg.toUpperCase();
        row[agg.column] = val;
        row.__isAggregation = true;

        finalRows.push(row);
      });
      return finalRows;
    }
    const grouped: Record<string, any[]> = {};
    rawRows.forEach((r) => {
      const key = r[groupBy!] ?? "UNKNOWN";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    const finalRows: any[] = [];
    const labelColumn = columns[0];
    Object.keys(grouped).forEach((groupKey) => {
      const rows = grouped[groupKey];
      rows.forEach((r) => finalRows.push({ ...r }));
      if (!hasAgg) return;
      aggregations!.forEach((agg) => {
        const values = rows
          .map((r) => Number(r[agg.column]))
          .filter((v) => !isNaN(v));

        let val: number | string = "";
        switch (agg.agg) {
          case "sum": {
            const total = values.reduce((a, b) => a + b, 0);
            val = formatNumber(total);
            break;
          }
          case "max": {
            const max = values.length ? Math.max(...values) : NaN;
            val = formatNumber(max);
            break;
          }
          case "min": {
            const min = values.length ? Math.min(...values) : NaN;
            val = formatNumber(min);
            break;
          }
          case "avg": {
            const avg = values.length
              ? values.reduce((a, b) => a + b, 0) / values.length
              : NaN;
            val = formatNumber(avg);
            break;
          }
          case "count":
            val = values.length.toString(); 
            break;
        }

        const row: any = {};
        columns.forEach((c) => (row[c] = ""));
        row[labelColumn] = agg.agg.toUpperCase();
        row[agg.column] = val;
        row.__isAggregation = true;

        finalRows.push(row);
      });
    });

    return finalRows;
  };

  const handlePreview = async (report: any) => {
    setPreviewingId(report.report_id);
    try {
      const aiResponse = report?.query?.ai_responce;
      if (!aiResponse) return;

      const execRes = await ApiServices.executeSql({
        sql_query: aiResponse,
        session_id: userData?.session_id,
      });

      const api = execRes.data.data;

      const config =
        typeof report.report_config === "string"
          ? JSON.parse(report.report_config)
          : report.report_config;
      const finalRows = buildFinalRows(
        api.rows,
        api.columns,
        config.group_by?.[0],
        config.aggregations
      );
      const chartsForPreview = (config.charts || []).map((c: any) => ({
        ...c,
        rows: api.rows,
      }));
      setPreviewChartData(chartsForPreview);
      await new Promise((res) => setTimeout(res, 500));

      const chartImages = (config.chart_images || []).map(
        (img: any) => img.url
      );
      const cleanFileName = report.report_name
        .replace(/\s*report$/i, "")
        .trim();
      await generatePDF(
        {
          rows: finalRows,
          columns: api.columns.map((c: string) => ({
            column_name: c,
            header: config.column_renames?.[c] || undefined,
          })),
        },
        chartImages,
        "preview",
        cleanFileName,
        chartsForPreview
      );
    } catch (err) {
      console.error("Preview failed", err);
    } finally {
      setPreviewingId(null);
    }
  };
  const handleDownload = async (report: any) => {
    setDownloadingId(report.report_id);
    try {
      const aiResponse = report?.query?.ai_responce;
      if (!aiResponse) return;
      const execRes = await ApiServices.executeSql({
        sql_query: aiResponse,
        session_id: userData?.session_id,
      });
      const api = execRes.data.data;
      const config =
        typeof report.report_config === "string"
          ? JSON.parse(report.report_config)
          : report.report_config;
      const finalRows = buildFinalRows(
        api.rows,
        api.columns,
        config.group_by?.[0],
        config.aggregations
      );

      const chartsForDownload = (config.charts || []).map((c: any) => ({
        ...c,
        rows: api.rows,
      }));

      const chartImages = (config.chart_images || []).map(
        (img: any) => img.url
      );
      const cleanFileName = report.report_name
        .replace(/\s*report$/i, "")
        .trim();
      await generatePDF(
        {
          rows: finalRows,
          columns: api.columns.map((c: string) => ({
            column_name: c,
            header: config.column_renames?.[c] || undefined,
          })),
        },
        chartImages,
        "download",
        cleanFileName,
        chartsForDownload
      );
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setGlobalFilter("");
    await fetchReportList(true);
  };
  return (
    <div className="mx-auto px-6 py-8 h-[calc(97vh-6rem)] flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">
              Report Designer
            </h1>
            <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
              Create reports from saved queries and visualise your data.
            </p>
          </div>

          <button
            className="bg-[#7CA1F3] hover:bg-blue-500 h-10 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center"
            style={{ width: "108px" }}
            onClick={() => navigate("/layout/report-designer-view")}
          >
            Create Report
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Global Search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
              style={{ width: "568px" }}
            />
          </div>
          <Tippy content="Refresh" theme="gray">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`
                          w-10 h-10 flex items-center justify-center rounded-xl border border-[#D9D9D9] 
                          bg-[#D9D9D9] hover:bg-[#D9D9D9] transition-all
                          ${isRefreshing
                  ? "opacity-70 cursor-wait"
                  : "cursor-pointer"
                }
                        `}
            >
              <AutorenewRoundedIcon
                className={`w-5 h-5 text-gray-500 ${isRefreshing ? "animate-spin" : ""
                  }`}
                fontSize="small"
              />
            </button>
          </Tippy>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-24 text-gray-500">
          <AutorenewRoundedIcon className="animate-spin" fontSize="small" />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
          <div>
            <table className="w-full text-[15px] table-fixed">
              <thead className="bg-gray-100 text-[#3D5B81]">
                <tr>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">
                    Report Name
                  </th>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">
                    Saving Date
                  </th>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">
                    Saving Time
                  </th>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">
                    Update Date
                  </th>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">
                    Update Time
                  </th>
                  <th className="px-5 py-2.5 bg-gray-100 text-left">Rows</th>
                  <th className="px-5 py-2.5 bg-gray-100">Action</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[65vh]">
            <table className="w-full text-[15px] table-fixed">
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((item) => {
                  return (
                    <tr key={item.report_id} className="hover:bg-gray-50">
                      <td className="px-6 py-2.5 text-xs">{item.report_name}</td>

                      <td className="px-6 py-2.5 text-xs text-gray-600">
                        {item.actual_created_date}
                      </td>

                      <td className="px-6 py-2.5 text-xs text-gray-600">
                        {timeAgo(
                          item.actual_created_date,
                          item.actual_created_at
                        )}
                      </td>

                      <td className="px-6 py-2.5 text-xs text-gray-600">
                        {item.actual_saved_date}
                      </td>

                      <td className="px-6 py-2.5 text-xs text-gray-600">
                        {timeAgo(item.actual_saved_date, item.actual_saved_at)}
                      </td>

                      <td className="px-6 py-2.5 text-xs text-gray-600">
                        {item.row_affected}
                      </td>

                      <td className="px-6 py-2.5">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs w-[60px] flex items-center justify-center"
                            onClick={() => handlePreview(item)}
                            disabled={previewingId !== null}
                          >
                            {previewingId === item.report_id ? (
                              <AutorenewRoundedIcon className="animate-spin" fontSize="small" />
                            ) : (
                              "Preview"
                            )}
                          </button>

                          <button
                            className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-xs w-[80px] flex items-center justify-center"
                            onClick={() => handleDownload(item)}
                            disabled={downloadingId !== null}
                          >
                            {downloadingId === item.report_id ? (
                              <AutorenewRoundedIcon className="animate-spin" fontSize="small" />
                            ) : (
                              "Download"
                            )}
                          </button>
                          <button
                            className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs"
                            onClick={() => {
                              console.log(" Edit Report Data:", item);

                              navigate("/layout/report-designer-view", {
                                state: { report: item },
                              });
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-20rem)]">
          <MdOutlineHourglassEmpty size={40} className="text-gray-400" />
          <p className="text-gray-500 mt-2">Empty Report List</p>
        </div>
      )}
    </div>
  );
};

export default ReportDesignManage;
