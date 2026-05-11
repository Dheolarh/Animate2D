import React, { useState } from 'react';
import { Save, X, Play, ChevronDown, Download, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AnimationSettings from './AnimationSettings';
import CanvasSettings from './CanvasSettings';
import AnimationPreview from '../preview/AnimationPreview';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { exportAsMP4, exportAsSpriteSheet } from '../utils/exportUtils';
import type { Project, SpriteSheetAsset } from '@/types/animation';
import { toast } from 'sonner';

interface SettingsPanelProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onSave: () => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ project, onProjectUpdate, onSave, onClose }) => {
  const { frames, animationSettings, canvasState } = useSpriteEditor();
  const [showPreview, setShowPreview] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);

  const exportOpts = {
    frames,
    fps: animationSettings.fps,
    width: canvasState.width,
    height: canvasState.height,
    transparent: transparentBackground,
    backgroundColor: canvasState.backgroundColor || '#ffffff',
  };

  const runExport = async (label: string, fn: () => Promise<void>) => {
    if (frames.filter(f => f.thumbnail).length === 0) {
      toast.error('No frames to export. Draw something first!');
      return;
    }
    setIsExporting(true);
    toast.loading(`${label}…`, { id: 'export' });
    try {
      await fn();
      toast.success(`${label} saved!`, { id: 'export' });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export: ${String(err)}`, { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBakeToSpriteSheet = async () => {
    if (frames.filter(f => f.thumbnail).length === 0) {
      toast.error('No frames to bake. Draw something first!');
      return;
    }
    
    setIsExporting(true);
    const id = toast.loading("Baking sprite sheet...");
    try {
      const sheet = await exportAsSpriteSheet(exportOpts);
      
      const newAsset: SpriteSheetAsset = {
        id: `sheet_${Date.now()}`,
        name: `${project.name} Baked`,
        type: 'spritesheet',
        url: sheet.url,
        cols: sheet.cols,
        rows: sheet.rows,
        frameCount: sheet.frameCount,
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
        fps: project.settings.fps,
        createdAt: Date.now()
      };

      const updatedProject = {
        ...project,
        assets: [...project.assets, newAsset]
      };
      
      onProjectUpdate(updatedProject);
      toast.success("Added to Sprite Library!", { id });
    } catch (err: any) {
      console.error(err);
      toast.error(`Baking failed: ${err.message}`, { id });
    } finally {
      setIsExporting(false);
    }
  };

  const mp4Label = 'Export as .mp4';

  return (
    <div className="w-60 border-r bg-card flex flex-col h-full overflow-hidden shrink-0 shadow-sm z-10 relative">
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <AnimationSettings />
        <Separator className="opacity-50" />
        <CanvasSettings />
        <Separator className="opacity-50" />
        
        {/* Export Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Download className="w-3 h-3" />
            <span>Export</span>
          </div>
          <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-transparent hover:border-border/50 transition-colors">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="transparent-bg" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Transparent BG
                </Label>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-[10px]">Export frames with transparent background</p>
              </TooltipContent>
            </Tooltip>
            <Switch
              id="transparent-bg"
              checked={transparentBackground}
              onCheckedChange={setTransparentBackground}
              className="scale-75 origin-right"
            />
          </div>

          {/* FFmpeg status removed — MP4 now uses native VideoEncoder, no download needed */}
        </div>
      </div>
      
      {/* Footer Action Buttons */}
      <div className="p-3 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 space-y-2 shrink-0">
        <Button 
          onClick={() => setShowPreview(true)} 
          variant="secondary" 
          size="sm" 
          className="w-full h-8 text-xs font-medium"
        >
          <Play className="w-3 h-3 mr-2 text-primary" />
          Preview
        </Button>
        
        <div className="flex gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs font-medium bg-primary/90 hover:bg-primary"
                disabled={isExporting}
              >
                {isExporting
                  ? <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  : <Save className="w-3 h-3 mr-2" />
                }
                {isExporting ? 'Exporting…' : 'Export'}
                <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">

              {/* MP4 — native VideoEncoder, no download required */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => runExport('MP4', () => exportAsMP4({
                      ...exportOpts,
                      onProgress: (r) => {
                        setEncodeProgress(r);
                        toast.loading(`Encoding MP4… ${Math.round(r * 100)}%`, { id: 'export' });
                      },
                    }))}
                    className="cursor-pointer gap-2 p-2"
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">Export as .mp4</span>
                    </div>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-[10px]">Universal video format (high quality, small size)</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenuSeparator />

              {/* Sprite Sheet — optimized for scenes */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={handleBakeToSpriteSheet}
                    className="cursor-pointer gap-2 p-2"
                    disabled={isExporting}
                  >
                    <Save className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">Save as sprite</span>
                    </div>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-[10px]">Turn into an optimized asset for your scenes</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AnimationPreview open={showPreview} onOpenChange={setShowPreview} />
    </div>
  );
};

export default SettingsPanel;
