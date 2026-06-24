import React, { useEffect, useState } from 'react'
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useNavigate } from 'react-router-dom';
import ApiServices from "../../services/ApiServices";
import Tippy from '@tippyjs/react';
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import "../../styles/primereact-table.css";

function ManageCompanyAdmin() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyAdmin, setCompanyAdmin] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState({
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
  });
  const navigate = useNavigate();
  useEffect(() => {
    fetchCompanyAdmins();
  }, []);
  const columnConfig = [
    {
      field: "admin_user_id",
      header: "User Name",
      sortable: true,
    },
    {
      field: "admin_email",
      header: "Email ID",
      sortable: true,
    },
    // {
    //   field: "company_name",
    //   header: "Company Name",
    //   sortable: true,
    // },
    {
      field: "phone_number",
      header: "Phone Number",
      sortable: true,
    },
    {
      field: "address",
      header: "Address",
      sortable: true,
      body: (row: any) => {
        if (!row.address) return null;

        let addrText = "";

        try {
          const addr = JSON.parse(row.address);
          addrText = [
            addr.area,
            addr.city,
            addr.district,
            addr.state,
            addr.country,
            addr.pin_code ? `- ${addr.pin_code}` : ""
          ]
            .filter(Boolean)
            .join(", ");
        } catch {
          addrText = row.address; // plain string
        }

        return (
          <div
            className="max-w-[280px] truncate"
            title={addrText}
          >
            {addrText}
          </div>
        );
      },
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      body: (row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active === 1
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {row.is_active === 1 ? "Active" : "Inactive"}
        </span>
      ),
    }


  ];



  const fetchCompanyAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiServices.getAllCompanyAdmins();
      if (response?.data?.isSuccess) {
        setCompanyAdmin(response.data.data);
      } else {
        setError(response?.data?.message || "Failed to fetch companies");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  };
  const actionBodyTemplate = (row: any) => (
    <div className="flex justify-end gap-2">
      <Tippy content="Edit" theme="gray">
        <button
          className="p-1 rounded hover:bg-blue-100 text-gray-600"
          onClick={() => {
            navigate(`/layout/add-company-admin/${row.id}`, {
              state: { admin: row }
            });
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </button>
      </Tippy>


    </div>
  );




  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);


    setFilters({
      global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    });

    await fetchCompanyAdmins();

    setIsRefreshing(false);
  };

  return (
    <div className="mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold text-[#1C1B1F] leading-tight">Manage Company Admins</h1>
            <p className="text-[12px] text-[#888585] mt-1 whitespace-nowrap">
              Start by adding your first company admin.

            </p>
          </div>
          <button
            className="bg-blue-400 hover:bg-blue-700 h-10 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center p-4"

            onClick={() => navigate("/layout/add-company-admin")}

          >
            Add Company Admin
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400 group-focus-within:text-[#5433FF] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Global Search"
              value={filters.global.value}
              onChange={(e) =>
                setFilters({
                  global: {
                    value: e.target.value,
                    matchMode: FilterMatchMode.CONTAINS,
                  },
                })
              }
              className="pl-10 pr-4 py-2 border border-[#D9D9D9] rounded-lg h-10 text-sm
               bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#5433FF]"
              style={{ width: "568px" }}
            />

          </div>
          <Tippy content="Refresh" theme="gray">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`
        w-10 h-10 flex items-center justify-center rounded-lg
        border border-[#D9D9D9] bg-[#D9D9D9]
        ${isRefreshing ? "opacity-70 cursor-wait" : "cursor-pointer"}
      `}
            >
              <AutorenewRoundedIcon
                className={`w-5 h-5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`}
                fontSize="small"
              />
            </button>
          </Tippy>

        </div>
      </div>
      {/* <DataTable
        value={companyAdmin}
        paginator
        rows={5}
        loading={isLoading}
        filters={filters}
        globalFilterFields={columnConfig.map(c => c.field)}
        stripedRows
        emptyMessage="No companies found"
        className="custom-table"
      >
        {columnConfig.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable}
          // body={col.body}

          />
        ))}

        <Column
          header="Action"
          align="center"
          body={actionBodyTemplate}
          style={{ width: "120px" }}
        />
      </DataTable> */}
      <div className="relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <DataTable
          value={companyAdmin}
          paginator
          paginatorClassName="custom-paginator"
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          rowGroupMode="subheader"
          groupRowsBy="company_name"
          sortMode="single"
          sortField="company_name"
          sortOrder={1}
          rowGroupHeaderTemplate={(data: any) => (
            <div className="flex items-center gap-2 px-2 py-3 bg-gray-50 border-b border-gray-200">
              <span className="font-bold text-gray-800">{data.company_name}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {data.company_code}
              </span>
            </div>
          )}
          filters={filters}
          globalFilterFields={columnConfig.map(c => c.field)}
          stripedRows
          emptyMessage="No users found"
          className="custom-table"
        >
          {columnConfig.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              sortable={col.sortable}
              body={col.body}
            />
          ))}

          <Column
            header="Action"
            align="center"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
          />
        </DataTable>
      </div>



    </div>
  )
}
export default ManageCompanyAdmin
