import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ApiService from "../../../services/ApiServices";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ProductDataTable from "../../query-designer/components/DataTable";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../../Auth/AuthContext";
import ConfirmSaveView from "../../../Modal/ConfirmSaveView";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../../styles/tippy-theme.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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

interface StoredChatData {
  created_by: string;
  session_id: string;
  messages: StoredMessage[];
}

interface ChatSession {
  id: number;
  session_id: string;
  session_name: string;
  file_name: string;
  question: string;
  query: string;
  logs: string[];
  ai_response?: string;
}
interface TableData {
  rows: any[];
  columns: any[];
}
// interface ChatHistoryItem {
//   query_id: number;
//   session_id: string;
//   message: string;
//   created_at: string;
// }

// interface TableOption {
//   label: string;
//   value: string;
// }

// const CHAT_INIT_KEY = "chat_initialized_session";
//for new chat session
// =======================
// Local Storage Helpers
// =======================

const CHAT_STORE_KEY = "data_doctor_chat_store";

const getChatStore = (createdBy: string, sessionId: string): StoredChatData => {
  try {
    const raw = localStorage.getItem(CHAT_STORE_KEY);

    if (!raw) {
      return {
        created_by: createdBy,
        session_id: sessionId,
        messages: [],
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      created_by: createdBy,
      session_id: sessionId,
      messages: [],
    };
  }
};

const saveChatStore = (data: StoredChatData) => {
  localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(data));
};

export default function Chat({
  passedData,
}: {
  passedData?: {
    id?: number;
    query_title?: string;
    messages?: any[];
  };
}) {
  const { setDownloadData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("ig_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const sessionData = getStoredUser();
  const defaultSession = {
    session_id: sessionData?.session_id || "",
    session_name: sessionData?.session_name || "Chat01",
  };
  const isSessionDataMissing = !defaultSession.session_id;
  const [chat, setChat] = useState<ChatSession>({
    id: 1,
    session_id: defaultSession.session_id,
    session_name: defaultSession.session_name,
    question: isSessionDataMissing
      ? "FATAL ERROR: Session ID Missing."
      : "How can I assist you right now?",
    query: "",
    logs: isSessionDataMissing
      ? ["CRITICAL: Missing session_id. Cannot communicate with API."]
      : [],
    file_name: "",
  });
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [typedQuery, setTypedQuery] = useState("");
  const [typewriterKey, setTypewriterKey] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScriptRunSuccess, setIsScriptRunSuccess] = useState(false);
  const [executionMeta, setExecutionMeta] = useState<{
    rows_effected?: number | string;
    query_time?: string;
  } | null>(null);
  const userData = JSON.parse(localStorage.getItem("ig_user"));
  const [inputError, setInputError] = useState<string | null>(null);
  const [isScriptGenerated, setIsScriptGenerated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  // const [messageHistory, setMessageHistory] = useState<ChatHistoryItem[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [parentQueryId, setParentQueryId] = useState<number | null>(null);

  const [saveModalConfig, setSaveModalConfig] = useState<{
    customMessage?: string;
    showConfirmButton?: boolean;
  }>({});

  const isDefaultQuestion =
    chat?.question === "How can I assist you right now?" ||
    chat?.question?.startsWith("FATAL ERROR");

  const {
    setIsConfirmSaveModalOpen,
    viewName,
    setViewName,
    setConfirmSaveAction,
    isSaving,
    setIsSaving,
  } = useAuth();

  // useEffect(() => {
  //   const savedHistory = localStorage.getItem("chat_history");
  //   if (savedHistory) {
  //     try {
  //       setMessageHistory(JSON.parse(savedHistory));
  //     } catch (e) {
  //       console.error("Error parsing chat history", e);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!chat.session_id) return;

  //   const initializedSession = localStorage.getItem(CHAT_INIT_KEY);

  //   // FIRST TIME entering chat for this session
  //   if (initializedSession !== chat.session_id) {
  //     localStorage.removeItem("chat_history"); // clear old messages
  //     localStorage.setItem(CHAT_INIT_KEY, chat.session_id);
  //     setMessageHistory([]);
  //     return;
  //   }

  //   // NOT first time → load history
  //   const savedHistory = localStorage.getItem("chat_history");
  //   if (savedHistory) {
  //     try {
  //       setMessageHistory(JSON.parse(savedHistory));
  //     } catch (e) {
  //       console.error("Error parsing chat history", e);
  //     }
  //   }
  // }, [chat.session_id]);

  const mapMessagesToChatStore = (messages: any[]) =>
    messages.map((m, index) => ({
      query_id: m.id || index + 1,
      query: m.query,
      created_at: m.actual_created_at || new Date().toISOString(),
      ai_response: m.ai_response,
      is_execute: m.is_execute === 1,
      row_count: m.row_count,
      query_time: m.query_time,
      is_success: m.is_execute === 1,
      ai_responded_at: m.updated_at || m.actual_created_at || new Date().toISOString(),
    }));

  const getLastMessage = (messages: any[] = []) =>
    messages.length ? messages[messages.length - 1] : null;

  const storedMessages = getChatStore(
    userData?.user_id || "unknown",
    chat.session_id
  ).messages;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [storedMessages.length]);

  // useEffect(() => {
  //   console.log("Chat received passedData:", passedData);

  //   if (!passedData) return;

  //   if (passedData.user_query) {
  //     setInputValue(passedData.user_query);
  //   }

  //   if (passedData.query_title) {
  //     setViewName(passedData.query_title);
  //   }

  //   if (passedData.ai_response) {
  //     setIsScriptGenerated(false);
  //     setChat((prevChat) => ({
  //       ...prevChat,
  //       query: passedData.ai_response,
  //       ai_response: passedData.ai_response,
  //     }));

  //     // IMPORTANT: trigger typewriter effect immediately
  //     setTypedQuery(passedData.ai_response);
  //     setTypewriterKey((prev) => prev + 1);

  //   }
  // }, [passedData]);

  useEffect(() => {
    if (!passedData) {
      console.log("Create mode: clearing chat history");
      localStorage.removeItem("data_doctor_chat_store");
      setChat((prev) => ({
        ...prev,
        query: "",
        ai_response: "",
        logs: [],
      }));

      setTypedQuery("");
      setIsScriptGenerated(false);
      setDisplayedLogs([]);
      setViewName("");
      setParentQueryId(null);
    }
  }, [passedData]);

  useEffect(() => {
    if (!passedData?.messages?.length) return;
    console.log("Edit mode: patching chat history", passedData);
    if (passedData.id) {
      setParentQueryId(passedData.id);
    }
    if (passedData.query_title) {
      setViewName(passedData.query_title);
    }
    const patchedMessages = mapMessagesToChatStore(passedData.messages);
    saveChatStore({
      created_by: userData?.user_id || "unknown",
      session_id: chat.session_id,
      messages: patchedMessages,
    });
    setDisplayedLogs([]);
  }, [passedData]);

  useEffect(() => {
    if (!passedData?.messages?.length) return;
    const lastMsg = getLastMessage(passedData.messages);
    if (!lastMsg?.ai_response) return;
    console.log("Edit mode: loading last procedure");
    setIsScriptGenerated(false);
    setChat((prev) => ({
      ...prev,
      query: lastMsg.ai_response,
      ai_response: lastMsg.ai_response,
    }));

    setTypedQuery(lastMsg.ai_response);
    setTypewriterKey((prev) => prev + 1);
  }, [passedData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat) return;
    setIsScriptGenerated(false);
    setInputError(null);

    if (!chat.session_id || !chat.session_name) {
      return;
    }

    const queryId = Date.now();
    const queryTime = new Date().toISOString();

    const chatStore = getChatStore(
      userData?.user_id || "unknown",
      chat.session_id
    );

    chatStore.messages.push({
      query_id: queryId,
      query: inputValue.trim(),
      created_at: queryTime,
      ai_response: "",
      is_execute: false,
      row_count: 0,
      query_time: 0,
      is_success: false,
    });

    saveChatStore(chatStore);

    setIsSending(true);

    try {
      const payload = {
        session_id: chat.session_id,
        user_query: inputValue,
      };

      const response = await ApiService.chat(payload);
      const result = response.data?.data || {};
      const updatedStore = getChatStore(
        userData?.user_id || "unknown",
        chat.session_id
      );

      const currentMsg = updatedStore.messages.find(
        (m) => m.query_id === queryId
      );

      if (currentMsg) {
        currentMsg.ai_response = result.ai_response || "";
        currentMsg.ai_responded_at = new Date().toISOString();
      }

      saveChatStore(updatedStore);

      setChat((prev) => ({
        ...prev,
        question: result.user_query || inputValue,
        query: result.ai_response || "",
        ai_response: result.ai_response || "",
        logs: result.logs || [],
      }));
      setDisplayedLogs([]);
      setTypewriterKey((prev) => prev + 1);
      setInputValue("");
      setTableData(null);
      setIsScriptRunSuccess(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong";
      setInputError(errorMessage);
      setIsScriptGenerated(false);
      setIsScriptRunSuccess(false);

      // Clean up failed message from local storage
      const updatedStore = getChatStore(
        userData?.user_id || "unknown",
        chat.session_id
      );
      updatedStore.messages = updatedStore.messages.filter(m => m.query_id !== queryId);
      saveChatStore(updatedStore);
    } finally {
      setIsSending(false);
    }
  };

  const extractSqlQuery = (rawQuery: string): string => {
    if (!rawQuery) {
      return "";
    }
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
  const handleRunScript = async () => {
    if (!chat) {
      setDisplayedLogs(["No active chat session."]);
      return;
    }

    const executableQuery = extractSqlQuery(chat.query?.trim() || "");
    if (!executableQuery || !chat.session_id) {
      setDisplayedLogs(["No script to run."]);
      setTableData(null);
      setIsScriptRunSuccess(false);
      return;
    }

    setIsExecuting(true);
    try {
      const payload = {
        session_id: userData?.session_id,
        sql_query: executableQuery,
      };

      const response = await ApiService.executeSql(payload);

      // if (
      //   response.data.isSuccess &&
      //   response.data.data &&
      //   Array.isArray(response.data.data.rows)
      // ) {
      //   const rowCount =
      //     response.data.data.total_rows ?? response.data.data.rows.length;
      //   const executionTime = response.data.data.execution_time ?? null;
      //   const rows = response.data.data.rows;
      //   const columns =
      //     rows.length > 0
      //       ? Object.keys(rows[0]).map((key) => ({ column_name: key }))
      //       : [];

      //   setTableData({ rows, columns });
      //   setDownloadData({ rows, columns });
      //   setDisplayedLogs([response.data.message || "Execution successful."]);
      //   setExecutionMeta({
      //     rows_effected: rowCount,
      //     query_time: executionTime,
      //   });
      //   setIsScriptRunSuccess(true);
      //   const store = getChatStore(
      //     userData?.user_id || "unknown",
      //     chat.session_id
      //   );
      //   const lastMsg = [...store.messages]
      //     .reverse()
      //     .find((m) => m.is_execute === false);

      //   if (lastMsg) {
      //     lastMsg.is_execute = true;
      //     lastMsg.is_success = true;
      //     lastMsg.row_count = rowCount;
      //     lastMsg.query_time = executionTime;
      //   }

      //   saveChatStore(store);
      // } else {
      //   setTableData(null);
      //   setDisplayedLogs([
      //     response.data.message || "Execution failed or returned no data.",
      //   ]);
      //   setExecutionMeta(null);
      //   setIsScriptRunSuccess(false);
      // }
      //  ALWAYS show backend message first
      setDisplayedLogs([response.data.message || ""]);

      if (response.data.isSuccess === true) {
        const rowCount =
          response.data.data?.total_rows ??
          response.data.data?.rows?.length ??
          0;

        const executionTime = response.data.data?.execution_time ?? null;
        const rows = response.data.data?.rows || [];
        const columns =
          rows.length > 0
            ? Object.keys(rows[0]).map((key) => ({ column_name: key }))
            : [];

        setTableData({ rows, columns });
        setDownloadData({ rows, columns });
        setExecutionMeta({
          rows_effected: rowCount,
          query_time: executionTime,
        });
        setIsScriptRunSuccess(true);

        const store = getChatStore(
          userData?.user_id || "unknown",
          chat.session_id
        );

        const lastMsg = [...store.messages]
          .reverse()
          .find((m) => m.is_execute === false);

        if (lastMsg) {
          lastMsg.is_execute = true;
          lastMsg.is_success = true;
          lastMsg.row_count = rowCount;
          lastMsg.query_time = executionTime;
        }

        saveChatStore(store);
      } else {
        //  FAILURE CASE (200 but isSuccess=false)
        setTableData(null);
        setExecutionMeta(null);
        setIsScriptRunSuccess(false);
      }

      // } catch (error) {
      //   console.error("Execute SQL API Error:", error);
      //   const store = getChatStore(
      //     userData?.user_id || "unknown",
      //     chat.session_id
      //   );

      //   const lastMsg = [...store.messages]
      //     .reverse()
      //     .find((m) => m.ai_response === chat.query);

      //   if (lastMsg) {
      //     lastMsg.is_execute = true;
      //     lastMsg.is_success = false;
      //   }

      //   saveChatStore(store);
      // } finally {
      //   setIsExecuting(false);
      // }
    } catch (error: any) {
      console.error("Execute SQL API Error:", error);

      //  SHOW MESSAGE FOR 400 / 500
      setDisplayedLogs([
        error?.response?.data?.message ||
        error?.message ||
        "Server error while executing query."
      ]);

      setTableData(null);
      setExecutionMeta(null);
      setIsScriptRunSuccess(false);

      const store = getChatStore(
        userData?.user_id || "unknown",
        chat.session_id
      );

      const lastMsg = [...store.messages]
        .reverse()
        .find((m) => m.ai_response === chat.query);

      if (lastMsg) {
        lastMsg.is_execute = true;
        lastMsg.is_success = false;
      }

      saveChatStore(store);
    } finally {
      setIsExecuting(false)
    }

  };
  // const handleDeleteMessage = (queryId: number) => {
  //   const updatedHistory = messageHistory.filter(
  //     (item) => item.query_id !== queryId
  //   );

  //   setMessageHistory(updatedHistory);
  //   localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
  // };

  useEffect(() => {
    const query = chat?.query || "";
    setTypedQuery(""); // Clear previous text
    const scriptContainerRef = document.getElementById("script-container");

    if (!query) return;

    let i = 0; // Start from the very first character

    const typingInterval = setInterval(() => {
      if (i < query.length) {
        // Retrieve the character at the current index 'i'
        const char = query.charAt(i);

        // Append it to the state
        setTypedQuery((prev) => prev + char);

        i++; // Increment index

        // Scroll to bottom
        if (scriptContainerRef) {
          scriptContainerRef.scrollTop = scriptContainerRef.scrollHeight;
        }
      } else {
        clearInterval(typingInterval);
        setIsScriptGenerated(true);
      }
    }, 10);

    return () => {
      clearInterval(typingInterval);
    };
  }, [chat, typewriterKey]);

  useEffect(() => {
    setConfirmSaveAction(() => handleConfirmSave);
  }, [chat, viewName, isScriptRunSuccess, tableData]);

  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [messageHistory]);

  // const handleConfirmSave = async () => {
  //   if (!chat || !viewName.trim()) return;

  //   const payload = {
  //     user_query: chat.question,
  //     is_execute: isScriptRunSuccess ? 1 : 0,
  //     ai_response: chat.ai_response || "",
  //     created_by: userData?.user_id || "unknown",
  //     // row_data: tableData || null,
  //     session_id: chat.session_id,
  //     rows_effected: executionMeta?.rows_effected ?? "",
  //     query_time: executionMeta?.query_time ?? "",
  //     query_title: viewName || "",
  //   };

  //   try {
  //     const response = await ApiService.saveChat(payload);
  //     if (response.data.isSuccess) {
  //       console.log("Chat saved successfully:", response.data.message);
  //     } else {
  //       console.error("Failed to save chat:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error saving chat:", error);
  //   } finally {
  //     setIsConfirmSaveModalOpen(false);
  //     setViewName(""); // Clear input after saving
  //     navigate("/layout/query-list");
  //   }
  // };

  const handleConfirmSave = async () => {
    if (!chat || !viewName.trim()) return;
    const store = getChatStore(
      userData?.user_id || "unknown",
      chat.session_id
    );
    // const messagesToSend = parentQueryId
    //   ? store.messages.slice(1)   
    //   : store.messages;           
    // const messagesToSend = store.messages;

    const messagesToSend = store.messages.filter(
      m => m.query_id >= 10 ** 12   // only NEW messages
    );

    // 2Build FULL payload
    const payload = {
      session_id: chat.session_id,
      created_by: userData?.user_id || "unknown",
      query_title: viewName,
      parent_query_id: parentQueryId,
      messages: messagesToSend.map(msg => ({
        query_id: msg.query_id,
        query: msg.query,
        ai_response: msg.ai_response,
        is_execute: msg.is_execute ? 1 : 0,
        is_success: msg.is_success ? 1 : 0,
        row_count: msg.row_count ?? 0,
        query_time: msg.query_time ?? null,
        created_at: msg.created_at,
      })),
    };

    console.log("Full session save payload:", payload);

    try {
      setIsSaving?.(true);
      const response = await ApiService.saveChat(payload);
      if (response.data.isSuccess) {
        localStorage.removeItem("data_doctor_chat_store");
      } else {
        console.error("Save failed:", response.data.message);
      }
    } catch (error) {
      console.error("Save API error:", error);
    } finally {
      setIsSaving?.(false);
      setIsConfirmSaveModalOpen(false);
      setViewName("");
      navigate("/layout/query-list");
    }
  };

  // const handleSaveClick = () => {
  //   const existingTitles = (location.state as any)?.existingTitles || [];
  //   console.log('object',existingTitles)
  //   const isDuplicate = existingTitles.some(
  //     (title: string) =>
  //       title.toLowerCase() === viewName.trim().toLowerCase() &&
  //       title.toLowerCase() !== passedData?.query_title?.toLowerCase()
  //   );

  //   if (isDuplicate) {
  //     setSaveModalConfig({
  //       customMessage: "Query name already exists. Please choose a different name.",
  //       showConfirmButton: false,
  //     });
  //     setIsConfirmSaveModalOpen(true);
  //     return;
  //   }
  //   setSaveModalConfig({});
  //   setIsConfirmSaveModalOpen(true);
  // };

  const handleSaveClick = () => {
    const existingTitles = (location.state as any)?.existingTitles || [];
    const currentName = viewName.trim().toLowerCase();
    const originalName = passedData?.query_title?.trim().toLowerCase();

    const isDuplicate = existingTitles.some(
      (title: string) =>
        title.trim().toLowerCase() === currentName
    );

    if (isDuplicate) {
      if (passedData?.query_title && currentName === originalName) {
      } else {
        setSaveModalConfig({
          customMessage: "Query name already exists. Please choose a different name.",
          showConfirmButton: false,
        });
        setIsConfirmSaveModalOpen(true);
        return;
      }
    }
    setSaveModalConfig({});
    setIsConfirmSaveModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen px-5 mt-5">
      {isSessionDataMissing && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-xl shadow-md"
          role="alert"
        >
          <p className="font-bold">Session Data Missing</p>
        </div>
      )}
      <div className="pb-5 bg-[#D9D9D91A] rounded-xl">
        <div className="px-5 pt-4">
          <h1 className="text-lg font-semibold text-gray-800">
            Speak to Data Doctor
          </h1>
          <div className="text-gray-500 text-md flex flex-row items-center gap-20 border-gray-200">
            <div className="border-b-2 border-[#D9D9D9] w-[100%] gap-6 mt-1 flex" />
          </div>
        </div>
        <div
          ref={chatContainerRef}
          className="px-5 py-6 text-gray-700 whitespace-pre-line flex flex-col gap-4 max-h-[300px] overflow-y-auto "
        >
          <div className="self-start bg-gray-100 p-3 rounded-xl rounded-tl-none text-gray-800 max-w-[80%]  ">
            How can I assist you right now?
          </div>
          {storedMessages.map((item) => (
            <div
              key={item.query_id}
              className="self-end bg-[#D9D9D9] p-3 rounded-xl 
               rounded-tr-none text-gray-800 max-w-[80%]"
            >
              <div className="font-medium">{item.query}</div>

              {item.ai_response && (
                <div className="mt-1 text-xs text-gray-600">
                  Sp generated
                </div>
              )}

              {item.is_execute && (
                <div className="mt-1 text-xs text-green-600">
                  ✔ Executed ({item.row_count} rows)
                </div>
              )}

              <div className="text-[9px] text-gray-500 mt-2 text-right font-light select-none">
                Queried: {formatTimestamp(item.created_at)}
                {item.ai_response && ` | Answered: ${formatTimestamp(item.ai_responded_at || item.created_at)}`}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSendMessage}
          className="mx-5 border rounded-xl flex justify-between items-center bg-[#FBFBFB] py-2 text-gray-500 outline-none focus-within:ring-1
    focus-within:ring-[#5433FF]
    "
        >
          <input
            type="text"
            value={inputValue}
            // onChange={(e) => setInputValue(e.target.value)}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder={
              passedData
                ? "Ask a query to generate a script"
                : "Ask a query to generate a script"
            }
            disabled={isSessionDataMissing || isSending}
            className="w-full h-full bg-transparent px-3 outline-none text-sm text-gray-800"
          />
          <button
            type="submit"
            disabled={isSessionDataMissing || isSending}
            className={`p-2 rounded-full hover:bg-gray-100 ${isSessionDataMissing || isSending
              ? "opacity-50 cursor-not-allowed"
              : ""
              }`}
          >
            {isSending ? (
              <AutorenewRoundedIcon className="w-6 h-6 text-gray-600 animate-spin" />
            ) : (
              <PlayArrowRoundedIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </form>
        {inputError && (
          <p className="mt-2 text-sm text-red-600 mx-4">{inputError}</p>
        )}
      </div>
      <div className="bg-[#D9D9D91A] p-2 mt-5 rounded-xl">
        <div className="flex flex-row items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-gray-800 mt-1">
            Generated Procedure
            <p className="text-sm text-gray-500 mb-4">Run available script</p>
          </h1>

          {/* <div className="flex flex-row items-center justify-between px-5 pr-0">
            <div className={`w-[420px] flex items-center justify-between border rounded-xl px-5 py-2 shadow-sm ${isScriptRunSuccess ? "bg-[#FBFBFB] border-[#4319C2]" : "bg-white border-gray-200"}`}>

              <Tippy content={viewName} theme="gray" placement="top">
                <input
                  type="text"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder={
                    passedData?.query_title ? "" : "Please enter query name"
                  }
                  disabled={!isScriptRunSuccess}
                  className="focus:outline-none focus:ring-0 w-[84%] truncate bg-transparent"
                />
              </Tippy>
              <button
                onClick={() => setIsConfirmSaveModalOpen(true)}
                disabled={!isScriptRunSuccess || !viewName.trim()}
                className={`px-3 py-2 rounded-md bg-gray-200 text-gray-600 text-sm transition ${!isScriptRunSuccess || !viewName.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
                  }`}
              >
                Save
              </button>
            </div>
          </div> */}
          <div className="flex items-center gap-2">
            <Tippy content={viewName} theme="gray" placement="top">
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Name and save your custom view"
                disabled={!isScriptRunSuccess}
                className={`
        w-[360px] h-[36px]
      px-3 text-sm text-gray-700
        border border-gray-300 rounded-xl
        bg-white
        focus:outline-none focus:ring-1 focus:ring-[#5433FF]
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
      `}
              />
            </Tippy>
            <button
              onClick={handleSaveClick}
              disabled={!isScriptRunSuccess || !viewName.trim() || isSaving}
              className={`
      h-[36px] px-3 text-sm
      border border-gray-300 rounded-xl
      bg-gray-100 text-gray-600
      transition
      ${!isScriptRunSuccess || !viewName.trim() || isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
                }
    `}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin inline-block h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        <div className="mx-4 p-6 bg-white shadow-sm mb-10 rounded-xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              id="script-container"
              className=" w-[100%] text-sm font-mono relative min-h-[150px] max-h-[350px] overflow-y-auto max-w-[1300px]"
            >
              <SyntaxHighlighter
                language="sql"
                style={oneLight}
                customStyle={{
                  backgroundColor: "transparent",
                  padding: 0,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {typedQuery + (typedQuery === (chat?.query || "") ? "" : " ")}
              </SyntaxHighlighter>
            </div>
            <button
              onClick={handleRunScript}
              // disabled={isSessionDataMissing || isExecuting}
              disabled={
                isSessionDataMissing || isExecuting || !isScriptGenerated
              }
              className={`px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex-shrink-0 ${isSessionDataMissing || isExecuting || !isScriptGenerated
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300"
                }`}
            >
              {isExecuting ? "Running..." : "Run"}
            </button>
          </div>
          {displayedLogs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm -mx-6 px-5">
              {displayedLogs.map((log, i) => (
                <p
                  key={i}
                  className={
                    log.includes("ERROR") ? "text-red-600" : "text-gray-600"
                  }
                >
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="m-5">
          {" "}
          {tableData && tableData.rows.length > 0 && (
            <div className=" bg-white rounded-xl shadow-md">
              {" "}
              <ProductDataTable
                data={tableData.rows}
                columns={tableData.columns.filter(
                  (col) => col.column_name !== "row_hash"
                )}
                globalFilter={""}
              />{" "}
            </div>
          )}{" "}
        </div>
      </div>

      <ConfirmSaveView {...saveModalConfig} />
    </div>
  );
}
