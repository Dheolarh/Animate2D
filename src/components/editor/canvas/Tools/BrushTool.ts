import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';

export class BrushTool implements DrawingTool {
  name = 'brush';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.isDrawingMode = true;
    const brush = new fabric.PencilBrush(canvas);
    brush.color = context.brushColor;
    brush.width = context.brushSize;
    canvas.freeDrawingBrush = brush;
  }

  onDeactivate(canvas: fabric.Canvas) {
    canvas.isDrawingMode = false;
  }
}
