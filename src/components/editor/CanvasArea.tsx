import React, { useRef, useEffect } from 'react';
import { Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Scene, Asset, SceneObject } from '@/types/animation';

interface CanvasAreaProps {
  scene: Scene;
  assets: Asset[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onUpdateObject: (objectId: string, updates: Partial<SceneObject>) => void;
  playheadTime: number;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  scene,
  assets,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  playheadTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = React.useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = scene.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
      ctx.lineWidth = 1;
      
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    const sortedObjects = [...scene.objects].sort((a, b) => {
      const layerA = scene.layers.find(l => l.id === a.layer);
      const layerB = scene.layers.find(l => l.id === b.layer);
      return (layerA?.order || 0) - (layerB?.order || 0);
    });

    for (const obj of sortedObjects) {
      if (!obj.visible) continue;

      const asset = assets.find(a => a.id === obj.assetId);
      if (!asset) continue;

      ctx.save();
      ctx.globalAlpha = obj.opacity;
      ctx.translate(obj.transform.x, obj.transform.y);
      ctx.rotate((obj.transform.rotation * Math.PI) / 180);
      ctx.scale(
        obj.transform.scaleX * (obj.flipHorizontal ? -1 : 1),
        obj.transform.scaleY * (obj.flipVertical ? -1 : 1)
      );

      if (asset.type === 'animation') {
        const frameIndex = Math.floor(playheadTime * asset.fps) % asset.frames.length;
        const frame = asset.frames[frameIndex];
        
        const img = new Image();
        img.src = frame.imageData;
        ctx.drawImage(img, -asset.width / 2, -asset.height / 2, asset.width, asset.height);
      } else if (asset.type === 'spritesheet') {
        const frameIndex = Math.floor(playheadTime * asset.fps) % asset.frameCount;
        const col = frameIndex % asset.cols;
        const row = Math.floor(frameIndex / asset.cols);
        
        const img = new Image();
        img.src = asset.url;
        
        // Draw only the specific frame from the sheet
        ctx.drawImage(
          img,
          col * asset.frameWidth,
          row * asset.frameHeight,
          asset.frameWidth,
          asset.frameHeight,
          -asset.frameWidth / 2,
          -asset.frameHeight / 2,
          asset.frameWidth,
          asset.frameHeight
        );
      } else if (asset.type === 'sprite') {
        const img = new Image();
        img.src = asset.frame.imageData;
        ctx.drawImage(img, -asset.width / 2, -asset.height / 2, asset.width, asset.height);
      } else if (asset.type === 'image') {
        const img = new Image();
        img.src = asset.url;
        ctx.drawImage(img, -asset.width / 2, -asset.height / 2, asset.width, asset.height);
      }

      ctx.restore();

      if (obj.id === selectedObjectId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          obj.transform.x - 50,
          obj.transform.y - 50,
          100,
          100
        );
        ctx.setLineDash([]);
      }
    }
  }, [scene, assets, selectedObjectId, playheadTime, showGrid]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sortedObjects = [...scene.objects].sort((a, b) => {
      const layerA = scene.layers.find(l => l.id === a.layer);
      const layerB = scene.layers.find(l => l.id === b.layer);
      return (layerB?.order || 0) - (layerA?.order || 0);
    });

    for (const obj of sortedObjects) {
      if (!obj.visible || obj.locked) continue;

      const dx = x - obj.transform.x;
      const dy = y - obj.transform.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        onSelectObject(obj.id);
        return;
      }
    }

    onSelectObject('');
  };

  return (
    <div className="flex-1 bg-muted/20 relative flex items-center justify-center">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={scene.width}
        height={scene.height}
        className="border-2 border-border bg-white shadow-lg cursor-crosshair"
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default CanvasArea;
