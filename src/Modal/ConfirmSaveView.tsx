import React from "react";
import { useAuth } from "../pages/Auth/AuthContext";

interface ConfirmSaveViewProps {
  type?: string;
  customTitle?: string;
  customMessage?: string;
  customOnCancel?: () => void;
  customOnConfirm?: () => void | Promise<void>;
  showConfirmButton?: boolean;
  hideHeaderLabel?: boolean;
}

export default function ConfirmSaveView({
  type = "Query",
  customTitle,
  customMessage,
  customOnCancel,
  customOnConfirm,
  showConfirmButton = true,
  hideHeaderLabel = false,
}: ConfirmSaveViewProps) {
  const { isConfirmSaveModalOpen, setIsConfirmSaveModalOpen, viewName, confirmSave, isSaving } = useAuth();
  const [localActionLoading, setLocalActionLoading] = React.useState(false);

  const onCancel = customOnCancel || (() => setIsConfirmSaveModalOpen(false));

  const handleConfirm = async () => {
    if (customOnConfirm) {
      try {
        setLocalActionLoading(true);
        const res = customOnConfirm();
        if (res && (res as Promise<void>).then) {
          await res;
        }
      } finally {
        setLocalActionLoading(false);
      }
      return;
    }

    confirmSave();
  };

  const isActionLoading = customOnConfirm ? localActionLoading : isSaving;
  const displayTitle = customTitle || viewName;
  const displayMessage = customMessage || `Do you want to save the ${type.toLowerCase()}?`;
  const isDuplicateMessage =
    !!customMessage &&
    customMessage.toLowerCase().includes("already exists");


  if (!isConfirmSaveModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-[550px] bg-[#D9D9D9] rounded-2xl shadow-lg border-[11px] border-white flex flex-col justify-center items-center gap-6 p-8">
        <div className="text-center">
          {!hideHeaderLabel && (
            <p className="text-gray-600 text-lg">{customTitle ? "File Name" : `${type} Name`}</p>
          )}
          <h2 className="text-2xl font-semibold text-gray-700">{displayTitle}</h2>
        </div>
        <p
          className={`text-xl whitespace-pre-line text-center ${isDuplicateMessage ? "text-red-600 font-medium" : "text-gray-600"
            }`}
        >
          {displayMessage}
        </p>


        <div className="flex gap-4">
          {showConfirmButton ? (
            <>
              <button
                className="px-6 py-2 rounded-xl border border-gray-400 text-gray-700 bg-white hover:bg-[#7ca1f3] hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={onCancel}
                disabled={!customOnConfirm && isActionLoading}

              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-[#7ca1f3] text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={handleConfirm}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <svg className="animate-spin inline-block h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {customOnConfirm ? "Deleting..." : "Saving..."}
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </>
          ) : (
            <button
              className="px-6 py-2 rounded-xl bg-[#7ca1f3] text-white hover:opacity-90 transition"
              onClick={onCancel}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}