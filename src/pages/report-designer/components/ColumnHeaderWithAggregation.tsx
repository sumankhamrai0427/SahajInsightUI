// import { useState } from "react";
// import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

// export default function ColumnHeaderWithAggregation({
//     label,
//     columnName,
//     aggregations = [],
//     onAggregationSelect,
//     openAggColumn,
//     setOpenAggColumn
// }: {
//     label: string;
//     columnName: string;
//     aggregations: string[];
//     onAggregationSelect?: (column: string, agg: string) => void;
//     openAggColumn: string | null;
//     setOpenAggColumn: (col: string | null) => void;
// }) {

//     const isOpen = openAggColumn === columnName;

//     if (!aggregations.length) {
//         return <span>{label}</span>;
//     }

//     return (
//         <div className="relative flex items-center gap-1">
//             <span>{label}</span>

//             <KeyboardArrowDownRoundedIcon
//                 sx={{ fontSize: 25, cursor: "pointer" }}
//                 onClick={() =>
//                     setOpenAggColumn(isOpen ? null : columnName)
//                 }
//             />

//             {isOpen && (
//                 <div className="absolute top-full left-0 z-50 bg-white border rounded shadow-md text-xs min-w-[120px]">
//                     {aggregations.map((agg) => (
//                         <div
//                             key={agg}
//                             className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
//                             onClick={() => {
//                                 onAggregationSelect?.(columnName, agg);
//                                 setOpenAggColumn(null);
//                             }}

//                         >
//                             {agg.toUpperCase()}
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

import { useState, useEffect, useRef } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../../styles/tippy-theme.css";

export default function ColumnHeaderWithAggregation({
    label,
    columnName,
    aggregations = [],
    onAggregationSelect,
    openAggColumn,
    setOpenAggColumn,
    onRename
}: {
    label: string;
    columnName: string;
    aggregations: string[];
    onAggregationSelect?: (column: string, agg: string) => void;
    openAggColumn: string | null;
    setOpenAggColumn: (col: string | null) => void;
    onRename?: (originalName: string, newName: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempName(label);
    }, [label]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (tempName.trim() && tempName !== label) {
            onRename?.(columnName, tempName.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setTempName(label);
            setIsEditing(false);
        }
    };

    const isOpen = openAggColumn === columnName;

    return (
        <div className="relative flex items-center gap-1 group">
            {isEditing ? (
                <div className="flex items-center gap-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-24 px-1 py-0.5 text-xs border border-blue-500 rounded outline-none bg-white text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <CheckRoundedIcon
                        sx={{ fontSize: 16, cursor: "pointer", color: "green" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                        }}
                    />
                </div>
            ) : (
                <>
                    <span className="truncate max-w-[150px]" title={label}>{label}</span>
                    {onRename && (
                        <Tippy content="Edit Name" theme="gray">
                            <EditRoundedIcon
                                sx={{ fontSize: 14, cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
                                className="text-gray-400 hover:text-blue-600 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            />
                        </Tippy>
                    )}
                </>
            )}

            {aggregations.length > 0 && (
                <KeyboardArrowDownRoundedIcon
                    sx={{ fontSize: 20, cursor: "pointer", color: "#6b7280" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenAggColumn(isOpen ? null : columnName);
                    }}
                />
            )}

            {isOpen && (
                <div className="absolute top-full left-0 z-50 bg-white border rounded shadow-md text-xs min-w-[120px]">
                    {aggregations.map((agg) => (
                        <div
                            key={agg}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                onAggregationSelect?.(columnName, agg);
                                setOpenAggColumn(null);
                            }}

                        >
                            {agg.toUpperCase()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
