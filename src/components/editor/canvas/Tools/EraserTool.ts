import * as fabric from 'fabric';
import { EraserBrush } from 'erase2d';
import { DrawingTool, ToolContext } from './Tool';

export class EraserTool implements DrawingTool {
  name = 'eraser';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.isDrawingMode = true;
    const eraser = new EraserBrush(canvas);
    eraser.width = context.brushSize;
    canvas.freeDrawingBrush = eraser;
    
    // Disable selection while erasing to prevent full object selection/deletion
    canvas.selection = false;
    canvas.getObjects().forEach(obj => {
      obj.selectable = false;
      obj.evented = true; // Still needs to be evented for eraser intersection
    });
  }

  onDeactivate(canvas: fabric.Canvas) {
    canvas.isDrawingMode = false;
  }
}
