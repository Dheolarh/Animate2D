import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SquareDashed, Globe } from 'lucide-react';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { Button } from '@/components/ui/button';

// Basic color parser to handle both hex and rgba
const parseColor = (color: string) => {
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    if (match) {
      return { 
        r: parseInt(match[1]), 
        g: parseInt(match[2]), 
        b: parseInt(match[3]), 
        a: match[4] !== undefined ? parseFloat(match[4]) : 1 
      };
    }
  } else if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1
      };
    }
  }
  return { r: 255, g: 255, b: 255, a: 1 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const CanvasSettings: React.FC = () => {
  const { canvasState, setCanvasState, currentFrameId, frames, setFrameBackgroundColor } = useSpriteEditor();

  const currentFrame = frames.find(f => f.id === currentFrameId);
  const activeBgColor = currentFrame?.backgroundColor || canvasState.backgroundColor || '#ffffff';

  const handleBackgroundColorChange = (color: string) => {
    if (currentFrameId) {
      setFrameBackgroundColor(currentFrameId, color, false);
    }
  };

  const applyColorToAll = () => {
    if (currentFrameId) {
      setFrameBackgroundColor(currentFrameId, activeBgColor, true);
      setCanvasState({ ...canvasState, backgroundColor: activeBgColor });
    }
  };

  const parsed = useMemo(() => parseColor(activeBgColor), [activeBgColor]);
  const pickerHex = rgbToHex(parsed.r, parsed.g, parsed.b);
  const opacityPercent = Math.round(parsed.a * 100);

  const handlePickerChange = (newHex: string) => {
    const { r, g, b } = hexToRgb(newHex);
    // Keep 2 decimal places for cleaner rgba strings
    handleBackgroundColorChange(`rgba(${r}, ${g}, ${b}, ${Number(parsed.a.toFixed(2))})`);
  };

  const handleOpacityChange = (newOpacityPercent: number) => {
    const newA = newOpacityPercent / 100;
    handleBackgroundColorChange(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${newA})`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <SquareDashed className="w-3 h-3" />
        <span>Canvas</span>
      </div>
      
      <div className="space-y-3">
        {/* Color Picker & Input Row */}
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="bg-color" className="text-[10px] uppercase font-bold text-muted-foreground w-10 shrink-0">
            Color
          </Label>
          <div className="flex items-center gap-1 w-full relative">
            <div 
              className="w-5 h-5 rounded-md border border-border shrink-0 absolute left-1 top-1 overflow-hidden shadow-inner z-10"
              style={{ 
                backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGAQYKABjAhlVEMDmgZ1AAAbVwA1rT00+QAAAABJRU5ErkJggg==")'
              }}
            >
              <div className="w-full h-full" style={{ backgroundColor: activeBgColor }} />
              <input
                id="bg-color"
                type="color"
                value={pickerHex}
                onChange={(e) => handlePickerChange(e.target.value)}
                className="opacity-0 w-full h-full cursor-pointer absolute inset-0 z-10"
              />
            </div>
            <Input
              type="text"
              value={activeBgColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="h-7 text-xs pl-7 pr-7 bg-muted/50 border-transparent hover:border-border focus:bg-background transition-colors font-mono lowercase"
              placeholder="rgba(255, 255, 255, 1)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={applyColorToAll}
              className="h-5 w-5 absolute right-1 top-1 rounded hover:bg-primary/20 hover:text-primary transition-all z-10"
              title="Apply to all frames"
            >
              <Globe className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Alpha/Opacity Slider */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground w-16 shrink-0">
            Alpha
          </Label>
          <div className="flex items-center gap-2 w-full">
            <Slider
              value={[opacityPercent]}
              max={100}
              step={1}
              onValueChange={(vals) => handleOpacityChange(vals[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground font-mono w-8 text-right">
              {opacityPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasSettings;
