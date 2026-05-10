import * as fabric from 'fabric';
import { BaseShapeTool } from './BaseShapeTool';
import { ToolContext } from './Tool';

export class CircleTool extends BaseShapeTool {
  name = 'circle';

  createShape(pointer: { x: number, y: number }, context: ToolContext): fabric.Object {
    return new fabric.Ellipse({
      left: pointer.x,
      top: pointer.y,
      originX: 'left',
      originY: 'top',
      rx: 0,
      ry: 0,
      width: 0,
      height: 0,
      fill: context.shapeFillMode === 'fill' ? context.brushColor : 'rgba(0,0,0,0)',
      stroke: context.shapeFillMode === 'fill' ? 'rgba(0,0,0,0)' : context.brushColor,
      strokeWidth: context.shapeFillMode === 'fill' ? 0 : context.brushSize,
      selectable: false,
      evented: false,
      erasable: true,
    });
  }

  updateShape(pointer: { x: number, y: number }): void {
    if (!this.shape) return;
    
    const ellipse = this.shape as fabric.Ellipse;
    const width = Math.abs(this.origX - pointer.x);
    const height = Math.abs(this.origY - pointer.y);

    if (this.origX > pointer.x) {
      ellipse.set({ left: pointer.x });
    } else {
      ellipse.set({ left: this.origX });
    }

    if (this.origY > pointer.y) {
      ellipse.set({ top: pointer.y });
    } else {
      ellipse.set({ top: this.origY });
    }

    ellipse.set({
      rx: width / 2,
      ry: height / 2,
      width: width,
      height: height,
    });
  }
}
