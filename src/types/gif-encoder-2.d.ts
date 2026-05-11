// Hand-written type declarations for the "gifenc" package (no official @types).
// Covers only the exports used in exportUtils.ts.

declare module 'gifenc' {
  /** Raw indexed-colour frame data after palette mapping */
  type IndexedFrame = Uint8Array;

  /** RGBA palette entry array */
  type Palette = number[][];

  interface WriteFrameOptions {
    /** Palette of up to 256 RGBA colours */
    palette?: Palette;
    /** Frame delay in milliseconds */
    delay?: number;
    /** 0 = loop forever, -1 = no loop, N = loop N times */
    repeat?: number;
    /** Whether to encode transparency */
    transparent?: boolean;
    /** Palette index to treat as transparent */
    transparentIndex?: number;
  }

  interface GIFEncoderInstance {
    /**
     * Write a single indexed-colour frame.
     * @param index  Result of applyPalette()
     * @param width  Frame width in pixels
     * @param height Frame height in pixels
     * @param opts   Per-frame options (palette, delay, repeat, transparency)
     */
    writeFrame(index: IndexedFrame, width: number, height: number, opts?: WriteFrameOptions): void;
    /** Finish writing and flush the GIF stream */
    finish(): void;
    /** Return the encoded GIF as a Uint8Array */
    bytes(): Uint8Array;
  }

  /** Create a new GIF encoder instance */
  export function GIFEncoder(): GIFEncoderInstance;

  /**
   * Quantize RGBA pixel data down to at most `maxColors` palette entries.
   * @param data      Raw RGBA Uint8Array (e.g. from ImageData.data)
   * @param maxColors Maximum palette size (≤ 256)
   * @param opts      Optional quantization options
   */
  export function quantize(
    data: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    opts?: { format?: string; oneBitAlpha?: boolean }
  ): Palette;

  /**
   * Map each pixel in `data` to the nearest palette index.
   * @param data    Raw RGBA Uint8Array
   * @param palette Palette returned by quantize()
   * @returns       IndexedFrame (one byte per pixel)
   */
  export function applyPalette(
    data: Uint8ClampedArray | Uint8Array,
    palette: Palette
  ): IndexedFrame;
}
