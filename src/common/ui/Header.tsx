
import { useState, useEffect } from "react";
import { useTheme } from "../../theme";
import LogoutModal from "../../Modal/LogoutModal";
import { useAuth } from "../../pages/Auth/AuthContext";
import ApiServices from "../../services/ApiServices";

export default function Header() {
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const { user, setIsLogoutModalOpen } = useAuth();
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute, second] = timeStr.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      const dateString = `${weekday} | ${day}${getOrdinalSuffix(day)} ${month}`;
      const timeString = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setFormattedDate(dateString);
      setFormattedTime(formatTo12Hour(timeString));
    };

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchMyWorkspaces = async () => {
      // Find the user identifier (could be email or user_id for company users)
      const userIdentifier = user?.email || user?.user_email || user?.user_id;
      if (userIdentifier && user?.role !== 'superadmin') {
        try {
          const response = await ApiServices.getUserWorkspaces({ 
            user_email: userIdentifier,
            session_id: userData?.session_id,
            created_by: userData?.user_id
          });
          if (response.data?.isSuccess) {
            const fetchedWorkspaces = response.data.data || [];
            setWorkspaces(fetchedWorkspaces);
            if (fetchedWorkspaces.length > 0) {
              // Optionally load last selected from localStorage
              const saved = localStorage.getItem('selected_workspace');
              if (saved && fetchedWorkspaces.find(w => w.id.toString() === saved)) {
                setSelectedWorkspace(saved);
              } else {
                setSelectedWorkspace(fetchedWorkspaces[0].id.toString());
                localStorage.setItem('selected_workspace', fetchedWorkspaces[0].id.toString());
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch user workspaces", error);
        }
      }
    };
    
    if (user) {
      fetchMyWorkspaces();
    }
  }, [user]);

  const handleWorkspaceChange = (e) => {
    const val = e.target.value;
    setSelectedWorkspace(val);
    localStorage.setItem('selected_workspace', val);
    // Reload to apply workspace context if needed
    window.location.reload();
  };

  const { theme } = useTheme();

  const handleLogout = () => {
    setIsLogoutModalOpen(true)
  };

  return (
    <>
      <header
        className="flex justify-between items-center px-6 h-14 border-b"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.primaryText,
        }}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <p className="text-base md:text-lg font-semibold tracking-tight" style={{ color: theme.primaryText }}>
              <span style={{ color: theme.primaryText }}>Sahajinsight</span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: theme.secondaryText }}>
            {workspaces.length > 0 && (
              <select
                value={selectedWorkspace}
                onChange={handleWorkspaceChange}
                className="px-3 py-1 mr-4 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none text-sm font-medium"
              >
                {workspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.workspace_name}</option>
                ))}
              </select>
            )}
            <p>
              {formattedDate} | {formattedTime}
            </p>
          </div>
        </div>
      </header>
      <LogoutModal />
    </>
  );
}
