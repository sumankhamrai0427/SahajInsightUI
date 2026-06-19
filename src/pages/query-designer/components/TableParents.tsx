import { useState } from "react";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { useTheme } from "../../../theme";
import ProductDataTable from "./DataTable";
import { IconButton } from "@mui/material";
import "../../../styles/primereact-table.css";
interface DashboardTableProps {
  data: any[];
  columns: { column_name: string }[];
  insights: string[];
  globalFilter: string;
  tableName: string;
  viewSelection: string;
  isLoading?: boolean;
}
export default function TableParents({
  data,
  columns,
  insights,
  globalFilter,
  tableName,
  viewSelection,
  isLoading,
}: DashboardTableProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredColumns = columns
    .filter(
      (col, index, self) =>
        index === self.findIndex((t) => t.column_name === col.column_name)
    )
    .filter((col) => col.column_name !== "row_hash");

  if (isLoading) {
    return (
      <div className="px-4 mb-5">
        <div className="rounded-xl shadow-xs min-h-[200px] max-h-[200px] flex items-center justify-center bg-white text-gray-500">
          <AutorenewRoundedIcon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  if (!tableName) {
    return (
      <div className="px-4 mb-5">
        <div className="rounded-xl shadow-xs min-h-[200px] max-h-[200px] flex items-center justify-center bg-white text-gray-500">
          <p>Please select a table to view its data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="rounded-xl shadow-xs pb-4">
        {isExpanded && (
          <>
            {viewSelection === "metadata" && (
              <div className="p-4 min-h-[200px]  max-h-[200px]flex items-center justify-center custom-table mb-5">
                <div className="flex flex-wrap gap-3">
                  {filteredColumns.map((col) => (
                    <span
                      key={col.column_name}
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full text-sm"
                    >
                      {col.column_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {viewSelection === "dataview" && (
              <ProductDataTable
                data={data}
                globalFilter={globalFilter}
                columns={filteredColumns}
              />
            )}
            {viewSelection === "insights" && (
              <div className="custom-table mb-5">
                <div className="p-4 min-h-[200px] max-h-[200px] overflow-y-auto">
                  <ul className="list-disc list-outside pl-5 space-y-2">
                    {insights.map((insight, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 leading-relaxed"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
