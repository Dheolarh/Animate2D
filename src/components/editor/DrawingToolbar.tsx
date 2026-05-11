import React from 'react';
import { MousePointer2, Brush, Eraser, Square, Circle, Triangle, Type } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSpriteEditor } from './context/SpriteEditorContext';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DrawingToolbar: React.FC = () => {
  const { activeTool, setActiveTool, brushColor, changeBrushColor } = useSpriteEditor();

  // Extract RGBA values for the custom picker
  const [r, g, b, a] = React.useMemo(() => {
    // Basic parser for hex or rgba
    if (brushColor.startsWith('rgba')) {
      const parts = brushColor.match(/[\d.]+/g);
      return parts ? [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]), parseFloat(parts[3])] : [0,0,0,1];
    } else if (brushColor.startsWith('#')) {
      const hex = brushColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    }
    return [0, 0, 0, 1];
  }, [brushColor]);

  const updateColor = (newR: number, newG: number, newB: number, newA: number) => {
    changeBrushColor(`rgba(${newR}, ${newG}, ${newB}, ${newA})`);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    updateColor(r, g, b, a);
  };

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

      {/* Brush Settings */}
      <div className={cn(
        "flex flex-col items-center gap-3 w-full px-2 transition-opacity duration-200",
        ['eraser'].includes(activeTool) && "opacity-40 grayscale pointer-events-none"
      )}>
        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                 style={{ backgroundColor: brushColor }}>
            </div>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-64 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`}
                  onChange={handleHexChange}
                  className="w-8 h-8 rounded cursor-pointer p-0 border-0"
                  title="Base Color"
                />
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="255" value={r} onChange={e => updateColor(parseInt(e.target.value)||0, g, b, a)} className="w-12 h-7 text-xs text-center border rounded" />
                    <span className="text-[10px] text-muted-foreground">R</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="255" value={g} onChange={e => updateColor(r, parseInt(e.target.value)||0, b, a)} className="w-12 h-7 text-xs text-center border rounded" />
                    <span className="text-[10px] text-muted-foreground">G</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="255" value={b} onChange={e => updateColor(r, g, parseInt(e.target.value)||0, a)} className="w-12 h-7 text-xs text-center border rounded" />
                    <span className="text-[10px] text-muted-foreground">B</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Opacity (A)</label>
                <span className="text-[10px] font-mono">{Math.round(a * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={a}
                onChange={(e) => updateColor(r, g, b, parseFloat(e.target.value))}
                className="w-full appearance-none bg-border h-1.5 rounded-full cursor-pointer accent-primary"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DrawingToolbar;
