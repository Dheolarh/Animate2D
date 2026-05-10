import React, { useState } from 'react';
import { Save, X, Play, ChevronDown, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AnimationSettings from './AnimationSettings';
import CanvasSettings from './CanvasSettings';
import AnimationPreview from '../preview/AnimationPreview';

interface SettingsPanelProps {
  onSave: () => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSave, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(false);

  const handleSaveAsAnimClip = () => {
    onSave();
  };

  const handleExportAsMP4 = () => {
    console.log('Export as MP4 with transparent:', transparentBackground);
  };

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
              Transparent
            </Label>
            <Switch
              id="transparent-bg"
              checked={transparentBackground}
              onCheckedChange={setTransparentBackground}
              className="scale-75 origin-right"
            />
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
              <Button size="sm" className="flex-1 h-8 text-xs font-medium bg-primary/90 hover:bg-primary">
                <Save className="w-3 h-3 mr-2" />
                Save
                <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={handleSaveAsAnimClip} className="cursor-pointer gap-2 p-2">
                <Save className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Save as .animclip</span>
                  <span className="text-[10px] text-muted-foreground">Editor library format</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsMP4} className="cursor-pointer gap-2 p-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Export as .mp4</span>
                  <span className="text-[10px] text-muted-foreground">Standard video format</span>
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
