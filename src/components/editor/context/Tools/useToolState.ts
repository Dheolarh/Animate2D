import { useState } from 'react';
import type { ToolType } from '../../types/spriteEditor';
import type * as fabric from 'fabric';

export const useToolState = (fabricCanvas: fabric.Canvas | null) => {
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

  const changeBrushColor = (color: string) => {
    setBrushColor(color);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (obj.type === 'path') {
          obj.set('stroke', color);
        } else if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fill', color);
        } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'ellipse') {
          if (shapeFillMode === 'fill') {
            obj.set('fill', color);
          } else {
            obj.set('stroke', color);
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
        if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'ellipse') {
          if (mode === 'fill') {
            obj.set('fill', brushColor);
            obj.set('stroke', 'transparent');
          } else {
            obj.set('fill', 'transparent');
            obj.set('stroke', brushColor);
            obj.set('strokeWidth', brushSize);
          }
        }
      });
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    }
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
    changeBrushColor,
    changeTextSize,
    changeTextFontFamily,
    changeTextStrokeColor,
    changeTextStrokeWidth,
    changeTextLineHeight,
    changeTextCharSpacing,
    changeShapeFillMode
  };
};
