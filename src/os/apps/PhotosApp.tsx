import { useEffect, useState } from "react";

const PHOTOS_KEY = 'velluna-photos';

export interface PhotosAppProps {
  onSetWallpaper: (file: File) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PhotosApp = ({ onSetWallpaper }: PhotosAppProps) => {
  const [photos, setPhotos] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  }, [photos]);

  const onAdd = async (files: FileList | null) => {
    if (!files) return;
    const arr: string[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await fileToDataUrl(f);
      arr.push(dataUrl);
    }
    setPhotos((p) => [...arr, ...p]);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Your sweet gallery</div>
        <label className="px-3 py-1 rounded-md bg-primary text-primary-foreground cursor-pointer">Add Photos
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onAdd(e.target.files)} />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="flex-1 grid place-items-center text-muted-foreground">No photos yet. Add some memories ✨</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt={`Memory ${i+1}`} loading="lazy" className="w-full h-32 object-cover rounded-lg border" />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition rounded-lg grid place-items-center opacity-0 group-hover:opacity-100">
                <button className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-sm" onClick={async () => {
                  const res = await fetch(src);
                  const blob = await res.blob();
                  const file = new File([blob], 'wallpaper.jpg', { type: blob.type });
                  onSetWallpaper(file);
                }}>Set as wallpaper</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosApp;
