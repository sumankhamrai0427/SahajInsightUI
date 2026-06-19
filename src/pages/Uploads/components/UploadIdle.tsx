import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import { useTheme } from "../../../theme";

interface Props {
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadIdle({ onFileSelect, disabled = false }: Props) {
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFileSelect(Array.from(e.target.files));
  };

  return (
    <div className="flex flex-col items-center text-center">
      <BackupOutlinedIcon className="w-10 h-10" sx={{ color: theme.secondaryText }} />

      <p className="text-sm mt-2" style={{ color: theme.secondaryText }}>
        Click to upload or drag and drop <br />
        CSV (MAX 10MB)
      </p>

      <label className={`mt-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <input
          type="file"
          onChange={handleChange}
          className="hidden"
          multiple
          accept=".xml,.csv,.sql,.xlsx,.dump,.xls"
          disabled={disabled}
        />
        <span
          className="text-sm px-4 py-2 rounded-md border transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-200"
          style={{
            color: theme.primaryText,
            borderColor: theme.border,
          }}
        >
          Or Select File
        </span>
      </label>
    </div>
  );
}