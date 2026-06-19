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
import ApiServices from "../../../services/ApiServices";
import { useAuth } from "../../Auth/AuthContext";
import ConfirmSaveView from "../../../Modal/ConfirmSaveView";
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

  const csvTotalPages = Math.ceil(csvFiles.length / ITEMS_PER_PAGE) || 1;
  const csvStartIndex = (csvPage - 1) * ITEMS_PER_PAGE;
  const csvEndIndex = Math.min(csvStartIndex + ITEMS_PER_PAGE, csvFiles.length);
  const paginatedCsvFiles = csvFiles.slice(csvStartIndex, csvEndIndex);

  const webTotalPages = Math.ceil(webSearchFiles.length / ITEMS_PER_PAGE) || 1;
  const webStartIndex = (webPage - 1) * ITEMS_PER_PAGE;
  const webEndIndex = Math.min(webStartIndex + ITEMS_PER_PAGE, webSearchFiles.length);
  const paginatedWebFiles = webSearchFiles.slice(webStartIndex, webEndIndex);

  const [fileDependencies, setFileDependencies] = useState<string | null>(null);

  const handleRowClick = (file: any) => {
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
    } catch (err) {
      console.error("Failed to parse row details", err);
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
            {/* Global Column Headers */}
            <div className="mb-3 overflow-x-auto">
              <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-xl" style={{ backgroundColor: theme.border + '20' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: theme.secondaryText }}>
                    File Name
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: theme.secondaryText }}>
                    Table Name
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Rows Affected
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Connected Queries
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Connected Reports
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Table Extraction
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Column Extraction
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Data Insert Status
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    File Size
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Created Date
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Uploaded At
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Status
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-center" style={{ color: theme.secondaryText }}>
                    Action
                  </div>
                </div>
              </div>
            </div>

            {/* Files List - No fixed height, no vertical scrolling */}
            <div className="overflow-x-auto pr-2">
              {paginatedCsvFiles.map((file, index) => {
                const fileName = file.name || file.file_name;
                const currentProgress = processingProgress[fileName] || 0;
                const isFullyProcessed = currentProgress >= TOTAL_STEPS;

                const extractionFailed =
                  file.table_extraction_status?.toLowerCase() === "failed" ||
                  file.table_extraction_status?.toLowerCase() === "pending";

                return (
                  <div
                    key={index}
                    onClick={() => handleRowClick(file)}
                    className="rounded-xl p-4 w-full mb-3 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* File Name */}
                      <div className="flex-1 min-w-0">
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

                      {/* Table Name */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: theme.primaryText }}
                        >
                          {file.table_name || 'N/A'}
                        </div>
                      </div>

                      {/* Rows Affected */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.rows_effected || 0}
                        </div>
                      </div>
                      {/* Connected Queries */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.connected_queries ?? 0}
                        </div>
                      </div>

                      {/* Connected Reports */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.connected_reports ?? 0}
                        </div>
                      </div>

                      {/* Table Extraction Status */}
                      <div className="flex-1 min-w-0">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-center">
                          {file.column_extraction_status?.toLowerCase() === 'done' ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: theme.accent }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.secondaryText }} />
                          )}
                        </div>
                      </div>

                      {/* Data Insert Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-center">
                          {file.data_insert_status?.toLowerCase() === 'done' ? (
                            <CheckCircleIcon sx={{ fontSize: 20, color: theme.accent }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.secondaryText }} />
                          )}
                        </div>
                      </div>

                      {/* File Size */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                          {file.file_size_mb || (file.size ? `${(file.size / (1024 * 1024)).toFixed(2)}MB` : 'N/A')}
                        </div>
                      </div>

                      {/* Create Date */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-center"
                          style={{ color: theme.primaryText }}
                        >
                          {file.created_date || "N/A"}
                        </div>
                      </div>

                      {/* Uploaded At */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                          {formatTo12Hour(file.created_at) || new Date().toLocaleDateString()}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-center" style={{ color: theme.primaryText }}>
                          {file.status || 'processed'}
                        </div>
                      </div>

                      {/* Delete Icon */}
                      <div className="flex-1 min-w-0 flex justify-center">
                        <Tippy content="Delete file" theme="gray">
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

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl mt-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min(csvStartIndex + 1, csvFiles.length)} to {Math.min(csvEndIndex, csvFiles.length)} of {csvFiles.length} files
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
                  onClick={() => setWebPage(p => p + 1)}
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

      {/* modal for row details */}
      {isDetailsModalOpen && selectedRowDetails && !isConfirmSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[560px] max-h-[80vh] rounded-xl shadow-2xl bg-white flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: theme.primaryText }}
                >
                  Connected Details
                </h3>
                <p className="text-xs text-gray-500">
                  File & dependency information
                </p>
              </div>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                     hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto">

              {/* File Info */}
              <div className="mb-5 grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">File Name</div>
                  <div className="font-medium text-gray-800">
                    {selectedRowDetails.file_name}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Table Name</div>
                  <div className="font-medium text-gray-800">
                    {selectedRowDetails.table_name}
                  </div>
                </div>
              </div>

              {/* Queries Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Connected Queries
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {selectedRowDetails.query_titles.length}
                  </span>
                </div>

                {selectedRowDetails.query_titles.length ? (
                  <div className="space-y-2">
                    {selectedRowDetails.query_titles.map((q: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <span className="mt-0.5 text-xs text-blue-600 font-semibold">
                          Q{i + 1}
                        </span>
                        <span className="text-xs text-gray-800">{q}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    No connected queries
                  </div>
                )}
              </div>

              {/* Reports Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Connected Reports
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    {selectedRowDetails.report_names.length}
                  </span>
                </div>

                {selectedRowDetails.report_names.length ? (
                  <div className="space-y-2">
                    {selectedRowDetails.report_names.map((r: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <span className="mt-0.5 text-xs text-green-600 font-semibold">
                          R{i + 1}
                        </span>
                        <span className="text-xs text-gray-800">{r}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    No connected reports
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-xl
                     bg-gray-200 hover:bg-gray-300 text-gray-700"
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
    </div>
  );
}