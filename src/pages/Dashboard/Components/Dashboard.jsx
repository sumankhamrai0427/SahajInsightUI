import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../../services/ApiServices";
import {
  FileText, Database, Search, FileBarChart, Clock, Target,
  TrendingUp, Activity, Lightbulb, CheckCircle2, Layers
} from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  const userData = JSON.parse(localStorage.getItem("ig_user"));
  const createdBy = userData?.user_id || "SahajInsight";
  const sessionId = userData?.session_id || "";

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchDashboardData();
    }
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const payload = { created_by: createdBy, session_id: sessionId };
      const response = await ApiService.getDashboardData(payload);
      if (response?.data?.isSuccess) setDashboardData(response.data.data);
    } catch (error) { console.error("Fetch Error:", error); }
    finally { setLoading(false); }
  }

  const insightsArray = dashboardData?.latest_file?.insights ? JSON.parse(dashboardData.latest_file.insights) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Loading dashboard insights...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F9FAFB] p-3 md:p-6 text-slate-900">

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
           Data Performance Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium ml-1 mt-2 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" /> Monitoring active sessions for <b>{createdBy}</b>
          </p>
        </div>
      </div>

      {/* 2. TOP KPI ROW - Using API keys exactly */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-8">
        <KPICard icon={<FileText size={18} />} label="Uploaded Files" value={dashboardData?.total_uploaded_files} color="blue" />
        <KPICard icon={<Database size={18} />} label="Extracted Files" value={dashboardData?.total_extracted_files} color="emerald" />
        <KPICard icon={<Search size={18} />} label="Total Queries" value={dashboardData?.total_queries} color="violet" />
        <KPICard icon={<FileBarChart size={18} />} label="Reports Generated" value={dashboardData?.total_reports_generated} color="indigo" />
        <KPICard icon={<Clock size={18} />} label="Avg Query Time" value={`${dashboardData?.avg_query_time}s`} color="amber" />
        <KPICard icon={<Target size={18} />} label="Query Success Rate" value={`${dashboardData?.query_success_rate}%`} color="rose" />
        <KPICard icon={<Layers size={18} />} label="Avg Rows/Report" value={dashboardData?.avg_rows_per_report} color="cyan" />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {/* 3. LATEST FILE STATUS - Analysis based on 'latest_file' object */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-700 uppercase text-xs tracking-widest">
              <TrendingUp size={16} className="text-indigo-500" /> Latest Processing Details
            </h3>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {dashboardData?.latest_file?.file_type} Engine
            </span>
          </div>
          <div className="p-5 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">File Name</span>
                <h4 className="text-xl md:text-2xl font-black text-slate-800 break-all truncate max-w-md">
                  {dashboardData?.latest_file?.file_name || "No Active File"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Table: <span className="font-bold text-indigo-600">{dashboardData?.latest_file?.table_name}</span> • Size: {dashboardData?.latest_file?.file_size_mb}</p>
              </div>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <ProgressStat label="Total Rows" value={dashboardData?.latest_file?.total_rows} />
                <ProgressStat label="Last Inserted" value={dashboardData?.latest_file?.last_inserted_rows} />
                <ProgressStat label="Actual Columns" value={dashboardData?.latest_file?.actual_columns} />
              </div>
            </div>

            {/* Status Steps Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <StatusStep label="Table Extraction" status={dashboardData?.latest_file?.table_extraction_status} />
              <StatusStep label="Column Extraction" status={dashboardData?.latest_file?.column_extraction_status} />
              <StatusStep label="Data Insert Status" status={dashboardData?.latest_file?.data_insert_status} />
            </div>
          </div>
        </div>

        {/* 4. QUERY ACTIVITY TREND */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-6 text-xs uppercase tracking-widest">Query Activity Trend</h3>
          <div className="h-[200px] md:h-[250px]">
            <Line
              data={{
                labels: dashboardData?.query_activity_trend?.map(d => new Date(d.query_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })) || [],
                datasets: [{
                  data: dashboardData?.query_activity_trend?.map(d => d.total_queries) || [],
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#6366f1'
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
              }}
            />
          </div>
        </div>

        {/* 5. TOP TABLES USED */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-8 text-xs uppercase tracking-widest">Top Tables Used</h3>
          <div className="space-y-6">
            {dashboardData?.top_tables_used?.map((table, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] font-bold mb-2 uppercase tracking-tight">
                  <span className="text-slate-600">{table.table_name}</span>
                  <span className="text-indigo-600">{table.usage_count} Usage</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(table.usage_count / Math.max(...dashboardData.top_tables_used.map(t => t.usage_count))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. AI INSIGHTS */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500 shrink-0" /> Insights from Latest File
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2">
            {insightsArray.length > 0 ? insightsArray.map((insight, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] md:text-xs leading-relaxed text-slate-600 flex gap-3 italic">
                <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                {insight}
              </div>
            )) : <p className="text-slate-400 text-xs col-span-2">No insights available for this file.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

/* --- Responsive Sub-Components --- */

function KPICard({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 border-blue-100 bg-blue-50/20",
    emerald: "text-emerald-600 border-emerald-100 bg-emerald-50/20",
    violet: "text-violet-600 border-violet-100 bg-violet-50/20",
    amber: "text-amber-600 border-amber-100 bg-amber-50/20",
    rose: "text-rose-600 border-rose-100 bg-rose-50/20",
    cyan: "text-cyan-600 border-cyan-100 bg-cyan-50/20",
    indigo: "text-indigo-600 border-indigo-100 bg-indigo-50/20"
  };
  return (
    <div className={`p-4 rounded-2xl border transition-all hover:shadow-md ${colors[color]} bg-white`}>
      <div className="mb-2 p-1.5 bg-white rounded-lg w-fit shadow-sm border border-inherit">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-lg font-black mt-1 text-slate-800">{value ?? "0"}</p>
    </div>
  );
}

function StatusStep({ label, status }) {
  const isDone = status === "done";
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{label}</span>
      {isDone ? (
        <CheckCircle2 size={18} className="text-emerald-500" />
      ) : (
        <div className="flex gap-1 animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      )}
    </div>
  );
}

function ProgressStat({ label, value }) {
  return (
    <div className="flex-1 min-w-[90px] text-left md:text-center px-2 md:border-r last:border-0 border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-sm md:text-base font-black text-slate-800">{value ?? "N/A"}</p>
    </div>
  );
}