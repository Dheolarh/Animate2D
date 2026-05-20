import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';

export class SelectTool implements DrawingTool {
  name = 'select';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    // Make sure every object is interactive — especially shapes that were
    // created with selectable/evented=false and newly loaded objects.
    canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.evented = true;
      obj.hasControls = true;
    });
    canvas.renderAll();
  }

  onDeactivate(canvas: fabric.Canvas) {
    // Nothing to do
  }
}
