import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';

export class SelectTool implements DrawingTool {
  name = 'select';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    // Select tool relies on the default canvas reset in FabricDrawingCanvas.tsx
    // which sets isDrawingMode = false, selection = true, etc.
  }

  onDeactivate(canvas: fabric.Canvas) {
    // Nothing to do
  }
}
