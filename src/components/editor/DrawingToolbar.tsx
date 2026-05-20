import React from 'react';
import { MousePointer2, Brush, Eraser, Square, Circle, Triangle, Type } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSpriteEditor } from './context/SpriteEditorContext';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { GradientColorPicker } from '@/components/ui/gradient-color-picker';

const DrawingToolbar: React.FC = () => {
  const { activeTool, setActiveTool, brushColor, changeBrushColor } = useSpriteEditor();

  return (
    <div className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-4 z-10 shadow-sm flex-shrink-0 overflow-y-auto no-scrollbar">
      <ToggleGroup 
        type="single" 
        value={activeTool} 
        onValueChange={(val) => val && setActiveTool(val as any)}
        className="flex flex-col gap-2"
      >
        <ToggleGroupItem 
          value="select" 
          aria-label="Select Tool"
          className="w-10 h-10 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all"
          title="Select"
        >
          <MousePointer2 className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="brush" 
          aria-label="Brush Tool"
          className="w-10 h-10 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all"
          title="Brush"
        >
          <Brush className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="eraser" 
          aria-label="Eraser Tool"
          className="w-10 h-10 rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all"
          title="Eraser"
        >
          <Eraser className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="rectangle" aria-label="Rectangle Tool" className="w-10 h-10 rounded-xl data-[state=on]:bg-primary/20 data-[state=on]:text-primary" title="Rectangle (R)">
          <Square className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="circle" aria-label="Circle Tool" className="w-10 h-10 rounded-xl data-[state=on]:bg-primary/20 data-[state=on]:text-primary" title="Circle (C)">
          <Circle className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="triangle" aria-label="Triangle Tool" className="w-10 h-10 rounded-xl data-[state=on]:bg-primary/20 data-[state=on]:text-primary" title="Triangle">
          <Triangle className="w-5 h-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="text" aria-label="Text Tool" className="w-10 h-10 rounded-xl data-[state=on]:bg-primary/20 data-[state=on]:text-primary" title="Text (T)">
          <Type className="w-5 h-5" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator className="w-8" />

      {/* Color picker — disabled for eraser */}
      <div className={cn(
        "flex flex-col items-center gap-3 w-full px-2 transition-opacity duration-200",
        activeTool === 'eraser' && "opacity-40 grayscale pointer-events-none",
      )}>
        <GradientColorPicker
          value={brushColor}
          onChange={changeBrushColor}
          side="right"
        />
      </div>
    </div>
  );
};

export default DrawingToolbar;
