import { Folder as FolderIcon, FileText } from "lucide-react";

export interface DesktopIconProps {
  name: string;
  type: 'file' | 'folder';
  onOpen: () => void;
}

const DesktopIcon = ({ name, type, onOpen }: DesktopIconProps) => {
  return (
    <button
      onDoubleClick={onOpen}
      className="group w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-xl bg-card/60 border hover:bg-card transition"
      aria-label={`Open ${name}`}
    >
      {type === 'folder' ? (
        <FolderIcon className="h-8 w-8 text-primary" />
      ) : (
        <FileText className="h-8 w-8 text-primary" />
      )}
      <span className="text-xs text-foreground px-1 text-center break-words">{name}</span>
    </button>
  );
};

export default DesktopIcon;
