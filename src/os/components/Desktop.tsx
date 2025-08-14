import DesktopIcon from "@/os/components/DesktopIcon";
import Window from "@/os/components/Window";
import StartMenu from "@/os/components/StartMenu";
import Taskbar from "@/os/components/Taskbar";
import wallpaper from "@/assets/wallpapers/velluna-soft-pink.jpg";
import { useEffect, useMemo, useState } from "react";
import { FileSystem, FSNode, FolderNode, createFile, createFolder, getNode, listChildren, loadFS, updateFileContent, renameNode } from "@/os/state/fs";
import { moveToTrash, restoreFromTrash, deletePermanently } from "@/os/state/fsUtils";
import FileExplorer from "@/os/apps/FileExplorer";
import PhotosApp from "@/os/apps/PhotosApp";
import TextEditor from "@/os/apps/TextEditor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sparkles, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { daysSinceOrigin } from "@/os/utils/vellunaDate";
const WP_KEY = 'velluna-wallpaper';
const PHOTOS_KEY = 'velluna-photos';
const sb: any = supabase;
export type WindowKind =
  | { type: 'explorer'; folderId: string; title: string }
  | { type: 'photos'; title: string }
  | { type: 'editor'; fileId: string; title: string };

const Desktop: React.FC<{ userId?: string; onLogout?: () => void }> = ({ userId, onLogout }) => {
  const [fs, setFs] = useState<FileSystem>(() => loadFS());
  const [menuOpen, setMenuOpen] = useState(false);
  const [windows, setWindows] = useState<WindowKind[]>([]);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() => localStorage.getItem(WP_KEY) || wallpaper);
  const [photos, setPhotos] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]'); } catch { return []; }
  });
  const { toast } = useToast();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('#start-menu') || el.closest('#start-trigger')) return;
      setMenuOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const desktopChildren: FSNode[] = useMemo(() => listChildren(fs, fs.desktopId), [fs]);

  // Persist photos locally for offline access
  useEffect(() => {
    try { localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)); } catch {}
  }, [photos]);

  // Load cloud state for this user
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error }: any = await sb
        .from('user_data')
        .select('fs_json, photos, wallpaper_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Load user_data error', error);
        return;
      }

      if (data) {
        // Apply small migrations to ensure system nodes (Trash, quotes.txt) exist
        let incoming = (data.fs_json || {}) as FileSystem;
        try {
          const ts = new Date().toISOString();
          const next: FileSystem = {
            ...incoming,
            nodes: { ...(incoming?.nodes || {}) },
          } as any;
          // Ensure desktopId exists
          const desktopId = next.desktopId || 'desktop';
          const desktop = next.nodes?.[desktopId] as any;

          // Ensure Trash exists and is on Desktop
          if (!next.trashId || !next.nodes?.[next.trashId]) {
            const trashId = 'trash';
            if (!next.nodes[trashId]) {
              (next as any).nodes[trashId] = {
                id: trashId,
                parentId: desktopId,
                name: 'Trash',
                type: 'folder',
                createdAt: ts,
                updatedAt: ts,
                children: [],
              } as any;
            }
            (next as any).trashId = 'trash';
          }
          if (desktop?.children && !desktop.children.includes(next.trashId)) {
            desktop.children.push(next.trashId);
          }

          setFs(next);
        } catch {
          setFs(incoming as any);
        }

        if (data.wallpaper_url) {
          setWallpaperUrl(data.wallpaper_url);
          localStorage.setItem(WP_KEY, data.wallpaper_url);
        }
        if (Array.isArray(data.photos)) setPhotos(data.photos as string[]);
      } else {
        await sb.from('user_data').insert({
          user_id: userId,
          fs_json: fs as any,
          photos: photos as any,
          wallpaper_url: wallpaperUrl,
        });
      }
    })();
  }, [userId]);

  // Save cloud state when things change
  useEffect(() => {
    if (!userId) return;
    sb.from('user_data').upsert({
      user_id: userId,
      fs_json: fs as any,
      photos: photos as any,
      wallpaper_url: wallpaperUrl,
    }, { onConflict: 'user_id' });
  }, [fs, photos, wallpaperUrl, userId]);

  const openFolder = (folderId: string) => {
    const node = getNode(fs, folderId) as FolderNode;
    setWindows((w) => [...w, { type: 'explorer', folderId, title: node?.name || 'Folder' }]);
  };

  const openFile = (fileId: string) => {
    const node = getNode(fs, fileId);
    setWindows((w) => [...w, { type: 'editor', fileId, title: node?.name || 'File' }]);
  };

  const onNewFileDesktop = () => {
    const name = `New Note ${Math.floor(Math.random()*100)}`;
    const next = createFile({ ...fs, nodes: { ...fs.nodes } }, fs.desktopId, name);
    setFs(next);
  };
  const onNewFolderDesktop = () => {
    const name = `Folder ${Math.floor(Math.random()*100)}`;
    const next = createFolder({ ...fs, nodes: { ...fs.nodes } }, fs.desktopId, name);
    setFs(next);
  };

  const changeWallpaper = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setWallpaperUrl(dataUrl);
      localStorage.setItem(WP_KEY, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const closeWindowAt = (idx: number) => setWindows((w) => w.filter((_, i) => i !== idx));

  return (
    <div className="relative min-h-screen" style={{ backgroundImage: `url(${wallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Slight overlay for legibility */}
      <div className="absolute inset-0 bg-background/30" />

      {/* Top actions/info */}
      <div className="absolute top-2 right-2 z-50 italic">
        <Tooltip>
          <TooltipTrigger className="px-2 py-1 rounded-md border bg-card hover:bg-secondary text-xs flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>Info</span>
            <span className="text-primary animate-pulse">♥</span>
          </TooltipTrigger>
          <TooltipContent className="mr-2 text-xs">Don't forget you are being loved!!🥰</TooltipContent>
        </Tooltip>
      </div>

      {/* Desktop grid */}
      <div className="relative z-10 p-4 grid grid-cols-4 md:grid-cols-8 gap-4">
        {desktopChildren.map((n) => (
          <DesktopIcon
            key={n.id}
            name={n.name}
            type={n.type}
            onOpen={() => (n.type === 'folder' ? openFolder(n.id) : openFile(n.id))}
            onDelete={
              n.id !== fs.desktopId &&
              n.id !== fs.trashId &&
              n.name !== 'Easter Egg' &&
              n.name !== 'The Diary' &&
              n.name.toLowerCase() !== 'quotes.txt'
                ? () => {
                    setFs(moveToTrash(fs, n.id));
                    toast({ title: "Moved to Trash", description: `${n.name} was moved to Trash.`, duration: 1500 });
                  }
                : undefined
            }
            onRename={n.id !== fs.desktopId && n.id !== fs.trashId ? () => {
              const newName = prompt('Rename to:', n.name) || '';
              if (newName.trim()) setFs(renameNode(fs, n.id, newName.trim()));
            } : undefined}
            isTrash={n.id === fs.trashId}
            isEasterEgg={n.name === 'Easter Egg'}
            isDiary={n.name === 'The Diary'}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map((w, i) => (
        <Window key={i} id={`${i}`} title={w.title} onClose={() => closeWindowAt(i)}>
          {w.type === 'explorer' && (
            <FileExplorer
              fs={fs}
              folderId={w.folderId}
              onOpenFolder={openFolder}
              onOpenFile={openFile}
              onCreateFile={(name) => setFs(createFile(fs, w.folderId, name))}
              onCreateFolder={(name) => setFs(createFolder(fs, w.folderId, name))}
              onDelete={(id) => {
                const node = getNode(fs, id);
                setFs(moveToTrash(fs, id));
                toast({ title: "Moved to Trash", description: `${node?.name || 'Item'} was moved to Trash.`, duration: 1500 });
              }}
              onRestore={(id) => setFs(restoreFromTrash(fs, id))}
              onPermanentDelete={(id) => setFs(deletePermanently(fs, id))}
            />
          )}
          {w.type === 'photos' && (
            <PhotosApp
              photos={photos}
              onPhotosChange={setPhotos}
              onSetWallpaper={async (file) => changeWallpaper(file)}
            />
          )}
          {w.type === 'editor' && (
            <TextEditor
              fs={fs}
              fileId={w.fileId}
              onSave={(content) => {
                setFs(updateFileContent(fs, w.fileId, content));
                toast({ title: "Saved with love", description: "Your changes are safe and synced.", duration: 1500 });
              }}
              onRename={(name) => setFs(renameNode(fs, w.fileId, name))}
            />
          )}
        </Window>
      ))}

      {/* Taskbar + Menu */}
      <Taskbar onToggleMenu={() => setMenuOpen((v) => !v)} userId={userId} onLogout={onLogout} />
      <div id="start-menu">
        <StartMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNewFile={onNewFileDesktop}
          onNewFolder={onNewFolderDesktop}
          onOpenPhotos={() => setWindows((w) => [...w, { type: 'photos', title: 'Photos' }])}
          //onOpenExplorer={() => setWindows((w) => [...w, { type: 'explorer', folderId: fs.desktopId, title: 'Desktop' }])}
          onChangeWallpaper={changeWallpaper}
          onOpenQuotes={() => {
            const q = Object.values(fs.nodes).find((n) => n.type === 'file' && n.name.toLowerCase() === 'quotes.txt') as any;
            if (q) openFile(q.id);
          }}
          onOpenEasterEgg={() => {
            const egg = Object.values(fs.nodes).find((n) => n.type === 'folder' && n.name === 'Easter Egg') as any;
            if (egg) openFolder(egg.id);
          }}
          onOpenDiary={() => {
            const diary = Object.values(fs.nodes).find((n) => n.type === 'folder' && n.name === 'The Diary') as any;
            if (diary) openFolder(diary.id);
          }}
          version="v0.1.0"
        />
      </div>

      {/* Quotes widget */}
      <DesktopQuotes fs={fs} />
    </div>
  );
};

export default Desktop;

// Lightweight quotes widget component
const DesktopQuotes: React.FC<{ fs: FileSystem }> = ({ fs }) => {
  // Find quotes.txt anywhere in the FS
  const file = useMemo(() => {
    return Object.values(fs.nodes).find((n) => n.type === 'file' && n.name.toLowerCase() === 'quotes.txt') as any;
  }, [fs]);
  const quote = useMemo(() => {
    const content: string = file?.content || '';
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return "Create a quotes.txt file to show daily quotes";
    const idx = daysSinceOrigin() % lines.length;
    return lines[idx];
  }, [file]);
  return (
    <div className="fixed right-2 bottom-14 z-40">
      <Tooltip>
        <TooltipTrigger className="px-2 py-1 rounded-md border bg-card/80 backdrop-blur shadow-lg text-xs text-foreground">
          <span className="flex items-center gap-2">
            {/* <Heart className="h-3 w-3 animate-heartbeat" />
            <Sparkles className="h-3 w-3" /> */}
            For You...
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm animate-scale-in mr-2" side="top">
          <div className="text-muted-foreground italic">{quote}</div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
