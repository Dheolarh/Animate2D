import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useSpriteEditor } from '../context/SpriteEditorContext';

interface AnimationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ open, onOpenChange }) => {
  const { animationSettings, canvasState, frames } = useSpriteEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(0);

  // Only frames that have thumbnail content
  const playableFrames = frames.filter(f => f.thumbnail);
  const frameCount = playableFrames.length;
  const frameDuration = 1000 / (animationSettings.fps || 12);

  // Auto-play when dialog opens, reset when it closes
  useEffect(() => {
    if (open) {
      setCurrentFrameIndex(0);
      lastFrameTimeRef.current = 0;
      setIsPlaying(frameCount > 1);
    } else {
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [open, frameCount]);

  // Animation loop using requestAnimationFrame at the configured FPS
  useEffect(() => {
    if (!isPlaying || frameCount === 0) return;

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        setCurrentFrameIndex(prev => (prev + 1) % frameCount);
        lastFrameTimeRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, frameDuration, frameCount]);

  // Render current frame thumbnail onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = playableFrames[currentFrameIndex];
    if (!frame?.thumbnail) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fill background if not transparent
      ctx.fillStyle = canvasState.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply frame-specific opacity if set
      ctx.globalAlpha = (frame.opacity ?? 100) / 100;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Reset alpha for next frame
      ctx.globalAlpha = 1.0;
    };
    img.src = frame.thumbnail;
  }, [currentFrameIndex, playableFrames, canvasState.width, canvasState.height]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(p => {
      if (!p) lastFrameTimeRef.current = 0;
      return !p;
    });
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    lastFrameTimeRef.current = 0;
  }, []);

  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => (prev - 1 + frameCount) % frameCount);
  }, [frameCount]);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => (prev + 1) % frameCount);
  }, [frameCount]);

  const hasFrames = frameCount > 0;
  const totalSeconds = hasFrames ? (frameCount / (animationSettings.fps || 12)).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Animation Preview</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
          {/* Canvas — constrained so it never pushes past the dialog */}
          <div className="flex items-center justify-center bg-muted/20 rounded-lg p-4">
            {hasFrames ? (
              <canvas
                ref={canvasRef}
                width={canvasState.width}
                height={canvasState.height}
                className="border border-border shadow-lg max-w-full max-h-[40vh] object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p className="text-lg font-medium">No frames to preview</p>
                <p className="text-sm mt-1">Draw something on your frames first</p>
              </div>
            )}
          </div>

          {/* Frame scrubber */}
          {hasFrames && (
            <input
              type="range"
              min={0}
              max={frameCount - 1}
              value={currentFrameIndex}
              onChange={e => {
                setIsPlaying(false);
                setCurrentFrameIndex(parseInt(e.target.value));
              }}
              className="w-full accent-primary"
            />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button onClick={handleStepBack} variant="outline" size="icon" disabled={!hasFrames} title="Previous frame">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button onClick={handlePlayPause} size="lg" disabled={!hasFrames || frameCount < 2}>
              {isPlaying
                ? <><Pause className="w-4 h-4 mr-2" />Pause</>
                : <><Play className="w-4 h-4 mr-2" />Play</>
              }
            </Button>
            <Button onClick={handleReset} variant="outline" size="icon" disabled={!hasFrames} title="Reset">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button onClick={handleStepForward} variant="outline" size="icon" disabled={!hasFrames} title="Next frame">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>Frame {hasFrames ? currentFrameIndex + 1 : 0} / {frameCount}</span>
            <span>{animationSettings.fps} FPS</span>
            <span>{totalSeconds}s total</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimationPreview;
