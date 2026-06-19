import { useState, useEffect, useRef } from "react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Tippy from "@tippyjs/react";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import "tippy.js/dist/tippy.css";
import "../../../styles/tippy-theme.css";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../theme";
import ApiServices from "../../../services/ApiServices";
import AnimatedToggleButton from "./AnimatedToggleButton";

interface HeaderProps {
  onRefresh: () => void;
  onTableSelect?: (data: any) => void;
  tableOptions: any[];
  viewSelection: string;
  isLoading: boolean;
  onViewChange: (view: string) => void;
  onTableLoading?: (isLoading: boolean) => void;
  onFetchTables?: () => void;

  passedData?: {
    user_query: string;
    query_title: string;
  };
}

export default function DashboardHeader({
  onRefresh,
  onTableSelect,
  tableOptions,
  viewSelection,
  isLoading,
  onViewChange,
  passedData,
  onTableLoading,
  onFetchTables,
}: HeaderProps) {
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<Dropdown>(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const navigate = useNavigate();
  const toggleOptions = [
    { label: "Meta Data", value: "metadata" },
    { label: "Data View", value: "dataview" },
    { label: "Insights", value: "insights" },
  ];
  const defaultSelectionIndex = toggleOptions.findIndex(
    (opt) => opt.value === viewSelection
  );

  useEffect(() => {
    if (passedData) {
      console.log("DashboardHeader received edit data:", passedData);
    }
  }, [passedData]);

  const handleViewChange = (e: { value: any }) => {
    const selectedTable = e.value;
    if (!selectedTable || selectedTable === selectedView) return;
    setSelectedView(selectedTable);

    const getStoredUser = () => {
      try {
        const raw = localStorage.getItem("ig_user");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };
    const user = getStoredUser();

    if (user && selectedTable) {
      const payload = {
        session_id: user.session_id,
        created_by: user.user_id,
        table_name: selectedTable,
      };

      setIsChanging(true);
      onTableLoading?.(true);
      ApiServices.getTableData(payload)
        .then((response) => {
          onTableSelect?.(response.data.data.details[selectedTable]);
        })
        .catch((error) => console.error("Error fetching table data:", error))
        .finally(() => {
          setIsChanging(false);
          onTableLoading?.(false);
        });
    }
  };
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  const handleDropdownShow = () => {
    window.addEventListener("scroll", handleScroll, true);
  };
  const handleDropdownHide = () => {
    window.removeEventListener("scroll", handleScroll, true);
  };
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.closest(".p-dropdown-panel")) {
      return;
    }
    dropdownRef.current?.hide();
  };

  return (
    <>
      <header
        // style={{ backgroundColor: theme.surface }}
        className="w-full"
      >
        <div className="px-3 sm:px-4 lg:px-3 ">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between h-auto md:h-20 py-2 md:py-0">
            <div className="flex items-center w-full md:w-auto">
              <button
                onClick={() => setShowBackConfirm(true)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <ArrowBackRoundedIcon fontSize="small" />
              </button>

              <div className="flex flex-col gap-1">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
                  Speak to your data
                </h1>
                {passedData?.query_title && (
                  <span className="text-sm text-gray-500 -mt-1">
                    {passedData.query_title}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <Dropdown
                ref={dropdownRef}
                value={selectedView}
                options={tableOptions}
                onChange={handleViewChange}
                // loading={isLoading || isChanging}
                // loadingIcon={<AutorenewRoundedIcon className="w-5 h-5 animate-spin" />}
                placeholder="Select a Table"
                onShow={handleDropdownShow}
                onHide={handleDropdownHide}
                onMouseDown={() => onFetchTables?.()}
                className="
                  w-72 h-10
                  border border-gray-200 
                  rounded-xl 
                  flex items-center justify-between
                  transition-all duration-200
                "
                panelClassName="
                  bg-white rounded-xl border border-gray-100 overflow-hidden text-sm
                "
                pt={{
                  root: { className: "cursor-pointer" },
                  input: {
                    className: "text-sm font-medium text-gray-700 px-3 py-0",
                  },
                  trigger: {
                    className:
                      "w-8 flex items-center justify-center text-gray-400",
                  },
                  list: { className: "p-1" },
                  item: ({ context }: any) => ({
                    className: `px-3 py-2 rounded-xl text-gray-700 cursor-pointer transition-colors mb-0.5 ${
                      context.selected
                        ? "bg-gray-100 hover:bg-gray-200 font-semibold"
                        : "hover:bg-gray-50"
                    }`,
                  }),
                  itemLabel: { className: "font-medium" },
                }}
              />
              <AnimatedToggleButton
                options={toggleOptions}
                defaultSelected={defaultSelectionIndex}
                onChange={(_index, value) => {
                  onViewChange(value as string);
                }}
                mode="text"
              />

              <Tippy content="Refresh" theme="gray">
                <div
                  onClick={handleRefresh}
                  className={`relative text-center bg-[#D9D9D9] border rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${
                    isRefreshing ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{ borderColor: theme.border }}
                >
                  {isRefreshing ? (
                    <AutorenewRoundedIcon
                      className="w-5 h-5 animate-spin"
                      sx={{ color: theme.secondaryText }}
                    />
                  ) : (
                    <AutorenewRoundedIcon
                      className="w-5 h-5"
                      sx={{
                        color: theme.secondaryText,
                        "&:hover": { color: theme.primaryText },
                      }}
                    />
                  )}
                </div>
              </Tippy>
            </div>
          </div>
        </div>
      </header>
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
              <p
                className="text-base md:text-lg font-semibold tracking-tight"
                style={{ color: theme.primaryText }}
              >
                <span style={{ color: theme.primaryText }}>Sahajinsight</span>
              </p>
            </div>

            <p
              className="mb-6 font-extrabold"
              style={{ color: theme.primaryText }}
            >
              Do you want to discard your changes?
            </p>

            <div className="flex justify-center gap-4">
              <button
                style={{ borderColor: theme.accent, color: theme.primaryText }}
                className="h-8 w-15 border font-extrabold text-xs px-5 rounded-xl hover:text-white transition"
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.accent)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                onClick={() => {
                  setShowBackConfirm(false);
                  navigate(-1);
                }}
              >
                Yes
              </button>
              <button
                style={{
                  backgroundColor: theme.accent,
                  borderColor: theme.accent,
                  color: theme.primaryText,
                }}
                className="h-8 w-15 border font-extrabold text-xs px-5 rounded-xl transition"
                onClick={() => setShowBackConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
