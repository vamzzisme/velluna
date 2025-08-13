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
  const diaryId = 'folder_diary';
  const mondayId = 'file_monday';
  const tuesdayId = 'file_tuesday';
  const noteId = 'file_note';
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
      children: [vellunaId, memoriesId, readmeId, quotesId, easterId, diaryId, trashId],
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
      content: `Morse Code Messages:

I LOVE YOU: .. / .-.. --- ...- . / -.-- --- ..-

I MISS YOU: .. / -- .. ... ... / -.-- --- ..-

GOOD MORNING: --. --- --- -.. / -- --- .-. -. .. -. --.

SWEET DREAMS: ... .-- . . - / -.. .-. . .- -- ...

YOU ARE BEAUTIFUL: -.-- --- ..- / .- .-. . / -... . .- ..- - .. ..-. ..- .-..

THINKING OF YOU: - .... .. -. -.- .. -. --. / --- ..-. / -.-- --- ..-

FOREVER YOURS: ..-. --- .-. . ...- . .-. / -.-- --- ..- .-. ...`,
    } as FileNode,
    [diaryId]: {
      id: diaryId,
      parentId: desktopId,
      name: 'The Diary',
      type: 'folder',
      createdAt: ts,
      updatedAt: ts,
      children: [mondayId, tuesdayId, noteId],
    } as FolderNode,
    [mondayId]: {
      id: mondayId,
      parentId: diaryId,
      name: 'Monday.txt',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: `Monday, Dear Diary,

Another week begins with the soft whisper of possibility. The morning light filtered through my window like hope itself, painting everything in that tender pink hue I've grown to love.

Today I thought about how every heartbeat carries a promise, and every breath holds a secret wish.

- Your thoughts matter
- Your dreams are valid
- You are enough

Until tomorrow,
💗`,
    } as FileNode,
    [tuesdayId]: {
      id: tuesdayId,
      parentId: diaryId,
      name: 'Tuesday.txt',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: `Tuesday, My Dear Companion,

The second day brought clarity like the morning dew. I found myself smiling at small things - the way shadows dance, how time seems to slow when you're truly present.

There's magic in the mundane when you look with the right eyes.

Remember:
- Be gentle with yourself
- Embrace the journey
- Love fiercely but wisely

With all my tenderness,
💗`,
    } as FileNode,
    [noteId]: {
      id: noteId,
      parentId: diaryId,
      name: 'Personal Note.txt',
      type: 'file',
      createdAt: ts,
      updatedAt: ts,
      content: `My Dearest Self,

This is a reminder of who you are when the world feels heavy:

You are the soft pink sunrise that breaks through the darkest nights.
You are the gentle heartbeat that keeps hope alive.
You are the whispered prayer that never goes unheard.

Your sensitivity is your superpower.
Your kindness is your strength.
Your love is your legacy.

Never forget that you are beautifully, perfectly, tenderly you.

Forever yours,
The voice that believes in you 💗

P.S. - On days when you doubt, come back to these words. They will always be true.`,
    } as FileNode,
  };
  return { nodes, rootId, desktopId, trashId };
}

import { supabase } from '@/integrations/supabase/client';

let cachedFS: FileSystem | null = null;

export function loadFS(): FileSystem {
  if (cachedFS) return cachedFS;
  
  // Sync load from localStorage initially
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) {
      cachedFS = JSON.parse(raw) as FileSystem;
    } else {
      cachedFS = defaultFS();
      localStorage.setItem(FS_KEY, JSON.stringify(cachedFS));
    }
  } catch {
    cachedFS = defaultFS();
    localStorage.setItem(FS_KEY, JSON.stringify(cachedFS));
  }
  
  // Async load from Supabase in background
  loadFromSupabase();
  return cachedFS;
}

async function loadFromSupabase(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_data')
        .select('fs_json')
        .eq('user_id', user.id)
        .single();
      
      if (data?.fs_json && !error) {
        const parsed = data.fs_json as any;
        cachedFS = parsed as FileSystem;
        localStorage.setItem(FS_KEY, JSON.stringify(cachedFS));
      } else if (cachedFS) {
        // Migrate local data to Supabase
        await saveFS(cachedFS);
      }
    }
  } catch (error) {
    console.error('Error loading from Supabase:', error);
  }
}

export function saveFS(fs: FileSystem): FileSystem {
  cachedFS = fs;
  localStorage.setItem(FS_KEY, JSON.stringify(fs));
  
  // Async save to Supabase
  saveToSupabase(fs).catch(error => {
    console.error('Error saving to Supabase:', error);
  });
  
  return fs;
}

async function saveToSupabase(fs: FileSystem): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          fs_json: fs as any,
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error saving to Supabase:', error);
  }
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
