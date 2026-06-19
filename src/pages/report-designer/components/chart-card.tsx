
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// // ==================== TYPES ====================
// interface ChartCardProps {
//   title: string;
//   description: string;
//   children: React.ReactNode;
//   onRemove?: () => void;
// }

// // ==================== GLOBAL REUSABLE CHART CARD ====================
// export default function ChartCard({ title, description, children, onRemove }: ChartCardProps) {
//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 w-full max-w-md  flex-shrink-0" style={{
//     height: "340px",     // 🔥 FIXED HEIGHT (IMPORTANT)
//     overflow: "visible"  // 🔥 NO CLIPPING
//   }}>
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
//           <p className="text-xs text-gray-500">{description}</p>
//         </div>
//         <div className="flex gap-2">
//           {onRemove && (
//             <button
//               onClick={onRemove}
//               className="p-1.5 rounded-md hover:bg-red-50 transition chart-delete-btn"
//               title="Remove chart"
//             >
//               <DeleteOutlineIcon
//                 sx={{ fontSize: "1.5rem" }}
//                 className="text-red-500 hover:text-red-600"
//               />
//             </button>
//           )}
//         </div>
//       </div>
//       {children}
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../../styles/tippy-theme.css";
// ==================== TYPES ====================
interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  id: string;
  onRemove?: () => void;
  onRename?: (newTitle: string) => void;
}

// ==================== GLOBAL REUSABLE CHART CARD ====================
export default function ChartCard({ title, description, children, onRemove, onRename, id }: ChartCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempTitle.trim() && tempTitle !== title) {
      onRename?.(tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div  id={`report-chart-${id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 w-full max-w-md  flex-shrink-0" style={{
    height: "340px",     // 🔥 FIXED HEIGHT (IMPORTANT)
    overflow: "visible",
    position:"relative"  // 🔥 NO CLIPPING
  }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0 mr-2">
          {isEditing ? (
            <div className="flex items-center ">
              <input
                ref={inputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full px-1 py-0.5 text-sm font-semibold border border-blue-500 rounded outline-none bg-white text-gray-900"
                onClick={(e) => e.stopPropagation()}
              />
              <CheckRoundedIcon
                sx={{ fontSize: 18, cursor: "pointer", color: "green" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              />
            </div>
          ) : (
            <div className="group flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 " title={title}>
                {title}
              </h3>
              {onRename && (
                <Tippy content="Edit Name" theme="gray">
                  <EditRoundedIcon
                    sx={{ fontSize: 16, cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
                    className="text-gray-400 hover:text-blue-600 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  />
                </Tippy>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-xl hover:bg-red-50 transition chart-delete-btn"
              title="Remove chart"
            >
              <DeleteOutlineIcon
                sx={{ fontSize: "1.5rem" }}
                className="text-red-500 hover:text-red-600"
              />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}