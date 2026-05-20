import * as fabric from 'fabric';
import { EraserBrush } from 'erase2d';
import { DrawingTool, ToolContext } from './Tool';

export class EraserTool implements DrawingTool {
  name = 'eraser';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    const eraser = new EraserBrush(canvas);
    eraser.width = context.brushSize;
    canvas.freeDrawingBrush = eraser;
    // erase2d needs objects to be evented so the eraser brush can intersect them.
    canvas.getObjects().forEach(obj => {
      obj.evented = true;
    });
  }

  onDeactivate(canvas: fabric.Canvas) {
    canvas.isDrawingMode = false;
  }
}
