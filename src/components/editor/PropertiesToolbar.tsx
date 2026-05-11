import React, { useMemo } from 'react';
import { Trash2, Lock, Unlock, Settings2, Type, Paintbrush, Copy, ChevronsUp, ChevronsDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpriteEditor } from './context/SpriteEditorContext';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const FONTS = [
  "Arial", "Arial Black", "Comic Sans MS", "Courier New", 
  "Georgia", "Impact", "Lucida Console", "Lucida Sans Unicode", 
  "Palatino Linotype", "Tahoma", "Times New Roman", "Trebuchet MS", 
  "Verdana", "sans-serif", "serif", "monospace"
];

const PropertiesToolbar: React.FC = () => {
  const { 
    activeTool,
    brushSize, setBrushSize,
    hasSelection, isSelectionLocked, deleteSelection, toggleLockSelection, duplicateSelection,
    bringToFront, bringForward, sendBackward, sendToBack,
    shapeFillMode, changeShapeFillMode,
    textSize, changeTextSize,
    textFontFamily, changeTextFontFamily,
    textStrokeColor, changeTextStrokeColor,
    textStrokeWidth, changeTextStrokeWidth,
    textLineHeight, changeTextLineHeight,
    textCharSpacing, changeTextCharSpacing,
    isTextSelected
  } = useSpriteEditor();

  const isTextMode = activeTool === 'text' || isTextSelected;

  const showToolbar = activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle' || activeTool === 'text' || hasSelection;

  // Must be called unconditionally BEFORE any early returns (Rules of Hooks)
  // Extract RGBA for text stroke color picker
  const [r, g, b, a] = useMemo(() => {
    if (textStrokeColor.startsWith('rgba')) {
      const parts = textStrokeColor.match(/[\d.]+/g);
      return parts ? [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]), parseFloat(parts[3])] : [0,0,0,1];
    } else if (textStrokeColor.startsWith('#')) {
      const hex = textStrokeColor.replace('#', '');
      const rv = parseInt(hex.substring(0, 2), 16);
      const gv = parseInt(hex.substring(2, 4), 16);
      const bv = parseInt(hex.substring(4, 6), 16);
      const av = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
      return [rv, gv, bv, av];
    }
    return [0, 0, 0, 1];
  }, [textStrokeColor]);

  if (!showToolbar) return null;

  const updateStrokeColor = (newR: number, newG: number, newB: number, newA: number) => {
    changeTextStrokeColor(`rgba(${newR}, ${newG}, ${newB}, ${newA})`);
  };

  const handleStrokeHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const rv = parseInt(hex.substring(1, 3), 16);
    const gv = parseInt(hex.substring(3, 5), 16);
    const bv = parseInt(hex.substring(5, 7), 16);
    updateStrokeColor(rv, gv, bv, a);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-16 border-l border-border bg-card flex flex-col items-center py-4 gap-4 z-20 shadow-sm animate-in fade-in slide-in-from-right-4 duration-200">
      
      {/* 1. ERASER, BRUSH or SHAPES */}
      {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle') && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">{brushSize}px</span>
          <div className="h-32 flex items-center justify-center py-2">
            <input 
              type="range" min="1" max="100" value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-28 -rotate-90 appearance-none bg-border h-1.5 rounded-full cursor-pointer accent-primary"
              title="Stroke Size"
            />
          </div>
        </div>
      )}

      {/* 2. SHAPES (Rectangle, Circle, Triangle) */}
      {(activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle') && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground">Style</span>
          <div className="flex flex-col gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={shapeFillMode === 'stroke' ? 'secondary' : 'ghost'} size="sm"
              className={cn("h-7 px-2 text-[10px]", shapeFillMode === 'stroke' && "bg-background shadow-sm")}
              onClick={() => changeShapeFillMode('stroke')}
            >
              Stroke
            </Button>
            <Button
              variant={shapeFillMode === 'fill' ? 'secondary' : 'ghost'} size="sm"
              className={cn("h-7 px-2 text-[10px]", shapeFillMode === 'fill' && "bg-background shadow-sm")}
              onClick={() => changeShapeFillMode('fill')}
            >
              Fill
            </Button>
          </div>
        </div>
      )}

      {/* 3. TEXT */}
      {isTextMode && (
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <span className="text-[10px] font-medium text-muted-foreground">Text</span>
          
          {/* Font Selector Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" title="Font Family">
                <Type className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-48 max-h-64 overflow-y-auto p-2" onWheel={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 px-2">Font Family</label>
                {FONTS.map(font => (
                  <Button 
                    key={font} variant={textFontFamily === font ? "secondary" : "ghost"} 
                    className="justify-start text-xs h-8" style={{ fontFamily: font }}
                    onClick={() => changeTextFontFamily(font)}
                  >
                    {font}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Size & Spacing Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" title="Size & Spacing">
                <Settings2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-56 p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                  <span className="text-[10px] font-mono">{textSize}px</span>
                </div>
                <input type="range" min="8" max="150" value={textSize} onChange={(e) => changeTextSize(parseInt(e.target.value))} className="accent-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Line Height</label>
                  <span className="text-[10px] font-mono">{textLineHeight}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.1" value={textLineHeight} onChange={(e) => changeTextLineHeight(parseFloat(e.target.value))} className="accent-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Char Spacing</label>
                  <span className="text-[10px] font-mono">{textCharSpacing}</span>
                </div>
                <input type="range" min="-100" max="800" value={textCharSpacing} onChange={(e) => changeTextCharSpacing(parseInt(e.target.value))} className="accent-primary" />
              </div>
            </PopoverContent>
          </Popover>

          {/* Stroke Properties Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" title="Text Stroke">
                <Paintbrush className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-64 p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Stroke Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`} onChange={handleStrokeHexChange} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center"><input type="number" min="0" max="255" value={r} onChange={e => updateStrokeColor(parseInt(e.target.value)||0, g, b, a)} className="w-12 h-7 text-xs text-center border rounded" /><span className="text-[10px] text-muted-foreground">R</span></div>
                    <div className="flex flex-col items-center"><input type="number" min="0" max="255" value={g} onChange={e => updateStrokeColor(r, parseInt(e.target.value)||0, b, a)} className="w-12 h-7 text-xs text-center border rounded" /><span className="text-[10px] text-muted-foreground">G</span></div>
                    <div className="flex flex-col items-center"><input type="number" min="0" max="255" value={b} onChange={e => updateStrokeColor(r, g, parseInt(e.target.value)||0, a)} className="w-12 h-7 text-xs text-center border rounded" /><span className="text-[10px] text-muted-foreground">B</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Stroke Opacity</label>
                  <span className="text-[10px] font-mono">{Math.round(a * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={a} onChange={(e) => updateStrokeColor(r, g, b, parseFloat(e.target.value))} className="accent-primary" />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Stroke Width</label>
                  <span className="text-[10px] font-mono">{textStrokeWidth}px</span>
                </div>
                <input type="range" min="0" max="20" value={textStrokeWidth} onChange={(e) => changeTextStrokeWidth(parseInt(e.target.value))} className="accent-primary" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Layer ordering & Object actions — for all tools except eraser, when something is selected */}
      {hasSelection && activeTool !== 'eraser' && (
        <>
          <Separator className="w-8 mt-auto" />
          <div className="flex flex-col items-center gap-1 mb-1">
            {/* Layer controls */}
            <button
              onClick={bringToFront}
              className="w-10 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Bring to Front"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button
              onClick={bringForward}
              className="w-10 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Move Up One Layer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={sendBackward}
              className="w-10 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Move Down One Layer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={sendToBack}
              className="w-10 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>

            <Separator className="w-6 my-1" />

            {/* Object actions */}
            <Button
              variant="ghost" size="icon" className="w-10 h-10 rounded-xl"
              onClick={toggleLockSelection} title={isSelectionLocked ? "Unlock Object" : "Lock Object"}
            >
              {isSelectionLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost" size="icon" className="w-10 h-10 rounded-xl"
              onClick={duplicateSelection} title="Duplicate Object (Ctrl+D)"
            >
              <Copy className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={deleteSelection} title="Delete Object (Del)"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesToolbar;
