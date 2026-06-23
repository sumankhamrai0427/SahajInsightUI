import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useTheme } from "../../../theme";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ApiServices from "../../../services/ApiServices";
import { useAuth } from "../../Auth/AuthContext";
import ConfirmSaveView from "../../../Modal/ConfirmSaveView";
import AnimatedToggleButton from "../../query-designer/components/AnimatedToggleButton";
import TableParents from "../../query-designer/components/TableParents";
import { Snackbar, Alert } from "@mui/material";

interface Props {
  files: any[];
  onRefresh?: () => void | Promise<void>;
}

const STEPS = ["Table Extraction", "Column Extraction", "Data Insert Status"];
const TOTAL_STEPS = STEPS.length;

export default function DataProcessing({ files, onRefresh }: Props) {
  const { user, setIsConfirmSaveModalOpen, isConfirmSaveModalOpen } = useAuth();

  const { theme } = useTheme();
  const navigate = useNavigate();
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRowDetails, setSelectedRowDetails] = useState<any>(null);
  const [deleteFile, setDeleteFile] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({ open: false, message: "", severity: "success" });

  const ITEMS_PER_PAGE = 5;

  const csvFiles = files.filter(f => f.file_type !== "web_search");
  const webSearchFiles = files.filter(f => f.file_type === "web_search");

  const [csvPage, setCsvPage] = useState(1);
  const [webPage, setWebPage] = useState(1);

  // Group CSV files by workspace
  interface GroupedWorkspace {
    workspaceName: string;
    files: any[];
  }

  const getGroupedCsvs = (): GroupedWorkspace[] => {
    const groups: Record<string, any[]> = {};
    csvFiles.forEach(file => {
      const wsName = file.workspace_name || "Unassigned Workspace";
      if (!groups[wsName]) {
        groups[wsName] = [];
      }
      groups[wsName].push(file);
    });

    return Object.entries(groups).map(([workspaceName, files]) => ({
      workspaceName,
      files
    }));
  };

  const groupedCsvs = getGroupedCsvs();
  const csvTotalPages = Math.ceil(groupedCsvs.length / ITEMS_PER_PAGE) || 1;
  const csvStartIndex = (csvPage - 1) * ITEMS_PER_PAGE;
  const csvEndIndex = Math.min(csvStartIndex + ITEMS_PER_PAGE, groupedCsvs.length);
  const paginatedGroupedCsvFiles = groupedCsvs.slice(csvStartIndex, csvEndIndex);

  const webTotalPages = Math.ceil(webSearchFiles.length / ITEMS_PER_PAGE) || 1;
  const webStartIndex = (webPage - 1) * ITEMS_PER_PAGE;
  const webEndIndex = Math.min(webStartIndex + ITEMS_PER_PAGE, webSearchFiles.length);
  const paginatedWebFiles = webSearchFiles.slice(webStartIndex, webEndIndex);

  const [fileDependencies, setFileDependencies] = useState<string | null>(null);

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsFile, setLogsFile] = useState<any>(null);

  const handleViewLogs = (file: any) => {
    setLogsFile(file);
    setIsLogsModalOpen(true);
  };

  const getLogsForFile = (file: any) => {
    const logs = [];
    const dateStr = file.created_date || new Date().toLocaleDateString();
    const timeStr = formatTo12Hour(file.created_at) || "12:00 AM";
    const name = file.name || file.file_name;

    logs.push(`[${dateStr} ${timeStr}] [INFO] Initializing ingestion pipeline for file: "${name}"`);
    logs.push(`[${dateStr} ${timeStr}] [INFO] Reading upload source from dynamic metadata store...`);

    if (file.table_extraction_status?.toLowerCase() === "done") {
      logs.push(`[${dateStr} ${timeStr}] [SUCCESS] Table extraction completed. Table created: "${file.table_name}"`);
    } else if (file.table_extraction_status?.toLowerCase() === "failed") {
      logs.push(`[${dateStr} ${timeStr}] [ERROR] Table extraction failed. Check CSV formatting or syntax.`);
    } else {
      logs.push(`[${dateStr} ${timeStr}] [PENDING] Table extraction is currently in progress or queued.`);
    }

    if (file.column_extraction_status?.toLowerCase() === "done") {
      logs.push(`[${dateStr} ${timeStr}] [SUCCESS] Column extraction completed. Inferred types and generated schemas successfully.`);
    } else if (file.column_extraction_status?.toLowerCase() === "failed") {
      logs.push(`[${dateStr} ${timeStr}] [ERROR] Column extraction failed.`);
    } else {
      logs.push(`[${dateStr} ${timeStr}] [PENDING] Column schema mapping is pending.`);
    }

    if (file.data_insert_status?.toLowerCase() === "done") {
      logs.push(`[${dateStr} ${timeStr}] [SUCCESS] Data insert completed. Loaded ${file.rows_effected || 0} rows into "${file.table_name}".`);
      logs.push(`[${dateStr} ${timeStr}] [INFO] File processing pipeline finished successfully.`);
    } else if (file.data_insert_status?.toLowerCase() === "failed") {
      logs.push(`[${dateStr} ${timeStr}] [ERROR] Data insert failed. Connection reset or field mismatch.`);
    } else {
      logs.push(`[${dateStr} ${timeStr}] [PENDING] Writing data rows to database is pending.`);
    }

    return logs;
  };

  // Selection states
  const [selectedCsvs, setSelectedCsvs] = useState<string[]>([]);
  const [selectedWebs, setSelectedWebs] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTableName, setEditTableName] = useState("");
  const [editWorkspaceId, setEditWorkspaceId] = useState<number | string>("");

  const [isFetchingViewData, setIsFetchingViewData] = useState(false);
  const [viewTableData, setViewTableData] = useState<{ rows: any[]; columns: any[]; insights: any[]; tableName: string }>({
    rows: [],
    columns: [],
    insights: [],
    tableName: "",
  });
  const [viewExplorerSelection, setViewExplorerSelection] = useState<string>("dataview");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const userIdentifier = user?.email || user?.user_email || user?.user_id;
      if (!userIdentifier) return;
      try {
        const payload = {
            user_email: userIdentifier,
            session_id: user?.session_id,
            created_by: user?.user_id || ""
        };
        const res = await ApiServices.getUserWorkspaces(payload);
        if (res.data?.isSuccess) {
          setWorkspaces(res.data.data || []);
        }
      } catch (e) {
        console.error("Error fetching workspaces", e);
      }
    };
    fetchWorkspaces();
  }, [user]);

  useEffect(() => {
    setCsvPage(1);
    setWebPage(1);
  }, [files]);

  const handleOpenEdit = (file: any) => {
    setEditingFile(file);
    setEditTableName(file.table_name || "");
    setEditWorkspaceId(file.workspace_id || "");
  };

  const handleSaveEdit = async () => {
    if (!editTableName.trim()) {
      setSnackbar({ open: true, message: "Table name is required", severity: "error" });
      return;
    }
    setIsSavingEdit(true);
    try {
      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        file_id: editingFile.file_id || editingFile.id,
        workspace_id: editWorkspaceId ? Number(editWorkspaceId) : null,
        table_name: editTableName.trim()
      };
      const response = await ApiServices.updateUploadedFile(payload);
      if (response.data?.isSuccess) {
        setSnackbar({ open: true, message: "File updated successfully", severity: "success" });
        setEditingFile(null);
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setSnackbar({ open: true, message: response.data?.message || "Failed to update file", severity: "error" });
      }
    } catch (error: any) {
      console.error("Update failed", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating file",
        severity: "error"
      });
    } finally {
      setIsSavingEdit(false);
    }
  };
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const handleToggleCsv = (fileName: string) => {
    setSelectedCsvs(prev =>
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleToggleWeb = (fileName: string) => {
    setSelectedWebs(prev =>
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSelectAllCsv = (checked: boolean) => {
    if (checked) {
      setSelectedCsvs(csvFiles.map(f => f.name || f.file_name));
    } else {
      setSelectedCsvs([]);
    }
  };

  const handleSelectAllWeb = (checked: boolean) => {
    if (checked) {
      setSelectedWebs(webSearchFiles.map(f => f.name || f.file_name));
    } else {
      setSelectedWebs([]);
    }
  };

  const handleImportSummary = async () => {
    setIsSummarizing(true);
    try {
      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        csv_files: selectedCsvs,
        web_searches: selectedWebs
      };
      const response = await ApiServices.summarizeSources(payload);
      if (response.data?.isSuccess) {
        setSummaryResult(response.data.data.summary);
        setIsSummaryModalOpen(true);
      } else {
        alert(response.data?.message || "Failed to generate summary.");
      }
    } catch (error: any) {
      console.error("Summarize failed", error);
      alert(error?.response?.data?.message || "Error generating summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleWantToKnowMore = async () => {
    setIsIngesting(true);
    try {
      const wsId = localStorage.getItem("selected_workspace") || localStorage.getItem("active_workspace_id") || user?.workspace_id;
      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        workspace_id: wsId,
        csv_files: selectedCsvs,
        web_searches: selectedWebs
      };
      const response = await ApiServices.ingestSelectedSources(payload);
      if (response.data?.isSuccess) {
        localStorage.setItem("rag_flow_type", "selected");
        localStorage.setItem("selected_csvs", JSON.stringify(selectedCsvs));
        localStorage.setItem("selected_webs", JSON.stringify(selectedWebs));
        setIsSummaryModalOpen(false);
        navigate("/layout/query-list");
      } else {
        alert(response.data?.message || "Failed to ingest selected sources.");
      }
    } catch (error: any) {
      console.error("Ingestion failed", error);
      alert(error?.response?.data?.message || "Error ingesting selected sources.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRowClick = async (file: any) => {
    const tableName = file.table_name;
    if (!tableName) return;

    try {
      const parsedData = {
        ...file,
        query_titles:
          typeof file.query_titles === "string"
            ? JSON.parse(file.query_titles)
            : file.query_titles || [],
        report_names:
          typeof file.report_names === "string"
            ? JSON.parse(file.report_names)
            : file.report_names || [],
      };

      setSelectedRowDetails(parsedData);
      setIsDetailsModalOpen(true);
      setIsFetchingViewData(true);

      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        table_name: tableName,
      };

      const response = await ApiServices.getTableData(payload);
      const detail = response.data?.data?.details?.[tableName] || {};
      setViewTableData({
        rows: detail.data || [],
        columns: detail.columns || [],
        insights: Array.isArray(detail.insights)
          ? detail.insights
          : JSON.parse(detail.insights || "[]"),
        tableName: tableName,
      });
    } catch (err) {
      console.error("Failed to parse row details or fetch table data", err);
      setViewTableData({
        rows: [],
        columns: [],
        insights: [],
        tableName: tableName,
      });
    } finally {
      setIsFetchingViewData(false);
    }
  };

  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute, second] = timeStr.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  useEffect(() => {
    setCsvPage(1);
    setWebPage(1);
    setSelectedCsvs([]);
    setSelectedWebs([]);
  }, [files]);

  useEffect(() => {
    const initialProgress: Record<string, number> = {};

    files.forEach(file => {
      const fileName = file.name || file.file_name;
      let progress = 0;

      if (file.table_extraction_status?.toLowerCase() === 'done') {
        progress = 1;
      }
      if (file.column_extraction_status?.toLowerCase() === 'done') {
        progress = 2;
      }
      if (file.data_insert_status?.toLowerCase() === 'done') {
        progress = 3;
      }

      initialProgress[fileName] = progress;
    });

    setProcessingProgress(initialProgress);
  }, [files]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleNavigateToDashboard = (file: any) => {
    const fileName = file.name || file.file_name;
    const progress = processingProgress[fileName] || 0;

    if (progress >= TOTAL_STEPS) {
      navigate('/layout/table-insights', {
        state: {
          sessionId: file.session_id,
          sessionName: file.session_name,
          fileName: fileName
        }
      });
    }
  };

  const handleDeleteFile = async (file: any) => {
    try {
      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        file_name: file.name || file.file_name,
      };

      const response = await ApiServices.deleteUploadedFile(payload);
      const res = response.data;

      if (res?.isSuccess) {
        setIsConfirmSaveModalOpen(false);
        setIsDetailsModalOpen(false);
        if (onRefresh) {
          await onRefresh();
        }
        setSnackbar({ open: true, message: "File deleted successfully", severity: "success" });
        return;
      }

      if (!res?.isSuccess && res?.message) {
        setFileDependencies(res.message);
        return;
      }

      alert(res?.message || "Unable to delete file");
      setIsConfirmSaveModalOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error: any) {
      console.error("Delete failed", error);
      alert("Something went wrong while deleting file");
      setIsConfirmSaveModalOpen(false);
      setIsDetailsModalOpen(false);
    }
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-gray-900">{part}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-bold text-gray-800 mt-4 mb-2">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-base font-bold text-gray-800 mt-5 mb-2 border-b pb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-lg font-extrabold text-blue-600 mt-6 mb-3">
            {line.replace("# ", "")}
          </h2>
        );
      }
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const bulletText = line.trim().replace(/^[-*]\s+/, "");
        return (
          <li key={index} className="ml-4 list-disc text-xs text-gray-700 mb-1.5">
            {parseBoldText(bulletText)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-xs text-gray-700 mb-2 leading-relaxed">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div className="mt-6 space-y-12">
      {/* -------------------- SECTION 1: UPLOADED FILES (CSV) -------------------- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label
            className="block text-sm font-semibold"
            style={{ color: theme.primaryText }}
          >
            Uploaded Files
          </label>
          <Tippy content="Refresh" theme="gray">
            <div
              onClick={handleRefresh}
              className={`relative text-center border rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${isRefreshing
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-500/10"
                }`}
              style={{ borderColor: theme.border }}
            >
              {isRefreshing ? (
                <AutorenewRoundedIcon
                  className="w-5 h-5 animate-spin"
                  sx={{ color: theme.secondaryText }}
                />
              ) : (
                <AutorenewRoundedIcon
                  className="w-5 h-5"
                  sx={{
                    color: theme.secondaryText,
                    "&:hover": { color: theme.primaryText },
                  }}
                />
              )}
            </div>
          </Tippy>
        </div>

        {csvFiles.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center border border-dashed text-sm"
            style={{
              borderColor: theme.border,
              color: theme.secondaryText,
              backgroundColor: theme.surface
            }}
          >
            No uploaded files found.
          </div>
        ) : (
          <>
            {/* Scrollable container for the whole table */}
            <div className="overflow-x-auto w-full pr-2">
              <div className="min-w-[1500px]">
                
                {/* Global Column Headers */}
                <div className="mb-3">
                  <div className="flex items-center gap-4 px-4 py-2 rounded-xl" style={{ backgroundColor: theme.border + '20' }}>
                    <div className="flex-[1.5] min-w-[150px] text-xs font-semibold" style={{ color: theme.secondaryText }}>
                      Workspace Name
                    </div>
                    <div className="flex-[13.7] flex items-center gap-4">
                      <div className="w-12 flex-shrink-0 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={csvFiles.length > 0 && selectedCsvs.length === csvFiles.length}
                          onChange={(e) => handleSelectAllCsv(e.target.checked)}
                          className="w-4 h-4 rounded text-[#7CA1F3] focus:ring-[#7CA1F3] border-gray-300 cursor-pointer"
                        />
                      </div>
                      <div className="flex-[2] min-w-[200px] text-xs font-semibold" style={{ color: theme.secondaryText }}>
                        File Name
                      </div>
                      <div className="flex-[1.5] min-w-[150px] text-xs font-semibold" style={{ color: theme.secondaryText }}>
                        Table Names
                      </div>
                      <div className="flex-[0.8] min-w-[80px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Row Affected
                      </div>
                      <div className="flex-[1] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Table Extraction
                      </div>
                      <div className="flex-[1] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Column Extraction
                      </div>
                      <div className="flex-[1] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Data Insert Status
                      </div>
                      <div className="flex-[1] min-w-[80px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        File Size
                      </div>
                      <div className="flex-[1.2] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Created Date
                      </div>
                      <div className="flex-[1.2] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Uploaded At
                      </div>
                      <div className="flex-[1] min-w-[100px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Status
                      </div>
                      <div className="flex-[0.8] min-w-[80px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Log
                      </div>
                      <div className="flex-[1.2] min-w-[120px] text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                        Action
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workspace Grouped Cards */}
                <div className="space-y-3">
                  {paginatedGroupedCsvFiles.map((group, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-stretch rounded-xl overflow-hidden bg-gray-200"
                        style={{ border: `1px solid ${theme.border}` }}
                      >
                        {/* Left column: Workspace Name */}
                        <div
                          className="flex-[1.5] min-w-[150px] p-4 flex items-center bg-gray-300 font-semibold text-sm break-words whitespace-normal"
                          style={{ color: theme.primaryText }}
                        >
                          {group.workspaceName}
                        </div>

                        {/* Right column: Files list stack */}
                        <div className="flex-[13.7] flex flex-col divide-y divide-gray-300 bg-gray-200">
                          {group.files.map((file, fileIdx) => {
                            const fileName = file.name || file.file_name;
                            const currentProgress = processingProgress[fileName] || 0;
                            const isFullyProcessed = currentProgress >= TOTAL_STEPS;
                            const extractionFailed =
                              file.table_extraction_status?.toLowerCase() === "failed" ||
                              file.table_extraction_status?.toLowerCase() === "pending";

                            return (
                              <div
                                key={fileIdx}
                                className="flex items-center gap-4 p-4 hover:bg-gray-300 transition-colors duration-200"
                              >
                                {/* Checkbox */}
                                <div className="w-12 flex-shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={selectedCsvs.includes(fileName)}
                                    onChange={() => handleToggleCsv(fileName)}
                                    className="w-4 h-4 rounded text-[#7CA1F3] focus:ring-[#7CA1F3] border-gray-300 cursor-pointer"
                                  />
                                </div>

                                {/* File Name */}
                                <div className="flex-[2] min-w-[200px]">
                                  <div
                                    className="text-sm font-medium break-words whitespace-normal"
                                    style={{ color: theme.primaryText }}
                                  >
                                    {fileName}
                                  </div>
                                </div>

                                {/* Table Names */}
                                <div className="flex-[1.5] min-w-[150px]">
                                  <div
                                    className="text-sm font-medium break-words whitespace-normal"
                                    style={{ color: theme.primaryText }}
                                  >
                                    {file.table_name || 'N/A'}
                                  </div>
                                </div>

                                {/* Row Affected */}
                                <div className="flex-[0.8] min-w-[80px]">
                                  <div
                                    className="text-sm font-medium text-center"
                                    style={{ color: theme.primaryText }}
                                  >
                                    {file.rows_effected || 0}
                                  </div>
                                </div>

                                {/* Table Extraction Status */}
                                <div className="flex-[1] min-w-[100px]">
                                  <div className="flex justify-center">
                                    {extractionFailed ? (
                                      <span className="text-red-500 text-xs font-medium">Failed</span>
                                    ) : file.table_extraction_status?.toLowerCase() === 'done' ? (
                                      <CheckCircleIcon sx={{ fontSize: 20, color: theme.accent }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.secondaryText }} />
                                    )}
                                  </div>
                                </div>

                                {/* Column Extraction Status */}
                                <div className="flex-[1] min-w-[100px]">
                                  <div className="flex justify-center">
                                    {file.column_extraction_status?.toLowerCase() === 'done' ? (
                                      <CheckCircleIcon sx={{ fontSize: 20, color: theme.accent }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.secondaryText }} />
                                    )}
                                  </div>
                                </div>

                                {/* Data Insert Status */}
                                <div className="flex-[1] min-w-[100px]">
                                  <div className="flex justify-center">
                                    {file.data_insert_status?.toLowerCase() === 'done' ? (
                                      <CheckCircleIcon sx={{ fontSize: 20, color: theme.accent }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.secondaryText }} />
                                    )}
                                  </div>
                                </div>

                                {/* File Size */}
                                <div className="flex-[1] min-w-[80px]">
                                  <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                                    {file.file_size_mb || (file.size ? `${(file.size / (1024 * 1024)).toFixed(2)}MB` : 'N/A')}
                                  </div>
                                </div>

                                {/* Created Date */}
                                <div className="flex-[1.2] min-w-[100px]">
                                  <div
                                    className="text-sm font-medium text-center"
                                    style={{ color: theme.primaryText }}
                                  >
                                    {file.created_date || "N/A"}
                                  </div>
                                </div>

                                {/* Uploaded At */}
                                <div className="flex-[1.2] min-w-[100px]">
                                  <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                                    {formatTo12Hour(file.created_at) || new Date().toLocaleDateString()}
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="flex-[1] min-w-[100px]">
                                  <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                                    {file.status || 'processed'}
                                  </div>
                                </div>

                                {/* Log Button */}
                                <div className="flex-[0.8] min-w-[80px] flex justify-center" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleViewLogs(file)}
                                    className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition font-mono border border-gray-700 active:scale-95"
                                  >
                                    LOG
                                  </button>
                                </div>

                                {/* Actions */}
                                <div className="flex-[1.2] min-w-[120px] flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Tippy content="Edit file" theme="gray">
                                    <EditIcon
                                      onClick={() => handleOpenEdit(file)}
                                      sx={{
                                        fontSize: 20,
                                        color: "#9ca3af",
                                        cursor: "pointer",
                                        "&:hover": {
                                          color: theme.accent,
                                        },
                                      }}
                                    />
                                  </Tippy>
                                  <Tippy content="View file details" theme="gray">
                                    <VisibilityIcon
                                      onClick={() => handleRowClick(file)}
                                      sx={{
                                        fontSize: 20,
                                        color: "#9ca3af",
                                        cursor: "pointer",
                                        "&:hover": {
                                          color: "#10b981",
                                        },
                                      }}
                                    />
                                  </Tippy>
                                  <Tippy content="Delete file" theme="gray">
                                    <DeleteIcon
                                      onClick={() => {
                                        setDeleteFile(file);
                                        setFileDependencies(null);
                                        setIsConfirmSaveModalOpen(true);
                                      }}
                                      sx={{
                                        fontSize: 20,
                                        color: "#9ca3af",
                                        cursor: "pointer",
                                        "&:hover": {
                                          color: "#ef4444",
                                        },
                                      }}
                                    />
                                  </Tippy>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl mt-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min(csvStartIndex + 1, groupedCsvs.length)} to {Math.min(csvEndIndex, groupedCsvs.length)} of {groupedCsvs.length} workspaces
              </div>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => setCsvPage(p => p - 1)}
                  disabled={csvPage === 1}
                  className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${csvPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: csvTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCsvPage(page)}
                    className={`min-w-[32px] h-[32px] text-sm font-medium rounded-xl transition-all ${csvPage === page
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCsvPage(p => p + 1)}
                  disabled={csvPage === csvTotalPages}
                  className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${csvPage === csvTotalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* -------------------- SECTION 2: LLM WEB SEARCH HISTORY -------------------- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label
            className="block text-sm font-semibold"
            style={{ color: theme.primaryText }}
          >
            LLM Web Search History
          </label>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center
              ${isRefreshing 
                ? 'bg-blue-100 text-[#7CA1F3] cursor-not-allowed' 
                : 'hover:bg-blue-50 text-gray-500 hover:text-[#7CA1F3] cursor-pointer'
              }`}
            title="Refresh History"
          >
            <AutorenewRoundedIcon 
              sx={{ fontSize: 18 }} 
              className={`transition-all duration-500 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
            />
          </button>
        </div>

        {webSearchFiles.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center border border-dashed text-sm"
            style={{
              borderColor: theme.border,
              color: theme.secondaryText,
              backgroundColor: theme.surface
            }}
          >
            No web search history found.
          </div>
        ) : (
          <>
            {/* Headers */}
            <div className="mb-3 overflow-x-auto">
              <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-xl" style={{ backgroundColor: theme.border + '20' }}>
                <div className="w-12 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={webSearchFiles.length > 0 && selectedWebs.length === webSearchFiles.length}
                    onChange={(e) => handleSelectAllWeb(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7CA1F3] focus:ring-[#7CA1F3] border-gray-300 cursor-pointer"
                  />
                </div>
                <div className="flex-[2] min-w-0">
                  <div className="text-xs font-semibold" style={{ color: theme.secondaryText }}>
                    Query / Source Name
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Knowledge Chunks / Rows Affected
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Ingestion Date
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Ingestion Time
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Action
                  </div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto pr-2">
              {paginatedWebFiles.map((file, index) => {
                const fileName = file.name || file.file_name;

                return (
                  <div
                    key={index}
                    className="rounded-xl p-4 w-full mb-3 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Checkbox */}
                      <div className="w-12 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedWebs.includes(fileName)}
                          onChange={() => handleToggleWeb(fileName)}
                          className="w-4 h-4 rounded text-[#7CA1F3] focus:ring-[#7CA1F3] border-gray-300 cursor-pointer"
                        />
                      </div>

                      {/* Query Name */}
                      <div className="flex-[2] min-w-0">
                        <div className="relative group">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: theme.primaryText }}
                          >
                            {fileName}
                          </div>
                          <div className="absolute left-0 mt-1 hidden group-hover:block whitespace-nowrap bg-[#888585] text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                            {fileName}
                          </div>
                        </div>
                      </div>

                      {/* Chunks Affected */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.rows_effected || 0}
                        </div>
                      </div>

                      {/* Ingestion Date */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.created_date || "N/A"}
                        </div>
                      </div>

                      {/* Ingestion Time */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                          {formatTo12Hour(file.created_at) || new Date().toLocaleDateString()}
                        </div>
                      </div>

                      {/* Delete Action */}
                      <div className="flex-1 min-w-0 flex justify-center">
                        <Tippy content="Delete search history" theme="gray">
                          <DeleteIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteFile(file);
                              setFileDependencies(null);
                              setIsConfirmSaveModalOpen(true);
                            }}
                            sx={{
                              fontSize: 20,
                              color: "#9ca3af",
                              cursor: "pointer",
                              "&:hover": {
                                color: "#ef4444",
                              },
                            }}
                          />
                        </Tippy>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl mt-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min(webStartIndex + 1, webSearchFiles.length)} to {Math.min(webEndIndex, webSearchFiles.length)} of {webSearchFiles.length} records
              </div>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => setWebPage(p => p - 1)}
                  disabled={webPage === 1}
                  className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${webPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: webTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setWebPage(page)}
                    className={`min-w-[32px] h-[32px] text-sm font-medium rounded-xl transition-all ${webPage === page
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setWebPage(p => p - 1)}
                  disabled={webPage === webTotalPages}
                  className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${webPage === webTotalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* -------------------- IMPORT ACTION BUTTON (BOTTOM RIGHT) -------------------- */}
      <div className="flex justify-end mt-8">
        <button
          disabled={selectedCsvs.length === 0 && selectedWebs.length === 0}
          onClick={handleImportSummary}
          className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${(selectedCsvs.length === 0 && selectedWebs.length === 0)
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-blue-500 to-[#7CA1F3] hover:from-blue-600 hover:to-blue-500 cursor-pointer hover:shadow-xl active:scale-95"
            }`}
        >
          Import ({selectedCsvs.length + selectedWebs.length} Selected)
        </button>
      </div>

      {/* -------------------- LOADER OVERLAY -------------------- */}
      {isSummarizing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm border">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#7CA1F3] border-t-transparent" />
            <div className="text-center">
              <h3 className="font-semibold text-sm text-gray-800">Generating Summary...</h3>
              <p className="text-xs text-gray-500 mt-1"> analyzing.....</p>
            </div>
          </div>
        </div>
      )}

      {isIngesting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm border">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#7CA1F3] border-t-transparent" />
            <div className="text-center">
              <h3 className="font-semibold text-sm text-gray-800">Ingesting Data...</h3>
              <p className="text-xs text-gray-500 mt-1">Preparing selected files and web searches for RAG Chat.</p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PREMIUM SUMMARY MODAL -------------------- */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-[680px] max-h-[85vh] rounded-2xl shadow-2xl bg-white flex flex-col border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Data Ingestion Summary
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Synthesized AI insights on content and motive
                </p>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Selected items chip list */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-blue-600 block mb-1.5 uppercase tracking-wider">Summarized Sources</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCsvs.map((name, i) => (
                    <span key={`csv-${i}`} className="text-[10px] font-medium bg-blue-100/60 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                      📄 {name}
                    </span>
                  ))}
                  {selectedWebs.map((name, i) => (
                    <span key={`web-${i}`} className="text-[10px] font-medium bg-purple-100/60 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">
                      🌐 {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rendered Summary markdown content */}
              <div className="prose prose-sm max-w-none text-xs text-gray-800 leading-relaxed pb-4 border-b border-gray-100">
                {renderMarkdown(summaryResult)}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-200 active:scale-95 cursor-pointer"
              >
                Close Summary
              </button>
              <button
                disabled={isIngesting}
                onClick={handleWantToKnowMore}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition duration-200 active:scale-95 flex items-center gap-1.5 hover:scale-[1.02] ${isIngesting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-[#7CA1F3] hover:from-blue-600 hover:to-blue-500 hover:shadow-lg cursor-pointer"}`}
              >
                {isIngesting ? "Processing..." : "Want to know more"}
                <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal for row details (Table Explorer) */}
      {isDetailsModalOpen && selectedRowDetails && !isConfirmSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-[1000px] max-w-[95vw] h-[85vh] max-h-[85vh] rounded-2xl shadow-2xl bg-white flex flex-col border overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: theme.primaryText }}>
                  Table Explorer: {selectedRowDetails.table_name}
                </h3>
                <p className="text-xs" style={{ color: theme.secondaryText }}>
                  Source: {selectedRowDetails.file_name}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <AnimatedToggleButton
                  options={[
                    { label: "Schema", value: "metadata" },
                    { label: "Data View", value: "dataview" },
                    { label: "Insights", value: "insights" },
                  ]}
                  defaultSelected={1}
                  onChange={(_idx, val) => setViewExplorerSelection(val as string)}
                  borderRadius="0.75rem"
                  activeBorderRadius="0.375rem"
                  fontSize="0.75rem"
                  buttonPadding="0.4rem 1rem"
                  mode="text"
                />

                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <TableParents
                data={viewTableData.rows}
                columns={viewTableData.columns}
                insights={viewTableData.insights}
                tableName={viewTableData.tableName}
                viewSelection={viewExplorerSelection}
                globalFilter=""
                isLoading={isFetchingViewData}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- EDIT MODAL -------------------- */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-[450px] rounded-2xl shadow-2xl bg-white flex flex-col border overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: theme.primaryText }}>
                  Edit File Details
                </h3>
                <p className="text-xs" style={{ color: theme.secondaryText }}>
                  Update table name and workspace assignment
                </p>
              </div>
              <button
                onClick={() => setEditingFile(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* File Name (ReadOnly) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: theme.secondaryText }}>File Name</label>
                <input
                  type="text"
                  value={editingFile.file_name || ""}
                  disabled
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: theme.border }}
                />
              </div>

              {/* Table Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: theme.secondaryText }}>Table Name</label>
                <input
                  type="text"
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  placeholder="Enter Table Name"
                  className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7CA1F3]"
                  style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.primaryText }}
                />
              </div>

              {/* Workspace Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: theme.secondaryText }}>Select Workspace</label>
                <select
                  value={editWorkspaceId}
                  onChange={(e) => setEditWorkspaceId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7CA1F3]"
                  style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.primaryText }}
                >
                  <option value="" disabled>Select Workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.workspace_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setEditingFile(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition duration-200 flex items-center gap-1.5 ${isSavingEdit ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-[#7CA1F3] hover:from-blue-600 hover:to-blue-500 cursor-pointer"}`}
              >
                {isSavingEdit ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TERMINAL LOGS MODAL -------------------- */}
      {isLogsModalOpen && logsFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-[700px] max-w-[95vw] rounded-2xl shadow-2xl bg-[#0d1117] flex flex-col border border-gray-800 overflow-hidden">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f85149] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#d29922] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#3fb950] inline-block" />
                </div>
                <span className="ml-2 text-xs font-mono text-gray-400">
                  ingestion-pipeline://{logsFile.name || logsFile.file_name}
                </span>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Terminal Window Body */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[50vh] font-mono text-xs text-[#c9d1d9] space-y-2 select-text leading-relaxed bg-[#0d1117]">
              {getLogsForFile(logsFile).map((logLine, idx) => {
                let colorClass = "text-[#c9d1d9]";
                if (logLine.includes("[SUCCESS]")) {
                  colorClass = "text-[#3fb950]";
                } else if (logLine.includes("[ERROR]")) {
                  colorClass = "text-[#f85149]";
                } else if (logLine.includes("[PENDING]")) {
                  colorClass = "text-[#d29922]";
                } else if (logLine.includes("[INFO]")) {
                  colorClass = "text-[#58a6ff]";
                }

                return (
                  <div key={idx} className={colorClass}>
                    {logLine}
                  </div>
                );
              })}
            </div>

            {/* Terminal Window Footer */}
            <div className="px-5 py-3 bg-[#161b22] border-t border-gray-800 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  const fullLogText = getLogsForFile(logsFile).join("\n");
                  navigator.clipboard.writeText(fullLogText);
                  setSnackbar({ open: true, message: "Logs copied to clipboard", severity: "success" });
                }}
                className="px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition duration-200 border border-gray-700 active:scale-95"
              >
                Copy Logs
              </button>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition duration-200 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmSaveView
        customTitle={deleteFile?.name || deleteFile?.file_name}
        customMessage={
          fileDependencies
            ? fileDependencies
            : "Are you sure you want to delete this file?"
        }
        customOnCancel={() => {
          setIsConfirmSaveModalOpen(false);
          setIsDetailsModalOpen(false);
          setFileDependencies(null);
        }}
        customOnConfirm={() => handleDeleteFile(deleteFile)}
        showConfirmButton={!fileDependencies}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}