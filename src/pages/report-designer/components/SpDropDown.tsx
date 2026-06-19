import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export const ProcedureToggleButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-xs"
    >
      Procedure View
      {/* <KeyboardArrowUpIcon
        className={transition-transform ${isOpen ? "" : "rotate-180"}}
      /> */}
    </button>
  );
};

export const ProcedureCodeBlock = ({ isVisible, sql }) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isVisible ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="p-4 bg-gray-100 rounded-lg">
        <pre className="text-xs text-indigo-500 whitespace-pre-wrap">
          {sql}
        </pre>
      </div>
    </div>
  );
};