import { DrawingTool } from './Tool';
import { SelectTool } from './SelectTool';
import { BrushTool } from './BrushTool';
import { EraserTool } from './EraserTool';
import { RectangleTool } from './RectangleTool';
import { CircleTool } from './CircleTool';
import { TriangleTool } from './TriangleTool';
import { TextTool } from './TextTool';

export * from './Tool';

export const toolsMap: Record<string, DrawingTool> = {
  select: new SelectTool(),
  brush: new BrushTool(),
  eraser: new EraserTool(),
  rectangle: new RectangleTool(),
  circle: new CircleTool(),
  triangle: new TriangleTool(),
  text: new TextTool(),
};
