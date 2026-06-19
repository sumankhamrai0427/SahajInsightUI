import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

interface Props {
  fileName: string;
}

export default function UploadSuccess({ fileName }: Props) {
  return (
    <div className="flex flex-col items-center">
      <DescriptionOutlinedIcon className="w-8 h-8 text-gray-500 mb-2" />

      <p className="text-sm text-gray-700">{fileName}</p>

      <div className="w-64 h-1 bg-gray-300 rounded mt-3 overflow-hidden">
        <div className="h-full bg-gray-600 w-full"></div>
      </div>

      <p className="text-xs mt-2 text-gray-700 font-semibold">Uploaded</p>
    </div>
  );
}
