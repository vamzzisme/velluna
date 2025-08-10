import { FileSystem, FSNode, FolderNode, saveFS } from "@/os/state/fs";

function nowISO() {
  return new Date().toISOString();
}

export function getPath(fs: FileSystem, id: string): string {
  const parts: string[] = [];
  let cur: FSNode | undefined = fs.nodes[id];
  while (cur) {
    parts.unshift(cur.name);
    const pid = (cur as any).parentId as string | undefined;
    if (!pid) break;
    cur = fs.nodes[pid];
  }
  if (parts[0]?.toLowerCase() === 'root') parts.shift();
  return parts.map((p) => p.toLowerCase()).join('/');
}

export function moveToTrash(fs: FileSystem, id: string): FileSystem {
  if (id === fs.trashId || id === fs.rootId || id === fs.desktopId) return { ...fs, nodes: { ...fs.nodes } };
  const node = fs.nodes[id];
  if (!node) return { ...fs, nodes: { ...fs.nodes } };
  const ts = nowISO();
  // Remove from current parent
  const pid = (node as any).parentId as string | undefined;
  if (pid) {
    const parent = fs.nodes[pid] as FolderNode;
    if (parent?.type === 'folder') {
      parent.children = parent.children.filter((c) => c !== id);
      (parent as any).updatedAt = ts;
    }
  }
  // Add to trash
  const trash = fs.nodes[fs.trashId] as FolderNode;
  if (trash && trash.type === 'folder') {
    if (!trash.children.includes(id)) trash.children.unshift(id);
    (trash as any).updatedAt = ts;
  }
  (node as any).parentId = fs.trashId;
  (node as any).updatedAt = ts;
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}
