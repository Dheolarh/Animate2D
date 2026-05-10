import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSpriteEditor } from '../context/SpriteEditorContext';

interface AnimationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ open, onOpenChange }) => {
  const { animationSettings, canvasState } = useSpriteEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(0);

  // No frames available
  const frames: any[] = [];

  // Calculate frame duration in milliseconds
  const frameDuration = 1000 / animationSettings.fps;

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
        lastFrameTimeRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, frameDuration, frames.length]);

  // Render current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = frames[currentFrame];
    if (!frame || !frame.imageData) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = frame.imageData;
  }, [currentFrame, frames]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      lastFrameTimeRef.current = 0;
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
    lastFrameTimeRef.current = 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Animation Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas */}
          <div className="flex items-center justify-center bg-muted/20 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={canvasState.width}
              height={canvasState.height}
              className="border border-border shadow-lg max-w-full h-auto"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handlePlayPause} size="lg">
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            Frame {currentFrame + 1} of {frames.length} • {animationSettings.fps} FPS
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimationPreview;
