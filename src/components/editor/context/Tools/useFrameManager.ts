import { useState, useEffect, useRef, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import type { EditorFrame } from '../../types/spriteEditor';

const defaultFrame = (): EditorFrame => ({
  id: `frame_${Date.now()}`,
  fabricData: null,
  thumbnail: null,
  opacity: 100,
});

export const useFrameManager = (projectId: string) => {
  // Project-specific storage keys
  const STORAGE_KEY = `animate2d_frames_${projectId}`;
  const CURRENT_FRAME_KEY = `animate2d_current_frame_${projectId}`;

  const [frames, setFrames] = useState<EditorFrame[]>([]);
  const [currentFrameId, setCurrentFrameId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [past, setPast] = useState<{frames: EditorFrame[], currentFrameId: string | null}[]>([]);
  const [future, setFuture] = useState<{frames: EditorFrame[], currentFrameId: string | null}[]>([]);
  const [historyRevision, setHistoryRevision] = useState(0);

  const [onionSkinFrameCount, setOnionSkinFrameCount] = useState<number>(5);
  const [onionSkinOpacity, setOnionSkinOpacity] = useState<number>(40);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // ── Live refs so undo/redo never have stale closures ───────────────────────
  const framesRef = useRef(frames);
  const currentFrameIdRef = useRef(currentFrameId);
  const pastRef = useRef(past);
  const futureRef = useRef(future);
  useEffect(() => { framesRef.current = frames; }, [frames]);
  useEffect(() => { currentFrameIdRef.current = currentFrameId; }, [currentFrameId]);
  useEffect(() => { pastRef.current = past; }, [past]);
  useEffect(() => { futureRef.current = future; }, [future]);

  // ── Hydrate from IndexedDB on mount ───────────────────────────────────────
  useEffect(() => {
    Promise.all([
      get<EditorFrame[]>(STORAGE_KEY),
      get<string>(CURRENT_FRAME_KEY),
    ]).then(([savedFrames, savedFrameId]) => {
      const loadedFrames =
        savedFrames && savedFrames.length > 0 ? savedFrames : [defaultFrame()];

      const validId =
        savedFrameId && loadedFrames.some(f => f.id === savedFrameId)
          ? savedFrameId
          : loadedFrames[0].id;

      setFrames(loadedFrames);
      setCurrentFrameId(validId);
      setIsHydrated(true);
    }).catch(() => {
      const first = defaultFrame();
      setFrames([first]);
      setCurrentFrameId(first.id);
      setIsHydrated(true);
    });
  }, [projectId, STORAGE_KEY, CURRENT_FRAME_KEY]);

  // ── Persist frames to IndexedDB (only after hydration) ─────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      set(STORAGE_KEY, frames)
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('unsaved'));
    }, 500);
    return () => clearTimeout(timer);
  }, [frames, isHydrated, STORAGE_KEY]);

  // ── Persist current frame ID ───────────────────────────────────────────────
  useEffect(() => {
    if (currentFrameId && isHydrated) {
      set(CURRENT_FRAME_KEY, currentFrameId).catch(() => {});
    }
  }, [currentFrameId, isHydrated, CURRENT_FRAME_KEY]);

  const pushHistory = (currentFrames: EditorFrame[], currentId: string | null) => {
    setPast(p => [...p, { frames: currentFrames, currentFrameId: currentId }]);
    setFuture([]);
  };

  // Debounced history for canvas drawing
  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preDrawSnapshotRef = useRef<{frames: EditorFrame[], currentFrameId: string | null} | null>(null);
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
      if (prev.length <= 1) return prev;
      pushHistory(prev, currentFrameId);
      const newFrames = prev.filter(f => f.id !== id);
      if (currentFrameId === id) {
        const deletedIndex = prev.findIndex(f => f.id === id);
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

  const updateFrameData = (id: string, fabricData: any, thumbnail: string) => {
    setFrames(prev => {
      if (!isRestoringHistoryRef.current) {
        if (!preDrawSnapshotRef.current) {
          preDrawSnapshotRef.current = { frames: prev, currentFrameId: currentFrameIdRef.current };
        }
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

  const setFrameOpacity = (id: string, opacity: number) => {
    setFrames(prev => prev.map(f =>
      f.id === id ? { ...f, opacity } : f
    ));
  };

  const setFrameBackgroundColor = (id: string, color: string, applyToAll: boolean = false) => {
    setFrames(prev => prev.map(f =>
      (applyToAll || f.id === id) ? { ...f, backgroundColor: color } : f
    ));
  };

  return {
    frames,
    currentFrameId,
    isHydrated,
    addFrame,
    duplicateFrame,
    deleteFrame,
    selectFrame,
    reorderFrames,
    updateFrameData,
    setFrameOpacity,
    setFrameBackgroundColor,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyRevision,
    onionSkinFrameCount,
    setOnionSkinFrameCount,
    onionSkinOpacity,
    setOnionSkinOpacity,
    saveStatus,
    setSaveStatus,
  };
};
