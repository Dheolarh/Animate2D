import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpriteEditor, type UploadedImage } from '../context/SpriteEditorContext';
import { toast } from 'sonner';

const ImageGallery: React.FC = () => {
  const { uploadedImages, setUploadedImages, setDraggingImageUrl } = useSpriteEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      try {
        // Create object URL for instant access (no upload needed!)
        const objectUrl = URL.createObjectURL(file);

        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
          const newImage: UploadedImage = {
            id: `img_${Date.now()}_${Math.random()}`,
            url: objectUrl,
            name: file.name,
            width: img.width,
            height: img.height
          };

          setUploadedImages(prev => [...prev, newImage]);
          toast.success(`${file.name} loaded`);
        };
        img.onerror = () => {
          toast.error(`Failed to load ${file.name}`);
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      } catch (error) {
        console.error('Load error:', error);
        toast.error(`Failed to load ${file.name}`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragStart = (e: React.DragEvent, image: UploadedImage) => {
    setDraggingImageUrl(image.url);
    e.dataTransfer.effectAllowed = 'copy';
    const payload = JSON.stringify({ url: image.url, width: image.width, height: image.height });
    e.dataTransfer.setData('text/plain', payload);
  };

  const handleDragEnd = () => {
    setDraggingImageUrl(null);
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Image Library</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag images onto canvas
        </p>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {uploadedImages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No images uploaded yet
            </p>
            <Button onClick={handleUploadClick} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-2 gap-2">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="aspect-square bg-muted rounded border border-border overflow-hidden cursor-move hover:border-primary transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
            
            {/* Upload Button at End */}
            <button
              onClick={handleUploadClick}
              className="aspect-square bg-muted rounded border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageGallery;
