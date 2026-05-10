import * as fabric from 'fabric';

export interface ToolContext {
  brushColor: string;
  brushSize: number;
  shapeFillMode: 'stroke' | 'fill';
  textSize: number;
  textFontFamily: string;
  textStrokeColor: string;
  textStrokeWidth: number;
  textLineHeight: number;
  textCharSpacing: number;
}

export interface DrawingTool {
  name: string;
  onActivate: (canvas: fabric.Canvas, context: ToolContext) => void;
  onDeactivate: (canvas: fabric.Canvas) => void;
  onMouseDown?: (canvas: fabric.Canvas, opt: any, context: ToolContext) => void;
  onMouseMove?: (canvas: fabric.Canvas, opt: any, context: ToolContext) => void;
  // Returns the finished object if drawing is complete, so the canvas can auto-select it
  onMouseUp?: (canvas: fabric.Canvas, opt: any, context: ToolContext) => fabric.Object | null;
}
