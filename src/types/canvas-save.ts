// Canvas save structure for version control

export interface CanvasSaveVersion {
  id: string;
  timestamp: number;
  version: number;
  canvasData: {
    width: number;
    height: number;
    backgroundColor: string;
    frameNumber: number;
    objects: string; // JSON stringified fabric objects
  };
}

export interface CanvasSaveState {
  currentVersion: number;
  versions: CanvasSaveVersion[];
}

export const STORAGE_KEY = 'animate2d_canvas_saves';
export const MAX_VERSIONS = 50; // Keep last 50 versions
