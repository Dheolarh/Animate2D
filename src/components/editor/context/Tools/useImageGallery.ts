import { useState } from 'react';
import type { FrameImage, FrameText } from '@/types/animation';
import type { UploadedImage } from '../SpriteEditorContext';

export const useImageGallery = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<FrameImage | null>(null);
  const [selectedText, setSelectedText] = useState<FrameText | null>(null);
  const [draggingImageUrl, setDraggingImageUrl] = useState<string | null>(null);

  return {
    uploadedImages,
    setUploadedImages,
    selectedImage,
    setSelectedImage,
    selectedText,
    setSelectedText,
    draggingImageUrl,
    setDraggingImageUrl
  };
};
