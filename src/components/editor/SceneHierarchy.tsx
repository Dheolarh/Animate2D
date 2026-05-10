import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { SceneObject, Layer } from '@/types/animation';
import { cn } from '@/lib/utils';

interface SceneHierarchyProps {
  objects: SceneObject[];
  layers: Layer[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
}

const SceneHierarchy: React.FC<SceneHierarchyProps> = ({
  objects,
  layers,
  selectedObjectId,
  onSelectObject,
  onDeleteObject
}) => {
  const sortedObjects = [...objects].sort((a, b) => {
    const layerA = layers.find(l => l.id === a.layer);
    const layerB = layers.find(l => l.id === b.layer);
    return (layerB?.order || 0) - (layerA?.order || 0);
  });

  return (
    <div className="w-64 border-r bg-card flex flex-col flex-shrink-0">
      <div className="px-3 py-2 border-b">
        <h3 className="font-semibold text-sm">Scene Objects</h3>
      </div>

      <ScrollArea className="flex-1">
        {sortedObjects.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No objects in scene.
            <br />
            Drag assets from library to add.
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedObjects.map(obj => {
              const layer = layers.find(l => l.id === obj.layer);
              return (
                <div
                  key={obj.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors group',
                    selectedObjectId === obj.id && 'bg-accent'
                  )}
                  onClick={() => onSelectObject(obj.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{obj.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {layer?.name || 'No Layer'} • {obj.type}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(obj.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SceneHierarchy;
