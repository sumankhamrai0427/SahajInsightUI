import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../theme";
import FileDropZone from "./components/FileDropZone";
import DataProcessing from "./components/DataProcessing";
import ApiService from "../../services/ApiServices";
import { useAuth } from "../Auth/AuthContext";
import TableImportModal from "./modal/table-import-modal";

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
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(localStorage.getItem("selected_workspace") || "");

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
          
          if (!selectedWorkspace && wsList.length > 0) {
            setSelectedWorkspace(wsList[0].id.toString());
            localStorage.setItem("selected_workspace", wsList[0].id.toString());
          }
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
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: theme.primaryText }}>Select Workspace:</label>
          <select 
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CA1F3]"
            style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.primaryText }}
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
          >
            <option value="" disabled>Select a workspace</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.workspace_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <FileDropZone
            key={resetKey}
            onUploadComplete={uploadFiles}
            theme={theme}
            disabled={isUploading || isProcessing}
          />
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
                placeholder="Enter query (e.g. Retail industry sales 2026)"
                disabled={isSearching}
                className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#7CA1F3]"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.primaryText
                }}
              />
              <textarea
                value={searchResults}
                readOnly
                placeholder="Search result summary will appear here..."
                className="w-full h-24 p-3 border rounded-xl text-xs resize-none focus:outline-none"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.primaryText
                }}
              />
            </div>
          </div>
          <button
            onClick={handleWebSearch}
            disabled={isSearching || !searchQuery.trim()}
            className={`w-full mt-4 bg-[#7CA1F3] hover:bg-blue-600 h-10 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSearching || !searchQuery.trim() ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
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