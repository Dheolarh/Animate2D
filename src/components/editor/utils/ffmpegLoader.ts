/**
 * Singleton FFmpeg WASM loader with real download-progress tracking.
 *
 * `@ffmpeg/ffmpeg`'s built-in `progress` event only fires during encoding.
 * This loader manually fetches the core JS + WASM with a ReadableStream reader
 * so we can report actual byte-level download progress.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

// Known compressed sizes (bytes) — used as fallback when Content-Length is absent.
// WASM is the dominant file (~9 MB gzipped from unpkg).
const APPROX_WASM_BYTES = 9_500_000;

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// All registered progress listeners (registered before OR after load starts)
const progressListeners = new Set<(ratio: number) => void>();

export type FFmpegLoadProgress = (ratio: number) => void;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a URL and convert it to an ObjectURL, reporting byte progress.
 * `weight` controls how much of the overall 0-1 range this file covers.
 */
const fetchBlobURL = async (
  url: string,
  mimeType: string,
  onProgress?: (ratio: number) => void
): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FFmpeg fetch failed (${res.status}): ${url}`);

  const contentLength = res.headers.get('content-length');
  const total = contentLength
    ? parseInt(contentLength, 10)
    : APPROX_WASM_BYTES; // graceful fallback

  const reader = res.body!.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress) onProgress(Math.min(loaded / total, 0.99)); // cap at 99% until complete
  }

  if (onProgress) onProgress(1);
  return URL.createObjectURL(new Blob(chunks, { type: mimeType }));
};

const broadcastProgress = (ratio: number) => {
  progressListeners.forEach(fn => fn(ratio));
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns the shared FFmpeg instance, loading it if needed. */
export const getFFmpeg = (onProgress?: FFmpegLoadProgress): Promise<FFmpeg> => {
  if (onProgress) progressListeners.add(onProgress);

  if (ffmpegInstance) {
    onProgress?.(1);
    return Promise.resolve(ffmpegInstance);
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const instance = new FFmpeg();

      broadcastProgress(0.01); // show immediate movement at 1%

      // Download JS (~300 KB) — counts as the first 5% 
      const coreURL = await fetchBlobURL(
        `${CORE_BASE}/ffmpeg-core.js`,
        'text/javascript',
        (r) => broadcastProgress(r * 0.05)         // 0 → 5%
      );

      // Download WASM (~9 MB gzipped) — counts as the next 90%
      const wasmURL = await fetchBlobURL(
        `${CORE_BASE}/ffmpeg-core.wasm`,
        'application/wasm',
        (r) => broadcastProgress(0.05 + r * 0.90)  // 5% → 95%
      );

      broadcastProgress(0.96); // starting WASM compilation…

      // WASM compilation can take 10-60s — slowly crawl 96→99% so it
      // looks alive instead of frozen. Jumps to 100% when actually done.
      let compileProgress = 0.96;
      const crawlInterval = setInterval(() => {
        compileProgress = Math.min(compileProgress + 0.003, 0.99);
        broadcastProgress(compileProgress);
      }, 500);

      try {
        await instance.load({ coreURL, wasmURL });
      } finally {
        clearInterval(crawlInterval);
      }

      broadcastProgress(1);   // done
      ffmpegInstance = instance;
      return instance;
    })().catch(err => {
      loadPromise = null;
      ffmpegInstance = null;
      progressListeners.clear();
      throw err;
    });
  }

  return loadPromise;
};

/**
 * Call early to start the background download.
 * Safe to call multiple times — only one download ever runs.
 */
export const warmupFFmpeg = () => {
  getFFmpeg().catch(() => { /* reset already handled inside getFFmpeg */ });
};

export { fetchFile };
export type { FFmpeg };
