import * as fabric from 'fabric';
import { DrawingTool, ToolContext } from './Tool';

export abstract class BaseShapeTool implements DrawingTool {
  abstract name: string;
  
  protected isDrawing = false;
  protected origX = 0;
  protected origY = 0;
  protected shape: fabric.Object | null = null;

  onActivate(canvas: fabric.Canvas, context: ToolContext) {
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.getObjects().forEach(obj => {
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
    const pointer = opt.scenePoint;
    this.isDrawing = true;
    this.origX = pointer.x;
    this.origY = pointer.y;

    this.shape = this.createShape(pointer, context);
    canvas.add(this.shape);
  }

  onMouseMove(canvas: fabric.Canvas, opt: any, context: ToolContext) {
    if (!this.isDrawing || !this.shape) return;

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
