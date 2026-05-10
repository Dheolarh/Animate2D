import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Timeline as TimelineType, SceneObject } from '@/types/animation';
import { cn } from '@/lib/utils';

interface TimelineProps {
  timeline: TimelineType;
  objects: SceneObject[];
  playheadTime: number;
  onPlayheadChange: (time: number) => void;
  isPlaying: boolean;
  selectedObjectId: string | null;
}

const Timeline: React.FC<TimelineProps> = ({
  timeline,
  objects,
  playheadTime,
  onPlayheadChange,
  isPlaying,
  selectedObjectId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const next = playheadTime + 1 / timeline.fps;
      onPlayheadChange(next >= timeline.duration ? 0 : next);
    }, 1000 / timeline.fps);

    return () => clearInterval(interval);
  }, [isPlaying, timeline.fps, timeline.duration, playheadTime, onPlayheadChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const pixelsPerSecond = 100;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;

    for (let i = 0; i <= timeline.duration; i++) {
      const x = i * pixelsPerSecond;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '10px monospace';
      ctx.fillText(`${i}s`, x + 4, 12);
    }

    const playheadX = playheadTime * pixelsPerSecond;
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX - 6, 10);
    ctx.lineTo(playheadX + 6, 10);
    ctx.closePath();
    ctx.fill();
  }, [timeline, playheadTime]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pixelsPerSecond = 100;
    const time = Math.max(0, Math.min(timeline.duration, x / pixelsPerSecond));
    onPlayheadChange(time);
  };

  return (
    <div className="h-full border-t bg-card flex flex-col">
      <div className="px-3 py-2 border-b flex-shrink-0">
        <h3 className="font-semibold text-sm">Timeline</h3>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full flex">
          <div className="w-48 border-r bg-muted/20 flex flex-col flex-shrink-0">
            <div className="h-8 border-b flex items-center px-3 text-xs font-semibold text-muted-foreground">
              Objects
            </div>
            <ScrollArea className="flex-1">
              {objects.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground">
                  No objects
                </div>
              ) : (
                <div>
                  {objects.map(obj => (
                    <div
                      key={obj.id}
                      className={cn(
                        'h-8 px-3 flex items-center text-xs border-b',
                        selectedObjectId === obj.id && 'bg-accent'
                      )}
                    >
                      {obj.name}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-x-auto min-w-0" ref={containerRef}>
            <canvas
              ref={canvasRef}
              width={timeline.duration * 100 + 100}
              height={Math.max(200, objects.length * 32 + 32)}
              className="cursor-pointer"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
