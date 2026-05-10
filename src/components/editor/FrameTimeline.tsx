import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Copy, Trash2 } from 'lucide-react';
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
    onionSkinFrameCount,
    setOnionSkinFrameCount
  } = useSpriteEditor();

  return (
    <div className="h-40 border-t border-border bg-card flex flex-col flex-shrink-0">
      <div className="h-8 border-b border-border flex items-center px-4 justify-between bg-muted/30">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frames</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-border pr-4">
            <label htmlFor="onionSkin" className="text-[10px] font-medium text-muted-foreground uppercase cursor-pointer" title="Number of previous frames to ghost underneath the active canvas">
              Onion Skin:
            </label>
            <input 
              id="onionSkin"
              type="number" 
              min="0" 
              max="10" 
              value={onionSkinFrameCount}
              onChange={(e) => setOnionSkinFrameCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-10 h-6 bg-background border border-border rounded text-xs px-1 text-center font-mono outline-none focus:border-primary"
              title="Frames to show (0 to disable)"
            />
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
                onClick={() => selectFrame(frame.id)}
                className={cn(
                  "relative group flex-shrink-0 w-24 h-24 rounded-md border-2 overflow-hidden cursor-pointer transition-all bg-muted",
                  currentFrameId === frame.id 
                    ? "border-primary shadow-sm" 
                    : "border-transparent hover:border-border"
                )}
              >
                {/* Frame Number */}
                <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm text-[9px] font-mono px-1 rounded text-foreground z-10">
                  {index + 1}
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
                  backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGAQYKABjAhlVEMDmgZ1AAAbVwA1rT00+QAAAABJRU5ErkJggg==")',
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
