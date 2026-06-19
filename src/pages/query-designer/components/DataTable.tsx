import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { useState, useEffect } from "react";
import "../../../styles/primereact-table.css";
import ColumnHeaderWithAggregation from "../../report-designer/components/ColumnHeaderWithAggregation";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

interface ColumnConfig {
  column_name: string;
  header?: string;
  sortable?: boolean;
}

interface ProductDataTableProps {
  data: any[];
  globalFilter: string;
  showPagination?: boolean;
  columns: (ColumnConfig | { column_name: string })[];
  showColumnDropdownIcon?: boolean;
  columnAggregations?: Record<string, string[]>;
  onAggregationSelect?: (column: string, agg: string) => void;
  enableRowGrouping?: boolean;
  collapsedGroups?: Record<string, boolean>;
  onToggleGroup?: (key: string) => void;
  aggregationMap?: Record<
    string,
    Record<"SUM" | "AVG" | "MIN" | "MAX" | "COUNT", number>
  >;
  aggregationOrder?: string[];
  isGrouped?: boolean;
  onColumnRename?: (originalName: string, newName: string) => void;
}
export default function ProductDataTable({
  data,
  globalFilter,
  showPagination = true,
  columns = [],
  columnAggregations,
  onAggregationSelect,
  enableRowGrouping,
  collapsedGroups,
  onToggleGroup,
  aggregationMap,
  aggregationOrder,
  isGrouped = false,
  onColumnRename
}: ProductDataTableProps) {
  const uniqueColumns = columns.filter((col, index, self) =>
    index === self.findIndex((t) => t.column_name === col.column_name)
  );

  const [filters, setFilters] = useState({
    global: { value: globalFilter, matchMode: FilterMatchMode.CONTAINS },
  });

  const [first, setFirst] = useState(0);
  // const rows = 5;
  const rows = enableRowGrouping
    ? data.length        // 🔥 group mode → exact rows
    : 5;                 // normal mode

  // const totalRecords = data.length;
  const totalRecords = enableRowGrouping
    ? data.filter(r => !r.__isGroup).length
    : data.length;

  const totalPages = Math.ceil(totalRecords / rows);
  const currentPage = Math.floor(first / rows) + 1;
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const maxVisiblePages = 5;
  const [openAggColumn, setOpenAggColumn] = useState<string | null>(null);


  const rowClassName = (rowData: any) => {
    if (rowData.__isGroup) {
      return "bg-gray-100 font-semibold";
    }
    return "border-b border-gray-200";
  };

  useEffect(() => {
    setFilters({
      global: { value: globalFilter, matchMode: FilterMatchMode.CONTAINS },
    });
    setFirst(0);
    setPageWindowStart(1);
  }, [globalFilter]);
  const formatHeader = (headerText: string) => {
    if (!headerText) return '';
    return headerText
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const onPageChange = (page: number) => {
    const newFirst = (page - 1) * rows;
    setFirst(newFirst);
    if (page > pageWindowStart + maxVisiblePages - 1) {
      setPageWindowStart(page - maxVisiblePages + 1);
    } else if (page < pageWindowStart) {
      setPageWindowStart(page);
    }
  };
  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  const getVisiblePages = () => {
    const pages = [];
    const endPage = Math.min(pageWindowStart + maxVisiblePages - 1, totalPages);

    for (let i = pageWindowStart; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };
  const visiblePages = getVisiblePages();


  return (
    <div style={{ maxWidth: "92vw" }}>
      <DataTable
        value={data}
        paginator={!enableRowGrouping}
        rows={showPagination ? rows : data.length}
        first={first}
        onPage={(e) => setFirst(e.first)}
        dataKey={data.length > 0 && 'row_hash' in data[0] ? 'row_hash' : undefined}
        filters={filters}
        globalFilterFields={uniqueColumns.map(col => col.column_name)}
        emptyMessage="No data available"
        sortMode="multiple"

        className="custom-table"
        stripedRows
        // rowClassName={() => "border-b border-gray-200"}
        rowClassName={enableRowGrouping ? rowClassName : undefined}


      >
        {uniqueColumns.map((col, index) => {
          const headerLabel = 'header' in col && col.header ? col.header : formatHeader(col.column_name);
          const isSortable = 'sortable' in col ? col.sortable : true;

          return (
            <Column
              style={{ whiteSpace: "nowrap", width: "auto" }}
              key={`${col.column_name}_${index}`}
              field={col.column_name}
              // header={headerLabel}
              header={
                <ColumnHeaderWithAggregation
                  label={headerLabel}
                  columnName={col.column_name}
                  aggregations={columnAggregations?.[col.column_name] || []}
                  onAggregationSelect={onAggregationSelect}
                  openAggColumn={openAggColumn}
                  setOpenAggColumn={setOpenAggColumn}
                  onRename={onColumnRename}
                />

              }


              sortable={isSortable}
              headerStyle={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#3D5B81'
              }}
              bodyStyle={{
                fontSize: '14px',
                fontWeight: 400
              }}
              body={(rowData) => {

                // 🔹 GROUP HEADER
                if (rowData.__isGroup) {
                  if (index === 0) {
                    const collapsed = collapsedGroups?.[rowData.__groupKey] ?? true;

                    return (
                      <div
                        className="flex items-center justify-between cursor-pointer font-semibold"
                        onClick={() => onToggleGroup?.(rowData.__groupKey)}
                      >
                        <div>
                          {rowData.__groupLabel}
                          <span className="ml-2 text-xs text-gray-500">
                            ({rowData.__count})
                          </span>
                        </div>

                        <span className="flex items-center">
                          {collapsed ? (
                            <KeyboardArrowDownRoundedIcon fontSize="small" />
                          ) : (
                            <KeyboardArrowUpRoundedIcon fontSize="small" />
                          )}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }


                // 🔹 GROUP AGGREGATION ROW
                if (rowData.__isGroupAgg) {
                  if (index === 0) {
                    return (
                      <div className="text-xs font-semibold text-gray-700 aggregation-container">
                        {/* {rowData.__aggregationOrder.map(a => (
                          <div className="aggregation-row-item" key={a}>{a}</div>
                        ))} */}
                        {rowData.__aggregationOrder.map(a => (
                          <div key={a} className="aggregation-row-item">
                            <span className="font-semibold mr-2">{a}</span>
                            <span>
                              {rowData.__aggregationMap[col.column_name]?.[a] ??
                                rowData.__count ??
                                ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  const colAgg = rowData.__aggregationMap[col.column_name];
                  if (!colAgg) return null;

                  return (
                    <div className="text-xs font-semibold aggregation-container">
                      {rowData.__aggregationOrder.map(a => (
                        <div className="aggregation-row-item" key={a}>
                          {colAgg[a]?.toFixed?.(2) ?? ""}
                        </div>
                      ))}
                    </div>
                  );
                }

                // 🔹 NORMAL ROW
                return rowData[col.column_name];
              }}
              footer={
                !isGrouped && aggregationMap && aggregationOrder?.length ? (
                  index === 0 ? (
                    <div className="aggregation-container text-xs text-gray-700 font-semibold">
                      {aggregationOrder.map(a => (
                        <div key={a} className="aggregation-row-item">
                          <span className="mr-2">{a}</span>
                          <span>
                            {a === "COUNT"
                              ? totalRecords
                              : aggregationMap?.[col.column_name]?.[a]?.toFixed?.(2) ?? ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                    : aggregationMap[col.column_name] ? (
                      // 🔹 VALUE COLUMN
                      <div className="aggregation-container">
                        {aggregationOrder.map((a) => (
                          <div key={a} className="aggregation-row-item text-xs text-gray-700 font-semibold">
                            {aggregationMap[col.column_name][a]?.toFixed?.(2) ?? ""}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="aggregation-container">
                        {aggregationOrder.map((a) => (
                          <div key={a} className="aggregation-row-item"></div>
                        ))}
                      </div>
                    )
                ) : null
              }






            />
          );
        })}
      </DataTable>


      {showPagination && (
        <div className="flex items-center justify-between px-4 py-1 bg-white border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            Showing {first + 1} to {Math.min(first + rows, totalRecords)} of {totalRecords} results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              Previous
            </button>
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-[32px] text-sm font-medium rounded-xl transition-all ${currentPage === page
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              Next
            </button>
          </div>
        </div>)}
    </div>
  );
}