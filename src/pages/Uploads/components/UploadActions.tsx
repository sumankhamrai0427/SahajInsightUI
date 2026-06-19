interface Props {
  onReupload: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export default function UploadActions({ onReupload, onDelete, disabled = false }: Props) {
  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2">
      <button
        title="Re-upload"
        onClick={onReupload}
        disabled={disabled}
        className="group flex items-center gap-3 hover:bg-[#D0D0D0] px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xs text-[#5F6368] font-medium hidden group-hover:inline">Re-upload</span>
        <img src="/src/assets/reupload.svg" className="w-5 h-5" />
      </button>

      <button
        onClick={onDelete}
        disabled={disabled}
        className="group flex items-center gap-3 hover:bg-[#D0D0D0] px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete"
      >
        <span className="text-xs text-[#5F6368] font-medium hidden group-hover:inline">Delete</span>
        <img src="/src/assets/delete.svg" className="w-5 h-5" />
      </button>
    </div>
  );
}
