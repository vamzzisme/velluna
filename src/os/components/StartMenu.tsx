import { Image, FolderPlus, FilePlus, Images, Settings2, FileText, Sparkles, BookHeart, Quote, Gift } from "lucide-react";
import { daysSinceOrigin} from "../utils/vellunaDate";

export interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onOpenPhotos: () => void;
  onChangeWallpaper: (file: File) => void;
  onOpenQuotes?: () => void;
  onOpenEasterEgg?: () => void;
  onOpenDiary?: () => void;
  version?: string;
}

const StartMenu = ({ open, onClose, onNewFile, onNewFolder, onOpenPhotos, onChangeWallpaper, onOpenQuotes, onOpenEasterEgg, onOpenDiary, version }: StartMenuProps) => {
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
      <div className="w-full p-4 rounded-lg bg-pink-100 border border-pink-300 shadow-inner flex flex-col items-center text-center mb-2">
        <div className="text-sm text-rose-800 font-semibold mb-1">Velluna OS</div>
        <div className="text-xl font-light text-rose-800 mb-1">Velvet. Luna. You.</div>
        <div className="text-sm text-grey-900 italic">Day #{daysSinceOrigin(new Date())}</div>
      </div>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onNewFile(); onClose(); }}>
        <FilePlus className="h-4 w-4" /> New File
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onNewFolder(); onClose(); }}>
        <FolderPlus className="h-4 w-4" /> New Folder
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-150" onClick={() => { onOpenDiary?.(); onClose(); }}>
        <BookHeart className="h-4 w-4" /> The Diary
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-150" onClick={() => { onOpenQuotes?.(); onClose(); }}>
        <Quote className="h-4 w-4" /> quotes.txt
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-150" onClick={() => { onOpenEasterEgg?.(); onClose(); }}>
        <Gift className="h-4 w-4" /> Easter Egg
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary" onClick={() => { onOpenPhotos(); onClose(); }}>
        <Images className="h-4 w-4" /> Photos
      </button>
      <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary cursor-pointer transition-all duration-150">
        <Image className="h-4 w-4" /> Change Wallpaper
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      <div className="text-[10px] text-muted-foreground px-2 py-1 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> Made with love...</span>
        {version && <span>v2.1.13</span>}
      </div>
    </div>
  );
};

export default StartMenu;
