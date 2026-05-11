/**
 * Export utilities for Animate2D — all client-side, no server required.
 *
 * exportAsGif → gifenc (ESM, ~15 KB)
 * exportAsMP4 → native VideoEncoder + mp4-muxer (no WASM, hardware-accelerated)
 *
 * Both re-render from fabricData at FULL resolution so the output is sharp.
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { EditorFrame } from '../types/spriteEditor';

interface ExportOptions {
  frames: EditorFrame[];
  fps: number;
  width: number;
  height: number;
  transparent: boolean;
  backgroundColor: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Render a frame at full resolution onto an offscreen canvas.
 * Uses fabricData (via dynamic import of Fabric.js) for pixel-perfect quality.
 * Falls back to the thumbnail if fabricData is unavailable.
 */
const renderFrameFullRes = async (
  frame: EditorFrame,
  width: number,
  height: number,
  transparent: boolean,
  defaultBackgroundColor: string,
): Promise<HTMLCanvasElement> => {
  const fabric = await import('fabric');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Use StaticCanvas for lighter, offscreen rendering
  const fc = new fabric.StaticCanvas(canvas, {
    width,
    height,
    enableRetinaScaling: false,
  });

  if (frame.fabricData) {
    // In Fabric v6+, loadFromJSON is async and returns a Promise
    await fc.loadFromJSON(frame.fabricData);
    
    // Force dimensions
    fc.setDimensions({ width, height });
    
    // Handle Background Color
    if (!transparent) {
      fc.backgroundColor = frame.backgroundColor || defaultBackgroundColor || '#ffffff';
    } else {
      fc.backgroundColor = 'transparent';
    }
    
    // Apply frame-specific opacity if set
    fc.backgroundImage?.set({ opacity: (frame.opacity ?? 100) / 100 });
    fc.getObjects().forEach(obj => {
      // We multiply the object's existing opacity by the frame's opacity
      const originalOpacity = obj.opacity ?? 1;
      obj.set({ opacity: originalOpacity * ((frame.opacity ?? 100) / 100) });
    });

    // Ensure all objects are rendered
    fc.renderAll();
  } else if (frame.thumbnail) {
    const ctx = canvas.getContext('2d')!;
    if (!transparent) {
      ctx.fillStyle = frame.backgroundColor || defaultBackgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = frame.thumbnail!;
    });
    ctx.globalAlpha = (frame.opacity ?? 100) / 100;
    ctx.drawImage(img, 0, 0, width, height);
    ctx.globalAlpha = 1.0;
  }

  // We return the canvas element. Note: We don't dispose fc here because 
  // it might clear the canvas. The canvas element will be garbage collected.
  return canvas;
};

/**
 * Packs animation frames into a single grid-based PNG (Sprite Sheet).
 */
export const exportAsSpriteSheet = async (opts: ExportOptions): Promise<{
  url: string;
  cols: number;
  rows: number;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}> => {
  const { frames, width: fWidth, height: fHeight, transparent, backgroundColor } = opts;
  const playable = frames.filter((f) => f.fabricData || f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  const frameCount = playable.length;
  const cols = Math.ceil(Math.sqrt(frameCount));
  const rows = Math.ceil(frameCount / cols);

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = cols * fWidth;
  sheetCanvas.height = rows * fHeight;
  const sheetCtx = sheetCanvas.getContext('2d')!;

  // Fill background if not transparent
  if (!transparent) {
    sheetCtx.fillStyle = backgroundColor;
    sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);
  }

  for (let i = 0; i < playable.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const frameCanvas = await renderFrameFullRes(playable[i], fWidth, fHeight, transparent, backgroundColor);
    
    sheetCtx.drawImage(
      frameCanvas,
      col * fWidth,
      row * fHeight,
      fWidth,
      fHeight
    );
  }

  return {
    url: sheetCanvas.toDataURL('image/png'),
    cols,
    rows,
    frameCount,
    frameWidth: fWidth,
    frameHeight: fHeight
  };
};

/** Trigger a browser file download */
const download = (data: Uint8Array | Blob, filename: string, mime: string) => {
  const blob =
    data instanceof Blob
      ? data
      : new Blob(
          [data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer],
          { type: mime }
        );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// ---------------------------------------------------------------------------
// GIF export
// ---------------------------------------------------------------------------

export const exportAsGif = async (opts: ExportOptions): Promise<void> => {
  const { frames, fps, width, height, transparent } = opts;
  const playable = frames.filter((f) => f.fabricData || f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  const delay = Math.round(100 / fps) * 10; // GIF delay in 1/100s units

  const gif = GIFEncoder();

  for (const frame of playable) {
    const canvas = await renderFrameFullRes(frame, width, height, transparent, opts.backgroundColor);
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256, { format: 'rgba4444' });
    const index = applyPalette(imageData.data, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay,
      repeat: 0,
      transparent,
      ...(transparent ? { transparentIndex: 0 } : {}),
    });
  }

  gif.finish();
  download(gif.bytes(), 'animation.gif', 'image/gif');
};

// ---------------------------------------------------------------------------
// MP4 export — native VideoEncoder + mp4-muxer
// Works in Brave, Chrome, Edge (Chromium 94+). No downloads, no WASM.
// ---------------------------------------------------------------------------

export interface MP4ExportOptions extends ExportOptions {
  onProgress?: (ratio: number) => void;
}

export const exportAsMP4 = async (opts: MP4ExportOptions): Promise<void> => {
  const { frames, fps, width, height, transparent, onProgress } = opts;
  const playable = frames.filter((f) => f.fabricData || f.thumbnail);
  if (!playable.length) throw new Error('No frames to export');

  // H.264 requires even dimensions
  const encWidth  = width  % 2 === 0 ? width  : width  + 1;
  const encHeight = height % 2 === 0 ? height : height + 1;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: encWidth, height: encHeight },
    fastStart: 'in-memory',
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? {}),
    error: (e) => { throw e; },
  });

  encoder.configure({
    codec: 'avc1.640028',    // H.264 High Profile Level 4.0 — max quality
    width: encWidth,
    height: encHeight,
    bitrate: 8_000_000,      // 8 Mbps — crisp even for pixel art
    framerate: fps,
    latencyMode: 'quality',
  });

  const usPerFrame = Math.round(1_000_000 / fps);

  for (let i = 0; i < playable.length; i++) {
    onProgress?.(i / playable.length);

    const frameCanvas = await renderFrameFullRes(playable[i], encWidth, encHeight, transparent, opts.backgroundColor);
    const bitmap = await createImageBitmap(frameCanvas);

    const videoFrame = new VideoFrame(bitmap, {
      timestamp: i * usPerFrame,
      duration: usPerFrame,
    });

    encoder.encode(videoFrame, { keyFrame: i % 30 === 0 });
    videoFrame.close();
    bitmap.close();
  }

  await encoder.flush();
  muxer.finalize();
  onProgress?.(1);

  const { buffer } = muxer.target;
  download(new Uint8Array(buffer), 'animation.mp4', 'video/mp4');
};
