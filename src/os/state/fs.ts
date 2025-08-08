export type NodeType = 'file' | 'folder';

export interface FSNodeBase {
  id: string;
  name: string;
  type: NodeType;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
}

export interface FileNode extends FSNodeBase {
  type: 'file';
  content: string;
}

export interface FolderNode extends FSNodeBase {
  type: 'folder';
  children: string[];
}

export type FSNode = FileNode | FolderNode;

export interface FileSystem {
  nodes: Record<string, FSNode>;
  rootId: string;
  desktopId: string;
}

const FS_KEY = 'velluna-fs';

function nowISO() {
  return new Date().toISOString();
}

function makeId(prefix: string = 'n') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultFS(): FileSystem {
  const rootId = 'root';
  const desktopId = 'desktop';
  const vellunaId = 'folder_velluna';
  const memoriesId = 'folder_memories';
  const readmeId = 'file_readme';
  const ts = nowISO();
  const nodes: Record<string, FSNode> = {
    [rootId]: {
      id: rootId,
      name: 'Root',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [desktopId],
    } as FolderNode,
    [desktopId]: {
      id: desktopId,
      parentId: rootId,
      name: 'Desktop',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [vellunaId, memoriesId, readmeId],
    } as FolderNode,
    [vellunaId]: {
      id: vellunaId,
      parentId: desktopId,
      name: 'Velluna',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [],
    } as FolderNode,
    [memoriesId]: {
      id: memoriesId,
      parentId: desktopId,
      name: 'Memories',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [],
    } as FolderNode,
    [readmeId]: {
      id: readmeId,
      parentId: desktopId,
      name: 'ReadMe.love',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: 'To the brightest smile: every day since 17 Aug 2023 has been a new sunrise in my sky. – VA ♥',
    } as FileNode,
  };
  return { nodes, rootId, desktopId };
}

export function loadFS(): FileSystem {
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) return JSON.parse(raw) as FileSystem;
  } catch {}
  const fs = defaultFS();
  saveFS(fs);
  return fs;
}

export function saveFS(fs: FileSystem) {
  localStorage.setItem(FS_KEY, JSON.stringify(fs));
}

export function listChildren(fs: FileSystem, folderId: string): FSNode[] {
  const folder = fs.nodes[folderId] as FolderNode;
  if (!folder || folder.type !== 'folder') return [];
  return folder.children.map((id) => fs.nodes[id]).filter(Boolean);
}

export function getNode(fs: FileSystem, id: string): FSNode | undefined {
  return fs.nodes[id];
}

export function createFile(fs: FileSystem, parentId: string, name: string): FileSystem {
  const id = makeId('file');
  const ts = nowISO();
  const file: FileNode = {
    id,
    parentId,
    name,
    type: 'file',
    createdAt: ts,
    updatedAt: ts,
    content: '',
  };
  const folder = fs.nodes[parentId] as FolderNode;
  if (folder && folder.type === 'folder') {
    folder.children.push(id);
    folder.updatedAt = ts;
  }
  fs.nodes[id] = file;
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}

export function createFolder(fs: FileSystem, parentId: string, name: string): FileSystem {
  const id = makeId('folder');
  const ts = nowISO();
  const folderNode: FolderNode = {
    id,
    parentId,
    name,
    type: 'folder',
    createdAt: ts,
    updatedAt: ts,
    children: [],
  };
  const parent = fs.nodes[parentId] as FolderNode;
  if (parent && parent.type === 'folder') {
    parent.children.push(id);
    parent.updatedAt = ts;
  }
  fs.nodes[id] = folderNode;
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}

export function updateFileContent(fs: FileSystem, fileId: string, content: string): FileSystem {
  const node = fs.nodes[fileId] as FileNode;
  if (node && node.type === 'file') {
    node.content = content;
    node.updatedAt = nowISO();
  }
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}

export function renameNode(fs: FileSystem, id: string, newName: string): FileSystem {
  const node = fs.nodes[id];
  if (node && newName && newName.trim()) {
    node.name = newName.trim();
    node.updatedAt = nowISO();
    saveFS(fs);
  }
  return { ...fs, nodes: { ...fs.nodes } };
}
