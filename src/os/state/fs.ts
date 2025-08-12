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
  trashId: string;
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
  const trashId = 'trash';
  const vellunaId = 'folder_velluna';
  const memoriesId = 'folder_memories';
  const readmeId = 'file_readme';
  const quotesId = 'file_quotes';
  const easterId = 'folder_easter';
  const emptyId = 'folder_empty';
  const morseId = 'file_morse';
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
      children: [vellunaId, memoriesId, readmeId, quotesId, easterId, trashId],
    } as FolderNode,
    [trashId]: {
      id: trashId,
      parentId: desktopId,
      name: 'Trash',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [],
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
    [quotesId]: {
      id: quotesId,
      parentId: desktopId,
      name: 'quotes.txt',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: 'The best is yet to come — VA\nYou are my favorite notification — VA\nLittle things, big love — VA\nEvery sunrise is brighter with you — VA\nYou make ordinary days magic — VA\nHere, now, always — VA\nGrow, glow, and go — VA\nMore than words, always — VA\nYou are my peace — VA\nSoft hearts move mountains — VA\nWe’ll laugh about this one day — VA\nToday is a good day to love — VA',
    } as FileNode,
    [easterId]: {
      id: easterId,
      parentId: desktopId,
      name: 'Easter Egg',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [emptyId, morseId],
    } as FolderNode,
    [emptyId]: {
      id: emptyId,
      parentId: easterId,
      name: 'Empty',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [],
    } as FolderNode,
    [morseId]: {
      id: morseId,
      parentId: easterId,
      name: 'morse.txt',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: 'I LOVE YOU: .. .-.. --- ...- . / -.-- --- ..-\nI MISS YOU: .. / -- .. ... ... / -.-- --- ..-\nALWAYS: .- .-.. .-- .- -.-- ...\nFOREVER: ..-. --- .-. . ...- . .-.',
    } as FileNode,
  };
  return { nodes, rootId, desktopId, trashId };
}

export function loadFS(): FileSystem {
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as any;
      // Migrations: ensure trash folder and quotes file exist
      if (!parsed.trashId) {
        const migrated = defaultFS();
        // keep existing nodes if possible
        parsed.trashId = migrated.trashId;
        if (!parsed.nodes[migrated.trashId]) {
          parsed.nodes[migrated.trashId] = migrated.nodes[migrated.trashId];
          parsed.nodes[parsed.desktopId].children.push(migrated.trashId);
        }
        // add quotes file if missing
        const quotesNode = Object.values(parsed.nodes).find((n: any) => n.type === 'file' && n.name?.toLowerCase?.() === 'quotes.txt');
        if (!quotesNode) {
          const q = (Object.keys(migrated.nodes) as string[]).find((k) => migrated.nodes[k].name === 'quotes.txt')!;
          parsed.nodes[q] = migrated.nodes[q];
          parsed.nodes[parsed.desktopId].children.push(q);
        }
        saveFS(parsed);
      }
      // Ensure Easter Egg folder exists
      try {
        const hasEaster = Object.values(parsed.nodes || {}).some((n: any) => n?.type === 'folder' && n?.name === 'Easter Egg');
        if (!hasEaster) {
          const ts = nowISO();
          const desktopId = parsed.desktopId;
          const easterId = makeId('folder');
          const emptyId = makeId('folder');
          const morseId = makeId('file');
          parsed.nodes[easterId] = { id: easterId, parentId: desktopId, name: 'Easter Egg', type: 'folder', createdAt: ts, updatedAt: ts, children: [emptyId, morseId] };
          parsed.nodes[emptyId] = { id: emptyId, parentId: easterId, name: 'Empty', type: 'folder', createdAt: ts, updatedAt: ts, children: [] };
          parsed.nodes[morseId] = { id: morseId, parentId: easterId, name: 'morse.txt', type: 'file', createdAt: ts, updatedAt: ts, content: 'I LOVE YOU: .. .-.. --- ...- . / -.-- --- ..-\nI MISS YOU: .. / -- .. ... ... / -.-- --- ..-\nALWAYS: .- .-.. .-- .- -.-- ...\nFOREVER: ..-. --- .-. . ...- . .-.' };
          const desktop = parsed.nodes[desktopId];
          if (desktop?.children && !desktop.children.includes(easterId)) desktop.children.push(easterId);
          saveFS(parsed);
        }
      } catch {}
      return parsed as FileSystem;
    }
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
  const finalName = name.endsWith('.txt') ? name : `${name}.txt`;
  const file: FileNode = {
    id,
    parentId,
    name: finalName,
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
  if (!node || !newName || !newName.trim()) return { ...fs, nodes: { ...fs.nodes } };
  let final = newName.trim();
  if (node.type === 'file' && !final.toLowerCase().endsWith('.txt')) final = `${final}.txt`;
  node.name = final;
  (node as any).updatedAt = nowISO();
  saveFS(fs);
  return { ...fs, nodes: { ...fs.nodes } };
}

// Re-export utilities for backward compatibility
export { getPath, moveToTrash } from "./fsUtils";
