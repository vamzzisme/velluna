import { FileSystem, FolderNode, FSNode, getNode, listChildren } from "@/os/state/fs";
import { getPath } from "@/os/state/fsUtils";
import DesktopIcon from "@/os/components/DesktopIcon";
import { useMemo, useState } from "react";

export interface FileExplorerProps {
  fs: FileSystem;
  folderId: string;
  onOpenFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onCreateFile: (name: string) => void;
  onCreateFolder: (name: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const FileExplorer = ({ fs, folderId, onOpenFolder, onOpenFile, onCreateFile, onCreateFolder, onDelete, onRestore, onPermanentDelete }: FileExplorerProps) => {
  const folder = getNode(fs, folderId) as FolderNode;
  const children: FSNode[] = useMemo(() => listChildren(fs, folderId), [fs, folderId]);
  const [name, setName] = useState("");
  const isTrashFolder = folderId === fs.trashId;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="text-sm text-muted-foreground">Location: {getPath(fs, folderId)}</div>
      <div className="flex items-center gap-2">
        <input
          className="px-2 py-1 border rounded-md bg-background"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="px-3 py-1 rounded-md bg-secondary border" onClick={() => { if(name){ onCreateFolder(name); setName(""); }}}>New Folder</button>
        <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground" onClick={() => { if(name){ onCreateFile(name); setName(""); }}}>New File</button>
      </div>
      {/* Content area */}
      {children.length === 0 ? (
        <div className="mt-6 p-4 rounded-lg border bg-card text-sm text-muted-foreground">
          {(() => {
            const isEmptyEgg = folder?.name?.toLowerCase?.() === 'empty';
            const now = new Date();
            const is735 = now.getMinutes() === 35 && (now.getHours() % 12) === 7;
            if (isEmptyEgg) {
              return is735
                ? 'It was just to keep u occupied, hehe 😌'
                : 'Come back at the right time to see the magic. Hint: You ride on it everyday!!';
            }
            return 'This folder is empty.';
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 mt-2">
          {children.map((n) => (
            <div key={n.id} className="flex flex-col items-center gap-1">
              <DesktopIcon
                name={n.name}
                type={n.type}
                onOpen={() => (n.type === 'folder' ? onOpenFolder(n.id) : onOpenFile(n.id))}
                onDelete={isTrashFolder ? undefined : () => onDelete(n.id)}
              />
              {isTrashFolder && (
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-md bg-secondary border text-xs" onClick={() => onRestore(n.id)}>🔄</button>
                  <button
                    className="px-2 py-1 rounded-md bg-red-300 text-destructive-foreground text-xs border"
                    onClick={() => { if (confirm('Permanently delete this item? This cannot be undone.')) onPermanentDelete(n.id); }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
