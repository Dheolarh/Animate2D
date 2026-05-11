import { useState, useEffect } from 'react';
import type * as fabric from 'fabric';

export const useCanvasSelection = () => {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [selectionOpacity, setSelectionOpacity] = useState<number>(1);

  useEffect(() => {
    if (!fabricCanvas) return;
    const updateSelection = () => {
      const active = fabricCanvas.getActiveObject();
      setHasSelection(!!active);
      setIsSelectionLocked(active ? !!active.lockMovementX : false);
      if (active) {
        setSelectionOpacity(active.opacity ?? 1);
        setIsTextSelected(active.type === 'i-text' || active.type === 'text');
      } else {
        setIsTextSelected(false);
      }
    };
    fabricCanvas.on('selection:created', updateSelection);
    fabricCanvas.on('selection:updated', updateSelection);
    fabricCanvas.on('selection:cleared', updateSelection);
    fabricCanvas.on('object:modified', updateSelection);

    return () => {
      fabricCanvas.off('selection:created', updateSelection);
      fabricCanvas.off('selection:updated', updateSelection);
      fabricCanvas.off('selection:cleared', updateSelection);
      fabricCanvas.off('object:modified', updateSelection);
    };
  }, [fabricCanvas]);

  const deleteSelection = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach(obj => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
    }
  };

  const toggleLockSelection = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      const isCurrentlyLocked = !!activeObjects[0].lockMovementX;
      activeObjects.forEach(obj => {
        obj.set({
          lockMovementX: !isCurrentlyLocked,
          lockMovementY: !isCurrentlyLocked,
          lockRotation: !isCurrentlyLocked,
          lockScalingX: !isCurrentlyLocked,
          lockScalingY: !isCurrentlyLocked,
        });
      });
      fabricCanvas.requestRenderAll();
      setIsSelectionLocked(!isCurrentlyLocked);
      fabricCanvas.fire('object:modified');
    }
  };

  const duplicateSelection = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone().then((clonedObj: any) => {
      fabricCanvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 20,
        top: clonedObj.top + 20,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = fabricCanvas;
        clonedObj.forEachObject((obj: any) => {
          fabricCanvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        fabricCanvas.add(clonedObj);
      }
      fabricCanvas.setActiveObject(clonedObj);
      fabricCanvas.requestRenderAll();
      fabricCanvas.fire('object:modified');
    });
  };

  const changeSelectionOpacity = (opacity: number) => {
    setSelectionOpacity(opacity);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => { obj.set('opacity', opacity); });
      fabricCanvas.requestRenderAll();
    }
  };

  // ── Layer ordering ──────────────────────────────────────────────────────────
  const bringToFront = () => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    fabricCanvas.bringObjectToFront(obj);
    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  const bringForward = () => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    const objects = fabricCanvas.getObjects();
    const idx = objects.indexOf(obj);
    if (idx < objects.length - 1) {
      fabricCanvas.moveObjectTo(obj, idx + 1);
    }
    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  const sendBackward = () => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    const objects = fabricCanvas.getObjects();
    const idx = objects.indexOf(obj);
    if (idx > 0) {
      fabricCanvas.moveObjectTo(obj, idx - 1);
    }
    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  const sendToBack = () => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    fabricCanvas.sendObjectToBack(obj);
    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  // ── Arrow-key nudge (1px; caller passes 10px when Shift held) ──────────────
  const nudgeSelection = (dx: number, dy: number) => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (!activeObjects.length) return;
    activeObjects.forEach(obj => {
      obj.set({
        left: (obj.left ?? 0) + dx,
        top: (obj.top ?? 0) + dy,
      });
      obj.setCoords();
    });
    fabricCanvas.requestRenderAll();
    fabricCanvas.fire('object:modified');
  };

  return {
    fabricCanvas,
    setFabricCanvas,
    hasSelection,
    isSelectionLocked,
    isTextSelected,
    selectionOpacity,
    deleteSelection,
    toggleLockSelection,
    duplicateSelection,
    changeSelectionOpacity,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    nudgeSelection,
  };
};
