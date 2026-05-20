/**
 * Shape geometry utilities.
 */

// ─── Rounded triangle SVG path ─────────────────────────────────────────────────

/**
 * Generate an SVG path string for an isosceles triangle (matching Fabric.Triangle
 * geometry) with rounded corners of radius `r`.
 *
 * Vertices in local (bounding-box) space:
 *   Top         = (w/2, 0)
 *   Bottom-right = (w,   h)
 *   Bottom-left  = (0,   h)
 *
 * Each corner is rounded with a quadratic Bézier arc of the given radius.
 * `r` is automatically clamped so it never exceeds the half-edge length.
 */
export function roundedTriangleSvgPath(w: number, h: number, r: number): string {
  // Triangle vertices
  const vx = [w / 2, w, 0];
  const vy = [0,     h, h];

  const n = 3;

  const norm = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
    if (len === 0) return [0, 0];
    return [(bx - ax) / len, (by - ay) / len];
  };

  // Clamp r to at most half the shortest edge to avoid degenerate arcs
  let minEdge = Infinity;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const edgeLen = Math.sqrt((vx[j] - vx[i]) ** 2 + (vy[j] - vy[i]) ** 2);
    if (edgeLen < minEdge) minEdge = edgeLen;
  }
  const cr = Math.min(r, minEdge / 2);

  if (cr <= 0) {
    // No rounding — plain triangle
    return `M ${vx[0]} ${vy[0]} L ${vx[1]} ${vy[1]} L ${vx[2]} ${vy[2]} Z`;
  }

  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const next = (i + 1) % n;

    // Direction toward prev vertex and toward next vertex
    const [dpx, dpy] = norm(vx[i], vy[i], vx[prev], vy[prev]);
    const [dnx, dny] = norm(vx[i], vy[i], vx[next], vy[next]);

    // Arc start (approaching this vertex from previous edge)
    const asx = vx[i] + cr * dpx;
    const asy = vy[i] + cr * dpy;
    // Arc end (leaving this vertex toward next edge)
    const aex = vx[i] + cr * dnx;
    const aey = vy[i] + cr * dny;

    if (i === 0) {
      parts.push(`M ${asx.toFixed(3)} ${asy.toFixed(3)}`);
    } else {
      parts.push(`L ${asx.toFixed(3)} ${asy.toFixed(3)}`);
    }
    // Quadratic Bézier around the corner vertex
    parts.push(`Q ${vx[i].toFixed(3)} ${vy[i].toFixed(3)} ${aex.toFixed(3)} ${aey.toFixed(3)}`);
  }

  parts.push('Z');
  return parts.join(' ');
}
