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
  onRename: (id: string, newName: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const FileExplorer = ({ fs, folderId, onOpenFolder, onOpenFile, onCreateFile, onCreateFolder, onDelete, onRename, onRestore, onPermanentDelete }: FileExplorerProps) => {
  const folder = getNode(fs, folderId) as FolderNode;
  const children: FSNode[] = useMemo(() => listChildren(fs, folderId), [fs, folderId]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
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
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-2">
        {children.map((n) => (
          <div key={n.id} className="flex flex-col items-center gap-1">
            <DesktopIcon
              name={n.name}
              type={n.type}
              onOpen={() => (n.type === 'folder' ? onOpenFolder(n.id) : onOpenFile(n.id))}
              onDelete={isTrashFolder ? undefined : () => onDelete(n.id)}
              onRename={() => { setEditingId(n.id); setEditingName(n.name); }}
            />
            {editingId === n.id && (
              <div className="w-full flex items-center gap-1">
                <input
                  className="px-2 py-1 border rounded-md bg-background w-full text-xs"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onRename(n.id, editingName); setEditingId(null); } }}
                />
                <button className="px-2 py-1 rounded-md bg-secondary border text-xs" onClick={() => { onRename(n.id, editingName); setEditingId(null); }}>Save</button>
                <button className="px-2 py-1 rounded-md border text-xs" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            )}
            {isTrashFolder && (
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 rounded-md bg-secondary border text-xs" onClick={() => onRestore(n.id)}>Restore</button>
                <button
                  className="px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs border"
                  onClick={() => { if (confirm('Permanently delete this item? This cannot be undone.')) onPermanentDelete(n.id); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
