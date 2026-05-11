/**
 * Export utilities for Animate2D — all client-side, no server required.
 *
 * exportAsGif  → uses gifenc (ESM, ~15 KB)
 * exportAsWebM → uses browser MediaRecorder + canvas.captureStream()
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { EditorFrame } from '../types/spriteEditor';

interface ExportOptions {
  frames: EditorFrame[];
  fps: number;
  width: number;
  height: number;
  transparent: boolean;
}

/** Load an HTMLImageElement from a URL */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** Paint one frame onto an offscreen canvas context */
const paintFrame = async (
  ctx: CanvasRenderingContext2D,
  frame: EditorFrame,
  width: number,
  height: number,
  transparent: boolean,
) => {
  ctx.clearRect(0, 0, width, height);
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  if (frame.thumbnail) {
    const img = await loadImage(frame.thumbnail);
    ctx.drawImage(img, 0, 0, width, height);
  }
};

/** Trigger a file download from a Uint8Array or Blob */
const download = (data: Uint8Array | Blob, filename: string, mime: string) => {
  const blob = data instanceof Blob ? data : new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// ─── Animated GIF ─────────────────────────────────────────────────────────────

export const exportAsGif = async (opts: ExportOptions): Promise<void> => {
  const { frames, fps, width, height, transparent } = opts;
  const playable = frames.filter(f => f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  const delay = Math.round(100 / fps) * 10; // GIF delay is in 1/100 s units → ms

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const gif = GIFEncoder();

  for (const frame of playable) {
    await paintFrame(ctx, frame, width, height, transparent);
    const imageData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256, { format: 'rgba4444' });
    const index = applyPalette(imageData.data, palette);

    if (transparent) {
      // Find the most-transparent colour index to treat as transparent
      gif.writeFrame(index, width, height, {
        palette,
        delay,
        repeat: 0,
        transparent: true,
        transparentIndex: 0,
      });
    } else {
      gif.writeFrame(index, width, height, { palette, delay, repeat: 0 });
    }
  }

  gif.finish();
  download(gif.bytes(), 'animation.gif', 'image/gif');
};

// ─── WebM (device export) ─────────────────────────────────────────────────────

export const exportAsWebM = async (opts: ExportOptions): Promise<void> => {
  const { frames, fps, width, height, transparent } = opts;
  const playable = frames.filter(f => f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      download(blob, 'animation.webm', mimeType);
      resolve();
    };
    recorder.onerror = reject;
    recorder.start();

    const msPerFrame = 1000 / fps;
    let i = 0;

    const next = async () => {
      if (i >= playable.length) {
        recorder.stop();
        return;
      }
      await paintFrame(ctx, playable[i], width, height, transparent);
      i++;
      setTimeout(next, msPerFrame);
    };

    next();
  });
};

// ─── MP4 via FFmpeg WASM (fully client-side, no server) ───────────────────────

export interface MP4ExportOptions extends ExportOptions {
  onFFmpegProgress?: (ratio: number) => void;
}

export const exportAsMP4 = async (opts: MP4ExportOptions): Promise<void> => {
  const { frames, fps, width, height, transparent, onFFmpegProgress } = opts;
  const playable = frames.filter(f => f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  // Dynamic import so FFmpeg is only bundled when needed
  const { getFFmpeg, fetchFile } = await import('./ffmpegLoader');
  const ff = await getFFmpeg(onFFmpegProgress);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Write each frame as a PNG into the FFmpeg virtual FS
  for (let i = 0; i < playable.length; i++) {
    await paintFrame(ctx, playable[i], width, height, transparent);
    const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/png'));
    const data = new Uint8Array(await blob.arrayBuffer());
    await ff.writeFile(`frame${String(i).padStart(4, '0')}.png`, data);
  }

  // Encode frames → MP4 using H.264
  await ff.exec([
    '-framerate', String(fps),
    '-i', 'frame%04d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    'output.mp4',
  ]);

  const output = await ff.readFile('output.mp4');
  download(output as Uint8Array, 'animation.mp4', 'video/mp4');

  // Clean up virtual FS
  for (let i = 0; i < playable.length; i++) {
    await ff.deleteFile(`frame${String(i).padStart(4, '0')}.png`).catch(() => {});
  }
  await ff.deleteFile('output.mp4').catch(() => {});
};
