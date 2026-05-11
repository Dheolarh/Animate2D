/**
 * Singleton FFmpeg WASM loader.
 *
 * Call `warmupFFmpeg()` early (e.g. when SettingsPanel mounts) to start the
 * 32 MB download in the background.  By the time the user clicks "Export MP4"
 * the WASM will already be cached and ready.
 *
 * Uses the single-threaded core (@ffmpeg/core) so NO SharedArrayBuffer /
 * COOP-COEP HTTP headers are required.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// CDN for the single-threaded core (no special HTTP headers needed)
const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type FFmpegLoadProgress = (ratio: number) => void;

/** Returns the shared FFmpeg instance, loading it if needed. */
export const getFFmpeg = (onProgress?: FFmpegLoadProgress): Promise<FFmpeg> => {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();

    if (onProgress) {
      instance.on('progress', ({ progress }) => onProgress(Math.min(progress, 1)));
    }

    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
};

/**
 * Call this early to start the background download.
 * Safe to call multiple times — only one download ever runs.
 */
export const warmupFFmpeg = () => {
  getFFmpeg().catch(() => {
    // Reset so the user can retry on next export attempt
    loadPromise = null;
    ffmpeg = null;
  });
};

export { fetchFile };
export type { FFmpeg };
