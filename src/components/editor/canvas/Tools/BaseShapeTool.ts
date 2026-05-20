import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';
import {
  isGradientValue,
  decodeGradient,
  gradientToFabricOptions,
} from '@/lib/colorUtils';

/**
 * Convert a brushColor value (solid string or encoded gradient) to whatever
 * Fabric accepts as a fill/stroke at creation-time.
 * Uses `gradientUnits:'percentage'` so the gradient auto-scales to object size.
 */
export const fabricPaintFromColor = (
  color: string,
): string | fabric.Gradient<'linear'> | fabric.Gradient<'radial'> => {
  if (isGradientValue(color)) {
    const data = decodeGradient(color);
    if (data) {
      const opts = gradientToFabricOptions(data, 1, 1, true);
      return new fabric.Gradient(opts as any) as any;
    }
  }
  return color;
};

export abstract class BaseShapeTool implements DrawingTool {
  abstract name: string;
  
  protected isDrawing = false;
  protected origX = 0;
  protected origY = 0;
  protected shape: fabric.Object | null = null;

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    // Always reset draw-in-progress state so a previous incomplete gesture
    // (e.g. interrupted by a tool switch or a Fabric synthetic event) never
    // permanently blocks the next draw attempt.
    if (this.shape) {
      canvas.remove(this.shape);
    }
    this.isDrawing = false;
    this.shape = null;

    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    // Prevent existing objects from intercepting draw clicks.
    canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  }

  onDeactivate(canvas: fabric.Canvas) {
    this.isDrawing = false;
    this.shape = null;
  }

  abstract createShape(pointer: { x: number, y: number }, context: ToolContext): fabric.Object;
  abstract updateShape(pointer: { x: number, y: number }): void;

  onMouseDown(canvas: fabric.Canvas, opt: any, context: ToolContext) {
    if (!opt?.scenePoint) return;
    const pointer = opt.scenePoint;
    this.isDrawing = true;
    this.origX = pointer.x;
    this.origY = pointer.y;

    this.shape = this.createShape(pointer, context);
    canvas.add(this.shape);
  }

  onMouseMove(canvas: fabric.Canvas, opt: any, context: ToolContext) {
    if (!this.isDrawing || !this.shape || !opt?.scenePoint) return;

    const pointer = opt.scenePoint;
    this.updateShape(pointer);
    canvas.requestRenderAll();
  }

  onMouseUp(canvas: fabric.Canvas, opt: any, context: ToolContext): fabric.Object | null {
    if (!this.isDrawing || !this.shape) return null;
    
    this.isDrawing = false;
    const finalShape = this.shape;
    this.shape = null; // Reset for next draw
    
    return finalShape;
  }
}
