import React, { useState, useEffect, useRef } from "react";
import ApiServices from "../../services/ApiServices";
import { Toast } from "primereact/toast";
import { useAuth } from "../Auth/AuthContext";

export default function ManageWorkspaces() {
  const toast = useRef(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user?.role !== "companyadmin" && user?.role !== "superadmin") {
    return <div className="p-6 text-red-500">Access Denied: Only company administrators can manage workspaces.</div>;
  }

  const fetchWorkspaces = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("ig_user") || "{}");
      const payload = { session_id: userData.session_id, created_by: userData.user_id };
      const response = await ApiServices.listWorkspaces(payload);
      if (response.data?.isSuccess) {
        setWorkspaces(response.data.data || []);
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: "Failed to fetch workspaces" });
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: "Workspace name is required" });
      return;
    }
    
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("ig_user") || "{}");
      const payload = { 
        workspace_name: workspaceName,
        session_id: userData.session_id,
        created_by: userData.user_id
      };
      const response = await ApiServices.createWorkspace(payload);
      if (response.data?.isSuccess) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: "Workspace created successfully" });
        setWorkspaceName("");
        fetchWorkspaces();
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: response.data?.message || "Failed to create workspace" });
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.response?.data?.message || "Error creating workspace" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Toast ref={toast} position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Workspaces</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Workspace</h2>
        <form onSubmit={handleCreateWorkspace} className="flex gap-4">
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Enter Workspace Name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Workspace Name</th>
              <th className="p-4 font-semibold text-gray-600">Created At</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-500">
                  No workspaces found
                </td>
              </tr>
            ) : (
              workspaces.map((ws) => (
                <tr key={ws.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{ws.workspace_name}</td>
                  <td className="p-4 text-gray-600">
                    {ws.created_at}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
