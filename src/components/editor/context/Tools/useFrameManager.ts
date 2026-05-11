import { useState, useEffect, useRef, useCallback } from 'react';
import type { EditorFrame } from '../../types/spriteEditor';

const STORAGE_KEY = 'animate2d_frames';
const CURRENT_FRAME_KEY = 'animate2d_current_frame';

const loadInitialFrames = (): EditorFrame[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load frames from localStorage", e);
  }
  return [{ id: `frame_${Date.now()}`, fabricData: null, thumbnail: null }];
};

export const useFrameManager = () => {
  const [frames, setFrames] = useState<EditorFrame[]>(loadInitialFrames);
  
  const [currentFrameId, setCurrentFrameId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_FRAME_KEY);
      if (saved) {
        // Just verify it exists in the initially loaded frames
        const exists = loadInitialFrames().some(f => f.id === saved);
        if (exists) return saved;
      }
    } catch (e) {
      console.error("Failed to load current frame from localStorage", e);
    }
    // Fallback to the first frame
    return loadInitialFrames()[0]?.id || null;
  });
  
  const [past, setPast] = useState<{frames: EditorFrame[], currentFrameId: string | null}[]>([]);
  const [future, setFuture] = useState<{frames: EditorFrame[], currentFrameId: string | null}[]>([]);
  const [historyRevision, setHistoryRevision] = useState(0);
  
  const [onionSkinFrameCount, setOnionSkinFrameCount] = useState<number>(5);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Live refs so undo/redo never have stale closures
  const framesRef = useRef(frames);
  const currentFrameIdRef = useRef(currentFrameId);
  const pastRef = useRef(past);
  const futureRef = useRef(future);
  useEffect(() => { framesRef.current = frames; }, [frames]);
  useEffect(() => { currentFrameIdRef.current = currentFrameId; }, [currentFrameId]);
  useEffect(() => { pastRef.current = past; }, [past]);
  useEffect(() => { futureRef.current = future; }, [future]);

  // Persist frames on change
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(frames));
        setSaveStatus('saved');
      } catch (e) {
        console.error("Failed to save frames to localStorage", e);
        setSaveStatus('unsaved');
      }
    }, 500); // Small delay to let the UI show "Saving..." and debounce heavy JSON stringification
    return () => clearTimeout(timer);
  }, [frames]);

  // Persist current frame ID on change
  useEffect(() => {
    if (currentFrameId) {
      try {
        localStorage.setItem(CURRENT_FRAME_KEY, currentFrameId);
      } catch (e) {
        console.error("Failed to save current frame to localStorage", e);
      }
    }
  }, [currentFrameId]);

  const pushHistory = (currentFrames: EditorFrame[], currentId: string | null) => {
    setPast(p => [...p, { frames: currentFrames, currentFrameId: currentId }]);
    setFuture([]);
  };

  // Debounced history for canvas drawing — captures a snapshot before each
  // "drawing session" (collapses rapid strokes into one undo step)
  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preDrawSnapshotRef = useRef<{frames: EditorFrame[], currentFrameId: string | null} | null>(null);
  // Flag set during undo/redo so the canvas reload doesn't wipe the redo stack
  const isRestoringHistoryRef = useRef(false);

  const undo = useCallback(() => {
    const p = pastRef.current;
    if (p.length === 0) return;
    const previous = p[p.length - 1];
    isRestoringHistoryRef.current = true;
    setPast(p.slice(0, p.length - 1));
    setFuture(f => [{ frames: framesRef.current, currentFrameId: currentFrameIdRef.current }, ...f]);
    setFrames(previous.frames);
    setCurrentFrameId(previous.currentFrameId);
    setHistoryRevision(r => r + 1);
    // Allow new drawing to push history again after canvas settles
    setTimeout(() => { isRestoringHistoryRef.current = false; }, 1000);
  }, []);

  const redo = useCallback(() => {
    const f = futureRef.current;
    if (f.length === 0) return;
    const next = f[0];
    isRestoringHistoryRef.current = true;
    setPast(p => [...p, { frames: framesRef.current, currentFrameId: currentFrameIdRef.current }]);
    setFuture(f.slice(1));
    setFrames(next.frames);
    setCurrentFrameId(next.currentFrameId);
    setHistoryRevision(r => r + 1);
    setTimeout(() => { isRestoringHistoryRef.current = false; }, 1000);
  }, []);

  const addFrame = () => {
    setFrames(prev => {
      pushHistory(prev, currentFrameId);
      const newFrameId = `frame_${Date.now()}`;
      setCurrentFrameId(newFrameId);
      return [...prev, { id: newFrameId, fabricData: null, thumbnail: null }];
    });
  };

  const duplicateFrame = (id: string) => {
    setFrames(prev => {
      pushHistory(prev, currentFrameId);
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      const targetFrame = prev[index];
      const newFrameId = `frame_${Date.now()}`;
      const newFrames = [...prev];
      newFrames.splice(index + 1, 0, {
        id: newFrameId,
        fabricData: targetFrame.fabricData ? JSON.parse(JSON.stringify(targetFrame.fabricData)) : null,
        thumbnail: targetFrame.thumbnail
      });
      setCurrentFrameId(newFrameId);
      return newFrames;
    });
  };

  const deleteFrame = (id: string) => {
    setFrames(prev => {
      if (prev.length <= 1) return prev; // Don't delete the last frame
      
      pushHistory(prev, currentFrameId);
      const newFrames = prev.filter(f => f.id !== id);
      
      // Update currentFrameId if we deleted the current frame
      if (currentFrameId === id) {
        const deletedIndex = prev.findIndex(f => f.id === id);
        // Try to select the previous frame, or the next one if it was the first
        const newSelectedFrame = newFrames[deletedIndex - 1] || newFrames[0];
        setCurrentFrameId(newSelectedFrame.id);
      }
      
      return newFrames;
    });
  };

  const selectFrame = (id: string) => {
    if (frames.find(f => f.id === id)) {
      setCurrentFrameId(id);
    }
  };

  const reorderFrames = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setFrames(prev => {
      pushHistory(prev, currentFrameId);
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // updateFrameData pushes to history, but debounced at 800ms so rapid strokes
  // collapse into a single undo step instead of flooding the stack.
  const updateFrameData = (id: string, fabricData: any, thumbnail: string) => {
    setFrames(prev => {
      // If we're in the middle of an undo/redo, just update the data — skip history
      if (!isRestoringHistoryRef.current) {
        // Capture snapshot BEFORE the change, but only once per drawing session
        if (!preDrawSnapshotRef.current) {
          preDrawSnapshotRef.current = { frames: prev, currentFrameId: currentFrameIdRef.current };
        }

        // Reset the debounce timer — fires 800ms after the last stroke
        if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = setTimeout(() => {
          if (preDrawSnapshotRef.current) {
            setPast(p => [...p, preDrawSnapshotRef.current!]);
            setFuture([]);
            preDrawSnapshotRef.current = null;
          }
        }, 300);
      }

      return prev.map(f =>
        f.id === id ? { ...f, fabricData, thumbnail } : f
      );
    });
  };

  return {
    frames,
    currentFrameId,
    addFrame,
    duplicateFrame,
    deleteFrame,
    selectFrame,
    reorderFrames,
    updateFrameData,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyRevision,
    onionSkinFrameCount,
    setOnionSkinFrameCount,
    saveStatus,
    setSaveStatus
  };
};
