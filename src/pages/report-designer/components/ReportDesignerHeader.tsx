import { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../../styles/tippy-theme.css";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../theme";
import { useAuth } from "../../Auth/AuthContext";
import ConfirmSaveView from "../../../Modal/ConfirmSaveView";
export default function DataViewHeader({
  globalFilter,
  setGlobalFilter,
  selectedTables,
  setSelectedTables,
  tableOptions,
  onRefresh,
  onRunScript,
  isRefreshing,
  reportName,
  setReportName,
  onSaveReport,
  editReport,
  setIsRefreshing,
  isSaving,
}) {
  const navigate = useNavigate();
  const { setIsConfirmSaveModalOpen, setViewName, setConfirmSaveAction } =
    useAuth();
  const dropdownRef = useRef<Dropdown>(null);
  const [loading, setLoading] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const { theme } = useTheme();
  const itemTemplate = (option) => {
    if (!option) return null;
    return (
      <Tippy content={option.label} theme="gray" placement="top-start">
        <div>{option.label}</div>
      </Tippy>
    );
  };
  
  useEffect(() => {
    if (editReport) {
      console.log(" Edit report in header:", editReport);
    }
  }, [editReport]);
  const isEditMode = !!editReport;
  useEffect(() => {
    if (!isEditMode || tableOptions.length === 0) return;
    const queryName = editReport?.query?.query_name;
    if (!queryName) return;
    const matchedOption = tableOptions.find((opt) => opt.label === queryName);
    if (matchedOption) {
      setSelectedTables([matchedOption.value]);
      onRunScript?.(matchedOption.value);
    }
  }, [isEditMode, editReport, tableOptions]);
  const handleSaveClick = async () => {
    setViewName(reportName);
    try {
      setLoading(true);
      await onSaveReport();
      navigate("/layout/report-designer");
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setLoading(false);
    }
  };
const valueTemplate = (option) => {
  if (!option) {
    return (
      <span className="text-gray-400 text-sm">
        Select Views
      </span>
    );
  }

  return (
    <Tippy content={option.label} theme="gray" placement="top">
      <span
        className="
          block
          max-w-[120px]
          overflow-hidden
          text-ellipsis
          whitespace-nowrap
          text-sm font-medium text-gray-700
        "
      >
        {option.label}
      </span>
    </Tippy>
  );
};

  return (
    <header className="px-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between h-auto md:h-20">
        <div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between h-auto md:h-20">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowBackConfirm(true)}
                className=" hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <ArrowBackRoundedIcon fontSize="small" />
              </button>

              <div className="flex flex-col ">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">
                  Report Designer
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full md:w-80 my-3 md:my-0 text-gray-500">
          <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 w-full md:w-80 text-sm h-10 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
            placeholder="Global Search"
          />
        </div>
        <div>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Write a report name(required)"
            className=" px-4 w-full md:w-80 text-sm h-10 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
          />
        </div>
        <div className="flex items-start md:items-center justify-center gap-2">
          <Dropdown
            ref={dropdownRef}
            value={
              Array.isArray(selectedTables) && selectedTables.length > 0
                ? selectedTables[0]
                : null
            }
            options={tableOptions}
            onChange={(e) => {
              const val = e.value;
              if (val !== (selectedTables[0] || null)) {
                setIsRefreshing(true);
                setSelectedTables(val ? [val] : []);
              }
            }}
             appendTo="self"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Views"
            valueTemplate={valueTemplate}   
            itemTemplate={itemTemplate}
            className="
    w-80 h-10 text-sm
  rounded-xl
    flex items-center justify-between
    transition-all duration-200
    bg-white
    border focus:outline-none focus:ring-1 focus:ring-[#5433FF]"
            panelClassName="
    bg-white rounded-xl border border-gray-100 overflow-hidden text-sm max-w-56
  "
            pt={{
              root: { className: "cursor-pointer" },
              input: {
           className: `
      text-sm font-medium text-gray-700 
      px-3 py-2 h-full flex items-center leading-tight
      overflow-hidden text-ellipsis whitespace-nowrap
      max-w-[150px]
    `,
              },
              trigger: {
                className:
                  "w-8 flex items-center justify-center text-gray-400 shrink-0",
              },
              list: { className: "p-1" },
              item: ({ context }: any) => ({
                className: `px-3 py-2 rounded-xl text-gray-700 cursor-pointer transition-colors mb-0.5 whitespace-normal break-words ${context.selected
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                  }`,
              }),
              itemLabel: { className: "font-medium" },
            }}
          />
          <button
            onClick={handleSaveClick}
            disabled={!reportName || isSaving || loading}
            className={`rounded-xl text-sm font-medium transition-all flex items-center h-10 justify-center ${!reportName || isSaving || loading
                ? "bg-gray-300 cursor-not-allowed text-white"
                : "bg-[#7CA1F3] hover:bg-blue-500 text-white"
              }`}
            style={{ width: "108px", height: "40px" }}
          >
            {isSaving || loading ? (
              <AutorenewRoundedIcon className="animate-spin" sx={{ fontSize: 20 }} />
            ) : (
              "Save Report"
            )}
          </button>
        </div>
      </div>
      <ConfirmSaveView type="Report" />
      {showBackConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-[50] bg-black/30 backdrop-blur-sm">
          <div
            className="rounded-xl shadow-lg p-8 min-w-[420px] max-w-[420px] text-center relative flex flex-col items-center justify-center"
            style={{ backgroundColor: theme.surface, color: theme.primaryText }}
          >
            <button
              onClick={() => setShowBackConfirm(false)}
              className="absolute top-2 right-2 transition"
              aria-label="Close"
              style={{ color: theme.accent }}
            >
              <CancelIcon className="w-7 h-7" />
            </button>

            <WarningRoundedIcon sx={{ color: theme.accent, fontSize: 48 }} />

            <div className="my-4">
              <p className="text-base md:text-lg font-semibold tracking-tight" style={{ color: theme.primaryText }}>
                <span style={{ color: theme.primaryText }}>Sahajinsight</span>
              </p>
            </div>

            <p className="mb-6 font-extrabold" style={{ color: theme.primaryText }}>
              Do you want to discard your changes?
            </p>

            <div className="flex justify-center gap-4">
              <button
                style={{ borderColor: theme.accent, color: theme.primaryText }}
                className="h-8 w-15 border font-extrabold text-xs px-5 rounded-xl hover:text-white transition"
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  setShowBackConfirm(false);
                  navigate(-1);
                }}
              >
                Yes
              </button>
              <button
                style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: theme.primaryText }}
                className="h-8 w-15 border font-extrabold text-xs px-5 rounded-xl transition"
                onClick={() => setShowBackConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
