import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const SHARED_FS_ID = 'shared';

const PHOTOS_KEY = 'velluna-photos';

export interface PhotosAppProps {
  onSetWallpaper: (file: File) => void;
  photos?: string[];
  onPhotosChange?: (photos: string[]) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PhotosApp = ({ onSetWallpaper, photos: controlledPhotos, onPhotosChange }: PhotosAppProps) => {
  const [internalPhotos, setInternalPhotos] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]'); } catch { return []; }
  });
  const photos = controlledPhotos ?? internalPhotos;

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (controlledPhotos) return;
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(internalPhotos));
  }, [internalPhotos, controlledPhotos]);

  const onAdd = async (files: FileList | null) => {
    if (!files) return;
    const arr: string[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await fileToDataUrl(f);
      arr.push(dataUrl);
    }
    const finalPhotos = [...arr, ...photos];
    if (onPhotosChange) onPhotosChange(finalPhotos); else setInternalPhotos(finalPhotos);

    // Save to Supabase
    try {
      await supabase
        .from('user_data')
        .upsert({
          user_id: SHARED_FS_ID,
          photos: finalPhotos,
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error saving photos to Supabase:', err);
    }
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
            <div key={i} className="relative group" onClick={() => setPreviewSrc(src)}>
              <img src={src} alt={`Memory ${i+1}`} loading="lazy" className="w-full h-32 object-cover rounded-lg border" />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition rounded-lg grid place-items-center opacity-0 group-hover:opacity-100">
                <div className="flex flex-col gap-2">
                  <button className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-sm" onClick={async (e) => {
                    e.stopPropagation();
                    const res = await fetch(src);
                    const blob = await res.blob();
                    const file = new File([blob], 'wallpaper.jpg', { type: blob.type });
                    onSetWallpaper(file);
                  }}>Set as wallpaper</button>
                  <button className="px-2 py-1 rounded-md bg-red-500 text-white text-sm" onClick={async (e) => {
                    e.stopPropagation();
                    const newPhotos = photos.filter((_, idx) => idx !== i);
                    if (onPhotosChange) onPhotosChange(newPhotos); else setInternalPhotos(newPhotos);
                    try {
                      await supabase
                        .from('user_data')
                        .upsert({ user_id: SHARED_FS_ID, photos: newPhotos }, { onConflict: 'user_id' });
                    } catch (err) { console.error(err); }
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewSrc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreviewSrc(null)}>
          <div className="relative max-w-[70vw] max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <img src={previewSrc} alt="Preview" className="w-auto h-auto max-w-[70vw] max-h-[70vh] rounded-lg shadow-lg object-contain" />
            <button className="absolute top-2 right-2 px-2 py-1 bg-white rounded-md text-black font-bold" onClick={() => setPreviewSrc(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosApp;
