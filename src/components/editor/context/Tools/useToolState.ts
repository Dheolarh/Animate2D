import { useState } from 'react';
import type { ToolType } from '../../types/spriteEditor';
import type * as fabricTypes from 'fabric';
import * as fabric from 'fabric';
import {
  isGradientValue,
  decodeGradient,
  gradientToFabricOptions,
} from '@/lib/colorUtils';
import { roundedTriangleSvgPath } from '@/lib/shapeUtils';

/**
 * Convert a color value (solid or gradient) to whatever Fabric accepts as
 * a fill/stroke — either a color string or a fabric.Gradient instance.
 */
const toFabricPaint = (
  color: string,
  width: number,
  height: number,
): string | fabric.Gradient<'linear'> | fabric.Gradient<'radial'> => {
  if (isGradientValue(color)) {
    const data = decodeGradient(color);
    if (data) {
      const opts = gradientToFabricOptions(data, width, height);
      return new fabric.Gradient(opts as any) as any;
    }
  }
  return color;
};

export const useToolState = (fabricCanvas: fabricTypes.Canvas | null) => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [brushColor, setBrushColor] = useState<string>('#111827');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [textSize, setTextSize] = useState<number>(24);
  const [textFontFamily, setTextFontFamily] = useState<string>('sans-serif');
  const [textStrokeColor, setTextStrokeColor] = useState<string>('#000000');
  const [textStrokeWidth, setTextStrokeWidth] = useState<number>(0);
  const [textLineHeight, setTextLineHeight] = useState<number>(1);
  const [textCharSpacing, setTextCharSpacing] = useState<number>(0);
  const [shapeFillMode, setShapeFillMode] = useState<'stroke' | 'fill'>('stroke');
  const [shapeCornerRadius, setShapeCornerRadius] = useState<number>(0);

  const changeBrushColor = (color: string) => {
    setBrushColor(color);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        const w = (obj.width ?? 100);
        const h = (obj.height ?? 100);
        const paint = toFabricPaint(color, w, h);
        if (obj.type === 'path') {
          // Rounded-triangle paths respect fill mode; free-brush paths always use stroke
          if ((obj as any)._isRoundedTriangle) {
            if (shapeFillMode === 'fill') {
              obj.set('fill', paint as any);
            } else {
              obj.set('stroke', paint as any);
            }
          } else {
            obj.set('stroke', paint as any);
          }
        } else if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fill', paint as any);
        } else if (
          obj.type === 'rect' ||
          obj.type === 'circle' ||
          obj.type === 'triangle' ||
          obj.type === 'ellipse'
        ) {
          if (shapeFillMode === 'fill') {
            obj.set('fill', paint as any);
          } else {
            obj.set('stroke', paint as any);
          }
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextSize = (size: number) => {
    setTextSize(size);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fontSize', size);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextFontFamily = (fontFamily: string) => {
    setTextFontFamily(fontFamily);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fontFamily', fontFamily);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextStrokeColor = (color: string) => {
    setTextStrokeColor(color);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('stroke', color);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextStrokeWidth = (width: number) => {
    setTextStrokeWidth(width);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('strokeWidth', width);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextLineHeight = (height: number) => {
    setTextLineHeight(height);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('lineHeight', height);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeTextCharSpacing = (spacing: number) => {
    setTextCharSpacing(spacing);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('charSpacing', spacing);
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeShapeFillMode = (mode: 'stroke' | 'fill') => {
    setShapeFillMode(mode);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (
          obj.type === 'rect' ||
          obj.type === 'circle' ||
          obj.type === 'triangle' ||
          obj.type === 'ellipse'
        ) {
          const w = obj.width ?? 100;
          const h = obj.height ?? 100;
          const paint = toFabricPaint(brushColor, w, h);
          if (mode === 'fill') {
            obj.set('fill', paint as any);
            obj.set('stroke', 'transparent');
          } else {
            obj.set('fill', 'transparent');
            obj.set('stroke', paint as any);
            obj.set('strokeWidth', brushSize);
          }
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
  };

  const changeShapeCornerRadius = (radius: number) => {
    setShapeCornerRadius(radius);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      // ── Rectangle ──────────────────────────────────────────────────────────
      if (obj.type === 'rect') {
        (obj as fabric.Rect).set({ rx: radius, ry: radius });
        return;
      }

      // ── Triangle (native fabric.Triangle or a previously-rounded path) ────
      const isNativeTriangle = obj.type === 'triangle';
      const isRoundedTriangle = obj.type === 'path' && (obj as any)._isRoundedTriangle === true;
      if (!isNativeTriangle && !isRoundedTriangle) return;

      // Gather current visual properties
      const w = obj.width  ?? 60;
      const h = obj.height ?? 60;
      const props = {
        left:        obj.left  ?? 0,
        top:         obj.top   ?? 0,
        scaleX:      obj.scaleX ?? 1,
        scaleY:      obj.scaleY ?? 1,
        angle:       obj.angle  ?? 0,
        opacity:     obj.opacity ?? 1,
        fill:        (obj as any).fill,
        stroke:      (obj as any).stroke,
        strokeWidth: (obj as any).strokeWidth ?? 0,
        selectable:  obj.selectable,
        evented:     obj.evented,
        erasable:    (obj as any).erasable,
        originX:     obj.originX ?? 'left',
        originY:     obj.originY ?? 'top',
      };

      // Build the new (possibly rounded) path
      const pathStr = roundedTriangleSvgPath(w, h, radius);
      const newPath = new fabric.Path(pathStr, {
        ...props,
        // Mark so future radius changes recognise this path as a triangle
        _isRoundedTriangle: true,
        _cornerRadius:      radius,
      } as any);

      // Swap objects on canvas while preserving z-order
      const canvas = fabricCanvas;
      const idx = canvas.getObjects().indexOf(obj);
      canvas.remove(obj);
      canvas.insertAt(idx, newPath);
      canvas.setActiveObject(newPath);
    });

    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  return {
    activeTool,
    setActiveTool,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    textSize,
    setTextSize,
    textFontFamily,
    setTextFontFamily,
    textStrokeColor,
    setTextStrokeColor,
    textStrokeWidth,
    setTextStrokeWidth,
    textLineHeight,
    setTextLineHeight,
    textCharSpacing,
    setTextCharSpacing,
    shapeFillMode,
    setShapeFillMode,
    shapeCornerRadius,
    setShapeCornerRadius,
    changeBrushColor,
    changeTextSize,
    changeTextFontFamily,
    changeTextStrokeColor,
    changeTextStrokeWidth,
    changeTextLineHeight,
    changeTextCharSpacing,
    changeShapeFillMode,
    changeShapeCornerRadius,
  };
};
