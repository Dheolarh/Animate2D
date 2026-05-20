/**
 * Color utilities for solid colors and gradients.
 * Serialization format:
 *   - Solid:  any valid CSS color string, e.g. "rgba(r, g, b, a)" or "#rrggbb"
 *   - Gradient: "__gradient__:" + JSON.stringify(GradientData)
 */

export const GRADIENT_PREFIX = '__gradient__:';

export type GradientStop = {
  id: string;
  offset: number; // 0–1
  color: string;  // hex string e.g. "#ff0000"
};

export type GradientData = {
  type: 'linear' | 'radial';
  angle: number;   // degrees
  opacity: number; // overall gradient alpha 0–1
  stops: GradientStop[];
  // center position (0–1 relative)
  cx: number;
  cy: number;
  focalX: number;
  focalY: number;
};

// ─── Check ────────────────────────────────────────────────────────────────────

export const isGradientValue = (value: string): boolean =>
  typeof value === 'string' && value.startsWith(GRADIENT_PREFIX);

// ─── Encode / Decode ──────────────────────────────────────────────────────────

export const encodeGradient = (data: GradientData): string =>
  GRADIENT_PREFIX + JSON.stringify(data);

export const decodeGradient = (value: string): GradientData | null => {
  if (!isGradientValue(value)) return null;
  try {
    return JSON.parse(value.slice(GRADIENT_PREFIX.length)) as GradientData;
  } catch {
    return null;
  }
};

// ─── Default factories ────────────────────────────────────────────────────────

export const makeDefaultLinearGradient = (): GradientData => ({
  type: 'linear',
  angle: 90,
  opacity: 1,
  stops: [
    { id: '1', offset: 0, color: '#ffffff' },
    { id: '2', offset: 1, color: '#111111' },
  ],
  cx: 0.5, cy: 0.5,
  focalX: 0.5, focalY: 0.5,
});

export const makeDefaultRadialGradient = (): GradientData => ({
  type: 'radial',
  angle: 0,
  opacity: 1,
  stops: [
    { id: '1', offset: 0, color: '#ffffff' },
    { id: '2', offset: 1, color: '#111111' },
  ],
  cx: 0.5, cy: 0.5,
  focalX: 0.5, focalY: 0.5,
});

// ─── CSS ──────────────────────────────────────────────────────────────────────

/** Convert gradient data to a CSS gradient string (for previews / backgrounds). */
export const gradientToCss = (data: GradientData): string => {
  const opacity = data.opacity ?? 1;
  const sorted = [...data.stops].sort((a, b) => a.offset - b.offset);
  // Bake overall opacity into each stop colour so CSS renders it correctly
  const stopsStr = sorted
    .map(s => {
      const h = s.color.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${opacity}) ${Math.round(s.offset * 100)}%`;
    })
    .join(', ');

  if (data.type === 'linear') {
    return `linear-gradient(${data.angle}deg, ${stopsStr})`;
  }
  // Radial — cx/cy set the center; angle offsets the focal highlight direction
  const cx = data.cx ?? 0.5;
  const cy = data.cy ?? 0.5;
  const rad = ((data.angle - 90) * Math.PI) / 180;
  const FOCAL_DIST = 0.28;
  const fxPct = Math.round((cx + Math.cos(rad) * FOCAL_DIST) * 100);
  const fyPct = Math.round((cy + Math.sin(rad) * FOCAL_DIST) * 100);
  return `radial-gradient(circle at ${fxPct}% ${fyPct}%, ${stopsStr})`;
};

/** Return the CSS background value for any color value (solid or gradient). */
export const colorValueToCss = (value: string): string => {
  const grad = decodeGradient(value);
  if (grad) return gradientToCss(grad);
  return value;
};

// ─── Fabric.js gradient ───────────────────────────────────────────────────────

/**
 * Convert GradientData → a fabric.Gradient constructor options object.
 *
 * When `percentageUnits` is true (default for new shapes at creation time),
 * coords are normalised 0→1 so the gradient fills the object regardless of
 * its actual pixel size.  Pass false (with real width/height) when you want
 * absolute pixel coords (e.g. canvas background).
 *
 * Caller does: new fabric.Gradient(gradientToFabricOptions(data, w, h))
 */
export const gradientToFabricOptions = (
  data: GradientData,
  width: number,
  height: number,
  percentageUnits = false,
): object => {
  const opacity = data.opacity ?? 1;
  const sorted = [...data.stops].sort((a, b) => a.offset - b.offset);
  // Bake overall opacity into each stop so Fabric renders alpha correctly
  const colorStops = sorted.map(s => {
    const h = s.color.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { offset: s.offset, color: `rgba(${r},${g},${b},${opacity})` };
  });

  if (percentageUnits) {
    // Use gradientUnits:'percentage' so coords range 0→1 regardless of object size.
    if (data.type === 'linear') {
      const rad = ((data.angle - 90) * Math.PI) / 180;
      return {
        type: 'linear',
        gradientUnits: 'percentage',
        coords: {
          x1: 0.5 - Math.cos(rad) * 0.5,
          y1: 0.5 - Math.sin(rad) * 0.5,
          x2: 0.5 + Math.cos(rad) * 0.5,
          y2: 0.5 + Math.sin(rad) * 0.5,
        },
        colorStops,
      };
    }
    // Radial — percentage units; cx/cy set center; focal point offset from angle
    const radRad = ((data.angle - 90) * Math.PI) / 180;
    const FOCAL_DIST = 0.28;
    const cx = data.cx ?? 0.5;
    const cy = data.cy ?? 0.5;
    const fxP = cx + Math.cos(radRad) * FOCAL_DIST;
    const fyP = cy + Math.sin(radRad) * FOCAL_DIST;
    return {
      type: 'radial',
      gradientUnits: 'percentage',
      coords: {
        x1: fxP, y1: fyP, r1: 0,
        x2: cx,  y2: cy, r2: 0.5,
      },
      colorStops,
    };
  }

  // Absolute pixel mode (for canvas background etc.)
  if (data.type === 'linear') {
    const rad = ((data.angle - 90) * Math.PI) / 180;
    const half = Math.max(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;
    return {
      type: 'linear',
      coords: {
        x1: cx - Math.cos(rad) * half,
        y1: cy - Math.sin(rad) * half,
        x2: cx + Math.cos(rad) * half,
        y2: cy + Math.sin(rad) * half,
      },
      colorStops,
    };
  }

  // Radial absolute — cx/cy set center; focal point offset from angle
  const cx = data.cx ?? 0.5;
  const cy = data.cy ?? 0.5;
  const centerX = cx * width;
  const centerY = cy * height;
  const radRad2 = ((data.angle - 90) * Math.PI) / 180;
  const FOCAL_DIST_ABS = 0.28;
  const fx = (cx + Math.cos(radRad2) * FOCAL_DIST_ABS) * width;
  const fy = (cy + Math.sin(radRad2) * FOCAL_DIST_ABS) * height;
  const r  = Math.sqrt(width * width + height * height) / 2;
  return {
    type: 'radial',
    coords: { x1: fx, y1: fy, r1: 0, x2: centerX, y2: centerY, r2: r },
    colorStops,
  };
};

// ─── Hex ↔ RGBA helpers ───────────────────────────────────────────────────────

export const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    a: alpha,
  };
};

export const rgbaToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

export const parseRgba = (
  value: string,
): { r: number; g: number; b: number; a: number } => {
  if (value.startsWith('rgba')) {
    const m = value.match(/[\d.]+/g);
    if (m) return { r: +m[0], g: +m[1], b: +m[2], a: parseFloat(m[3]) };
  }
  if (value.startsWith('#')) {
    const hex = value.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

export const rgbaToString = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

// ─── First-stop solid fallback (for tools that can't paint gradients) ─────────

/**
 * For tools like PencilBrush that only accept a CSS color string,
 * return the first stop hex if the value is a gradient, else return as-is.
 */
export const solidColorFallback = (value: string): string => {
  const data = decodeGradient(value);
  if (!data) return value;
  const sorted = [...data.stops].sort((a, b) => a.offset - b.offset);
  return sorted[0]?.color ?? '#000000';
};
