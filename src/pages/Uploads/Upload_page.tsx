import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../theme";
import FileDropZone from "./components/FileDropZone";
import DataProcessing from "./components/DataProcessing";
import ApiService from "../../services/ApiServices";
import { useAuth } from "../Auth/AuthContext";
import TableImportModal from "./modal/table-import-modal";
import { Dropdown } from "primereact/dropdown";

export default function UploadPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState("");
  const isInitialMount = useRef(true);
  const uploadInProgress = useRef(false);
  const createdBy = user?.user_id || "";
  const [noFileMessage, setNoFileMessage] = useState("");
  const sessionId = user?.session_id || "";
  const workspaceId = localStorage.getItem("selected_workspace") || "";

  // ADD THESE TWO LINES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadResponseData, setUploadResponseData] = useState<any>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState("");

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const handleCreateWorkspaceInline = async (wsName: string) => {
    setIsCreatingWorkspace(true);
    try {
      const payload = {
        workspace_name: wsName,
        session_id: sessionId,
        created_by: createdBy,
        user_email: user?.email || user?.user_email || user?.user_id
      };
      const response = await ApiService.createWorkspace(payload);
      if (response.data?.isSuccess) {
        const newWsId = response.data.data?.workspace_id;

        // Refresh workspaces list
        const userIdentifier = user?.email || user?.user_email || user?.user_id;
        const res = await ApiService.getUserWorkspaces({
          user_email: userIdentifier,
          session_id: sessionId,
          created_by: createdBy
        });
        if (res.data?.isSuccess) {
          const wsList = res.data.data || [];
          setWorkspaces(wsList);
        }

        // Auto-select the newly created workspace
        if (newWsId) {
          setSelectedWorkspace(newWsId.toString());
        }

        setFilterQuery("");
      } else {
        alert(response.data?.message || "Failed to create workspace.");
      }
    } catch (error: any) {
      console.error("Workspace creation failed:", error);
      alert(error.response?.data?.message || "Error creating workspace.");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("selected_workspace", "all");
    localStorage.setItem("active_workspace_id", "all");
  }, []);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const userIdentifier = user?.email || user?.user_email || user?.user_id;
      if (!userIdentifier) return;
      try {
        const payload = {
          user_email: userIdentifier,
          session_id: sessionId,
          created_by: createdBy
        };
        const res = await ApiService.getUserWorkspaces(payload);
        if (res.data?.isSuccess) {
          const wsList = res.data.data || [];
          setWorkspaces(wsList);
        }
      } catch (e) {
        console.error("Error fetching workspaces", e);
      }
    };
    fetchWorkspaces();
  }, [user]);

  useEffect(() => {
    if (selectedWorkspace) {
      localStorage.setItem("selected_workspace", selectedWorkspace);
      localStorage.setItem("active_workspace_id", selectedWorkspace);
      if (!isInitialMount.current) {
        trackFiles();
      }
    }
  }, [selectedWorkspace]);

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults("");
    try {
      const payload = {
        session_id: sessionId,
        created_by: createdBy,
        user_query: searchQuery,
        workspace_id: selectedWorkspace
      };
      const response = await ApiService.llmWebSearch(payload);
      if (response.data.isSuccess && response.data.data?.ai_response) {
        setSearchResults(response.data.data.ai_response);
      } else {
        setSearchResults(`Web Search Result for "${searchQuery}":\nNo data returned.`);
      }
    } catch (error: any) {
      console.error("Web search failed:", error);
      setSearchResults(`Error performing search: ${error.message || "An unknown error occurred."}`);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      trackFiles();
    }
  }, [createdBy, sessionId]);



  async function trackFiles() {
    const payload = { created_by: createdBy, session_id: sessionId, workspace_id: selectedWorkspace };
    setIsLoadingFiles(true);
    try {
      const response = await ApiService.tracker(payload);
      if (response.data.isSuccess) {
        const files = response.data?.data || [];
        setProcessedFiles(files);
        if (files.length === 0) {
          setNoFileMessage(response.data?.message || "No files found");
        } else {
          setNoFileMessage("");
        }
      } else {
        setProcessedFiles([]);
        setNoFileMessage(response.data?.message || "Failed to retrieve files.");
      }
    } catch (error: any) {
      console.error("Error tracking files:", error);
      const message =
        error.response?.data?.message || error.message || "An unknown error occurred";
      setProcessedFiles([]);
      setNoFileMessage(message);
    } finally {
      setIsLoadingFiles(false);
    }
  }


  async function uploadFiles(files: File[]) {
    if (!files || files.length === 0) return;
    if (uploadInProgress.current) return;
    uploadInProgress.current = true;
    setIsUploading(true);
    setIsProcessing(false);
    try {
      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("session_id", sessionId);
      formData.append("created_by", createdBy);
      formData.append("workspace_id", selectedWorkspace);
      formData.append("has_header", "true");
      files.forEach((file) => {
        formData.append("files", file);
      });
      setProcessingFileName(
        files.length > 1 ? `${files.length} files` : files[0].name
      );
      const uploadResponse = await ApiService.fileUpload(formData);
      console.log("Upload Response:", uploadResponse?.data);
      const responseData = uploadResponse?.data;
      if (!responseData?.isSuccess) {
        console.error("Upload failed:", responseData?.message);
        return;
      }
      const fileInfo = responseData.data;
      if (!fileInfo) {
        console.error("File info missing.");
        return;
      }
      setUploadedFileName(fileInfo.file_name || files[0].name);
      setUploadResponseData(fileInfo);
      setIsModalOpen(true);
      setResetKey((prev) => prev + 1);

      setIsUploading(false);
      setIsProcessing(false);

      await trackFiles();
    } catch (error: any) {
      console.error("Upload error:", error?.message || error);
    } finally {
      uploadInProgress.current = false;
      setIsUploading(false);
      setIsProcessing(false);
    }
  }

  const getDropdownOptions = () => {
    const baseOptions = [
      { label: "All Workspaces", value: "all" },
      ...workspaces.map((ws) => ({
        label: ws.workspace_name,
        value: ws.id.toString(),
      }))
    ];

    const trimmed = filterQuery.trim();
    if (trimmed) {
      const exists = workspaces.some(ws => ws.workspace_name.toLowerCase() === trimmed.toLowerCase());
      if (!exists && trimmed.toLowerCase() !== "all workspaces" && trimmed.toLowerCase() !== "all") {
        baseOptions.push({
          label: `Create Workspace: "${trimmed}"`,
          value: `CREATE_WS:${trimmed}`
        });
      }
    }
    return baseOptions;
  };

  const workspaceItemTemplate = (option: any) => {
    if (option.value && option.value.startsWith("CREATE_WS:")) {
      const wsName = option.value.replace("CREATE_WS:", "");
      return (
        <div className="flex items-center gap-2 text-blue-600 font-semibold py-1">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
            checked={false}
            readOnly
          />
          <span>Create Workspace: "{wsName}"</span>
        </div>
      );
    }
    return <span className="py-1">{option.label}</span>;
  };

  const handleWorkspaceDropdownChange = async (val: string) => {
    if (val && val.startsWith("CREATE_WS:")) {
      const wsName = val.replace("CREATE_WS:", "");
      await handleCreateWorkspaceInline(wsName);
    } else {
      setSelectedWorkspace(val || "all");
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(urlRegex);
      return (
        <div key={lineIdx} className="min-h-[1.2rem] break-words whitespace-pre-wrap">
          {parts.map((part, partIdx) => {
            if (part.match(/^https?:\/\//)) {
              return (
                <a
                  key={partIdx}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline cursor-pointer break-all font-semibold"
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="w-full rounded-xl p-8">
      <h2
        className="text-center text-xl font-semibold"
        style={{ color: theme.primaryText }}
      >
        Connector
      </h2>

      <p
        className="text-center text-xs mb-6"
        style={{ color: theme.secondaryText }}
      >
        Start by uploading a data file to create your first view.
      </p>

      {/* WORKSPACE SELECTION */}
      <div className="flex justify-start items-center gap-3 mb-6 px-1">
        <label className="text-sm font-medium" style={{ color: theme.primaryText }}>Create Workspace:</label>
        <Dropdown
          value={selectedWorkspace}
          options={getDropdownOptions()}
          onChange={(e) => handleWorkspaceDropdownChange(e.value)}
          filter
          onFilter={(e: any) => setFilterQuery(e.filter || "")}
          onHide={() => setFilterQuery("")}
          itemTemplate={workspaceItemTemplate}
          filterBy="label"
          showClear={false}
          filterPlaceholder="Search or type to create workspace..."
          placeholder="Select a workspace"
          className="w-72 h-10 border rounded-xl flex items-center justify-between text-xs px-3 focus:outline-none transition-all duration-200"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
            color: theme.primaryText,
          }}
          panelClassName="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs max-w-72 shadow-lg"
          panelStyle={{
            backgroundColor: theme.surface,
            color: theme.primaryText,
          }}
          pt={{
            root: { className: "cursor-pointer" },
            input: {
              className: `text-xs font-medium px-3 py-2 h-full flex items-center leading-tight overflow-hidden text-ellipsis whitespace-nowrap`,
              style: { color: theme.primaryText }
            },
            trigger: {
              className: "w-8 flex items-center justify-center text-gray-400 shrink-0",
            },
            list: { className: "p-1" },
            item: ({ context }: any) => ({
              className: `px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors mb-0.5 whitespace-normal break-words ${context.selected
                ? "bg-sky-100 text-sky-600 font-semibold"
                : "hover:bg-sky-50 hover:text-sky-600"
                }`,
              style: context.selected ? {} : { color: theme.primaryText }
            }),
            itemLabel: { className: "font-medium" },
            filterContainer: {
              className: "px-3 py-2 border-b",
              style: { borderColor: theme.border }
            },
            filterInput: {
              className: "w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#7CA1F3]",
              style: {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.primaryText
              }
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <FileDropZone
            key={resetKey}
            onUploadComplete={uploadFiles}
            theme={theme}
            disabled={isUploading || isProcessing || selectedWorkspace === "all"}
          />
          {selectedWorkspace === "all" && (
            <p className="text-xs text-gray-400 mt-2 text-center font-semibold">
              Please select a specific workspace to upload files.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: theme.primaryText }}>
              web search using llm
            </p>
            <p className="text-xs" style={{ color: theme.secondaryText }}>
              Perform real-time web intelligence queries and get synthesized findings from AI.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={selectedWorkspace === "all" ? "Select a specific workspace to search" : "Enter query (e.g. Retail industry sales 2026)"}
                disabled={isSearching || selectedWorkspace === "all"}
                className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#7CA1F3]"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.primaryText
                }}
              />
              <div
                className="w-full h-48 min-h-[6rem] p-3 border rounded-xl text-xs overflow-y-auto custom-scrollbar whitespace-pre-wrap select-text text-left"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.primaryText
                }}
              >
                {searchResults ? (
                  renderFormattedText(searchResults)
                ) : (
                  <span className="text-gray-400">Search result summary will appear here...</span>
                )}
              </div>
            </div>
          </div>
          {selectedWorkspace === "all" && (
            <p className="text-xs text-gray-400 text-center font-semibold mt-1">
              Please select a specific workspace to search.
            </p>
          )}
          <button
            onClick={handleWebSearch}
            disabled={isSearching || !searchQuery.trim() || selectedWorkspace === "all"}
            className={`w-full mt-4 bg-[#7CA1F3] hover:bg-blue-600 h-10 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSearching || !searchQuery.trim() || selectedWorkspace === "all" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {(isProcessing || isUploading) && (
        <div className="flex flex-col items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{
              borderColor: theme.accent
            }}></div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.primaryText }}>
                Processing {processingFileName}...
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoadingFiles ? (
        <div className="flex justify-center items-center mt-20">
          <div className="flex items-center gap-2">
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderColor: theme.accent }}
            />
            <p className="text-sm" style={{ color: theme.secondaryText }}>
              Loading files...
            </p>
          </div>
        </div>
      ) : (
        <DataProcessing files={processedFiles} onRefresh={trackFiles} />
      )}
      <TableImportModal
        isOpen={isModalOpen}
        onClose={async () => {
          setIsModalOpen(false);
          await trackFiles();
        }}

        onFinish={trackFiles}
        uploadedFileName={uploadedFileName}
        apiData={uploadResponseData}
      />
    </div>
  );
}