import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

interface Props {
  fileName: string;
  progress: number;
}

export default function UploadProgress({ fileName, progress }: Props) {
  return (
    <div className="flex flex-col items-center">
      <DescriptionOutlinedIcon className="w-8 h-8 text-gray-500 mb-2" />

      <p className="text-sm text-gray-600">{fileName}</p>

      <div className="w-64 h-1 bg-gray-300 rounded mt-3 overflow-hidden">
        <div
          className="h-full bg-gray-600 transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-xs mt-2 text-gray-500">Uploading...</p>
    </div>
  );
}
