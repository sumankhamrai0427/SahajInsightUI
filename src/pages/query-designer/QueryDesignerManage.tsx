import { useEffect, useState, useRef } from "react";
import { MdOutlineHourglassEmpty, MdChatBubbleOutline, MdFolderOpen, MdFolder, MdAdd, MdRefresh } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Dropdown } from "primereact/dropdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../styles/tippy-theme.css";

import ApiServices from "../../services/ApiServices";
import { useAuth } from "../Auth/AuthContext";
import { useTheme } from "../../theme";
import ProductDataTable from "./components/DataTable";
import TableParents from "./components/TableParents";
import AnimatedToggleButton from "./components/AnimatedToggleButton";
import ConfirmSaveView from "../../Modal/ConfirmSaveView";

interface StoredMessage {
  query_id: number;
  query: string;
  created_at: string;
  ai_response: string;
  is_execute: boolean;
  row_count: number;
  query_time: number;
  is_success: boolean;
  ai_responded_at?: string;
  chat_type?: "sql" | "rag";
}

const formatTimestamp = (dateString?: string) => {
  if (!dateString) return "";
  try {
    let normalized = dateString;
    if (dateString.includes(" ") && !dateString.includes("T")) {
      normalized = dateString.replace(" ", "T");
    }
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch {
    return dateString;
  }
};

const formatMessageText = (text: string) => {
  if (!text) return null;

  // 1. Separate Source Header from Main Content if present
  let sourceBlock = "";
  let mainContent = text;

  const separator = "\n\n---\n\n";
  if (text.includes(separator)) {
    const parts = text.split(separator);
    sourceBlock = parts[0];
    mainContent = parts.slice(1).join(separator);
  } else if (text.startsWith("Source:") || text.startsWith("Sources:")) {
    const lines = text.split("\n");
    const firstBlank = lines.findIndex(l => l.trim() === "");
    if (firstBlank !== -1) {
      sourceBlock = lines.slice(0, firstBlank).join("\n");
      mainContent = lines.slice(firstBlank + 1).join("\n");
    }
  }

  // Helper to render inline formatting like **bold**
  const parseInline = (line: string) => {
    const parts = line.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
      }
      return part;
    });
  };

  // Helper to render block elements
  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-1.5"></div>;

    // Headers
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="text-xs font-bold text-gray-800 mt-3 mb-1">
          {parseInline(trimmed.substring(4))}
        </h3>
      );
    }
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={index} className="text-[11px] font-bold text-gray-800 mt-2 mb-1">
          {parseInline(trimmed.substring(5))}
        </h4>
      );
    }

    // List items
    if (trimmed.startsWith("- ")) {
      return (
        <li key={index} className="ml-4 list-disc text-gray-700 my-0.5">
          {parseInline(trimmed.substring(2))}
        </li>
      );
    }
    if (trimmed.startsWith("* ")) {
      return (
        <li key={index} className="ml-4 list-disc text-gray-700 my-0.5">
          {parseInline(trimmed.substring(2))}
        </li>
      );
    }

    // Normal paragraphs
    return (
      <p key={index} className="text-gray-700 my-0.5 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  const hasLink = (str: string) => {
    return str.includes("http://") || str.includes("https://");
  };

  return (
    <div className="space-y-1">
      {/* Source Header */}
      {sourceBlock && (
        <div 
          className={`font-semibold text-[10px] mb-2 p-1.5 rounded-lg border ${
            hasLink(sourceBlock) 
              ? "bg-green-50 border-green-100 text-green-700" 
              : "bg-red-50 border-red-100 text-red-500"
          }`}
        >
          {sourceBlock.split("\n").map((line, idx) => (
            <div key={idx}>{parseInline(line)}</div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-0.5">
        {mainContent.split("\n").map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};

interface ChatSession {
  id?: number;
  session_id: string;
  session_name: string;
  question: string;
  query: string;
  ai_response?: string;
  logs: string[];
  messages: StoredMessage[];
}

const QueryDesignerManage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  // --- Workspace & Search States ---
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [realWorkspaces, setRealWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("jk-sales");
  const [workspaceSearch, setWorkspaceSearch] = useState<string>("");
  const [querySearch, setQuerySearch] = useState<string>("");
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [isAddingWorkspace, setIsAddingWorkspace] = useState<boolean>(false);
  const [isWorkspaceListExpanded, setIsWorkspaceListExpanded] = useState<boolean>(true);

  // --- Agent Mode ---
  const [ragChatMessages, setRagChatMessages] = useState<any[]>([]);
  const [isFetchingRagHistory, setIsFetchingRagHistory] = useState<boolean>(false);

  // --- Workspace Files ---
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(false);

  // --- Workspace Suggestions ---
  const [suggestionChips, setSuggestionChips] = useState<string[]>([
    "What sudden changes in billing types ZBCL, ZBFO, ZFCL, or ZOR indicate potential disruptions in transaction processing?",
    "What trends in customer category 'Dealer' suggest shifts in market demand or supply chain dynamics?",
    "What variations in product categories (Tyre, Tube, Flap) reveal about inventory turnover or seasonal demand patterns?",
    "What anomalies in the uniform distribution across zones, regions, or plants point to operational inefficiencies?",
  ]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);

  // --- Saved Queries & Backend Loading States ---
  const [queries, setQueries] = useState<any[]>([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState<boolean>(true);
  const [errorQueries, setErrorQueries] = useState<string | null>(null);
  const [queriesFetched, setQueriesFetched] = useState<boolean>(false);
  const isFetchingQueriesRef = useRef<boolean>(false);

  // --- RAG Chat States ---
  const [activeQuery, setActiveQuery] = useState<any | null>(null);
  const [chatInputValue, setChatInputValue] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<StoredMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [chatInputError, setChatInputError] = useState<string | null>(null);
  const [typedQuery, setTypedQuery] = useState<string>("");
  const [isScriptGenerated, setIsScriptGenerated] = useState<boolean>(false);
  const [typewriterKey, setTypewriterKey] = useState<number>(0);

  // --- Script Execution States ---
  const [isExecutingScript, setIsExecutingScript] = useState<boolean>(false);
  const [scriptLogs, setScriptLogs] = useState<string[]>([]);
  const [scriptResultTable, setScriptResultTable] = useState<{ rows: any[]; columns: any[] } | null>(null);
  const [isScriptSuccess, setIsScriptSuccess] = useState<boolean>(false);
  const [executionMeta, setExecutionMeta] = useState<{ rows_effected?: number | string; query_time?: string } | null>(null);

  // --- Name & Save Query States ---
  const [customViewName, setCustomViewName] = useState<string>("");
  const [isSavingQuery, setIsSavingQuery] = useState<boolean>(false);
  const [saveModalConfig, setSaveModalConfig] = useState<{ customMessage?: string; showConfirmButton?: boolean }>({});
  const { isConfirmSaveModalOpen, setIsConfirmSaveModalOpen, setConfirmSaveAction, setDownloadData } = useAuth();

  // --- Table Explorer States ---
  const [tableOptions, setTableOptions] = useState<any[]>([]);
  const [selectedExplorerTable, setSelectedExplorerTable] = useState<any>(null);
  const [isFetchingTables, setIsFetchingTables] = useState<boolean>(false);
  const [tablesFetched, setTablesFetched] = useState<boolean>(false);
  const [explorerViewSelection, setExplorerViewSelection] = useState<string>("dataview");
  const [explorerTableData, setExplorerTableData] = useState<{ rows: any[]; columns: any[]; insights: any[]; tableName: string }>({
    rows: [],
    columns: [],
    insights: [],
    tableName: "",
  });
  const [isFetchingExplorerData, setIsFetchingExplorerData] = useState<boolean>(false);

  // --- Chat Container Auto-scroll Ref ---
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // 1. Initialize Workspaces & Query Mappings
  // ==========================================
  useEffect(() => {
    const fetchRealWorkspaces = async () => {
      const userIdentifier = user?.email || user?.user_email || user?.user_id;
      if (userIdentifier) {
        try {
          const response = await ApiServices.getUserWorkspaces({
            user_email: userIdentifier,
            session_id: user?.session_id,
            created_by: user?.user_id
          });
          if (response.data?.isSuccess) {
            const fetchedWorkspaces = response.data.data || [];
            setRealWorkspaces(fetchedWorkspaces);
            const wsNames = fetchedWorkspaces.map((w: any) => w.workspace_name);
            setWorkspaces(wsNames.length > 0 ? wsNames : ["default"]);

            // Sync with global active workspace if possible
            const globalActiveId = localStorage.getItem("active_workspace_id");
            const activeObj = fetchedWorkspaces.find((w: any) => w.id.toString() === globalActiveId);

            let activeWs = "default";
            if (activeObj) {
              activeWs = activeObj.workspace_name;
            } else if (wsNames.length > 0) {
              activeWs = wsNames[0];
            } else {
              const cachedActiveWs = localStorage.getItem("ig_active_workspace");
              if (cachedActiveWs) activeWs = cachedActiveWs;
            }

            setActiveWorkspace(activeWs);
            localStorage.setItem("ig_active_workspace", activeWs);
            const syncObj = fetchedWorkspaces.find((w: any) => w.workspace_name === activeWs);
            if (syncObj) {
              localStorage.setItem("selected_workspace", syncObj.id.toString());
              localStorage.setItem("active_workspace_id", syncObj.id.toString());
            }
          }
        } catch (error) {
          console.error("Failed to fetch workspaces in query designer", error);
        }
      }
    };

    fetchRealWorkspaces();
  }, [user]);

  // Fetch saved queries on user load
  useEffect(() => {
    if (user?.session_id && user?.user_id) {
      fetchSavedQueries(true);
    }
  }, [user]);

  // Fetch explorer tables when user, activeWorkspace, or workspaces list loads
  useEffect(() => {
    if (user?.session_id && user?.user_id && realWorkspaces.length > 0) {
      fetchExplorerTableOptions(true);
    }
  }, [user, activeWorkspace, realWorkspaces]);

  // Handle Query Mappings to Workspaces once queries are fetched
  useEffect(() => {
    if (queries.length > 0) {
      const mappingRaw = localStorage.getItem("ig_workspace_query_mapping");
      let mapping: Record<string, string> = {};
      if (mappingRaw) {
        try {
          mapping = JSON.parse(mappingRaw);
        } catch {
          mapping = {};
        }
      }

      let updated = false;
      queries.forEach((q) => {
        if (!mapping[q.query_title]) {
          mapping[q.query_title] = activeWorkspace || "default";
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem("ig_workspace_query_mapping", JSON.stringify(mapping));
      }
    }
  }, [queries, activeWorkspace]);

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages, ragChatMessages]);

  const getActiveWorkspaceId = () => {
    const ws = realWorkspaces.find(w => w.workspace_name === activeWorkspace);
    return ws ? ws.id : null;
  };

  const fetchRagHistory = async () => {
    const wsId = getActiveWorkspaceId();
    if (!user?.user_id) return;
    setIsFetchingRagHistory(true);
    try {
      const response = await ApiServices.getRagChatHistory({
        company_code: user?.company_code, // Or maybe let backend handle via session/db attach, but ApiServices needs company_code? Wait! chat history controller uses company_code.
        user_id: user?.user_id,
        workspace_id: wsId
      });
      if (response.data?.isSuccess) {
        setRagChatMessages(response.data.data?.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch RAG history", err);
    } finally {
      setIsFetchingRagHistory(false);
    }
  };

  // fetchRagHistory is no longer actively polled here since we rely on unified session history
  useEffect(() => {
    // Left empty or removed dependency on agentMode
  }, [activeWorkspace, realWorkspaces]);

  const fetchWorkspaceFiles = async () => {
    const wsId = getActiveWorkspaceId();
    if (!user?.user_id) return;
    setIsFetchingFiles(true);
    try {
      const response = await ApiServices.tracker({
        created_by: user?.user_id,
        session_id: user?.session_id,
        workspace_id: wsId
      });
      if (response.data?.status === "success" || response.data?.isSuccess) {
        const allFiles = response.data.data || [];
        const flowType = localStorage.getItem("rag_flow_type") || "all";
        console.log("RAG Flow Type:", flowType);
        if (flowType === "selected") {
          const selectedCsvs = JSON.parse(localStorage.getItem("selected_csvs") || "[]");
          const selectedWebs = JSON.parse(localStorage.getItem("selected_webs") || "[]");
          console.log("Filtering files with selectedCsvs:", selectedCsvs, "and selectedWebs:", selectedWebs);
          const filtered = allFiles.filter(file => {
            if (file.file_type === "web_search") {
              return selectedWebs.includes(file.file_name);
            } else {
              return selectedCsvs.includes(file.file_name);
            }
          });
          setWorkspaceFiles(filtered);
        } else {
          setWorkspaceFiles(allFiles);
        }
      }
    } catch (err) {
      console.error("Failed to fetch workspace files", err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const fetchWorkspaceSuggestions = async () => {
    const wsId = getActiveWorkspaceId();
    if (!user?.user_id) return;
    setIsFetchingSuggestions(true);
    try {
      const response = await ApiServices.suggestWorkspaceQuestions({
        created_by: user?.user_id,
        session_id: user?.session_id,
        workspace_id: wsId
      });
      if (response.data?.status === "success" || response.data?.isSuccess) {
        setSuggestionChips(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch workspace suggestions", err);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace && realWorkspaces.length > 0) {
      fetchWorkspaceFiles();
      fetchWorkspaceSuggestions();
    }
  }, [activeWorkspace, realWorkspaces]);


  // ==========================================
  // 2. Data Fetching & Helpers
  // ==========================================
  const fetchSavedQueries = async (forceRefresh = false) => {
    if (isFetchingQueriesRef.current || (queriesFetched && !forceRefresh)) return;
    isFetchingQueriesRef.current = true;
    setIsLoadingQueries(true);
    setErrorQueries(null);
    try {
      const payload = { session_id: user?.session_id, created_by: user?.user_id };
      const response = await ApiServices.getSavedQueryResponse(payload);
      if (response.data.isSuccess) {
        setQueries(response.data.data.queries || []);
        setQueriesFetched(true);
      } else {
        setErrorQueries(response.data.message || "Failed to load queries.");
      }
    } catch (err) {
      setErrorQueries("An error occurred while fetching saved queries.");
      console.error(err);
      setQueriesFetched(false);
    } finally {
      isFetchingQueriesRef.current = false;
      setIsLoadingQueries(false);
    }
  };

  const fetchExplorerTableOptions = async (forceRefresh = false) => {
    if ((tablesFetched && !forceRefresh) || isFetchingTables) return;
    setIsFetchingTables(true);
    const wsId = getActiveWorkspaceId();
    const payload = {
      created_by: user?.user_id || "",
      session_id: user?.session_id || "",
      workspace_id: wsId,
    };
    try {
      const response = await ApiServices.getTableData(payload);
      const responseData = response.data.data || {};
      const tables = responseData.tables_dropdown || [];
      setTableOptions([...tables].reverse());
      setTablesFetched(true);
    } catch (error) {
      console.error("Error fetching explorer table options:", error);
    } finally {
      setIsFetchingTables(false);
    }
  };

  const handleExplorerTableChange = (e: { value: any }) => {
    const tableName = e.value;
    if (!tableName || tableName === selectedExplorerTable) return;
    setSelectedExplorerTable(tableName);

    if (user && tableName) {
      const payload = {
        session_id: user.session_id,
        created_by: user.user_id,
        table_name: tableName,
      };

      setIsFetchingExplorerData(true);
      ApiServices.getTableData(payload)
        .then((response) => {
          const detail = response.data.data.details[tableName];
          setExplorerTableData({
            rows: detail.data || [],
            columns: detail.columns || [],
            insights: Array.isArray(detail.insights)
              ? detail.insights
              : JSON.parse(detail.insights || "[]"),
            tableName: tableName,
          });
        })
        .catch((error) => console.error("Error fetching table explorer data:", error))
        .finally(() => {
          setIsFetchingExplorerData(false);
        });
    }
  };

  // ==========================================
  // 3. Workspace Operations
  // ==========================================
  const handleAddWorkspace = () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    if (workspaces.includes(name)) {
      alert("Workspace already exists!");
      return;
    }
    const newList = [...workspaces, name];
    setWorkspaces(newList);
    localStorage.setItem("ig_workspaces", JSON.stringify(newList));
    setActiveWorkspace(name);
    localStorage.setItem("ig_active_workspace", name);
    setNewWorkspaceName("");
    setIsAddingWorkspace(false);
    handleNewQuery(); // start clean in new workspace
  };

  const handleSelectWorkspace = (ws: string) => {
    setActiveWorkspace(ws);
    localStorage.setItem("ig_active_workspace", ws);
    const wsObj = realWorkspaces.find(w => w.workspace_name === ws);
    if (wsObj) {
      localStorage.setItem("selected_workspace", wsObj.id.toString());
      localStorage.setItem("active_workspace_id", wsObj.id.toString());
    }
    handleNewQuery(); // start clean when switching workspaces
  };

  // Get queries belonging to current workspace and matching search
  const getFilteredQueries = () => {
    const mappingRaw = localStorage.getItem("ig_workspace_query_mapping");
    let mapping: Record<string, string> = {};
    if (mappingRaw) {
      try {
        mapping = JSON.parse(mappingRaw);
      } catch {
        mapping = {};
      }
    }

    return queries.filter((q) => {
      const mappedWs = mapping[q.query_title] || "default";
      const isInWorkspace = mappedWs === activeWorkspace;
      const matchesSearch = q.query_title.toLowerCase().includes(querySearch.toLowerCase());
      return isInWorkspace && matchesSearch;
    });
  };

  // ==========================================
  // 4. RAG Chat & New Query Flows
  // ==========================================
  const handleNewQuery = () => {
    setActiveQuery(null);
    setChatMessages([]);
    setChatInputValue("");
    setTypedQuery("");
    setIsScriptGenerated(false);
    setScriptLogs([]);
    setScriptResultTable(null);
    setIsScriptSuccess(false);
    setExecutionMeta(null);
    setCustomViewName("");
    setChatInputError(null);
  };

  const handleSelectQuerySession = (query: any) => {
    setActiveQuery(query);
    setChatInputError(null);
    setChatInputValue("");

    // Map messages
    const msgs = (query.messages || []).map((m: any, idx: number) => ({
      query_id: m.id || idx + 1,
      query: m.query,
      created_at: m.actual_created_at || new Date().toISOString(),
      ai_response: m.ai_response,
      is_execute: m.is_execute === 1,
      row_count: m.row_count || 0,
      query_time: m.query_time || 0,
      is_success: m.is_execute === 1,
      ai_responded_at: m.updated_at || m.actual_created_at || new Date().toISOString(),
    }));

    setChatMessages(msgs);

    // Load details of last message if any AI response
    if (msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg.ai_response) {
        setTypedQuery(lastMsg.ai_response);
        setIsScriptGenerated(true);
        setIsScriptSuccess(lastMsg.is_execute);
        setScriptLogs(lastMsg.is_execute ? ["Execution successful loaded from saved session."] : []);
        setExecutionMeta({
          rows_effected: lastMsg.row_count,
          query_time: lastMsg.query_time,
        });
      } else {
        setTypedQuery("");
        setIsScriptGenerated(false);
        setScriptLogs([]);
        setScriptResultTable(null);
        setIsScriptSuccess(false);
        setExecutionMeta(null);
      }
    } else {
      setTypedQuery("");
      setIsScriptGenerated(false);
      setScriptLogs([]);
      setScriptResultTable(null);
      setIsScriptSuccess(false);
      setExecutionMeta(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = chatInputValue.trim();
    if (!queryText || isSendingMessage) return;

    setIsScriptSuccess(false);
    setExecutionMeta(null);

    const tempQueryId = Date.now();
    const queryTime = new Date().toISOString();
    const newMsg: StoredMessage = {
      query_id: tempQueryId,
      query: queryText,
      created_at: queryTime,
      ai_response: "",
      is_execute: false,
      row_count: 0,
      query_time: 0,
      is_success: false,
      chat_type: undefined
    };

    setChatMessages((prev) => [...prev, newMsg]);

    setIsSendingMessage(true);
    setChatInputValue("");
    setChatInputError(null);

    try {
      const wsId = getActiveWorkspaceId();
      const payload = {
        company_code: user?.company_code,
        session_id: user?.session_id,
        user_id: user?.user_id,
        user_query: queryText,
        workspace_id: wsId,
        created_by: user?.user_id, // ensure created_by is passed if needed
        scope: localStorage.getItem("rag_flow_type") || "all"
      };

      const response = await ApiServices.unifiedChat(payload);
      
      let aiRespText = "";
      let chatType: "sql" | "rag" = "rag";
      let logs: string[] = [];

      // unified_chat_controller returns chat_type in JSON payload
      // if it was SQL, the payload structure from chat_endpoint_controller is slightly different from rag_chat_controller
      const result = response.data?.data || {};
      const chatTypeFromResponse = response.data?.chat_type || response.data?.data?.chat_type;

      if (chatTypeFromResponse === "sql" || response.data?.chat_type === "sql") {
        chatType = "sql";
        aiRespText = result.ai_response || "";
        const scriptText = result.sql_script || result.ai_response || "";
        logs = result.logs || [];
        
        setTypedQuery(scriptText);
        setTypewriterKey((prev) => prev + 1);
        setScriptLogs(logs);

        // Auto-populate results if backend already executed it
        if (result.results) {
            const rows = result.results.rows || [];
            const columns = result.results.columns ? result.results.columns.map((c: any) => ({ column_name: c })) : [];
            const rowCount = result.results.total_rows ?? rows.length;
            const executionTime = result.results.execution_time ?? null;

            setScriptResultTable({ rows, columns });
            setDownloadData({ rows, columns });
            setExecutionMeta({
                rows_effected: rowCount,
                query_time: executionTime,
            });
            setIsScriptSuccess(true);
            
            // Wait for typewriter effect then update message
            setTimeout(() => {
                setChatMessages((prev) =>
                    prev.map((msg) =>
                        msg.query_id === tempQueryId ? { 
                            ...msg, 
                            ai_response: aiRespText, 
                            chat_type: chatType,
                            is_execute: true,
                            is_success: true,
                            row_count: rowCount,
                            query_time: Number(executionTime || 0)
                        } : msg
                    )
                );
            }, 100);
        } else {
            // Update the message in chat state without execution data
            setChatMessages((prev) =>
                prev.map((msg) =>
                    msg.query_id === tempQueryId ? { ...msg, ai_response: aiRespText, chat_type: chatType } : msg
                )
            );
        }
      } else {
        chatType = "rag";
        // RAG uses ai_answer instead of ai_response sometimes, but let's be flexible
        aiRespText = result.ai_answer || result.ai_response || response.data?.ai_response || "No response.";
        
        // Update the message in chat state
        setChatMessages((prev) =>
            prev.map((msg) =>
                msg.query_id === tempQueryId ? { ...msg, ai_response: aiRespText, chat_type: chatType } : msg
            )
        );

        // Save RAG chat history immediately in background
        ApiServices.saveRagChat({
          company_code: user?.company_code,
          session_id: user?.session_id,
          user_id: user?.user_id,
          workspace_id: wsId,
          user_query: queryText,
          ai_response: aiRespText
        }).catch(err => console.error("Failed to save RAG chat", err));
      }

    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to process query.";
      setChatInputError(errMsg);
      // Clean up temporary message on error
      setChatMessages((prev) => prev.filter((msg) => msg.query_id !== tempQueryId));
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Copy procedural script helper
  const handleCopyScript = () => {
    if (!typedQuery) return;
    navigator.clipboard.writeText(typedQuery);
    alert("Script copied to clipboard!");
  };

  // SQL Query Extractor
  const extractSqlQuery = (rawQuery: string): string => {
    if (!rawQuery) return "";
    const queryMatch = rawQuery.match(/(?:WITH|SELECT)[\s\S]*/i);
    if (queryMatch) {
      let query = queryMatch[0];
      query = query
        .replace(/DELIMITER\s*;;/gi, "")
        .replace(/CREATE\s+PROCEDURE[\s\S]*?BEGIN/gi, "")
        .replace(/END\s*;;/gi, "");
      return query.split(";")[0].trim() + ";";
    }
    return "";
  };

  // Execute procedure script
  const handleRunScript = async () => {
    const executableQuery = extractSqlQuery(typedQuery.trim());
    if (!executableQuery) {
      setScriptLogs(["No query to run."]);
      setScriptResultTable(null);
      setIsScriptSuccess(false);
      return;
    }

    setIsExecutingScript(true);
    setScriptLogs(["Executing script on database..."]);

    try {
      const payload = {
        session_id: user?.session_id,
        created_by: user?.user_id,
        workspace_id: getActiveWorkspaceId(),
        sql_query: executableQuery,
      };

      const response = await ApiServices.executeSql(payload);
      setScriptLogs([response.data.message || ""]);

      if (response.data.isSuccess) {
        const rows = response.data.data?.rows || [];
        const columns = rows.length > 0
          ? Object.keys(rows[0]).map((key) => ({ column_name: key }))
          : [];

        const rowCount = response.data.data?.total_rows ?? rows.length;
        const executionTime = response.data.data?.execution_time ?? null;

        setScriptResultTable({ rows, columns });
        setDownloadData({ rows, columns });
        setExecutionMeta({
          rows_effected: rowCount,
          query_time: executionTime,
        });
        setIsScriptSuccess(true);

        // Update active message in state
        setChatMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const last = updated[updated.length - 1];
          last.is_execute = true;
          last.is_success = true;
          last.row_count = rowCount;
          last.query_time = Number(executionTime || 0);
          return updated;
        });
      } else {
        setScriptResultTable(null);
        setExecutionMeta(null);
        setIsScriptSuccess(false);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Server error while running query.";
      setScriptLogs([errorMsg]);
      setScriptResultTable(null);
      setExecutionMeta(null);
      setIsScriptSuccess(false);
    } finally {
      setIsExecutingScript(false);
    }
  };

  // ==========================================
  // 5. Save Custom View Flow
  // ==========================================
  const handleSaveClick = () => {
    const viewNameTrim = customViewName.trim();
    if (!viewNameTrim) return;

    // Check duplicate
    const isDuplicate = queries.some((q) => q.query_title.trim().toLowerCase() === viewNameTrim.toLowerCase());
    if (isDuplicate) {
      if (activeQuery && activeQuery.query_title.trim().toLowerCase() === viewNameTrim.toLowerCase()) {
        // allowing overwrite
      } else {
        setSaveModalConfig({
          customMessage: "Query name already exists. Please select a different name.",
          showConfirmButton: false,
        });
        setIsConfirmSaveModalOpen(true);
        return;
      }
    }
    setSaveModalConfig({});
    setIsConfirmSaveModalOpen(true);
  };

  // Save Confirm triggered from ConfirmSaveView context hook
  const handleConfirmSave = async () => {
    if (chatMessages.length === 0 || !customViewName.trim()) return;

    // We build the full chat save payload
    const payload = {
      session_id: user?.session_id,
      created_by: user?.user_id || "unknown",
      query_title: customViewName.trim(),
      parent_query_id: activeQuery?.id || null,
      messages: chatMessages.map((msg) => ({
        query_id: msg.query_id,
        query: msg.query,
        ai_response: msg.ai_response,
        is_execute: msg.is_execute ? 1 : 0,
        is_success: msg.is_success ? 1 : 0,
        row_count: msg.row_count || 0,
        query_time: msg.query_time || null,
        created_at: msg.created_at,
      })),
    };

    try {
      setIsSavingQuery(true);
      const response = await ApiServices.saveChat(payload);
      if (response.data.isSuccess) {
        // Map new query to workspace
        const mappingRaw = localStorage.getItem("ig_workspace_query_mapping");
        let mapping: Record<string, string> = {};
        if (mappingRaw) {
          try {
            mapping = JSON.parse(mappingRaw);
          } catch {
            mapping = {};
          }
        }
        mapping[customViewName.trim()] = activeWorkspace;
        localStorage.setItem("ig_workspace_query_mapping", JSON.stringify(mapping));

        // Refresh query logs
        await fetchSavedQueries(true);
        alert("Query saved successfully!");
      } else {
        console.error("Save failed:", response.data.message);
      }
    } catch (err) {
      console.error("Save API error:", err);
    } finally {
      setIsSavingQuery(false);
      setIsConfirmSaveModalOpen(false);
      setCustomViewName("");
    }
  };

  useEffect(() => {
    setConfirmSaveAction(() => handleConfirmSave);
  }, [chatMessages, customViewName, isScriptSuccess, scriptResultTable, activeWorkspace]);

  // ==========================================
  // 6. Typewriter script display effect
  // ==========================================
  useEffect(() => {
    if (!typedQuery) return;
    setTypedQuery("");
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < typedQuery.length) {
        const char = typedQuery.charAt(i);
        setTypedQuery((prev) => prev + char);
        i++;
      } else {
        clearInterval(typingInterval);
        setIsScriptGenerated(true);
      }
    }, 5);

    return () => clearInterval(typingInterval);
  }, [typewriterKey]);



  const filteredWorkspacesList = workspaces.filter((ws) =>
    ws.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-gray-50/50">

      {/* ======================================================== */}
      {/* LEFT COLUMN: WORKSPACE SIDEBAR                           */}
      {/* ======================================================== */}
      <div className="w-80 h-full border-r border-gray-200 bg-white flex flex-col shrink-0">

        {/* Workspace Title & Selector Toggle */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsWorkspaceListExpanded((e) => !e)}
            >
              <MdFolderOpen className="text-xl text-[#5433FF]" />
              <span className="font-semibold text-gray-800 text-sm tracking-tight capitalize truncate max-w-[160px]">
                Workspace: {activeWorkspace}
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">
                {isWorkspaceListExpanded ? "▲" : "▼"}
              </span>
            </div>

            {(user?.role === "companyadmin" || user?.role === "superadmin") && (
              <button
                onClick={() => setIsAddingWorkspace((prev) => !prev)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title="Add new workspace"
              >
                <MdAdd className="text-lg" />
              </button>
            )}
          </div>

          {/* Add Workspace Panel inline */}
          {isAddingWorkspace && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
              />
              <button
                onClick={handleAddWorkspace}
                className="px-3 py-1.5 bg-[#5433FF] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Create
              </button>
            </div>
          )}
        </div>

        {/* Workspace List Accordion Panel */}
        {isWorkspaceListExpanded && (
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Search workspace..."
                value={workspaceSearch}
                onChange={(e) => setWorkspaceSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
              />
              <button
                onClick={() => setWorkspaceSearch("")}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400"
              >
                <MdRefresh className="text-sm" />
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1">
              {filteredWorkspacesList.map((ws) => (
                <div
                  key={ws}
                  onClick={() => handleSelectWorkspace(ws)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${activeWorkspace === ws
                    ? "bg-blue-50 text-[#5433FF]"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <MdFolder className="text-sm shrink-0" />
                  <span className="truncate capitalize">{ws}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Workspace Queries Panel */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <button
            onClick={handleNewQuery}
            className="w-full h-10 bg-blue-50 hover:bg-blue-100 text-[#5433FF] rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 mb-4"
          >
            <MdAdd className="text-sm" /> New Query
          </button>

          <div className="flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
            <span>Query History</span>
            <button
              onClick={() => fetchSavedQueries(true)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400"
              title="Refresh logs"
            >
              <AutorenewRoundedIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Search queries..."
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
            />
          </div>

          {/* Queries list */}
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-1">
            {isLoadingQueries ? (
              <div className="flex justify-center py-6 text-gray-400">
                <AutorenewRoundedIcon className="animate-spin text-sm" />
              </div>
            ) : getFilteredQueries().length > 0 ? (
              getFilteredQueries().map((q) => (
                <div
                  key={q.id || q.query_title}
                  onClick={() => handleSelectQuerySession(q)}
                  className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition ${activeQuery?.query_title === q.query_title
                    ? "bg-gray-100 border border-gray-200 text-gray-950 font-medium"
                    : "hover:bg-gray-50 border border-transparent text-gray-600"
                    }`}
                >
                  <MdChatBubbleOutline className="text-sm shrink-0 mt-0.5 text-gray-400" />
                  <span className="text-xs break-all line-clamp-2 leading-relaxed">{q.query_title}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs">
                No queries in history
              </div>
            )}
          </div>
        </div>

        {/* Workspace Data Sources Panel */}
        <div className="flex-1 flex flex-col min-h-0 p-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
            <span>Workspace Data Sources</span>
            <button
              onClick={() => fetchWorkspaceFiles()}
              className="p-1 hover:bg-gray-100 rounded text-gray-400"
              title="Refresh files"
            >
              <AutorenewRoundedIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-1">
            {isFetchingFiles ? (
              <div className="flex justify-center py-4 text-gray-400">
                <AutorenewRoundedIcon className="animate-spin text-sm" />
              </div>
            ) : workspaceFiles.length > 0 ? (
              workspaceFiles.map((file, idx) => (
                <div key={file.file_id || idx} className="flex flex-col px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate" title={file.file_name}>{file.file_name}</span>
                  <span className="text-[10px] text-gray-400">{file.file_type === 'web_search' ? 'Web Search' : 'CSV Upload'} • {file.rows_effected} rows</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-xs">
                No data sources found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: RAG CHAT ASSISTANT & DATABASE EXPLORER    */}
      {/* ======================================================== */}
      <div className="flex-1 h-full flex flex-col min-h-0 overflow-y-auto">

        {/* TOP ROW: Table Browser/Explorer card (Commented Out) */}
        {/* 
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-md font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Query Explorer
              </h1>
              <p className="text-xs text-gray-500">
                Select table to analyze fields, records, and insights.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown
                value={selectedExplorerTable}
                options={tableOptions}
                onChange={handleExplorerTableChange}
                placeholder="Select a Table"
                onMouseDown={() => fetchExplorerTableOptions()}
                className="w-56 h-9 border border-gray-200 rounded-xl flex items-center justify-between text-xs px-2"
                panelClassName="bg-white rounded-xl border border-gray-100 text-xs shadow-lg"
              />

              <AnimatedToggleButton
                options={[
                  { label: "Schema", value: "metadata" },
                  { label: "Data View", value: "dataview" },
                  { label: "Insights", value: "insights" },
                ]}
                defaultSelected={1}
                onChange={(_idx, val) => setExplorerViewSelection(val as string)}
                borderRadius="0.75rem"
                activeBorderRadius="0.375rem"
                fontSize="0.75rem"
                buttonPadding="0.4rem 1rem"
                mode="text"
              />
            </div>
          </div>

          {selectedExplorerTable && (
            <div className="mt-4 border border-gray-100 rounded-xl bg-gray-50/50 p-2">
              <TableParents
                data={explorerTableData.rows}
                columns={explorerTableData.columns}
                insights={explorerTableData.insights}
                tableName={explorerTableData.tableName}
                viewSelection={explorerViewSelection}
                globalFilter=""
                isLoading={isFetchingExplorerData}
              />
            </div>
          )}
        </div>
        */}

        {/* BOTTOM ROW: Chat UI */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">

          {/* Agent Control Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shadow-sm z-10">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-800">Unified AI Chat</span>
            </div>
            {/* 
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace:</span>
                <select
                  value={activeWorkspace}
                  onChange={(e) => setActiveWorkspace(e.target.value)}
                  className="h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50 cursor-pointer text-gray-700 font-medium min-w-[150px]"
                >
                  {workspaces.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            */}
          </div>

          {/* Chat Messages Log Scroll area */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4"
          >
            {chatMessages.length === 0 ? (
                <div className="max-w-3xl mx-auto py-8 text-center space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#5433FF] rounded-full text-xs font-bold uppercase tracking-wider">
                    SahajInsight AI Assistant / SQL SESSION
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">
                    Speak to your data. What would you like to analyze today?
                  </h2>

                  {isFetchingSuggestions ? (
                    <div className="flex justify-center items-center py-10 text-gray-400 gap-2">
                      <AutorenewRoundedIcon className="animate-spin text-sm" />
                      <span className="text-xs">Generating workspace suggestions...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-left">
                      {suggestionChips.map((chip, idx) => (
                        <div
                          key={idx}
                          onClick={() => setChatInputValue(chip)}
                          className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#5433FF] hover:bg-blue-50/20 transition text-xs text-gray-600 leading-relaxed leading-normal"
                        >
                          {chip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.query_id} className="space-y-2">

                      {/* User speech bubble */}
                      <div className="flex justify-end">
                        <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-sm leading-relaxed">
                          <span className="font-semibold block mb-0.5 text-[10px] text-gray-500">You</span>
                          <div>{msg.query}</div>
                          <div className="text-[9px] text-gray-400 mt-1.5 text-right font-light select-none">
                            Queried: {formatTimestamp(msg.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* AI Agent Speech bubble */}
                      {msg.ai_response && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none text-xs max-w-[80%] shadow-sm leading-relaxed">
                            <span className="font-semibold block mb-1 text-[10px] text-[#5433FF]">SahajInsight AI Assistant</span>
                            
                            {msg.chat_type === "sql" ? (
                              <>
                                <span className="text-gray-500 italic block mb-2">Procedure code generated below</span>
                                <div className="flex justify-between items-center gap-4 bg-gray-50 border border-gray-100 p-2 rounded-lg text-[10px] font-mono mb-1">
                                  <span>SQL Query Ready</span>
                                  <button
                                    onClick={() => {
                                      setTypedQuery(msg.ai_response);
                                      setScriptLogs([]);
                                      setScriptResultTable(null);
                                      setExecutionMeta(null);
                                      setCustomViewName("");
                                    }}
                                    className="text-[#5433FF] font-bold hover:underline"
                                  >
                                    Load Editor
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="text-gray-700">
                                {formatMessageText(msg.ai_response)}
                              </div>
                            )}
                            <div className="text-[9px] text-gray-400 mt-2 text-right font-light select-none">
                              Responded: {formatTimestamp(msg.ai_responded_at || msg.created_at)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none text-xs max-w-[80%] shadow-sm leading-relaxed flex flex-col gap-1.5">
                        <span className="font-semibold block text-[10px] text-[#5433FF]">SahajInsight AI Assistant</span>
                        <div className="flex items-center gap-1.5 py-1 px-2 bg-gray-50 border border-gray-100 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-[#5433FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#5433FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#5433FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Generated Code Editor, Executer & Results Panel */}
          {typedQuery && (
            <div className="bg-white border-t border-gray-200 p-5 space-y-4 max-w-4xl mx-auto w-full rounded-t-2xl shadow-lg shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Generated SQL Procedure</h3>
                  <p className="text-[10px] text-gray-400">Preview, edit or execute procedure script</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
                    title="Copy to clipboard"
                  >
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </button>

                  <button
                    onClick={handleRunScript}
                    disabled={isExecutingScript}
                    className="h-8 px-4 bg-[#5433FF] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
                  >
                    {isExecutingScript ? "Running..." : "Run"}
                  </button>
                </div>
              </div>

              {/* Code Box container */}
              <div className="relative border border-gray-100 rounded-xl bg-gray-50 p-4 max-h-[160px] overflow-y-auto">
                <SyntaxHighlighter
                  language="sql"
                  style={oneLight}
                  customStyle={{
                    backgroundColor: "transparent",
                    padding: 0,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontSize: "11px",
                  }}
                >
                  {typedQuery}
                </SyntaxHighlighter>
              </div>

              {/* Execution log logs output */}
              {scriptLogs.length > 0 && (
                <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-3 rounded-lg space-y-1">
                  {scriptLogs.map((log, idx) => (
                    <p key={idx} className={log.includes("ERROR") ? "text-rose-400" : "text-emerald-400"}>
                      &gt; {log}
                    </p>
                  ))}
                  {executionMeta && (
                    <p className="text-slate-400">
                      &gt; Time: {executionMeta.query_time}s | Rows affected: {executionMeta.rows_effected}
                    </p>
                  )}
                </div>
              )}

              {/* Execution results table output */}
              {scriptResultTable && scriptResultTable.rows.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-[220px] overflow-y-auto">
                  <ProductDataTable
                    data={scriptResultTable.rows}
                    columns={scriptResultTable.columns.filter((c) => c.column_name !== "row_hash")}
                    globalFilter=""
                  />
                </div>
              )}

              {/* Saving procedure view workflow */}
              {isScriptSuccess && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder="Enter custom view name to save..."
                    value={customViewName}
                    onChange={(e) => setCustomViewName(e.target.value)}
                    className="flex-1 h-9 px-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
                  />
                  <button
                    onClick={handleSaveClick}
                    disabled={isSavingQuery || !customViewName.trim()}
                    className="h-9 px-4 bg-[#5433FF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition"
                  >
                    {isSavingQuery ? "Saving..." : "Save View"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RAG Chat Prompt inputs row */}
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto flex items-center border border-gray-200 rounded-2xl bg-white focus-within:ring-1 focus-within:ring-[#5433FF] focus-within:border-[#5433FF] overflow-hidden"
            >
              <input
                type="text"
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                placeholder="Ask anything about your data..."
                disabled={isSendingMessage}
                className="flex-1 h-11 px-4 text-xs text-gray-800 bg-transparent outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !chatInputValue.trim()}
                className="h-9 w-9 m-1 flex items-center justify-center bg-[#5433FF] hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50"
              >
                <PlayArrowRoundedIcon className="w-5 h-5" />
              </button>
            </form>
            {chatInputError && (
              <p className="max-w-4xl mx-auto mt-2 text-xs text-rose-500 px-1">{chatInputError}</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmSaveView {...saveModalConfig} />
    </div>
  );
};

export default QueryDesignerManage;