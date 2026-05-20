import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSpriteEditor } from '../context/SpriteEditorContext';
import { useCanvasZoomPan } from './useCanvasZoomPan';
import type { ToolType } from '../types/spriteEditor';
import { toolsMap } from './Tools';
import PropertiesToolbar from '../PropertiesToolbar';
import { colorValueToCss, isGradientValue } from '@/lib/colorUtils';

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
    onionSkinOpacity,
    historyRevision
  } = useSpriteEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onionSkinCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousToolRef = useRef<ToolType>('rectangle');
  const wasAutoSwitchedRef = useRef<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenAllowed, setIsFullscreenAllowed] = useState(true);

  // Zoom and Pan hooks
  const { zoom, pan, fitToViewport, handlers: zoomPanHandlers } = useCanvasZoomPan();

  // Check if fullscreen is allowed by permissions policy
  useEffect(() => {
    const checkFullscreenPermission = async () => {
      try {
        // Check if we're in an iframe
        const inIframe = window.self !== window.top;
        
        // Check Permissions API if available
        if ('permissions' in navigator && 'query' in navigator.permissions) {
          try {
            const result = await (navigator.permissions as any).query({ name: 'fullscreen' });
            setIsFullscreenAllowed(result.state !== 'denied');
            return;
          } catch (e) {
            // Permissions API might not support fullscreen query
          }
        }
        
        // Fallback: Check if document.fullscreenEnabled exists
        if ('fullscreenEnabled' in document) {
          setIsFullscreenAllowed(document.fullscreenEnabled);
          return;
        }
        
        // If in iframe, assume fullscreen might be blocked
        if (inIframe) {
          setIsFullscreenAllowed(false);
        }
      } catch (error) {
        console.error('Failed to check fullscreen permission:', error);
        // Assume allowed if we can't check
        setIsFullscreenAllowed(true);
      }
    };
    
    checkFullscreenPermission();
  }, []);

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
    canvas.backgroundColor = 'rgba(0,0,0,0)';
    canvas.renderAll();
  }, [canvasState.width, canvasState.height]);

  // Initialize Barebones Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const currentFrame = frames.find(f => f.id === currentFrameId);
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasState.width,
      height: canvasState.height,
      backgroundColor: 'rgba(0,0,0,0)',
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

  // Handle Tool Switch — only runs when the active tool actually changes.
  // Brush color/size changes must NOT be in this dep array to avoid re-running
  // during drawing (which caused canvas flickering).
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Discard any active selection/object when leaving select mode
    if (activeTool !== 'select') {
      canvas.discardActiveObject();
    }

    // Reset to safe defaults before the specific tool overrides what it needs.
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    // When a drawing tool activates it sets objects to non-interactive.
    // When switching back to select (or any other tool change) we must
    // restore interactiveness so previously drawn shapes can be selected.
    canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.evented = true;
      obj.hasControls = true;
    });

    const tool = toolsMap[activeTool];
    if (tool) {
      tool.onActivate(canvas, contextRef.current);
    }

    canvas.renderAll();
  }, [activeTool, currentFrameId]); // re-run if frame changes to catch new objects

  // When brush settings change, update the brush on the canvas if it's already
  // in drawing mode — but do NOT call onActivate/renderAll (no flicker).
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (activeTool === 'brush' || activeTool === 'eraser') {
      // Brush tools set canvas.freeDrawingBrush; update it live.
      const tool = toolsMap[activeTool];
      if (tool) tool.onActivate(canvas, contextRef.current);
    }
    // Shape/text tools read context from contextRef at draw-time, so no canvas
    // manipulation is needed here — contextRef is already kept up to date.
  }, [activeTool, brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing]);


  // Load current frame data when currentFrameId changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !currentFrameId) return;

    const currentFrame = frames.find(f => f.id === currentFrameId);
    if (currentFrame && currentFrame.fabricData) {
      canvas.loadFromJSON(currentFrame.fabricData).then(() => {
        canvas.getObjects().forEach(obj => {
          setupObjectSelection(obj);
        });
        
        // Re-apply current tool state after async load
        const tool = toolsMap[activeToolRef.current];
        if (tool) {
          tool.onActivate(canvas, contextRef.current);
        }
        
        canvas.backgroundColor = 'rgba(0,0,0,0)';
        canvas.renderAll();
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

  // Keep latest context and tool in refs to avoid stale closures in event listeners
  const contextRef = useRef({ brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing });
  const activeToolRef = useRef(activeTool);
  const updateFrameDataRef = useRef(updateFrameData);

  useEffect(() => {
    contextRef.current = { brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing };
    activeToolRef.current = activeTool;
    updateFrameDataRef.current = updateFrameData;
  }, [brushColor, brushSize, shapeFillMode, textSize, textFontFamily, textStrokeColor, textStrokeWidth, textLineHeight, textCharSpacing, activeTool, updateFrameData]);

  // Save frame data on modification
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const saveState = () => {
      if (!currentFrameId) return;
      // Force a synchronous render so deletions/modifications are reflected
      // before we capture the thumbnail and JSON snapshot.
      canvas.renderAll();
      const json = (canvas as any).toJSON(['erasable']);
      // Strip interaction-mode flags so they are never persisted.
      // On reload Fabric defaults to evented:true / selectable:true, which is
      // exactly what the Select tool needs — no stale drawing-mode state leaks in.
      if (Array.isArray(json.objects)) {
        json.objects.forEach((obj: any) => {
          delete obj.evented;
          delete obj.selectable;
          delete obj.hasControls;
        });
      }
      const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1.0 // Use 100% resolution for maximum preview clarity
      });
      updateFrameDataRef.current(currentFrameId, json, thumbnail);
    };

    const debounceSave = () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(saveState, 100);
    };

    const handlePathCreated = (e: any) => {
      if (e.path) {
        setupObjectSelection(e.path);
      }
      debounceSave();
    };

    const handleObjectAdded = (e: any) => {
      setupObjectSelection(e.target);
      // Skip auto-save when objects are being loaded from saved JSON (not user-added)
      if (e.target?._fromJSON) return;
      debounceSave();
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
      const currentToolName = activeToolRef.current;
      const tool = toolsMap[currentToolName];
      if (tool && tool.onMouseUp) {
        const finishedShape = tool.onMouseUp(canvas, opt, contextRef.current);

        if (finishedShape) {
          setupObjectSelection(finishedShape);

          if (finishedShape.width === 0 && finishedShape.height === 0) {
            canvas.remove(finishedShape);
          } else {
            if (currentToolName === 'text') {
              // Text needs to stay interactive so the user can type in it.
              // Once text:editing:exited fires we discard the active object so
              // the next click places a fresh text object.
              canvas.setActiveObject(finishedShape);
            } else {
              // Unlock the newly drawn shape so it can be moved/resized.
              // The shape was created with selectable/evented=false to prevent
              // it from intercepting the ongoing draw gesture.
              finishedShape.set({ selectable: true, evented: true, hasControls: true });
              finishedShape.setCoords();
              canvas.setActiveObject(finishedShape);
              // Track which draw tool was active so we can restore it on deselect.
              previousToolRef.current = currentToolName as ToolType;
              wasAutoSwitchedRef.current = true;
              // Auto-switch to select so the user can immediately move/resize.
              setActiveTool('select');
            }
            canvas.requestRenderAll();
            debounceSave();
          }
        }
      }

      // Force thumbnail update on mouseup globally to ensure shapes/images are perfectly captured
      setTimeout(debounceSave, 50);
    };

    // When text editing ends while the text tool is still active, discard the
    // active object so the next click places a fresh text object.
    const handleTextEditingExited = (e: any) => {
      if (activeToolRef.current === 'text') {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    };

    // When the user deselects (clicks empty canvas), restore the draw tool they came from.
    const handleSelectionCleared = () => {
      if (wasAutoSwitchedRef.current) {
        // Reset the flag BEFORE calling setActiveTool to prevent any feedback loop.
        wasAutoSwitchedRef.current = false;
        setActiveTool(previousToolRef.current);
      }
    };

    canvas.on('object:modified', debounceSave);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', debounceSave);
    canvas.on('path:created', handlePathCreated);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('text:editing:exited', handleTextEditingExited);

    return () => {
      canvas.off('object:modified', debounceSave);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', debounceSave);
      canvas.off('path:created', handlePathCreated);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('text:editing:exited', handleTextEditingExited);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
    // activeToolRef, contextRef, and updateFrameDataRef are refs — always current, no need in deps.
    // Only re-register when the frame changes. updateFrameData is accessed via ref
    // to prevent constant listener re-registration on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrameId]);

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
      // Use the global onion skin opacity as base, and multiply by the individual frame's opacity
      const frameBaseOpacity = (frame.opacity ?? 100) / 100;
      const globalOnionBase = (onionSkinOpacity ?? 40) / 100;
      
      // Still apply a slight distance-based fade so older frames are subtler,
      // but keep it very subtle (from 100% down to 60% of the base opacity)
      const distanceMultiplier = Math.max(0.6, 1.0 - ((distance - 1) * 0.1));
      const finalOpacity = frameBaseOpacity * globalOnionBase * distanceMultiplier;
      
      return new Promise<{img: HTMLImageElement, opacity: number} | null>((resolve) => {
        if (!frame.thumbnail) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => resolve({ img, opacity: finalOpacity });
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
  }, [currentFrameId, frames, onionSkinFrameCount, onionSkinOpacity]);

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!containerRef.current) {
      console.error('Container ref not available');
      toast.error('Fullscreen not available');
      return;
    }

    try {
      if (!isFullscreen) {
        // Enter fullscreen - fullscreen the parent element to include toolbar
        // The parent element contains: SettingsPanel, DrawingToolbar, Canvas, ImageGallery
        const element = (containerRef.current.parentElement || containerRef.current) as any;
        
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        } else {
          console.error('Fullscreen API not supported');
          toast.error('Fullscreen not supported in this browser');
        }
      } else {
        // Exit fullscreen - check for browser-specific methods
        const doc = document as any;
        
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error: any) {
      console.error('Fullscreen toggle failed:', error);
      
      // Check for specific error types
      if (error.message && error.message.includes('permissions policy')) {
        toast.error('Fullscreen blocked by browser security policy. Please open the app in a new tab.');
      } else if (error.name === 'TypeError' && error.message.includes('Disallowed')) {
        toast.error('Fullscreen blocked. Please open the app in a new tab to use fullscreen.');
      } else {
        toast.error('Failed to enter fullscreen mode');
      }
    }
  };

  // Listen for fullscreen changes (including ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isInFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
    };

    // Listen to all browser-specific fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
              
              // Check if there's an existing image at the drop position
              const objects = canvas.getObjects();
              let targetImage: fabric.Image | null = null;
              
              for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === 'image') {
                  // Check if drop position is within the bounds of this image
                  const objBounds = obj.getBoundingRect();
                  if (
                    canvasX >= objBounds.left &&
                    canvasX <= objBounds.left + objBounds.width &&
                    canvasY >= objBounds.top &&
                    canvasY <= objBounds.top + objBounds.height
                  ) {
                    targetImage = obj as fabric.Image;
                    break;
                  }
                }
              }
              
              // If we found an image to replace, capture its properties
              if (targetImage) {
                // Capture all transform properties from the old image
                const properties = {
                  left: targetImage.left,
                  top: targetImage.top,
                  scaleX: targetImage.scaleX,
                  scaleY: targetImage.scaleY,
                  angle: targetImage.angle,
                  flipX: targetImage.flipX,
                  flipY: targetImage.flipY,
                  originX: targetImage.originX,
                  originY: targetImage.originY,
                  opacity: targetImage.opacity,
                  skewX: targetImage.skewX,
                  skewY: targetImage.skewY,
                  lockMovementX: targetImage.lockMovementX,
                  lockMovementY: targetImage.lockMovementY,
                  lockRotation: targetImage.lockRotation,
                  lockScalingX: targetImage.lockScalingX,
                  lockScalingY: targetImage.lockScalingY,
                  erasable: true,
                };
                
                // Remove the old image
                canvas.remove(targetImage);
                
                // Apply all properties to the new image
                img.set(properties);
              } else {
                // No image to replace, use normal drop behavior
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
              }

              setupObjectSelection(img);
              canvas.add(img);
              canvas.setActiveObject(img);
              setActiveTool('select'); // auto-switch to select so user can move/resize immediately
              canvas.requestRenderAll();
              
              // Force immediate save after image drop/replacement
              // Use a minimal delay to ensure canvas render completes
              setTimeout(() => {
                if (!currentFrameId) return;
                canvas.renderAll();
                const json = (canvas as any).toJSON(['erasable']);
                const thumbnail = canvas.toDataURL({
                  format: 'png',
                  quality: 0.8,
                  multiplier: 1.0
                });
                updateFrameDataRef.current(currentFrameId, json, thumbnail);
              }, 50);
            };
            imgEl.src = payload.url;
          }
        } catch (err) {
          console.error("Drop error", err);
        }
      }}
      style={{ touchAction: 'none' }}
    >
      {/* Fullscreen Toggle Button - Only show if fullscreen is allowed */}
      {isFullscreenAllowed && (
        <div className="absolute top-2 right-2 z-50 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Viewport Artboard */}
      {(() => {
        const rawBg = frames.find(f => f.id === currentFrameId)?.backgroundColor
          || canvasState.backgroundColor
          || '#ffffff';
        const isGrad = isGradientValue(rawBg);
        const cssBg = colorValueToCss(rawBg);

        const artboardStyle: React.CSSProperties = {
          width: canvasState.width,
          height: canvasState.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: '0 0',
        };

        if (canvasState.showTransparentFrame) {
          artboardStyle.backgroundImage =
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGAQYKABjAhlVEMDmgZ1AAAbVwA1rT00+QAAAABJRU5ErkJggg==")';
        } else if (isGrad) {
          artboardStyle.background = cssBg;
        } else {
          artboardStyle.backgroundColor = rawBg;
        }

        return (
          <div
            className="absolute top-0 left-0 flex items-center justify-center shadow-2xl border border-border pointer-events-none"
            style={artboardStyle}
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
            <div
              className="w-full h-full pointer-events-auto relative z-10"
              style={{ opacity: (frames.find(f => f.id === currentFrameId)?.opacity ?? 100) / 100 }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
        );
      })()}

      <PropertiesToolbar />
    </div>
  );
};

export default FabricDrawingCanvas;
