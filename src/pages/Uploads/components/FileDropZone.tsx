import { useState, useEffect, useRef, type DragEvent } from "react";
import UploadIdle from "./UploadIdle";
import UploadProgress from "./UploadProgress";
import UploadSuccess from "./UploadSuccess";
import UploadActions from "./UploadActions";

interface Props {
  onUploadComplete: (files: File[]) => void;
  theme: any;
  disabled?: boolean;
}

export default function FileDropZone({ onUploadComplete, theme, disabled = false }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const uploadCalledRef = useRef(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; 
  const ALLOWED_TYPES = ["text/csv"];
  const [error, setError] = useState<string>("");

 const startUpload = (selectedFiles: File[]) => {
  if (!selectedFiles || selectedFiles.length === 0 || disabled) return;

  setError("");
  const csvFiles = selectedFiles.filter(
    (file) =>
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv")
  );

  const invalidTypeCount = selectedFiles.length - csvFiles.length;

  if (csvFiles.length === 0) {
    setError("Only CSV files are allowed.");
    return;
  }
  const validFiles = csvFiles.filter((f) => f.size <= MAX_FILE_SIZE);
  const invalidSizeCount = csvFiles.length - validFiles.length;

  if (validFiles.length === 0) {
    setError("CSV files larger than 10 MB are not allowed.");
    return;
  }
  if (invalidTypeCount > 0) {
    setError("Some files were ignored — only CSV files are allowed.");
  } else if (invalidSizeCount > 0) {
    setError("Some CSV files were ignored — max size is 10 MB.");
  }

  setFiles(validFiles);
  setUploading(true);
  setProgress(0);
  setUploadComplete(false);
  uploadCalledRef.current = false;
};

  const handleDelete = () => {
    setFiles([]);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    uploadCalledRef.current = false;
    setError("");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (disabled) {
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (disabled) {
      return;
    }

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    }
    if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  useEffect(() => {
    if (!uploading || files.length === 0) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);

          // Call onUploadComplete only once
          if (!uploadCalledRef.current) {
            uploadCalledRef.current = true;
            setTimeout(() => onUploadComplete(files), 300);
          }

          return 100;
        }
        return p + 1.2;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [uploading, files.length]); // Only depend on uploading and files.length

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: theme.primaryText }}>Upload Files</p>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative w-full h-44 rounded-xl border-2 border-dashed flex items-center justify-center transition ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: theme.surface,
          borderColor: dragActive ? theme.accent : theme.border,
        }}
      >
        {files.length === 0 ? (
          <UploadIdle onFileSelect={startUpload} disabled={disabled} />
        ) : uploading ? (
          <UploadProgress fileName={files.length > 1 ? `${files.length} files` : files[0].name} progress={progress} />
        ) : uploadComplete ? (
          <>
            <UploadSuccess fileName={files.length > 1 ? `${files.length} files` : files[0].name} />
          </>
        ) : null}
      </div>

      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
}