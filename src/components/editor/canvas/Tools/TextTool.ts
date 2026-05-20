import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';

export class TextTool implements DrawingTool {
  name = 'text';

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.selection = false;
    canvas.defaultCursor = 'text';
  }

  onDeactivate(canvas: fabric.Canvas) {
    // Nothing needed
  }

  onMouseUp(canvas: fabric.Canvas, opt: any, context: ToolContext): fabric.Object | null {
    if (!opt?.scenePoint) return null;
    const pointer = opt.scenePoint;
    
    const textObj = new fabric.IText('Text', {
      left: pointer.x,
      top: pointer.y,
      originX: 'left',
      originY: 'top',
      fontFamily: context.textFontFamily,
      fill: context.brushColor,
      fontSize: context.textSize,
      stroke: context.textStrokeColor,
      strokeWidth: context.textStrokeWidth,
      lineHeight: context.textLineHeight,
      charSpacing: context.textCharSpacing,
      erasable: true,
    });

    canvas.add(textObj);
    
    // Defer entering edit mode so FabricDrawingCanvas can finish setting it as the active object
    setTimeout(() => {
      textObj.enterEditing();
      textObj.selectAll();
      canvas.requestRenderAll();
    }, 50);

    return textObj;
  }
}
