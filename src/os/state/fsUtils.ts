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

export function restoreFromTrash(fs: FileSystem, id: string): FileSystem {
  if (id === fs.trashId || id === fs.rootId) return { ...fs, nodes: { ...fs.nodes } };
  const node = fs.nodes[id];
  if (!node) return { ...fs, nodes: { ...fs.nodes } };
  const ts = nowISO();
  // Remove from trash
  const trash = fs.nodes[fs.trashId] as FolderNode;
  if (trash && trash.type === 'folder') {
    trash.children = trash.children.filter((c) => c !== id);
    (trash as any).updatedAt = ts;
  }
  // Add back to Desktop by default
  const desktop = fs.nodes[fs.desktopId] as FolderNode;
  if (desktop && desktop.type === 'folder') {
    if (!desktop.children.includes(id)) desktop.children.unshift(id);
    (desktop as any).updatedAt = ts;
  }
  (node as any).parentId = fs.desktopId;
  (node as any).updatedAt = ts;
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}

export function deletePermanently(fs: FileSystem, id: string): FileSystem {
  if (id === fs.trashId || id === fs.rootId || id === fs.desktopId) return { ...fs, nodes: { ...fs.nodes } };
  const ts = nowISO();

  function removeNode(nodeId: string) {
    const n = fs.nodes[nodeId];
    if (!n) return;
    if (n.type === 'folder') {
      const folder = n as FolderNode;
      const children = [...folder.children];
      children.forEach((childId) => removeNode(childId));
    }
    const pid = (n as any).parentId as string | undefined;
    if (pid) {
      const parent = fs.nodes[pid] as FolderNode;
      if (parent && parent.type === 'folder') {
        parent.children = parent.children.filter((c) => c !== nodeId);
        (parent as any).updatedAt = ts;
      }
    }
    delete fs.nodes[nodeId];
  }

  removeNode(id);
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}
