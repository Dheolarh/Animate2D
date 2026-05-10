import { useState, useCallback, useRef, useEffect } from 'react';

interface ZoomPanState {
  zoom: number;
  panX: number;
  panY: number;
}

export const useCanvasZoomPan = () => {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  
  const fitToViewport = useCallback((containerWidth: number, containerHeight: number, canvasWidth: number, canvasHeight: number) => {
    const margin = 80; // 40px margin on each side
    const scaleX = Math.max(0.1, (containerWidth - margin) / canvasWidth);
    const scaleY = Math.max(0.1, (containerHeight - margin) / canvasHeight);
    
    const newScale = Math.min(scaleX, scaleY);
    const newZoom = newScale * 100;

    const panX = (containerWidth - canvasWidth * newScale) / 2;
    const panY = (containerHeight - canvasHeight * newScale) / 2;

    setZoom(newZoom);
    setPan({ x: panX, y: panY });
  }, []);

  // To stop pan outside of element
  const handlePointerUp = useCallback(() => {
    isPanningRef.current = false;
    lastPanPointRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerUp]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Use the container's bounding rect to find cursor position relative to container
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setZoom((prevZoom) => {
      let newZoom = prevZoom * (0.999 ** e.deltaY);
      if (newZoom > 2000) newZoom = 2000;
      if (newZoom < 10) newZoom = 10;
      
      const zoomFactor = newZoom / prevZoom;
      
      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * zoomFactor,
        y: mouseY - (mouseY - prevPan.y) * zoomFactor
      }));
      
      return newZoom;
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or Right click
      e.preventDefault();
      isPanningRef.current = true;
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current && lastPanPointRef.current) {
      e.preventDefault();
      const dx = e.clientX - lastPanPointRef.current.x;
      const dy = e.clientY - lastPanPointRef.current.y;
      
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent native right-click menu
  }, []);

  return {
    zoom,
    pan,
    fitToViewport,
    handlers: {
      onWheel: handleWheel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onContextMenu: handleContextMenu
    }
  };
};
