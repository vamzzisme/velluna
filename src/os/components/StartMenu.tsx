import { Image, FolderPlus, FilePlus, Images, Folder, Settings2, FileText } from "lucide-react";

export interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onOpenPhotos: () => void;
  onOpenExplorer: () => void;
  onChangeWallpaper: (file: File) => void;
}

const StartMenu = ({ open, onClose, onNewFile, onNewFolder, onOpenPhotos, onOpenExplorer, onChangeWallpaper }: StartMenuProps) => {
  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChangeWallpaper(f);
    e.currentTarget.value = '';
    onClose();
  };

  return (
    <div id="start-menu" className="fixed left-3 bottom-14 w-72 rounded-xl border bg-card shadow-lg p-2 animate-fade-in">
      <div className="text-xs text-muted-foreground px-2 py-1">Velluna Menu</div>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onNewFile(); onClose(); }}>
        <FilePlus className="h-4 w-4" /> New File on Desktop
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onNewFolder(); onClose(); }}>
        <FolderPlus className="h-4 w-4" /> New Folder on Desktop
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onOpenExplorer(); onClose(); }}>
        <Folder className="h-4 w-4" /> Open File Explorer
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onOpenPhotos(); onClose(); }}>
        <Images className="h-4 w-4" /> Photos
      </button>
      <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary cursor-pointer">
        <Image className="h-4 w-4" /> Change Wallpaper
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      <div className="text-[10px] text-muted-foreground px-2 py-1 flex items-center gap-1">
        <Settings2 className="h-3 w-3" /> Soft‑pink. Tender. Yours.
      </div>
    </div>
  );
};

export default StartMenu;
