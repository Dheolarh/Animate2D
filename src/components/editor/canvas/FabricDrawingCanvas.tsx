import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { useCanvasZoomPan } from './useCanvasZoomPan';
import type { ToolType } from '../types/spriteEditor';
import { toolsMap } from './Tools';
import PropertiesToolbar from '../PropertiesToolbar';

const ROTATE_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTE4MjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJhOSA5IDAgMSAxLTktOWMyLjUyIDAgNC45MyAxIDYuNzQgMi43NEwyMSA4Ii8+PHBhdGggZD0iTTIxIDN2NWgtNSIvPjwvc3ZnPg==";
const DELETE_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyA2aDE4Ii8+PHBhdGggZD0iTTE5IDZ2MTRjMCAxLTEgMi0yIDJIN2MtMSAwLTItMS0yLTJWNiIvPjxwYXRoIGQ9Ik04IDZWNGMwLTEgMS0yIDItMmg0YzEgMCAyIDEgMiAydjIiLz48L3N2Zz4=";
const LOCK_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJNNyAxMVY3YTUgNSAwIDAgMSAxMCAwdjQiLz48L3N2Zz4=";
const UNLOCK_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJNNyAxMVY3YTUgNSAwIDAgMSA5LjktMSIvPjwvc3ZnPg==";

const rotateImg = new Image(); rotateImg.src = ROTATE_ICON;
const deleteImg = new Image(); deleteImg.src = DELETE_ICON;
const lockImg = new Image(); lockImg.src = LOCK_ICON;
const unlockImg = new Image(); unlockImg.src = UNLOCK_ICON;

const deleteObject = (eventData: any, transform: any) => {
  const target = transform.target;
  const canvas = target.canvas;
  canvas.remove(target);
  canvas.requestRenderAll();
  return true;
};

const toggleLockObject = (eventData: any, transform: any) => {
  const target = transform.target;
  const canvas = target.canvas;
  const isLocked = target.lockMovementX;
  
  target.set({
    lockMovementX: !isLocked,
    lockMovementY: !isLocked,
    lockRotation: !isLocked,
    lockScalingX: !isLocked,
    lockScalingY: !isLocked,
  });
  
  canvas.requestRenderAll();
  return true;
};

const setupObjectSelection = (obj: any) => {
  if (!obj) return;
  obj.set({
    transparentCorners: false,
    cornerColor: '#ffffff',
    cornerStrokeColor: '#111827', // Dark Gray
    borderColor: '#111827',
    cornerSize: 6,
    padding: 0,
    cornerStyle: 'rect',
    borderDashArray: null,
    erasable: true,
  });

  // Custom rotation handle
  if (obj.controls && obj.controls.mtr) {
    obj.controls.mtr.render = (ctx: any, left: any, top: any, styleOverride: any, fabricObject: any) => {
      const size = 14;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(rotateImg, -size/2, -size/2, size, size);
      ctx.restore();
    };
  }
};

const FabricDrawingCanvas: React.FC = () => {
  const {
    canvasState,
    currentFrameId,
    frames,
    updateFrameData,
    activeTool,
    setActiveTool,
    brushColor,
    brushSize,
    shapeFillMode,
    textSize,
    textFontFamily,
    textStrokeColor,
    textStrokeWidth,
    textLineHeight,
    textCharSpacing,
    setFabricCanvas,
    onionSkinFrameCount,
    historyRevision
  } = useSpriteEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onionSkinCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zoom and Pan hooks
  const { zoom, pan, fitToViewport, handlers: zoomPanHandlers } = useCanvasZoomPan();

  // Initial fit to viewport
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        fitToViewport(rect.width, rect.height, canvasState.width, canvasState.height);
      }
    }
  }, [canvasState.width, canvasState.height, fitToViewport]);

  // Sync canvas dimensions
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width: canvasState.width, height: canvasState.height });
    canvas.backgroundColor = canvasState.backgroundColor || '#ffffff';
    canvas.renderAll();
  }, [canvasState.width, canvasState.height, canvasState.backgroundColor]);

  // Initialize Barebones Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasState.width,
      height: canvasState.height,
      backgroundColor: canvasState.backgroundColor || '#ffffff',
      preserveObjectStacking: true,
      selectionColor: 'rgba(17, 24, 39, 0.1)',
      selectionBorderColor: '#111827',
      selectionLineWidth: 1,
    });

    fabricCanvasRef.current = canvas;
    
    // Add canvas to context for external tools
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Tool State
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Discard any active selection when changing tools
    if (activeTool !== 'select') {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }

    // Reset default properties before applying specific tool
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    canvas.selection = true;
    canvas.getObjects().forEach(obj => {
      obj.selectable = true;
      obj.evented = true;
    });

    const tool = toolsMap[activeTool];
    if (tool) {
      tool.onActivate(canvas, { 
        brushColor, brushSize, shapeFillMode, 
        textSize, textFontFamily, textStrokeColor, 
        textStrokeWidth, textLineHeight, textCharSpacing 
      });
    }
  }, [activeTool, brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing, currentFrameId]); // re-run if frame changes to catch new objects

  // Load current frame data when currentFrameId changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !currentFrameId) return;

    const currentFrame = frames.find(f => f.id === currentFrameId);
    if (currentFrame && currentFrame.fabricData) {
      canvas.loadFromJSON(currentFrame.fabricData, () => {
        canvas.getObjects().forEach(obj => {
          setupObjectSelection(obj);
          obj.selectable = true;
          obj.evented = true;
        });
        
        // Re-apply current tool state after async load
        const tool = toolsMap[activeToolRef.current];
        if (tool) {
          tool.onActivate(canvas, contextRef.current);
        }
        
        canvas.backgroundColor = 'rgba(0,0,0,0)';
        canvas.requestRenderAll();
      });
    } else {
      canvas.clear();
      
      // Re-apply current tool state after clear to fix new frame brush bugs
      const tool = toolsMap[activeToolRef.current];
      if (tool) {
        tool.onActivate(canvas, contextRef.current);
      }
      
      canvas.backgroundColor = 'rgba(0,0,0,0)';
      canvas.renderAll();
    }
    // Intentionally excluding 'frames' dependency to avoid reloading during typing/drawing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrameId, historyRevision]);

  const previousToolRef = useRef<ToolType>(activeTool);
  const wasAutoSwitchedRef = useRef(false);

  // Keep latest context and tool in refs to avoid stale closures in event listeners
  const contextRef = useRef({ brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing });
  const activeToolRef = useRef(activeTool);

  useEffect(() => {
    contextRef.current = { brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing };
    activeToolRef.current = activeTool;
  }, [brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing, activeTool]);

  // Save frame data on modification
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const saveState = () => {
      if (!currentFrameId) return;
      const json = (canvas as any).toJSON(['erasable']);
      const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.2 // scaled down for thumbnail performance
      });
      updateFrameData(currentFrameId, json, thumbnail);
    };

    const debounceSave = () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(saveState, 100);
    };

    const handlePathCreated = (e: any) => {
      // Auto-select the drawn shape only if it's not a free drawing tool
      if (e.path) {
        setupObjectSelection(e.path);
        
        // Remember current tool and auto-switch to select (stay in brush/eraser)
        if (activeToolRef.current !== 'select' && activeToolRef.current !== 'eraser' && activeToolRef.current !== 'brush') {
          canvas.setActiveObject(e.path);
          canvas.renderAll();
          previousToolRef.current = activeToolRef.current;
          wasAutoSwitchedRef.current = true;
          setActiveTool('select');
        }
      }
      
      // debounceSave handles the thumbnail — no need to also fire object:modified
      debounceSave();
    };

    const handleObjectAdded = (e: any) => {
      setupObjectSelection(e.target);
      // Skip auto-save when objects are being loaded from saved JSON (not user-added)
      if (e.target?._fromJSON) return;
      debounceSave();
    };

    const handleSelectionCleared = () => {
      // If we were auto-switched to select tool, go back to previous tool on deselect
      if (wasAutoSwitchedRef.current) {
        setActiveTool(previousToolRef.current);
        wasAutoSwitchedRef.current = false;
      }
    };

    const handleMouseDown = (opt: any) => {
      const tool = toolsMap[activeToolRef.current];
      if (tool && tool.onMouseDown) {
        tool.onMouseDown(canvas, opt, contextRef.current);
      }
    };

    const handleMouseMove = (opt: any) => {
      const tool = toolsMap[activeToolRef.current];
      if (tool && tool.onMouseMove) {
        tool.onMouseMove(canvas, opt, contextRef.current);
      }
    };

    const handleMouseUp = (opt: any) => {
      const tool = toolsMap[activeToolRef.current];
      if (tool && tool.onMouseUp) {
        const finishedShape = tool.onMouseUp(canvas, opt, contextRef.current);
        
        if (finishedShape) {
          finishedShape.set({ selectable: true, evented: true });
          setupObjectSelection(finishedShape);
          
          if (finishedShape.width === 0 && finishedShape.height === 0) {
            canvas.remove(finishedShape);
          } else {
            canvas.setActiveObject(finishedShape);
            canvas.requestRenderAll();
            
            if (activeTool !== 'select') {
              previousToolRef.current = activeTool;
              if (activeTool !== 'text') {
                wasAutoSwitchedRef.current = true;
              }
              setActiveTool('select');
            }
            debounceSave();
          }
        }
      }
      
      // Force thumbnail update on mouseup globally to ensure shapes/images are perfectly captured
      setTimeout(debounceSave, 50);
    };

    canvas.on('object:modified', debounceSave);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', debounceSave);
    canvas.on('path:created', handlePathCreated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('object:modified', debounceSave);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', debounceSave);
      canvas.off('path:created', handlePathCreated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrameId, updateFrameData, setActiveTool, activeTool, brushColor, brushSize, shapeFillMode]);

  // Onion Skinning Engine
  useEffect(() => {
    let isActive = true;
    const onionCanvas = onionSkinCanvasRef.current;
    if (!onionCanvas) return;
    
    const ctx = onionCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
    
    if (onionSkinFrameCount <= 0 || !currentFrameId) return;
    
    const currentIndex = frames.findIndex(f => f.id === currentFrameId);
    if (currentIndex <= 0) return; // No previous frames
    
    const startIndex = Math.max(0, currentIndex - onionSkinFrameCount);
    const onionFrames = frames.slice(startIndex, currentIndex);
    
    const loadImages = onionFrames.map((frame, i) => {
      const distance = currentIndex - (startIndex + i);
      // Immediate previous frame at 90%, drops 15% per frame, minimum 25%
      const opacity = Math.max(0.25, 0.9 - ((distance - 1) * 0.15));
      
      return new Promise<{img: HTMLImageElement, opacity: number} | null>((resolve) => {
        if (!frame.thumbnail) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => resolve({ img, opacity });
        img.onerror = () => resolve(null);
        img.src = frame.thumbnail;
      });
    });
    
    Promise.all(loadImages).then(results => {
      if (!isActive) return;
      ctx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
      
      results.forEach(result => {
        if (result) {
          ctx.globalAlpha = result.opacity;
          ctx.drawImage(result.img, 0, 0, onionCanvas.width, onionCanvas.height);
        }
      });
      ctx.globalAlpha = 1.0;
    });
    
    return () => {
      isActive = false;
    };
  }, [currentFrameId, frames, onionSkinFrameCount]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-muted overflow-hidden"
      onWheel={zoomPanHandlers.onWheel}
      onPointerDown={zoomPanHandlers.onPointerDown}
      onPointerMove={zoomPanHandlers.onPointerMove}
      onPointerUp={zoomPanHandlers.onPointerUp}
      onPointerLeave={zoomPanHandlers.onPointerUp}
      onContextMenu={zoomPanHandlers.onContextMenu}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const payloadStr = e.dataTransfer.getData('text/plain');
          if (!payloadStr) return;
          const payload = JSON.parse(payloadStr);
          
          if (payload.url && fabricCanvasRef.current && containerRef.current) {
            const canvas = fabricCanvasRef.current;
            const imgEl = new window.Image();
            imgEl.onload = () => {
              const img = new fabric.Image(imgEl);
              
              // Calculate drop position relative to scaled canvas
              const containerRect = containerRef.current!.getBoundingClientRect();
              
              // Mouse position relative to container
              const mouseX = e.clientX - containerRect.left;
              const mouseY = e.clientY - containerRect.top;
              
              // Adjust for pan and zoom to get canvas coordinates
              const scale = zoom / 100;
              const canvasX = (mouseX - pan.x) / scale;
              const canvasY = (mouseY - pan.y) / scale;
              
              img.set({
                left: canvasX,
                top: canvasY,
                originX: 'center',
                originY: 'center',
                erasable: true,
              });
              
              // Scale down huge images to fit nicely
              if (img.width! > canvasState.width || img.height! > canvasState.height) {
                const scaleFactor = Math.min(
                  canvasState.width / img.width!,
                  canvasState.height / img.height!
                ) * 0.8;
                img.scale(scaleFactor);
              }

              setupObjectSelection(img);
              canvas.add(img);
              canvas.setActiveObject(img);
              setActiveTool('select'); // auto-switch to select so user can move/resize immediately
              canvas.requestRenderAll();
              
              // Force thumbnail update after image drop
              if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
              autoSaveTimeoutRef.current = setTimeout(() => {
                if (!currentFrameId) return;
                const json = (canvas as any).toJSON(['erasable']);
                const thumbnail = canvas.toDataURL({
                  format: 'png',
                  quality: 0.8,
                  multiplier: 0.2
                });
                updateFrameData(currentFrameId, json, thumbnail);
              }, 100);
            };
            imgEl.src = payload.url;
          }
        } catch (err) {
          console.error("Drop error", err);
        }
      }}
      style={{ touchAction: 'none' }}
    >
      {/* Viewport Artboard */}
      <div
        className="absolute top-0 left-0 flex items-center justify-center shadow-2xl border border-border pointer-events-none"
        style={{
          backgroundColor: canvasState.backgroundColor || '#ffffff',
          width: canvasState.width,
          height: canvasState.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <canvas
            ref={onionSkinCanvasRef}
            width={canvasState.width}
            height={canvasState.height}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        <div className="w-full h-full pointer-events-auto relative z-10">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <PropertiesToolbar />
    </div>
  );
};

export default FabricDrawingCanvas;
