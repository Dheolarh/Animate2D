import React from 'react';
import { useSpriteEditor } from '../context/SpriteEditorContext';

const ViewSettings: React.FC = () => {
  const { onionSkinFrameCount } = useSpriteEditor();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">View Settings</h3>
      <div className="text-xs text-muted-foreground">
        <p>Use the Onion Skin toggle (bottom-left) to show previous frames as ghost images.</p>
        <p className="mt-2">Currently showing up to {onionSkinFrameCount} previous frames.</p>
      </div>
    </div>
  );
};

export default ViewSettings;
