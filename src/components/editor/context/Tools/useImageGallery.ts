import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import type { FrameImage, FrameText } from '@/types/animation';
import type { UploadedImage } from '../SpriteEditorContext';

/** Convert any URL (blob: or data:) to a base64 data URL for persistence */
const toDataUrl = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No ctx')); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });

export const useImageGallery = (projectId: string) => {
  // Project-specific storage key
  const IMAGE_GALLERY_KEY = `animate2d_image_gallery_${projectId}`;

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGalleryHydrated, setIsGalleryHydrated] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FrameImage | null>(null);
  const [selectedText, setSelectedText] = useState<FrameText | null>(null);
  const [draggingImageUrl, setDraggingImageUrl] = useState<string | null>(null);

  // ── Load from IndexedDB on mount ──────────────────────────────────────────
  useEffect(() => {
    get<UploadedImage[]>(IMAGE_GALLERY_KEY)
      .then(saved => {
        if (saved && saved.length > 0) setUploadedImages(saved);
        setIsGalleryHydrated(true);
      })
      .catch(() => setIsGalleryHydrated(true));
  }, [projectId, IMAGE_GALLERY_KEY]);

  // ── Persist to IndexedDB whenever list changes (only post-hydration) ──────
  useEffect(() => {
    if (!isGalleryHydrated) return;
    set(IMAGE_GALLERY_KEY, uploadedImages).catch(() => {
      // IndexedDB write failure is non-fatal — gallery still works in memory
      console.warn('Failed to persist image gallery to IndexedDB');
    });
  }, [uploadedImages, isGalleryHydrated, IMAGE_GALLERY_KEY]);

  /**
   * Add an image to the gallery.
   * Converts blob: ObjectURLs → base64 data URLs before storing so they
   * survive page reloads. Revokes the ObjectURL after conversion.
   */
  const addUploadedImage = async (raw: UploadedImage): Promise<UploadedImage> => {
    try {
      const dataUrl = await toDataUrl(raw.url);
      const persisted: UploadedImage = { ...raw, url: dataUrl };
      if (raw.url.startsWith('blob:')) URL.revokeObjectURL(raw.url);
      setUploadedImages(prev => [...prev, persisted]);
      return persisted;
    } catch {
      // Conversion failed — store the original URL (won't survive reload)
      setUploadedImages(prev => [...prev, raw]);
      return raw;
    }
  };

  return {
    uploadedImages,
    setUploadedImages,
    addUploadedImage,
    selectedImage,
    setSelectedImage,
    selectedText,
    setSelectedText,
    draggingImageUrl,
    setDraggingImageUrl,
  };
};
