# Selection and Deselection System - Copiable Code

This folder contains reusable code for implementing the selection/deselection system in Fabric.js canvas applications.

## Files

### 1. `selection-deselection-system.tsx`
Complete implementation with all code sections separated by `==========`.

**Contains:**
- Ref declaration for tracking selection state
- Selection event listeners setup
- Mouse down handler with deselect logic
- Mouse up handler with manual ref updates
- addText function with manual ref update
- addImage function with manual ref update
- Key principles and explanations
- Common pitfalls to avoid
- Testing checklist
- Integration guide

**Sections:**
1. REF DECLARATION FOR TRACKING SELECTION STATE
2. SELECTION EVENT LISTENERS
3. MOUSE DOWN HANDLER WITH DESELECT LOGIC
4. MOUSE UP HANDLER - MANUAL REF UPDATE FOR SHAPES/LINES
5. ADD TEXT FUNCTION - MANUAL REF UPDATE
6. ADD IMAGE FUNCTION - MANUAL REF UPDATE
7. KEY PRINCIPLES AND EXPLANATION
8. COMMON PITFALLS TO AVOID
9. TESTING CHECKLIST
10. INTEGRATION GUIDE

### 2. `selection-utils.ts`
Reusable utility functions and type definitions.

**Contains:**
- Type definitions (SelectionStateRef, FabricCanvas, SelectionControlProps)
- Constants (DEFAULT_SELECTION_CONTROLS)
- Selection state management functions
- Object creation helpers (makeSelectable, makeNonSelectable)
- Mouse event helpers (findTargetAtPointer, isClickingEmptySpace, etc.)
- Selection actions (selectObject, deselectAll)
- Event listener setup/teardown
- Mouse down handler logic
- Complete usage examples
- Debugging helpers

**Sections:**
1. TYPE DEFINITIONS
2. CONSTANTS
3. SELECTION STATE MANAGEMENT
4. OBJECT CREATION HELPERS
5. MOUSE EVENT HELPERS
6. SELECTION ACTIONS
7. EVENT LISTENER SETUP
8. MOUSE DOWN HANDLER LOGIC
9. COMPLETE MOUSE DOWN HANDLER EXAMPLE
10. USAGE EXAMPLE
11. DEBUGGING HELPERS

## Quick Start

### Option 1: Copy Raw Implementation

Copy code sections from `selection-deselection-system.tsx` directly into your component.

### Option 2: Use Utility Functions

Import and use the utility functions from `selection-utils.ts`:

```typescript
import {
  setupSelectionListeners,
  selectObject,
  deselectAll,
  makeSelectable,
  shouldCreateNewObject,
} from './copiables/selection-utils';

// 1. Create ref
const selectionRef = useRef<boolean>(false);

// 2. Setup listeners
useEffect(() => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;
  
  setupSelectionListeners(canvas, selectionRef);
  
  return () => removeSelectionListeners(canvas);
}, []);

// 3. Use in handlers
const handleMouseDown = (e: fabric.IEvent) => {
  if (!shouldCreateNewObject(canvas, e.e as MouseEvent, selectionRef)) {
    return;
  }
  // Create new object...
};

const addText = (x: number, y: number) => {
  const text = new fabric.IText('Text', { left: x, top: y });
  makeSelectable(text);
  canvas.add(text);
  selectObject(canvas, text, selectionRef); // ← Correct way
};
```

## Key Concepts

### The Problem

When clicking on empty space to deselect a selected object, a new object was created instead of just deselecting.

### Root Cause

1. Fabric.js's internal event handling runs before custom handlers
2. By the time our handler runs, the object is already deselected
3. Checking `canvas.getActiveObject()` returns null even though something was selected
4. Programmatic selection (`setActiveObject()`) doesn't always fire events

### The Solution

1. **Track selection state independently** using a ref
2. **Update ref via Fabric.js events** for user-initiated selections
3. **Manually update ref** after programmatic selections
4. **Check ref in mouse:down** to determine if something was selected

### Critical Rules

1. ✅ **ALWAYS** manually update ref after `canvas.setActiveObject()`
2. ✅ **ALWAYS** check for target before deselecting
3. ✅ **ALWAYS** update ref when manually calling `discardActiveObject()`
4. ❌ **NEVER** rely on `getActiveObject()` in mouse:down handler
5. ❌ **NEVER** forget to setup selection event listeners

## Testing

Run through this checklist to verify the implementation:

- [ ] Create text → click empty space → deselects (no new text)
- [ ] Create shape → click empty space → deselects (no new shape)
- [ ] Draw line → click empty space → deselects (no new line)
- [ ] Add image → click empty space → deselects (no new image)
- [ ] After deselecting, click empty space → creates new object
- [ ] Click on object → selects it
- [ ] Click on different object → switches selection
- [ ] Multi-select → click empty space → deselects all

## Debugging

Use the debug helpers from `selection-utils.ts`:

```typescript
import { debugSelectionState, validateSelectionState } from './copiables/selection-utils';

// Log current state
debugSelectionState(canvas, selectionRef);

// Validate state is in sync
const isValid = validateSelectionState(canvas, selectionRef);
```

## Common Issues

### Issue: Deselect still creates new object

**Cause:** Forgot to manually update ref after `setActiveObject()`

**Fix:** Add `hasActiveSelectionRef.current = true;` after every `canvas.setActiveObject()` call

### Issue: Can't select objects by clicking

**Cause:** Not checking for target in mouse:down handler

**Fix:** Use `canvas.findTarget()` and return early if target exists

### Issue: Ref state out of sync

**Cause:** Missing event listeners or manual updates

**Fix:** Ensure `setupSelectionListeners()` is called and all `setActiveObject()` calls update the ref

## Version History

- v110: Initial implementation with manual ref updates
- v109: Added debug logging
- v108: First attempt with event-based tracking
- v107: Previous approach using `getActiveObject()` (failed)

## Related Documentation

- `THREE_CRITICAL_FIXES.md` - Complete explanation of all three bugs
- `DESELECT_FIX_V2.md` - Detailed explanation of the deselect fix
- `FABRIC_IMPLEMENTATION_GUIDE.md` - General Fabric.js implementation guide

## License

This code is part of the Animate 2D project and can be freely copied and adapted.
