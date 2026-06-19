import Tippy from '@tippyjs/react';
import React, { useEffect, useState } from 'react'
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import { FilterMatchMode } from "primereact/api";
import ApiServices from "../../services/ApiServices";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useAuth } from '../Auth/AuthContext';
import ConfirmSaveView from '../../Modal/ConfirmSaveView';

function ManageSEO() {
 const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoData, setSeoData] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
  });
const [deleteId, setDeleteId] = useState<number | null>(null);
    const { setIsConfirmSaveModalOpen } = useAuth();
  
  const navigate = useNavigate();
  useEffect(() => {
    fetchSEO();
  }, []);
  const EllipsisCell = ({ text, width = 260 }: { text: string; width?: number }) => {
  if (!text) return "-";

  return (
    <Tippy content={text} placement="top" theme="light-border">
      <div
        className="truncate"
        style={{
          maxWidth: `${width}px`,
          cursor: "pointer",
        }}
      >
        {text}
      </div>
    </Tippy>
  );
};

  const columnConfig = [
    { field: "page_path", header: "Page Path", sortable: true, },
    { field: "seo_title", header: "SEO Title", sortable: false, body: (row: any) => (
      <EllipsisCell text={row.seo_title} width={140} />
    ), },
    { field: "target_keyword", header: "Keyword", sortable: false, body: (row: any) => (
      <EllipsisCell text={row.target_keyword} width={140} />
    ), },
    { field: "meta_description", header: "Description", sortable: false, body: (row: any) => (
      <EllipsisCell text={row.meta_description} width={140} />
    ), },
    // {
    //   field: "address",
    //   header: "Company Address",
    //   body: (row: any) => {
    //     let addrText = "";

    //     try {
    //       const addr = row.address ? JSON.parse(row.address) : null;
    //       if (addr) {
    //         addrText = `${addr.area}, ${addr.city}, ${addr.district}, ${addr.state}, ${addr.country} - ${addr.pin_code}`;
    //       }
    //     } catch {
    //       addrText = row.address;
    //     }

    //     return (
    //       <div className="max-w-[260px] truncate" title={addrText}>
    //         {addrText}
    //       </div>
    //     );
    //   },
    // },
  ];



  const fetchSEO = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiServices.getSEOlist();
      if (response?.data?.isSuccess) {
        setSeoData(response.data.data);
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
            navigate(`/layout/add-seo/${row.id}`, {
              state: { seo: row }
            });
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </button>
      </Tippy>
      <Tippy content="Delete" theme="gray">
              <button
                className="p-1 rounded hover:bg-red-100 text-gray-600"
                onClick={() => handleDeleteClick(row.id)}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </button>
            </Tippy>
    </div>
  );





  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    //  RESET FILTER PROPERLY
    setFilters({
      global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    });

    await fetchSEO();

    setIsRefreshing(false);
  };
 const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsConfirmSaveModalOpen(true);
  };
   const deleteSEO = async (seoId: number) => {
  try {
    await ApiServices.deleteSEO({ id: seoId });
    fetchSEO();
  } catch (err) {
    console.error("Delete failed", err);
  }
};

  
    const handleConfirmDelete = async () => {
      if (deleteId) {
        await deleteSEO(deleteId);
        setIsConfirmSaveModalOpen(false);
        setDeleteId(null);
      }
    };
  return (
    <div className="mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold text-[#1C1B1F] leading-tight">Manage SEO</h1>
            <p className="text-[12px] text-[#888585] mt-1 whitespace-nowrap">
              Start by adding your first SEO.

            </p>
          </div>
          <button
            className="bg-blue-400 hover:bg-blue-700 h-10 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center"
            style={{
              width: '130px',
              height: '45px',
            }}
            onClick={() => navigate("/layout/add-seo")}

          >
            Add SEO
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

      <div className="relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <DataTable
          value={seoData}
          paginator
          rows={5}
          filters={filters}
          globalFilterFields={columnConfig.map(c => c.field)}
          stripedRows
          emptyMessage="No SEO records found"
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
      
            <ConfirmSaveView
              customTitle="Delete SEO"
              customMessage="Are you sure you want to delete this SEO?"
              customOnConfirm={handleConfirmDelete}
              customOnCancel={() => {
                setIsConfirmSaveModalOpen(false);
                setDeleteId(null);
              }}
              hideHeaderLabel={true}
            />
      
    </div>
  )
}

export default ManageSEO
