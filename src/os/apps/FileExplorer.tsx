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

const FileExplorer = ({ fs, folderId, onOpenFolder, onOpenFile, onCreateFile, onCreateFolder, onDelete }: FileExplorerProps) => {
  const folder = getNode(fs, folderId) as FolderNode;
  const children: FSNode[] = useMemo(() => listChildren(fs, folderId), [fs, folderId]);
  const [name, setName] = useState("");

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
          <DesktopIcon
            key={n.id}
            name={n.name}
            type={n.type}
            onOpen={() => (n.type === 'folder' ? onOpenFolder(n.id) : onOpenFile(n.id))}
            onDelete={() => onDelete(n.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
