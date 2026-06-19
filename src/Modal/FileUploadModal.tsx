import React, { useState } from "react";
import { Upload, X } from "lucide-react";

interface FileUploadModalProps {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  label = "Upload File",
  value,
  onChange,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  maxSizeMB = 2,
}) => {
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setLocalError("Only PNG, JPG or JPEG files are allowed");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size must be less than ${maxSizeMB} MB`);
      return;
    }

    setLocalError(null);
    setTempFile(file); // 🔹 only temp store
  };

  const handleDone = () => {
    if (tempFile) {
      onChange(tempFile); // ✅ final commit
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setTempFile(null);   // ❌ discard
    setLocalError(null);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setTempFile(value); // preload existing value
          setOpen(true);
        }}
        className="px-4 py-2 border rounded-lg flex items-center gap-2 text-sm"
      >
        <Upload size={16} />
        {label}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-[420px] p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Select File</h3>
              <button onClick={handleCancel}>
                <X size={18} />
              </button>
            </div>

            {/* File input */}
            <div className="border border-dashed rounded-lg p-3">
              <input
                type="file"
                accept={allowedTypes.join(",")}
                onChange={(e) =>
                  handleFileSelect(e.target.files?.[0] || null)
                }
                className="w-full text-sm"
              />

              <p className="mt-2 text-[11px] text-gray-400">
                Allowed types: PNG, JPEG, JPG <br />
                Max size: {maxSizeMB} MB
              </p>
            </div>

          

            {/* Error */}
            {localError && (
              <p className="mt-2 text-xs text-red-500">
                {localError}
              </p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-1 text-sm border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDone}
                disabled={!tempFile}
                className="px-4 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploadModal;
