import { useTheme } from "../../../theme";

interface Props {
  fileName: string | undefined;
  progress: number;
}

export default function UploadLoader({ fileName, progress }: Props) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-sm mb-1 font-medium" style={{ color: theme.primaryText }}>
        {fileName}
      </div>

      <div className="w-[55%] h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
        <div
          className="h-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: theme.accent }}
        />
      </div>

      <p className="text-xs mt-2 font-semibold" style={{ color: theme.secondaryText }}>
        Uploading
      </p>
    </div>
  );
}
