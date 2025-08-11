import { Folder as FolderIcon, FileText, Trash2, Pencil } from "lucide-react";

export interface DesktopIconProps {
  name: string;
  type: 'file' | 'folder';
  onOpen: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  isTrash?: boolean;
}

const DesktopIcon = ({ name, type, onOpen, onDelete, onRename, isTrash }: DesktopIconProps) => {
  return (
    <div className="group relative w-24 h-24">
      <button
        onDoubleClick={onOpen}
        className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl bg-card/60 border hover:bg-card transition"
        aria-label={`Open ${name}`}
      >
        {type === 'folder' ? (
          isTrash ? (
            <Trash2 className="h-8 w-8 text-primary" />
          ) : (
            <FolderIcon className="h-8 w-8 text-primary" />
          )
        ) : (
          <FileText className="h-8 w-8 text-primary" />
        )}
        <span className="text-xs text-foreground px-1 text-center break-words">{name}</span>
      </button>
      {onRename && (
        <button
          onClick={(e) => { e.stopPropagation(); onRename(); }}
          className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded-full bg-secondary text-foreground text-xs border"
          aria-label={`Rename ${name}`}
          title="Rename"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs border"
          aria-label={`Delete ${name}`}
          title="Move to Trash"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default DesktopIcon;
