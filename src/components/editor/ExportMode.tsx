import React, { useState } from 'react';
import { Download, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Project } from '@/types/animation';
import { toast } from 'sonner';

interface ExportModeProps {
  project: Project;
  onClose: () => void;
}

const ExportMode: React.FC<ExportModeProps> = ({ project, onClose }) => {
  const [resolution, setResolution] = useState('480p');
  const [frameRate, setFrameRate] = useState('24');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Export complete! (MVP: Simplified export)');
    }, 2000);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Configure your video export settings</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Free Tier:</strong> Exports include a watermark. Video export functionality is simplified in this MVP version.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Resolution</Label>
              <RadioGroup value={resolution} onValueChange={setResolution}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="480p" id="480p" />
                  <Label htmlFor="480p" className="font-normal cursor-pointer">
                    480p (854 × 480) - Free
                  </Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="720p" id="720p" disabled />
                  <Label htmlFor="720p" className="font-normal cursor-not-allowed flex items-center gap-2">
                    720p (1280 × 720) - Pro
                    <Lock className="w-3 h-3" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="1080p" id="1080p" disabled />
                  <Label htmlFor="1080p" className="font-normal cursor-not-allowed flex items-center gap-2">
                    1080p (1920 × 1080) - Pro
                    <Lock className="w-3 h-3" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="4k" id="4k" disabled />
                  <Label htmlFor="4k" className="font-normal cursor-not-allowed flex items-center gap-2">
                    4K (3840 × 2160) - Ultra
                    <Lock className="w-3 h-3" />
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Frame Rate</Label>
              <RadioGroup value={frameRate} onValueChange={setFrameRate}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24" id="24fps" />
                  <Label htmlFor="24fps" className="font-normal cursor-pointer">
                    24 fps (Cinematic)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="30fps" />
                  <Label htmlFor="30fps" className="font-normal cursor-pointer">
                    30 fps (Standard)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60" id="60fps" />
                  <Label htmlFor="60fps" className="font-normal cursor-pointer">
                    60 fps (Smooth)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">Export Range</div>
                  <div className="text-sm text-muted-foreground">
                    Full scene (0s - {project.scene.timeline.duration}s)
                  </div>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Video'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Free tier exports include a "Made with Animate 2D" watermark
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportMode;
