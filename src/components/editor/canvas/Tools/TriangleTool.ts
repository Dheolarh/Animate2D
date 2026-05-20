import * as fabric from 'fabric';
import { BaseShapeTool, fabricPaintFromColor } from './BaseShapeTool';
import { ToolContext } from './Tool';

export class TriangleTool extends BaseShapeTool {
  name = 'triangle';

  createShape(pointer: { x: number, y: number }, context: ToolContext): fabric.Object {
    const paint = fabricPaintFromColor(context.brushColor);
    return new fabric.Triangle({
      left: pointer.x,
      top: pointer.y,
      originX: 'left',
      originY: 'top',
      width: 0,
      height: 0,
      fill: context.shapeFillMode === 'fill' ? (paint as any) : 'rgba(0,0,0,0)',
      stroke: context.shapeFillMode === 'fill' ? 'rgba(0,0,0,0)' : (paint as any),
      strokeWidth: context.shapeFillMode === 'fill' ? 0 : context.brushSize,
      selectable: false,
      evented: false,
      erasable: true,
    });
  }

  updateShape(pointer: { x: number, y: number }): void {
    if (!this.shape) return;
    
    const triangle = this.shape as fabric.Triangle;

    if (this.origX > pointer.x) {
      triangle.set({ left: pointer.x });
    } else {
      triangle.set({ left: this.origX });
    }

    if (this.origY > pointer.y) {
      triangle.set({ top: pointer.y });
    } else {
      triangle.set({ top: this.origY });
    }

    triangle.set({
      width: Math.abs(this.origX - pointer.x),
      height: Math.abs(this.origY - pointer.y),
    });
  }
}
