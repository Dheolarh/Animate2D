import React from 'react';
import { ArrowLeft, Play, Pause, Square, Download, Pencil, MousePointer2, Sparkles, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { EditorMode } from '@/types/animation';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '@/config/features';
import DevelopmentNotice from '@/components/common/DevelopmentNotice';

interface TopToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  projectName: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  isAssistantOpen?: boolean;
  onAssistantToggle?: () => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  mode,
  onModeChange,
  projectName,
  isPlaying,
  onPlayPause,
  onStop,
  saveStatus = 'saved',
  isAssistantOpen = false,
  onAssistantToggle,
}) => {
  const navigate = useNavigate();
  const [showDevNotice, setShowDevNotice] = React.useState(false);

  // Ctrl+Shift+6 shortcut removed as downloadSourceZip is unavailable

  const handleModeChange = (newMode: EditorMode) => {
    if (FEATURES.DEV_MODE && (newMode === 'scene' || newMode === 'export')) {
      setShowDevNotice(true);
      return;
    }
    onModeChange(newMode);
  };

  const handlePlaybackAction = (action: () => void) => {
    if (FEATURES.DEV_MODE) {
      setShowDevNotice(true);
      return;
    }
    action();
  };

  return (
    <div className="h-16 border-b bg-gradient-to-b from-card to-card/95 backdrop-blur-sm flex items-center px-6 justify-between shadow-sm relative">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/projects')}
          title="Back to Projects"
          className="rounded-full hover:bg-accent/80 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="font-semibold text-sm truncate max-w-xs px-3 py-1.5 rounded-md bg-muted/50" title={projectName}>
          {projectName.length > 10 ? projectName.substring(0, 10) + '...' : projectName}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(value) => value && handleModeChange(value as EditorMode)}
          className="bg-muted/30 rounded-lg p-1 shadow-inner"
        >
          <ToggleGroupItem 
            value="sprite" 
            aria-label="Editor"
            className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 hover:scale-105"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editor
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="scene" 
            aria-label="Scene Mode"
            className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 hover:scale-105"
          >
            <MousePointer2 className="w-4 h-4 mr-2" />
            Scene
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Center Section */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        {mode !== 'sprite' && (
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1 shadow-inner">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePlaybackAction(onPlayPause)}
              title={isPlaying ? 'Pause' : 'Play'}
              className="rounded-md hover:bg-accent/80 transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePlaybackAction(onStop)}
              title="Stop"
              className="rounded-md hover:bg-accent/80 transition-all duration-200 hover:scale-105"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {saveStatus === 'saved' && (
          <div className="text-xs text-muted-foreground font-mono px-3 py-1.5 rounded-md bg-muted/50">
            All changes saved
          </div>
        )}
        {saveStatus === 'saving' && (
          <div className="text-xs text-muted-foreground font-mono px-3 py-1.5 rounded-md bg-muted/50 animate-pulse">
            Auto-saving...
          </div>
        )}
        {saveStatus === 'unsaved' && (
          <div className="text-xs text-orange-500 font-mono px-3 py-1.5 rounded-md bg-muted/50">
            Unsaved changes
          </div>
        )}

        {/* Download source code for debugging — button hidden, functionality preserved via keyboard shortcut Ctrl+Shift+S */}

        {mode !== 'sprite' && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant={mode === 'export' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleModeChange('export')}
              title="Export"
              className="rounded-full hover:bg-accent/80 transition-all duration-200 hover:scale-105"
            >
              <Download className="w-4 h-4" />
            </Button>
          </>
        )}

        {onAssistantToggle && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onAssistantToggle}
              title={isAssistantOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
              className={`rounded-full transition-all duration-200 hover:scale-105 ${
                isAssistantOpen
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'hover:bg-accent/80'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <DevelopmentNotice 
        isOpen={showDevNotice} 
        onClose={() => setShowDevNotice(false)} 
      />
    </div>
  );
};

export default TopToolbar;
