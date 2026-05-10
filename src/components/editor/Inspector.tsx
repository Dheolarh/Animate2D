import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SceneObject } from '@/types/animation';

interface InspectorProps {
  selectedObject: SceneObject | undefined;
  onUpdateObject: (objectId: string, updates: Partial<SceneObject>) => void;
}

const Inspector: React.FC<InspectorProps> = ({ selectedObject, onUpdateObject }) => {
  if (!selectedObject) {
    return (
      <div className="w-72 border-l bg-card flex items-center justify-center">
        <div className="text-sm text-muted-foreground text-center p-4">
          Select an object to view properties
        </div>
      </div>
    );
  }

  const handleTransformChange = (key: keyof SceneObject['transform'], value: number) => {
    onUpdateObject(selectedObject.id, {
      transform: {
        ...selectedObject.transform,
        [key]: value
      }
    });
  };

  return (
    <div className="w-72 border-l bg-card flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Inspector</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground">OBJECT</Label>
            <div className="mt-2 space-y-3">
              <div>
                <Label htmlFor="obj-name" className="text-sm">Name</Label>
                <Input
                  id="obj-name"
                  value={selectedObject.name}
                  onChange={(e) => onUpdateObject(selectedObject.id, { name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs font-semibold text-muted-foreground">TRANSFORM</Label>
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="pos-x" className="text-sm">Position X</Label>
                  <Input
                    id="pos-x"
                    type="number"
                    value={selectedObject.transform.x}
                    onChange={(e) => handleTransformChange('x', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pos-y" className="text-sm">Position Y</Label>
                  <Input
                    id="pos-y"
                    type="number"
                    value={selectedObject.transform.y}
                    onChange={(e) => handleTransformChange('y', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rotation" className="text-sm">Rotation</Label>
                <Input
                  id="rotation"
                  type="number"
                  value={selectedObject.transform.rotation}
                  onChange={(e) => handleTransformChange('rotation', Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="scale-x" className="text-sm">Scale X</Label>
                  <Input
                    id="scale-x"
                    type="number"
                    step="0.1"
                    value={selectedObject.transform.scaleX}
                    onChange={(e) => handleTransformChange('scaleX', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="scale-y" className="text-sm">Scale Y</Label>
                  <Input
                    id="scale-y"
                    type="number"
                    step="0.1"
                    value={selectedObject.transform.scaleY}
                    onChange={(e) => handleTransformChange('scaleY', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs font-semibold text-muted-foreground">APPEARANCE</Label>
            <div className="mt-2 space-y-3">
              <div>
                <Label htmlFor="opacity" className="text-sm">Opacity</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[selectedObject.opacity]}
                    onValueChange={([value]) => onUpdateObject(selectedObject.id, { opacity: value })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {Math.round(selectedObject.opacity * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="visible" className="text-sm">Visible</Label>
                <Switch
                  id="visible"
                  checked={selectedObject.visible}
                  onCheckedChange={(checked) => onUpdateObject(selectedObject.id, { visible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="flip-h" className="text-sm">Flip Horizontal</Label>
                <Switch
                  id="flip-h"
                  checked={selectedObject.flipHorizontal}
                  onCheckedChange={(checked) => onUpdateObject(selectedObject.id, { flipHorizontal: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="flip-v" className="text-sm">Flip Vertical</Label>
                <Switch
                  id="flip-v"
                  checked={selectedObject.flipVertical}
                  onCheckedChange={(checked) => onUpdateObject(selectedObject.id, { flipVertical: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="locked" className="text-sm">Locked</Label>
                <Switch
                  id="locked"
                  checked={selectedObject.locked}
                  onCheckedChange={(checked) => onUpdateObject(selectedObject.id, { locked: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Inspector;
