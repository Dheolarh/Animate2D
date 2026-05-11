import React, { createContext, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

import type {
  CanvasState,
  AnimationSettings,
  EditorFrame,
  ToolType
} from '../types/spriteEditor';
import type { FrameImage, FrameText } from '@/types/animation';

import { useCanvasSettings } from './Tools/useCanvasSettings';
import { useFrameManager } from './Tools/useFrameManager';
import { useImageGallery } from './Tools/useImageGallery';
import { useToolState } from './Tools/useToolState';
import { useCanvasSelection } from './Tools/useCanvasSelection';

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
}

interface SpriteEditorContextType {
  // Canvas state
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
  setShowTransparentFrame: (show: boolean) => void;
  setCanvasSize: (width: number, height: number) => void;

  // Animation settings
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;

  // Frame Management
  frames: EditorFrame[];
  currentFrameId: string | null;
  addFrame: () => void;
  duplicateFrame: (id: string) => void;
  deleteFrame: (id: string) => void;
  selectFrame: (id: string) => void;
  reorderFrames: (fromIndex: number, toIndex: number) => void;
  updateFrameData: (id: string, fabricData: any, thumbnail: string) => void;
  setFrameOpacity: (id: string, opacity: number) => void;
  setFrameBackgroundColor: (id: string, color: string, applyToAll?: boolean) => void;

  // Onion skin settings
  onionSkinFrameCount: number;
  setOnionSkinFrameCount: (count: number) => void;
  onionSkinOpacity: number;
  setOnionSkinOpacity: (opacity: number) => void;

  // Save status
  saveStatus: 'saved' | 'saving' | 'unsaved';
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  isHydrated: boolean;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyRevision: number;
  duplicateSelection: () => void;
  bringToFront: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  sendToBack: () => void;
  nudgeSelection: (dx: number, dy: number) => void;
  groupSelection: () => void;
  ungroupSelection: () => void;

  // Image gallery state
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  addUploadedImage: (raw: UploadedImage) => Promise<UploadedImage>;
  selectedImage: FrameImage | null;
  setSelectedImage: (image: FrameImage | null) => void;
  selectedText: FrameText | null;
  setSelectedText: (text: FrameText | null) => void;
  draggingImageUrl: string | null;
  setDraggingImageUrl: (url: string | null) => void;

  // Tools
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  changeBrushColor: (color: string) => void;
  textSize: number;
  changeTextSize: (size: number) => void;
  textFontFamily: string;
  changeTextFontFamily: (font: string) => void;
  textStrokeColor: string;
  changeTextStrokeColor: (color: string) => void;
  textStrokeWidth: number;
  changeTextStrokeWidth: (width: number) => void;
  textLineHeight: number;
  changeTextLineHeight: (height: number) => void;
  textCharSpacing: number;
  changeTextCharSpacing: (spacing: number) => void;
  shapeFillMode: 'stroke' | 'fill';
  changeShapeFillMode: (mode: 'stroke' | 'fill') => void;

  // Fabric Canvas & Selection Actions
  fabricCanvas: fabric.Canvas | null;
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
  hasSelection: boolean;
  isSelectionLocked: boolean;
  isTextSelected: boolean;
  isGroupSelected: boolean;
  selectionOpacity: number;
  deleteSelection: () => void;
  toggleLockSelection: () => void;
  changeSelectionOpacity: (opacity: number) => void;
}

const SpriteEditorContext = createContext<SpriteEditorContextType | undefined>(undefined);

interface SpriteEditorProviderProps {
  children: ReactNode;
}

export const SpriteEditorProvider: React.FC<SpriteEditorProviderProps> = ({ children }) => {
  const canvasSettings = useCanvasSettings();
  const frameManager = useFrameManager();
  const imageGallery = useImageGallery();

  const canvasSelection = useCanvasSelection();
  const {
    fabricCanvas,
    setFabricCanvas,
    hasSelection,
    isSelectionLocked,
    isTextSelected,
    isGroupSelected,
    selectionOpacity,
    deleteSelection,
    toggleLockSelection,
    changeSelectionOpacity,
    duplicateSelection,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    nudgeSelection,
    groupSelection,
    ungroupSelection,
  } = canvasSelection;

  /**
   * Wrap deleteSelection with an explicit forced save.
   * The native Fabric `object:removed` event triggers a debounced save, but that
   * debounce can be cancelled if a tool-state React effect re-runs during the same
   * tick (e.g. wasAutoSwitched → setActiveTool → effect cleanup clears the timer).
   * Calling updateFrameData directly here guarantees the thumbnail always refreshes.
   */
  const deleteSelectionWithSave = useCallback(() => {
    canvasSelection.deleteSelection();
    const fc = canvasSelection.fabricCanvas;
    const fid = frameManager.currentFrameId;
    if (!fc || !fid) return;
    // Use a short delay so Fabric's internal cleanup (discard active object, re-render)
    // finishes before we capture the snapshot.
    setTimeout(() => {
      fc.renderAll();
      const json = (fc as any).toJSON(['erasable']);
      const thumbnail = fc.toDataURL({ format: 'png', quality: 0.8, multiplier: 0.2 });
      frameManager.updateFrameData(fid, json, thumbnail);
    }, 50);
  }, [canvasSelection, frameManager]);

  const toolState = useToolState(fabricCanvas);

  // Stable refs so the keydown handler NEVER goes stale without re-registering
  const undoRef = useRef(frameManager.undo);
  const redoRef = useRef(frameManager.redo);
  const hasSelectionRef = useRef(hasSelection);
  const deleteSelectionRef = useRef(deleteSelection);
  const duplicateSelectionRef = useRef(duplicateSelection);
  const toggleLockSelectionRef = useRef(toggleLockSelection);
  const setActiveToolRef = useRef(toolState.setActiveTool);
  const nudgeSelectionRef = useRef(nudgeSelection);
  const groupSelectionRef = useRef(groupSelection);
  const ungroupSelectionRef = useRef(ungroupSelection);
  useEffect(() => { undoRef.current = frameManager.undo; }, [frameManager.undo]);
  useEffect(() => { redoRef.current = frameManager.redo; }, [frameManager.redo]);
  useEffect(() => { hasSelectionRef.current = hasSelection; }, [hasSelection]);
  useEffect(() => { deleteSelectionRef.current = deleteSelectionWithSave; }, [deleteSelectionWithSave]);
  useEffect(() => { duplicateSelectionRef.current = duplicateSelection; }, [duplicateSelection]);
  useEffect(() => { toggleLockSelectionRef.current = toggleLockSelection; }, [toggleLockSelection]);
  useEffect(() => { setActiveToolRef.current = toolState.setActiveTool; }, [toolState.setActiveTool]);
  useEffect(() => { nudgeSelectionRef.current = nudgeSelection; }, [nudgeSelection]);
  useEffect(() => { groupSelectionRef.current = groupSelection; }, [groupSelection]);
  useEffect(() => { ungroupSelectionRef.current = ungroupSelection; }, [ungroupSelection]);

  // Global Keyboard Shortcuts — registered ONCE, reads fresh values via refs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoRef.current();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redoRef.current();
        return;
      }

      // Tool Switching (QWERTY sequence)
      const toolKeys: Record<string, string> = {
        'q': 'select',
        'w': 'brush',
        'e': 'eraser',
        'r': 'rectangle',
        't': 'circle',
        'y': 'triangle',
        'u': 'text'
      };

      const key = e.key.toLowerCase();
      if (toolKeys[key]) {
        setActiveToolRef.current(toolKeys[key] as any);
        return;
      }

      // Selection Actions
      if (hasSelectionRef.current) {
        // Arrow-key nudge: 1px normally, 10px with Shift
        const arrowMap: Record<string, [number, number]> = {
          'ArrowLeft':  [-1, 0],
          'ArrowRight': [ 1, 0],
          'ArrowUp':    [ 0,-1],
          'ArrowDown':  [ 0, 1],
        };
        if (arrowMap[e.key]) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const [dx, dy] = arrowMap[e.key];
          nudgeSelectionRef.current(dx * step, dy * step);
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          deleteSelectionRef.current();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && key === 'd') {
          e.preventDefault();
          duplicateSelectionRef.current();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && key === 'l') {
          e.preventDefault();
          toggleLockSelectionRef.current();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && key === 'g') {
          e.preventDefault();
          if (e.shiftKey) {
            ungroupSelectionRef.current();
          } else {
            groupSelectionRef.current();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty deps — handler registered once, reads fresh state via refs

  const value = {
    ...canvasSettings,
    ...frameManager,
    setFrameOpacity: frameManager.setFrameOpacity,
    setFrameBackgroundColor: frameManager.setFrameBackgroundColor,
    onionSkinOpacity: frameManager.onionSkinOpacity,
    setOnionSkinOpacity: frameManager.setOnionSkinOpacity,
    ...imageGallery,

    // Tools
    activeTool: toolState.activeTool,
    setActiveTool: toolState.setActiveTool,
    brushColor: toolState.brushColor,
    setBrushColor: toolState.setBrushColor,
    brushSize: toolState.brushSize,
    setBrushSize: toolState.setBrushSize,
    textSize: toolState.textSize,
    setTextSize: toolState.setTextSize,
    textFontFamily: toolState.textFontFamily,
    setTextFontFamily: toolState.setTextFontFamily,
    textStrokeColor: toolState.textStrokeColor,
    setTextStrokeColor: toolState.setTextStrokeColor,
    textStrokeWidth: toolState.textStrokeWidth,
    setTextStrokeWidth: toolState.setTextStrokeWidth,
    textLineHeight: toolState.textLineHeight,
    setTextLineHeight: toolState.setTextLineHeight,
    textCharSpacing: toolState.textCharSpacing,
    setTextCharSpacing: toolState.setTextCharSpacing,
    shapeFillMode: toolState.shapeFillMode,
    setShapeFillMode: toolState.setShapeFillMode,
    changeBrushColor: toolState.changeBrushColor,
    changeTextSize: toolState.changeTextSize,
    changeTextFontFamily: toolState.changeTextFontFamily,
    changeTextStrokeColor: toolState.changeTextStrokeColor,
    changeTextStrokeWidth: toolState.changeTextStrokeWidth,
    changeTextLineHeight: toolState.changeTextLineHeight,
    changeTextCharSpacing: toolState.changeTextCharSpacing,
    changeShapeFillMode: toolState.changeShapeFillMode,

    // Selection — override deleteSelection with the save-aware version
    ...canvasSelection,
    deleteSelection: deleteSelectionWithSave,
  };

  // We will patch useCanvasSelection using useEffect here, or better, we patch it inside the component.
  // For now, let's wire the sync up in a useEffect to keep things clean.
  React.useEffect(() => {
    if (!canvasSelection.fabricCanvas) return;
    const updateSelection = () => {
      const active = canvasSelection.fabricCanvas?.getActiveObject();
      if (active) {
        if (active.type === 'i-text' || active.type === 'text') {
          const textObj = active as fabric.IText;
          if (textObj.fontSize) toolState.setTextSize(textObj.fontSize);
          if (textObj.fontFamily) toolState.setTextFontFamily(textObj.fontFamily);
          if (textObj.fill && typeof textObj.fill === 'string') toolState.setBrushColor(textObj.fill);
          if (textObj.stroke && typeof textObj.stroke === 'string') toolState.setTextStrokeColor(textObj.stroke);
          if (textObj.strokeWidth !== undefined) toolState.setTextStrokeWidth(textObj.strokeWidth);
          if (textObj.lineHeight !== undefined) toolState.setTextLineHeight(textObj.lineHeight);
          if (textObj.charSpacing !== undefined) toolState.setTextCharSpacing(textObj.charSpacing);
        } else if (active.type === 'path') {
          const pathObj = active as fabric.Path;
          if (pathObj.strokeWidth) toolState.setBrushSize(pathObj.strokeWidth);
          if (pathObj.stroke && typeof pathObj.stroke === 'string') toolState.setBrushColor(pathObj.stroke);
        }
      }
    };
    canvasSelection.fabricCanvas.on('selection:created', updateSelection);
    canvasSelection.fabricCanvas.on('selection:updated', updateSelection);

    return () => {
      canvasSelection.fabricCanvas?.off('selection:created', updateSelection);
      canvasSelection.fabricCanvas?.off('selection:updated', updateSelection);
    };
  }, [
    canvasSelection.fabricCanvas,
    toolState.setTextSize,
    toolState.setTextFontFamily,
    toolState.setBrushColor,
    toolState.setBrushSize,
    toolState.setTextStrokeColor,
    toolState.setTextStrokeWidth,
    toolState.setTextLineHeight,
    toolState.setTextCharSpacing
  ]);


  return (
    <SpriteEditorContext.Provider value={value}>
      {children}
    </SpriteEditorContext.Provider>
  );
};

export const useSpriteEditor = () => {
  const context = useContext(SpriteEditorContext);
  if (context === undefined) {
    throw new Error('useSpriteEditor must be used within a SpriteEditorProvider');
  }
  return context;
};
