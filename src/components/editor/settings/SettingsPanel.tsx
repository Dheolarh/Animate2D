import React, { useState, useEffect } from 'react';
import { Save, X, Play, ChevronDown, Download, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
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
import AnimationSettings from './AnimationSettings';
import CanvasSettings from './CanvasSettings';
import AnimationPreview from '../preview/AnimationPreview';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { exportAsGif, exportAsWebM, exportAsMP4 } from '../utils/exportUtils';
import { warmupFFmpeg } from '../utils/ffmpegLoader';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onSave: () => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSave, onClose }) => {
  const { frames, animationSettings, canvasState } = useSpriteEditor();
  const [showPreview, setShowPreview] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegProgress, setFfmpegProgress] = useState(0); // 0-1 loading progress

  // Start downloading FFmpeg WASM in the background as soon as the panel opens.
  // By the time the user clicks "Export MP4" it will already be cached.
  useEffect(() => {
    let cancelled = false;

    warmupFFmpeg(); // fire-and-forget background download

    // Track progress for the MP4 button label
    import('../utils/ffmpegLoader').then(({ getFFmpeg }) => {
      getFFmpeg((ratio) => {
        if (!cancelled) setFfmpegProgress(ratio);
      })
        .then(() => { if (!cancelled) setFfmpegReady(true); })
        .catch(() => {}); // silently ignore — user can retry via export click
    });

    return () => { cancelled = true; };
  }, []);

  const exportOpts = {
    frames,
    fps: animationSettings.fps,
    width: canvasState.width,
    height: canvasState.height,
    transparent: transparentBackground,
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

  const mp4Label = ffmpegReady
    ? 'Export as .mp4'
    : ffmpegProgress > 0
      ? `Preparing… ${Math.round(ffmpegProgress * 100)}%`
      : 'Export as .mp4 (loading…)';

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
            <Label htmlFor="transparent-bg" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              Transparent bg
            </Label>
            <Switch
              id="transparent-bg"
              checked={transparentBackground}
              onCheckedChange={setTransparentBackground}
              className="scale-75 origin-right"
            />
          </div>

          {/* FFmpeg status pill */}
          <div className="flex items-center gap-1.5 px-1">
            {ffmpegReady ? (
              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
            ) : (
              <Loader2 className="w-3 h-3 text-muted-foreground animate-spin flex-shrink-0" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {ffmpegReady
                ? 'MP4 encoder ready'
                : ffmpegProgress > 0
                  ? `Downloading MP4 encoder… ${Math.round(ffmpegProgress * 100)}%`
                  : 'Downloading MP4 encoder in background'}
            </span>
          </div>
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
              {/* GIF — animated clip for scenes */}
              <DropdownMenuItem
                onClick={() => runExport('GIF', () => exportAsGif(exportOpts))}
                className="cursor-pointer gap-2 p-2"
                disabled={isExporting}
              >
                <Save className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Save as .gif</span>
                  <span className="text-[10px] text-muted-foreground">Animated clip for scenes</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* WebM — quick device export */}
              <DropdownMenuItem
                onClick={() => runExport('WebM', () => exportAsWebM(exportOpts))}
                className="cursor-pointer gap-2 p-2"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Export as .webm</span>
                  <span className="text-[10px] text-muted-foreground">Fast — Chrome/Firefox/Edge</span>
                </div>
              </DropdownMenuItem>

              {/* MP4 — via FFmpeg WASM */}
              <DropdownMenuItem
                onClick={() => runExport('MP4', () => exportAsMP4({
                  ...exportOpts,
                  onFFmpegProgress: (r) => {
                    toast.loading(`Encoding MP4… ${Math.round(r * 100)}%`, { id: 'export' });
                  },
                }))}
                className="cursor-pointer gap-2 p-2"
                disabled={isExporting}
              >
                {ffmpegReady
                  ? <Download className="w-4 h-4 text-muted-foreground" />
                  : <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                }
                <div className="flex flex-col">
                  <span className="font-medium text-xs">{mp4Label}</span>
                  <span className="text-[10px] text-muted-foreground">Universal — plays everywhere</span>
                </div>
              </DropdownMenuItem>
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
