import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/animation';

interface PreviewModeProps {
  project: Project;
  playheadTime: number;
  onClose: () => void;
}

const PreviewMode: React.FC<PreviewModeProps> = ({ project, playheadTime, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          title="Exit Preview (ESC)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Preview Mode</h2>
          <p className="text-muted-foreground mb-2">
            Full-canvas playback view
          </p>
          <p className="text-sm text-muted-foreground">
            Press ESC or click the X button to return to Scene Mode
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewMode;
