import DesktopIcon from "@/os/components/DesktopIcon";
import Window from "@/os/components/Window";
import StartMenu from "@/os/components/StartMenu";
import Taskbar from "@/os/components/Taskbar";
import wallpaper from "@/assets/wallpapers/velluna-soft-pink.jpg";
import { useEffect, useMemo, useState } from "react";
import { FileSystem, FSNode, FolderNode, createFile, createFolder, getNode, listChildren, loadFS, updateFileContent, renameNode } from "@/os/state/fs";
import FileExplorer from "@/os/apps/FileExplorer";
import PhotosApp from "@/os/apps/PhotosApp";
import TextEditor from "@/os/apps/TextEditor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const WP_KEY = 'velluna-wallpaper';

export type WindowKind =
  | { type: 'explorer'; folderId: string; title: string }
  | { type: 'photos'; title: string }
  | { type: 'editor'; fileId: string; title: string };

const Desktop: React.FC<{ userId?: string; onLogout?: () => void }> = ({ userId, onLogout }) => {
  const [fs, setFs] = useState<FileSystem>(() => loadFS());
  const [menuOpen, setMenuOpen] = useState(false);
  const [windows, setWindows] = useState<WindowKind[]>([]);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() => localStorage.getItem(WP_KEY) || wallpaper);

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

      {/* Top adornments */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 text-primary pulse select-none">♥</div>
      <div className="absolute top-2 right-2 z-50">
        <Tooltip>
          <TooltipTrigger className="px-2 py-1 rounded-md border bg-card hover:bg-secondary text-xs flex items-center gap-1">
            <Info className="h-4 w-4" /> Info
          </TooltipTrigger>
          <TooltipContent>Don’t forget you are being loved!!🥰</TooltipContent>
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
            />
          )}
          {w.type === 'photos' && (
            <PhotosApp onSetWallpaper={async (file) => changeWallpaper(file)} />
          )}
          {w.type === 'editor' && (
            <TextEditor fs={fs} fileId={w.fileId} onSave={(content) => setFs(updateFileContent(fs, w.fileId, content))} onRename={(name) => setFs(renameNode(fs, w.fileId, name))} />
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
          onOpenExplorer={() => setWindows((w) => [...w, { type: 'explorer', folderId: fs.desktopId, title: 'Desktop' }])}
          onChangeWallpaper={changeWallpaper}
        />
      </div>
    </div>
  );
};

export default Desktop;
