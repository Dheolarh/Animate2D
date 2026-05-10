// Canvas save utilities for localStorage

import { CanvasSaveVersion, CanvasSaveState, STORAGE_KEY, MAX_VERSIONS } from '@/types/canvas-save';

/**
 * Load all canvas save versions from localStorage
 */
export function loadCanvasSaves(): CanvasSaveState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      console.log('[STORAGE] No saved data found in localStorage');
      return {
        currentVersion: -1,
        versions: [],
      };
    }
    console.log('[STORAGE] Loading from localStorage, size:', saved.length, 'bytes');
    const parsed = JSON.parse(saved) as CanvasSaveState;
    console.log('[STORAGE] Loaded', parsed.versions.length, 'versions');
    console.log('[STORAGE] Current version:', parsed.currentVersion);
    return parsed;
  } catch (error) {
    console.error('[STORAGE] Failed to load canvas saves:', error);
    return {
      currentVersion: -1,
      versions: [],
    };
  }
}

/**
 * Save a new canvas version to localStorage
 */
export function saveCanvasVersion(
  width: number,
  height: number,
  backgroundColor: string,
  frameNumber: number,
  objects: string
): CanvasSaveVersion {
  const saveState = loadCanvasSaves();
  
  // Create new version
  const newVersion: CanvasSaveVersion = {
    id: `v${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    version: saveState.versions.length,
    canvasData: {
      width,
      height,
      backgroundColor,
      frameNumber,
      objects,
    },
  };

  // If we're not at the latest version (user did undo), remove future versions
  if (saveState.currentVersion < saveState.versions.length - 1) {
    saveState.versions = saveState.versions.slice(0, saveState.currentVersion + 1);
  }

  // Add new version
  saveState.versions.push(newVersion);
  
  // Keep only last MAX_VERSIONS
  if (saveState.versions.length > MAX_VERSIONS) {
    saveState.versions = saveState.versions.slice(-MAX_VERSIONS);
    // Renumber versions
    saveState.versions.forEach((v, i) => {
      v.version = i;
    });
  }

  // Update current version pointer
  saveState.currentVersion = saveState.versions.length - 1;

  // Save to localStorage
  try {
    const saveStateJSON = JSON.stringify(saveState);
    console.log('[STORAGE] Saving to localStorage, size:', saveStateJSON.length, 'bytes');
    console.log('[STORAGE] Total versions:', saveState.versions.length);
    console.log('[STORAGE] Current version:', saveState.currentVersion);
    localStorage.setItem(STORAGE_KEY, saveStateJSON);
    console.log('[STORAGE] Successfully saved to localStorage');
  } catch (error) {
    console.error('[STORAGE] Failed to save canvas version:', error);
    if (error instanceof Error) {
      console.error('[STORAGE] Error name:', error.name);
      console.error('[STORAGE] Error message:', error.message);
    }
  }

  return newVersion;
}

/**
 * Get a specific version by index
 */
export function getCanvasVersion(versionIndex: number): CanvasSaveVersion | null {
  const saveState = loadCanvasSaves();
  if (versionIndex < 0 || versionIndex >= saveState.versions.length) {
    return null;
  }
  return saveState.versions[versionIndex];
}

/**
 * Get the current version
 */
export function getCurrentVersion(): CanvasSaveVersion | null {
  const saveState = loadCanvasSaves();
  if (saveState.currentVersion < 0) {
    return null;
  }
  return saveState.versions[saveState.currentVersion];
}

/**
 * Revert to previous version (Ctrl+Z)
 */
export function revertToPreviousVersion(): CanvasSaveVersion | null {
  const saveState = loadCanvasSaves();
  
  if (saveState.currentVersion <= 0) {
    return null; // No previous version
  }

  saveState.currentVersion--;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
  } catch (error) {
    console.error('Failed to revert version:', error);
  }

  return saveState.versions[saveState.currentVersion];
}

/**
 * Redo to next version (Ctrl+Y)
 */
export function redoToNextVersion(): CanvasSaveVersion | null {
  const saveState = loadCanvasSaves();
  
  if (saveState.currentVersion >= saveState.versions.length - 1) {
    return null; // No next version
  }

  saveState.currentVersion++;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
  } catch (error) {
    console.error('Failed to redo version:', error);
  }

  return saveState.versions[saveState.currentVersion];
}

/**
 * Clear all saves
 */
export function clearAllSaves(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saves:', error);
  }
}

/**
 * Get version history info
 */
export function getVersionInfo(): { current: number; total: number; canUndo: boolean; canRedo: boolean } {
  const saveState = loadCanvasSaves();
  return {
    current: saveState.currentVersion,
    total: saveState.versions.length,
    canUndo: saveState.currentVersion > 0,
    canRedo: saveState.currentVersion < saveState.versions.length - 1,
  };
}
