/**
 * SELECTION AND DESELECTION UTILITY FUNCTIONS
 * 
 * This file contains reusable utility functions and type definitions
 * for the selection/deselection system.
 * 
 * Each code section is separated by ========== for easy identification.
 */

import { fabric } from 'fabric';

// ==========================================================================
// SECTION 1: TYPE DEFINITIONS
// ==========================================================================

/**
 * Selection state ref type
 */
export type SelectionStateRef = React.MutableRefObject<boolean>;

/**
 * Fabric.js canvas type
 */
export type FabricCanvas = fabric.Canvas;

/**
 * Selection control properties
 */
export interface SelectionControlProps {
  borderColor: string;
  cornerColor: string;
  cornerStyle: 'rect' | 'circle';
  cornerSize: number;
  transparentCorners: boolean;
  borderScaleFactor: number;
  padding: number;
  borderDashArray: number[];
}

// ==========================================================================
// SECTION 2: CONSTANTS
// ==========================================================================

/**
 * Default selection control styling
 * These properties make selection controls visible and consistent
 */
export const DEFAULT_SELECTION_CONTROLS: SelectionControlProps = {
  borderColor: 'rgba(0, 0, 0, 0.6)',
  cornerColor: 'rgba(0, 0, 0, 0.9)',
  cornerStyle: 'circle',
  cornerSize: 12,
  transparentCorners: false,
  borderScaleFactor: 2,
  padding: 8,
  borderDashArray: [5, 5],
};

// ==========================================================================
// SECTION 3: SELECTION STATE MANAGEMENT
// ==========================================================================

/**
 * Update selection state ref when an object is selected
 * Call this after canvas.setActiveObject()
 */
export function markAsSelected(selectionRef: SelectionStateRef): void {
  selectionRef.current = true;
  console.log('[Selection] Object marked as selected');
}

/**
 * Update selection state ref when selection is cleared
 * Call this after canvas.discardActiveObject()
 */
export function markAsDeselected(selectionRef: SelectionStateRef): void {
  selectionRef.current = false;
  console.log('[Selection] Object marked as deselected');
}

/**
 * Check if something is currently selected
 */
export function isSelected(selectionRef: SelectionStateRef): boolean {
  return selectionRef.current;
}

// ==========================================================================
// SECTION 4: OBJECT CREATION HELPERS
// ==========================================================================

/**
 * Make an object selectable with proper control styling
 * Call this when making objects selectable after creation
 */
export function makeSelectable(
  obj: fabric.Object,
  controls: Partial<SelectionControlProps> = {}
): void {
  const finalControls = { ...DEFAULT_SELECTION_CONTROLS, ...controls };
  
  obj.set({
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    ...finalControls,
  });
}

/**
 * Make an object non-selectable
 * Use this for background elements, eraser paths, etc.
 */
export function makeNonSelectable(obj: fabric.Object): void {
  obj.set({
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
  });
}

// ==========================================================================
// SECTION 5: MOUSE EVENT HELPERS
// ==========================================================================

/**
 * Find the target object at the mouse position
 * Returns the object if found, null if clicking on empty space
 */
export function findTargetAtPointer(
  canvas: FabricCanvas,
  event: MouseEvent | TouchEvent
): fabric.Object | null {
  return canvas.findTarget(event as any, false);
}

/**
 * Check if clicking on empty space (no target)
 */
export function isClickingEmptySpace(
  canvas: FabricCanvas,
  event: MouseEvent | TouchEvent
): boolean {
  const target = findTargetAtPointer(canvas, event);
  return target === null;
}

/**
 * Check if clicking on an existing object
 */
export function isClickingOnObject(
  canvas: FabricCanvas,
  event: MouseEvent | TouchEvent
): boolean {
  const target = findTargetAtPointer(canvas, event);
  return target !== null;
}

// ==========================================================================
// SECTION 6: SELECTION ACTIONS
// ==========================================================================

/**
 * Select an object and update the selection ref
 * This is the CORRECT way to programmatically select objects
 */
export function selectObject(
  canvas: FabricCanvas,
  obj: fabric.Object,
  selectionRef: SelectionStateRef
): void {
  canvas.setActiveObject(obj);
  markAsSelected(selectionRef);
  canvas.renderAll();
}

/**
 * Deselect all objects and update the selection ref
 * This is the CORRECT way to programmatically deselect
 */
export function deselectAll(
  canvas: FabricCanvas,
  selectionRef: SelectionStateRef
): void {
  canvas.discardActiveObject();
  markAsDeselected(selectionRef);
  canvas.renderAll();
}

// ==========================================================================
// SECTION 7: EVENT LISTENER SETUP
// ==========================================================================

/**
 * Setup selection event listeners on a canvas
 * Call this once during canvas initialization
 */
export function setupSelectionListeners(
  canvas: FabricCanvas,
  selectionRef: SelectionStateRef
): void {
  // User selects an object by clicking
  canvas.on('selection:created', () => {
    console.log('[Selection Event] selection:created');
    markAsSelected(selectionRef);
  });

  // User switches to a different object
  canvas.on('selection:updated', () => {
    console.log('[Selection Event] selection:updated');
    markAsSelected(selectionRef);
  });

  // User deselects (clicks empty space or presses Escape)
  canvas.on('selection:cleared', () => {
    console.log('[Selection Event] selection:cleared');
    markAsDeselected(selectionRef);
  });
}

/**
 * Remove selection event listeners
 * Call this during cleanup
 */
export function removeSelectionListeners(canvas: FabricCanvas): void {
  canvas.off('selection:created');
  canvas.off('selection:updated');
  canvas.off('selection:cleared');
}

// ==========================================================================
// SECTION 8: MOUSE DOWN HANDLER LOGIC
// ==========================================================================

/**
 * Handle mouse down event with proper deselection logic
 * Returns true if the event should create a new object, false otherwise
 */
export function shouldCreateNewObject(
  canvas: FabricCanvas,
  event: MouseEvent | TouchEvent,
  selectionRef: SelectionStateRef
): boolean {
  // If clicking on an existing object, don't create new object
  if (isClickingOnObject(canvas, event)) {
    console.log('[Mouse Down] Clicking on object - no new object');
    return false;
  }

  // Clicking on empty space
  // If something is selected, just deselect - don't create new object
  if (isSelected(selectionRef)) {
    console.log('[Mouse Down] Deselecting active object');
    deselectAll(canvas, selectionRef);
    return false;
  }

  // Nothing selected and clicking empty space - create new object
  console.log('[Mouse Down] Creating new object');
  return true;
}

// ==========================================================================
// SECTION 9: COMPLETE MOUSE DOWN HANDLER EXAMPLE
// ==========================================================================

/**
 * Example mouse down handler using the utility functions
 */
export function handleMouseDownExample(
  canvas: FabricCanvas,
  event: fabric.IEvent,
  selectionRef: SelectionStateRef,
  currentTool: string,
  callbacks: {
    onCreateText?: (x: number, y: number) => void;
    onStartLine?: (x: number, y: number) => void;
    onStartShape?: (x: number, y: number) => void;
  }
): void {
  // Skip if in drawing mode (brush/eraser)
  if (canvas.isDrawingMode) return;

  const mouseEvent = event.e as MouseEvent;

  // Check if we should create a new object
  if (!shouldCreateNewObject(canvas, mouseEvent, selectionRef)) {
    return;
  }

  // Get pointer position
  const pointer = canvas.getPointer(event.e);

  // Handle different tools
  switch (currentTool) {
    case 'text':
      callbacks.onCreateText?.(pointer.x, pointer.y);
      break;
    case 'line':
      callbacks.onStartLine?.(pointer.x, pointer.y);
      break;
    case 'rectangle':
    case 'circle':
    case 'triangle':
      callbacks.onStartShape?.(pointer.x, pointer.y);
      break;
  }
}

// ==========================================================================
// SECTION 10: USAGE EXAMPLE
// ==========================================================================

/**
 * COMPLETE USAGE EXAMPLE:
 * 
 * import {
 *   setupSelectionListeners,
 *   selectObject,
 *   deselectAll,
 *   makeSelectable,
 *   shouldCreateNewObject,
 * } from './selection-utils';
 * 
 * // 1. Create ref
 * const selectionRef = useRef<boolean>(false);
 * 
 * // 2. Setup listeners on canvas init
 * useEffect(() => {
 *   const canvas = fabricCanvasRef.current;
 *   if (!canvas) return;
 *   
 *   setupSelectionListeners(canvas, selectionRef);
 *   
 *   return () => {
 *     removeSelectionListeners(canvas);
 *   };
 * }, []);
 * 
 * // 3. Use in mouse down handler
 * const handleMouseDown = (e: fabric.IEvent) => {
 *   const canvas = fabricCanvasRef.current;
 *   if (!canvas) return;
 *   
 *   if (!shouldCreateNewObject(canvas, e.e as MouseEvent, selectionRef)) {
 *     return;
 *   }
 *   
 *   // Create new object...
 * };
 * 
 * // 4. Use when creating objects
 * const addText = (x: number, y: number) => {
 *   const canvas = fabricCanvasRef.current;
 *   if (!canvas) return;
 *   
 *   const text = new fabric.IText('Text', { left: x, top: y });
 *   makeSelectable(text);
 *   canvas.add(text);
 *   selectObject(canvas, text, selectionRef); // ← Use helper
 * };
 */

// ==========================================================================
// SECTION 11: DEBUGGING HELPERS
// ==========================================================================

/**
 * Log current selection state for debugging
 */
export function debugSelectionState(
  canvas: FabricCanvas,
  selectionRef: SelectionStateRef
): void {
  const activeObject = canvas.getActiveObject();
  const refState = selectionRef.current;
  
  console.group('[Selection Debug]');
  console.log('Ref state:', refState);
  console.log('Active object:', activeObject);
  console.log('Match:', (!!activeObject) === refState ? '✅' : '❌');
  console.groupEnd();
}

/**
 * Validate that ref state matches actual canvas state
 * Returns true if in sync, false if out of sync
 */
export function validateSelectionState(
  canvas: FabricCanvas,
  selectionRef: SelectionStateRef
): boolean {
  const activeObject = canvas.getActiveObject();
  const refState = selectionRef.current;
  const isInSync = (!!activeObject) === refState;
  
  if (!isInSync) {
    console.warn('[Selection] State out of sync!', {
      refState,
      hasActiveObject: !!activeObject,
    });
  }
  
  return isInSync;
}

export {};
