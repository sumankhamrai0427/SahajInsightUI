import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  rows: any[];
  columns: any[];
}
interface PreviewChartData {
  charts: any[]; // you can replace `any` with ChartConfig later
}

interface ChatMessage {
  role: "user" | "ai";
  message: string;
  chart_updates?: any[];
  timestamp?: string;
}
interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: Dispatch<SetStateAction<boolean>>;
  isConfirmSaveModalOpen: boolean;
  downloadData: { rows: any[]; columns: any[] } | null;
  setDownloadData: Dispatch<TableData | null>;
  setIsConfirmSaveModalOpen: Dispatch<SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  viewName: string;
  setViewName: Dispatch<SetStateAction<string>>;
  confirmSave: () => void;
  setConfirmSaveAction: (action: () => void) => void;
  previewChartData: any[] | null;
  setPreviewChartData: Dispatch<SetStateAction<any[] | null>>;
  downloadChartData: any[] | null;
  setDownloadChartData: Dispatch<SetStateAction<any[] | null>>;
  chatHistory: ChatMessage[];
  setChatHistory: Dispatch<SetStateAction<ChatMessage[]>>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const storedUser = localStorage.getItem("ig_user");
      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Invalid user JSON:", err);
      localStorage.removeItem("ig_user");
      return null;
    }
  });
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewName, setViewName] = useState("");
  const [downloadData, setDownloadData] = useState<TableData | null>(null);
  const [confirmSaveAction, setConfirmSaveAction] = useState<() => void>(() => () => { });
  const [previewChartData, setPreviewChartData] = useState<any[] | null>(null);
  const [downloadChartData, setDownloadChartData] = useState<any[] | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const login = (userData: any) => {
    localStorage.setItem("ig_user", JSON.stringify(userData));
    setUser(userData);
    // navigate("/layout/dashboard", { replace: true });
    if (userData.role === "superadmin") {
      navigate("/layout/super-dashboard", { replace: true });
    } else {
      navigate("/layout/dashboard", { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem("ig_user");
    setIsLogoutModalOpen(false);
    setUser(null);
    navigate("/", { replace: true });
  };

  const confirmSave = () => {
    if (confirmSaveAction) {
      confirmSaveAction();
    }
    // Keep the modal open until the confirm action decides to close it (so a loader can be shown)
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, login, logout, isAuthenticated,
      isLogoutModalOpen, setIsLogoutModalOpen,
      isConfirmSaveModalOpen, setIsConfirmSaveModalOpen,
      isSaving, setIsSaving,
      downloadData, setDownloadData,
      viewName, setViewName, confirmSave, setConfirmSaveAction: setConfirmSaveAction, previewChartData,
      setPreviewChartData, downloadChartData, setDownloadChartData, chatHistory, setChatHistory
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};