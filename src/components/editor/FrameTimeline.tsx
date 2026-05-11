import React, { useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Copy, Trash2, GripVertical } from 'lucide-react';
import { useSpriteEditor } from './context/SpriteEditorContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const FrameTimeline: React.FC = () => {
  const { 
    frames, 
    currentFrameId, 
    selectFrame, 
    addFrame, 
    duplicateFrame, 
    deleteFrame,
    reorderFrames,
    onionSkinFrameCount,
    setOnionSkinFrameCount,
    setFrameOpacity,
    onionSkinOpacity,
    setOnionSkinOpacity,
    canvasState
  } = useSpriteEditor();

  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentFrame = frames.find(f => f.id === currentFrameId);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Slightly transparent while dragging
    (e.currentTarget as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderFrames(fromIndex, toIndex);
    }
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  return (
    <div className="h-40 border-t border-border bg-card flex flex-col flex-shrink-0">
      <div className="h-8 border-b border-border flex items-center px-4 justify-between bg-muted/30">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frames</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-border pr-4">
            <label htmlFor="frameOpacity" className="text-[10px] font-medium text-muted-foreground uppercase cursor-pointer" title="Opacity of the currently selected frame (affects final export)">
              Frame Opacity:
            </label>
            <div className="flex items-center gap-1">
              <input 
                id="frameOpacity"
                type="number" 
                min="0" 
                max="100" 
                value={currentFrame?.opacity ?? 100}
                onChange={(e) => currentFrameId && setFrameOpacity(currentFrameId, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-12 h-6 bg-background border border-border rounded text-xs px-1 text-center font-mono outline-none focus:border-primary"
                title="Selected Frame Opacity (0-100)"
              />
              <span className="text-[10px] text-muted-foreground">%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 border-r border-border pr-4">
            <label htmlFor="onionSkin" className="text-[10px] font-medium text-muted-foreground uppercase cursor-pointer" title="Number of previous frames to ghost underneath the active canvas">
              Onion Skin:
            </label>
            <div className="flex items-center gap-1">
              <input 
                id="onionSkin"
                type="number" 
                min="0" 
                max="50" 
                value={onionSkinFrameCount}
                onChange={(e) => setOnionSkinFrameCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 h-6 bg-background border border-border rounded text-xs px-1 text-center font-mono outline-none focus:border-primary"
                title="Frames to show (0 to disable)"
              />
              <span className="text-[10px] text-muted-foreground">F</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-r border-border pr-4">
            <label htmlFor="onionSkinOpacity" className="text-[10px] font-medium text-muted-foreground uppercase cursor-pointer" title="Opacity of the ghosted frames (editor only)">
              Ghost Opacity:
            </label>
            <div className="flex items-center gap-1">
              <input 
                id="onionSkinOpacity"
                type="number" 
                min="0" 
                max="100" 
                value={onionSkinOpacity}
                onChange={(e) => setOnionSkinOpacity(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-12 h-6 bg-background border border-border rounded text-xs px-1 text-center font-mono outline-none focus:border-primary"
                title="Ghosting Opacity (0-100)"
              />
              <span className="text-[10px] text-muted-foreground">%</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {frames.length} Frame{frames.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-2">
        <ScrollArea className="w-full h-full whitespace-nowrap">
          <div className="flex items-center gap-2 h-full pb-3">
            {frames.map((frame, index) => (
              <div
                key={frame.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => selectFrame(frame.id)}
                className={cn(
                  "relative group flex-shrink-0 w-24 h-24 rounded-md border-2 overflow-hidden cursor-pointer transition-all bg-muted select-none",
                  currentFrameId === frame.id 
                    ? "border-primary shadow-sm" 
                    : "border-transparent hover:border-border",
                  dragOverIndex === index && dragIndexRef.current !== index
                    ? "border-primary/70 ring-2 ring-primary/40 scale-105"
                    : ""
                )}
              >
                {/* Frame Number */}
                <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm text-[9px] font-mono px-1 rounded text-foreground z-10">
                  {index + 1}
                </div>

                {/* Drag handle (visible on hover) */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-70 transition-opacity z-10 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3 text-muted-foreground rotate-90" />
                </div>

                {/* Actions (visible on hover) */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateFrame(frame.id); }}
                    className="p-1 bg-background/80 backdrop-blur-sm hover:bg-background rounded text-foreground transition-colors"
                    title="Duplicate Frame"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {frames.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFrame(frame.id); }}
                      className="p-1 bg-destructive/80 backdrop-blur-sm hover:bg-destructive text-destructive-foreground rounded transition-colors"
                      title="Delete Frame"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="w-full h-full flex items-center justify-center p-1" style={{
                  backgroundColor: !canvasState.showTransparentFrame ? (frame.backgroundColor || canvasState.backgroundColor || '#ffffff') : 'transparent',
                  backgroundImage: canvasState.showTransparentFrame ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGAQYKABjAhlVEMDmgZ1AAAbVwA1rT00+QAAAABJRU5ErkJggg==")' : 'none',
                  backgroundSize: '10px 10px'
                }}>
                  {frame.thumbnail ? (
                    <img 
                      src={frame.thumbnail} 
                      alt={`Frame ${index + 1}`} 
                      className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium">Empty</span>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="icon"
              className="w-24 h-24 flex-shrink-0 border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex flex-col gap-2 rounded-md"
              onClick={addFrame}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add Frame</span>
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default FrameTimeline;
