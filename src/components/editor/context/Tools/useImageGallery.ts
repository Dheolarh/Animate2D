import { useState, useEffect } from 'react';
import type { FrameImage, FrameText } from '@/types/animation';
import type { UploadedImage } from '../SpriteEditorContext';

const IMAGE_GALLERY_KEY = 'animate2d_image_gallery';

// Convert a URL (object URL or data URL) to base64 data URL for persistence
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

const loadFromStorage = (): UploadedImage[] => {
  try {
    const raw = localStorage.getItem(IMAGE_GALLERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useImageGallery = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(loadFromStorage);
  const [selectedImage, setSelectedImage] = useState<FrameImage | null>(null);
  const [selectedText, setSelectedText] = useState<FrameText | null>(null);
  const [draggingImageUrl, setDraggingImageUrl] = useState<string | null>(null);

  // Persist to localStorage whenever the list changes.
  // Images stored as base64 data URLs so they survive page reload.
  useEffect(() => {
    try {
      localStorage.setItem(IMAGE_GALLERY_KEY, JSON.stringify(uploadedImages));
    } catch {
      // Storage quota exceeded — silently ignore, gallery still works in memory
    }
  }, [uploadedImages]);

  // Thin wrapper: converts an ObjectURL → base64 before adding to the list,
  // so the stored URL doesn't expire when the page reloads.
  const addUploadedImage = async (raw: UploadedImage) => {
    try {
      const dataUrl = await toDataUrl(raw.url);
      const persisted: UploadedImage = { ...raw, url: dataUrl };
      // Revoke the temporary ObjectURL since we've converted it
      if (raw.url.startsWith('blob:')) URL.revokeObjectURL(raw.url);
      setUploadedImages(prev => [...prev, persisted]);
      return persisted;
    } catch {
      // If conversion fails, store the ObjectURL as-is (won't survive reload)
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
