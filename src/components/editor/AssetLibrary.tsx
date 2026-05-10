import React, { useState } from 'react';
import { Folder, FolderOpen, Image, Film, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { Asset, Project, SceneObject } from '@/types/animation';
import { getAllSampleAssets } from '@/lib/sampleAnimations';
import { cn } from '@/lib/utils';

interface AssetLibraryProps {
  assets: Asset[];
  onAddObject: (object: SceneObject) => void;
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({
  assets,
  onAddObject,
  project,
  onProjectUpdate
}) => {
  const [selectedTab, setSelectedTab] = useState('library');
  const sampleAssets = getAllSampleAssets();

  const handleAddAssetToScene = (asset: Asset) => {
    const newObject: SceneObject = {
      id: `obj_${Date.now()}`,
      name: asset.name,
      type: asset.type === 'sprite' ? 'sprite' : asset.type === 'animation' ? 'animation' : 'image',
      assetId: asset.id,
      transform: {
        x: project.scene.width / 2,
        y: project.scene.height / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      },
      opacity: 1,
      visible: true,
      flipHorizontal: false,
      flipVertical: false,
      layer: 'layer_mid',
      locked: false
    };

    onAddObject(newObject);
  };

  const handleAddSampleToProject = (sampleAsset: Asset) => {
    const existingAsset = project.assets.find(a => a.id === sampleAsset.id);
    if (existingAsset) {
      handleAddAssetToScene(existingAsset);
      return;
    }

    const updatedProject = {
      ...project,
      assets: [...project.assets, sampleAsset]
    };
    onProjectUpdate(updatedProject);
    handleAddAssetToScene(sampleAsset);
  };

  return (
    <div className="h-full border-t bg-card flex flex-col">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
        <div className="px-3 pt-2 border-b flex-shrink-0">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sprites" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              Sprites
            </TabsTrigger>
            <TabsTrigger value="animations" className="text-xs">
              <Film className="w-3 h-3 mr-1" />
              Animations
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              Images
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              <Music className="w-3 h-3 mr-1" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="library" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Library
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <TabsContent value="sprites" className="p-3 m-0">
            {assets.filter(a => a.type === 'sprite').length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No sprites yet. Create one in Sprite Editor mode.
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {assets.filter(a => a.type === 'sprite').map(asset => (
                  <Card
                    key={asset.id}
                    className="p-2 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleAddAssetToScene(asset)}
                  >
                    <div className="aspect-square bg-muted rounded flex items-center justify-center mb-1">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-xs truncate text-center">{asset.name}</div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="animations" className="p-3 m-0">
            {assets.filter(a => a.type === 'animation').length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No animations yet. Create one in Sprite Editor mode.
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {assets.filter(a => a.type === 'animation').map(asset => (
                  <Card
                    key={asset.id}
                    className="p-2 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleAddAssetToScene(asset)}
                  >
                    <div className="aspect-square bg-muted rounded flex items-center justify-center mb-1">
                      <Film className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-xs truncate text-center">{asset.name}</div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="p-3 m-0">
            <div className="text-sm text-muted-foreground text-center py-8">
              No images imported yet.
            </div>
          </TabsContent>

          <TabsContent value="audio" className="p-3 m-0">
            <div className="text-sm text-muted-foreground text-center py-8">
              No audio files imported yet.
            </div>
          </TabsContent>

          <TabsContent value="library" className="p-3 m-0">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">SAMPLE ANIMATIONS</h4>
                <div className="grid grid-cols-6 gap-2">
                  {sampleAssets.slice(0, 12).map(asset => (
                    <Card
                      key={asset.id}
                      className="p-2 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleAddSampleToProject(asset)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded flex items-center justify-center mb-1">
                        <Film className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-xs truncate text-center">{asset.name}</div>
                      <div className="text-xs text-muted-foreground text-center">{asset.frames.length}f</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default AssetLibrary;
