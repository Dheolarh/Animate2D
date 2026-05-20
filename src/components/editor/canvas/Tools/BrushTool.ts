import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';
import { solidColorFallback } from '@/lib/colorUtils';

export class BrushTool implements DrawingTool {
  name = 'brush';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.isDrawingMode = true;
    const brush = new fabric.PencilBrush(canvas);
    // PencilBrush only accepts a solid CSS color string — use first stop as fallback
    brush.color = solidColorFallback(context.brushColor);
    brush.width = context.brushSize;
    canvas.freeDrawingBrush = brush;
  }

  onDeactivate(canvas: fabric.Canvas) {
    canvas.isDrawingMode = false;
  }
}
