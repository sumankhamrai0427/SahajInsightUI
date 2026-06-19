import React, { useState, useEffect, useRef } from "react";
import ApiServices from "../../services/ApiServices";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";

export default function AssignWorkspaceUsers() {
  const toast = useRef(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigningUserEmail, setAssigningUserEmail] = useState("");

  const [filters, setFilters] = useState({
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("ig_user") || "{}");
      const payload = { session_id: userData.session_id, created_by: userData.user_id };
      
      const [wsResponse, usersResponse] = await Promise.all([
        ApiServices.listWorkspaces(payload),
        ApiServices.getAllUsersWorkspace(payload)
      ]);

      if (wsResponse.data?.isSuccess) {
        setWorkspaces(wsResponse.data.data || []);
      }
      if (usersResponse.data?.isSuccess) {
        setAllUsers(usersResponse.data.data || []);
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignUser = async (userEmail, selectedWorkspaceId) => {
    if (!selectedWorkspaceId) {
      toast.current?.show({ severity: 'warn', summary: 'Warning', detail: "Please select a workspace to assign" });
      return;
    }

    setAssigningUserEmail(userEmail);
    try {
      const userData = JSON.parse(localStorage.getItem("ig_user") || "{}");
      const response = await ApiServices.assignUserWorkspace({
        workspace_id: parseInt(selectedWorkspaceId),
        user_email: userEmail,
        session_id: userData.session_id,
        created_by: userData.user_id
      });

      if (response.data?.isSuccess) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: "Workspace assigned successfully" });
        // Refresh data to update assignments
        await fetchData();
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: response.data?.message || "Failed to assign workspace" });
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.response?.data?.message || "Error assigning workspace" });
    } finally {
      setAssigningUserEmail("");
    }
  };

  const actionBodyTemplate = (rowData) => {
    // Filter out workspaces the user is already assigned to
    const assignedIds = rowData.assigned_workspace_ids || [];
    const availableWorkspaces = workspaces.filter(ws => !assignedIds.includes(ws.id));
    
    const isAtLimit = assignedIds.length >= 5;

    return (
      <div className="flex items-center gap-2">
        <select
          value={rowData.selectedWorkspaceId || ""}
          onChange={(e) => {
            const val = e.target.value;
            setAllUsers(prevUsers => 
              prevUsers.map(u => 
                u.email === rowData.email ? { ...u, selectedWorkspaceId: val } : u
              )
            );
          }}
          disabled={isAtLimit || availableWorkspaces.length === 0}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[200px]"
        >
          <option value="">-- Select Workspace --</option>
          {availableWorkspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.workspace_name}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleAssignUser(rowData.email, rowData.selectedWorkspaceId)}
          disabled={isAtLimit || availableWorkspaces.length === 0 || assigningUserEmail === rowData.email || !rowData.selectedWorkspaceId}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[80px]"
        >
          {assigningUserEmail === rowData.email ? "Assigning..." : "Assign"}
        </button>
      </div>
    );
  };

  const assignedWorkspacesNamesTemplate = (rowData) => {
    const assignedIds = rowData.assigned_workspace_ids || [];
    const assignedWorkspaces = workspaces.filter(ws => assignedIds.includes(ws.id));

    if (assignedWorkspaces.length === 0) {
      return <span className="text-gray-400 text-xs italic">None</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
        {assignedWorkspaces.map(ws => (
          <span 
            key={ws.id} 
            className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded shadow-sm truncate max-w-[120px]"
            title={ws.workspace_name}
          >
            {ws.workspace_name}
          </span>
        ))}
      </div>
    );
  };

  const assignedCountTemplate = (rowData) => {
    const count = (rowData.assigned_workspace_ids || []).length;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${count >= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        {count} / 5
      </span>
    );
  };

  return (
    <div className="p-6">
      <Toast ref={toast} position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assign Users to Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">Select a workspace to assign to a user (Max 5 workspaces per user).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.global.value}
            onChange={(e) =>
              setFilters({
                global: {
                  value: e.target.value,
                  matchMode: FilterMatchMode.CONTAINS,
                },
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm w-64"
          />
        </div>

        <DataTable
          value={allUsers}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          loading={loading}
          filters={filters}
          globalFilterFields={["full_name", "email"]}
          stripedRows
          emptyMessage="No users found."
          className="custom-table"
        >
          <Column field="full_name" header="Name" sortable />
          <Column field="email" header="Email" sortable />
          <Column header="Assigned Workspaces" body={assignedWorkspacesNamesTemplate} />
          <Column header="Usage" body={assignedCountTemplate} align="center" />
          <Column header="Add Workspace" body={actionBodyTemplate} />
        </DataTable>
      </div>
    </div>
  );
}
