import React, { useCallback, useId, useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, GripHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GRADIENT_PREFIX,
  GradientData,
  GradientStop,
  colorValueToCss,
  decodeGradient,
  encodeGradient,
  gradientToCss,
  hexToRgba,
  isGradientValue,
  makeDefaultLinearGradient,
  makeDefaultRadialGradient,
  parseRgba,
  rgbaToHex,
  rgbaToString,
} from '@/lib/colorUtils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type FillType = 'solid' | 'linear' | 'radial';

interface GradientColorPickerProps {
  /** Current value — solid rgba/hex string or `__gradient__:JSON` */
  value: string;
  onChange: (value: string) => void;
  /** Show an "Apply to all" icon button */
  onApplyAll?: () => void;
  /** Optional label for the swatch */
  label?: string;
  /** Open direction for popover */
  side?: 'left' | 'right' | 'top' | 'bottom';
}

// ─── Checkerboard SVG data URI for transparent backgrounds ────────────────────
const CHECKER =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGAQYKABjAhlVEMDmgZ1AAAbVwA1rT00+QAAAABJRU5ErkJggg==")';

// ─── Hex input with live editing ──────────────────────────────────────────────
const HexInput: React.FC<{ hex: string; onChange: (hex: string) => void }> = ({
  hex,
  onChange,
}) => {
  const [local, setLocal] = useState(hex.replace('#', ''));
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setLocal(v);
    if (v.length === 6) onChange('#' + v);
  };

  return (
    <input
      className="w-16 h-7 text-xs text-center border border-border rounded bg-muted/40 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
      value={focused ? local : hex.replace('#', '').toUpperCase()}
      onFocus={() => {
        setLocal(hex.replace('#', ''));
        setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onChange={handleChange}
      maxLength={6}
      placeholder="RRGGBB"
    />
  );
};

// ─── Compact RGB channel inputs ───────────────────────────────────────────────
const RgbInputs: React.FC<{
  r: number; g: number; b: number;
  onChange: (r: number, g: number, b: number) => void;
}> = ({ r, g, b, onChange }) => {
  const ch = (label: string, val: number, idx: 0 | 1 | 2) => (
    <div className="flex flex-col items-center gap-0.5" key={label}>
      <input
        type="number" min="0" max="255" value={val}
        onChange={e => {
          const v = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
          const arr: [number, number, number] = [r, g, b];
          arr[idx] = v;
          onChange(arr[0], arr[1], arr[2]);
        }}
        className="w-10 h-7 text-xs text-center border border-border rounded bg-muted/40 font-mono"
      />
      <span className="text-[9px] text-muted-foreground font-mono">{label}</span>
    </div>
  );
  return (
    <div className="flex gap-1">
      {ch('R', r, 0)}{ch('G', g, 1)}{ch('B', b, 2)}
    </div>
  );
};

// ─── Gradient stop handle ─────────────────────────────────────────────────────
const StopHandle: React.FC<{
  stop: GradientStop;
  selected: boolean;
  onSelect: () => void;
  onDragOffset: (offset: number) => void;
}> = ({ stop, selected, onSelect, onDragOffset }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    const track = (e.currentTarget as HTMLElement).closest('[data-gradient-track]') as HTMLElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();

    const onMove = (me: MouseEvent) => {
      const raw = (me.clientX - rect.left) / rect.width;
      onDragOffset(Math.min(1, Math.max(0, raw)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onSelect, onDragOffset]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={onSelect}
      className={cn(
        'absolute top-3 -translate-x-1/2 w-4 h-4 rounded-sm border-2 cursor-grab shadow-md transition-all',
        selected ? 'border-primary scale-110 z-10' : 'border-white z-0',
      )}
      style={{ left: `${stop.offset * 100}%`, backgroundColor: stop.color }}
    />
  );
};

// ─── Solid color editor ────────────────────────────────────────────────────────
const SolidEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const { r, g, b, a } = useMemo(() => parseRgba(value), [value]);
  const hex = rgbaToHex(r, g, b);

  const setRgba = useCallback(
    (nr: number, ng: number, nb: number, na: number) =>
      onChange(rgbaToString(nr, ng, nb, na)),
    [onChange],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Native color + Hex + RGB */}
      <div className="flex items-start gap-2">
        <label className="relative w-8 h-8 rounded-full overflow-hidden border border-border cursor-pointer shrink-0 shadow-sm">
          <div className="w-full h-full" style={{ backgroundImage: CHECKER }} />
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
          <input
            type="color" value={hex}
            onChange={e => {
              const { r: nr, g: ng, b: nb } = hexToRgba(e.target.value);
              setRgba(nr, ng, nb, a);
            }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        <HexInput
          hex={hex}
          onChange={newHex => {
            const { r: nr, g: ng, b: nb } = hexToRgba(newHex);
            setRgba(nr, ng, nb, a);
          }}
        />
        <RgbInputs r={r} g={g} b={b} onChange={(nr, ng, nb) => setRgba(nr, ng, nb, a)} />
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Opacity</span>
        <div className="relative flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundImage: CHECKER }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: `linear-gradient(to right, transparent, ${hex})` }}
          />
          <input
            type="range" min="0" max="1" step="0.01" value={a}
            onChange={e => setRgba(r, g, b, parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>
        <span className="text-[10px] font-mono w-9 text-right">{Math.round(a * 100)}%</span>
      </div>
    </div>
  );
};

// ─── Gradient editor ──────────────────────────────────────────────────────────
const GradientEditor: React.FC<{
  data: GradientData;
  onChange: (d: GradientData) => void;
}> = ({ data, onChange }) => {
  const [selectedId, setSelectedId] = useState<string>(data.stops[0]?.id ?? '');
  const uid = useId();

  const sorted = useMemo(
    () => [...data.stops].sort((a, b) => a.offset - b.offset),
    [data.stops],
  );
  const selected = data.stops.find(s => s.id === selectedId) ?? data.stops[0];

  const updateStop = useCallback(
    (id: string, patch: Partial<GradientStop>) => {
      onChange({
        ...data,
        stops: data.stops.map(s => (s.id === id ? { ...s, ...patch } : s)),
      });
    },
    [data, onChange],
  );

  const addStop = useCallback(() => {
    // Insert in the middle
    const stops = [...sorted];
    const mid = stops.length >= 2
      ? (stops[0].offset + stops[stops.length - 1].offset) / 2
      : 0.5;
    const id = uid + Math.random().toString(36).slice(2);
    const newStop: GradientStop = { id, offset: mid, color: '#888888' };
    onChange({ ...data, stops: [...data.stops, newStop] });
    setSelectedId(id);
  }, [data, onChange, sorted, uid]);

  const removeStop = useCallback(() => {
    if (data.stops.length <= 2) return;
    const remaining = data.stops.filter(s => s.id !== selectedId);
    onChange({ ...data, stops: remaining });
    setSelectedId(remaining[0]?.id ?? '');
  }, [data, onChange, selectedId]);

  const cssPrev = gradientToCss(data);

  // Selected stop color
  const selHex = selected?.color ?? '#000000';
  const selRgb = hexToRgba(selHex);

  return (
    <div className="flex flex-col gap-3">
      {/* Gradient bar */}
      <div className="relative pt-1 pb-4" data-gradient-track>
        <div
          className="h-7 rounded-md border border-border shadow-inner"
          style={{ backgroundImage: `${CHECKER}, ${cssPrev}`, backgroundBlendMode: 'normal' }}
        />
        {data.stops.map(stop => (
          <StopHandle
            key={stop.id}
            stop={stop}
            selected={stop.id === selectedId}
            onSelect={() => setSelectedId(stop.id)}
            onDragOffset={offset => updateStop(stop.id, { offset })}
          />
        ))}
      </div>

      {/* Stop controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={addStop}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 h-6 rounded border border-border hover:bg-accent transition-colors"
        >
          <Plus className="w-3 h-3" /> Add stop
        </button>
        <button
          onClick={removeStop}
          disabled={data.stops.length <= 2}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive disabled:opacity-30 px-2 h-6 rounded border border-border hover:bg-accent transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
        {selected && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
            {Math.round(selected.offset * 100)}%
          </span>
        )}
      </div>

      {/* Selected stop color */}
      {selected && (
        <div className="flex flex-col gap-2 border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">Stop color</span>
          <div className="flex items-start gap-2">
            <label className="relative w-8 h-8 rounded-full overflow-hidden border border-border cursor-pointer shrink-0 shadow-sm">
              <div className="w-full h-full" style={{ backgroundImage: CHECKER }} />
              <div className="absolute inset-0" style={{ backgroundColor: selHex }} />
              <input
                type="color" value={selHex}
                onChange={e => updateStop(selected.id, { color: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            <HexInput
              hex={selHex}
              onChange={hex => updateStop(selected.id, { color: hex })}
            />
            <RgbInputs
              r={selRgb.r} g={selRgb.g} b={selRgb.b}
              onChange={(nr, ng, nb) =>
                updateStop(selected.id, { color: rgbaToHex(nr, ng, nb) })
              }
            />
          </div>
        </div>
      )}

      {/* Overall opacity — matches SolidEditor layout */}
      <div className="flex items-center gap-2 border-t border-border pt-2">
        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Opacity</span>
        <div
          className="relative flex-1 h-3 rounded-full overflow-hidden"
          style={{ backgroundImage: CHECKER }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, ${sorted[0]?.color ?? '#000000'})`,
            }}
          />
          <input
            type="range" min="0" max="1" step="0.01"
            value={data.opacity ?? 1}
            onChange={e => onChange({ ...data, opacity: parseFloat(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>
        <span className="text-[10px] font-mono w-9 text-right">
          {Math.round((data.opacity ?? 1) * 100)}%
        </span>
      </div>

      {/* Angle — linear direction / radial focal direction */}
      {(data.type === 'linear' || data.type === 'radial') && (
        <div className="flex items-center gap-2 border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground w-12 shrink-0">Angle</span>
          <AngleWheel
            angle={data.angle}
            onChange={angle => onChange({ ...data, angle })}
          />
          <input
            type="range" min="0" max="360" step="1" value={data.angle}
            onChange={e => onChange({ ...data, angle: parseInt(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="text-[10px] font-mono w-9 text-right">{data.angle}°</span>
        </div>
      )}

      {/* Position X/Y — radial center position */}
      {data.type === 'radial' && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">Position</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">X</span>
            <input
              type="range" min="0" max="1" step="0.01"
              value={data.cx ?? 0.5}
              onChange={e => onChange({ ...data, cx: parseFloat(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="text-[10px] font-mono w-9 text-right">
              {Math.round((data.cx ?? 0.5) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">Y</span>
            <input
              type="range" min="0" max="1" step="0.01"
              value={data.cy ?? 0.5}
              onChange={e => onChange({ ...data, cy: parseFloat(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="text-[10px] font-mono w-9 text-right">
              {Math.round((data.cy ?? 0.5) * 100)}%
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

// ─── Angle wheel ──────────────────────────────────────────────────────────────
const AngleWheel: React.FC<{ angle: number; onChange: (a: number) => void }> = ({
  angle,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    const deg = ((rad * 180) / Math.PI + 90 + 360) % 360;
    onChange(Math.round(deg));
  };

  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = 10;
  const cy = 10;
  const r = 7;

  return (
    <div
      ref={ref}
      className="w-6 h-6 rounded-full border border-border bg-muted relative shrink-0 cursor-pointer hover:border-primary transition-colors"
      onClick={handleClick}
      title={`Angle: ${angle}°`}
    >
      <svg viewBox="0 0 20 20" className="w-full h-full">
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos(rad) * r}
          y2={cy + Math.sin(rad) * r}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className="text-foreground"
        />
        <circle cx={cx} cy={cy} r="1.5" className="fill-foreground" />
      </svg>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  value,
  onChange,
  onApplyAll,
  label,
  side = 'right',
}) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Free-drag state — null means use the auto-computed position near the trigger
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Determine current fill type
  const currentType: FillType = useMemo(() => {
    const g = decodeGradient(value);
    if (!g) return 'solid';
    return g.type;
  }, [value]);

  const [fillType, setFillType] = useState<FillType>(currentType);

  // Keep fillType in sync whenever the value changes from outside
  // (e.g. switching between canvas BG picker and tool color picker)
  useEffect(() => {
    setFillType(currentType);
  }, [currentType]);

  // When switching tabs, convert the current value
  const handleTabSwitch = (tab: FillType) => {
    setFillType(tab);
    if (tab === 'solid') {
      const g = decodeGradient(value);
      if (g) {
        const firstStop = [...g.stops].sort((a, b) => a.offset - b.offset)[0];
        onChange(firstStop ? firstStop.color : '#000000');
      }
    } else if (tab === 'linear') {
      if (!isGradientValue(value)) {
        const g = makeDefaultLinearGradient();
        const { r, g: green, b } = parseRgba(value);
        g.stops[0].color = rgbaToHex(r, green, b);
        onChange(encodeGradient(g));
      } else {
        const existing = decodeGradient(value);
        if (existing && existing.type !== 'linear') {
          onChange(encodeGradient({ ...existing, type: 'linear', angle: 90 }));
        }
      }
    } else if (tab === 'radial') {
      if (!isGradientValue(value)) {
        const g = makeDefaultRadialGradient();
        const { r, g: green, b } = parseRgba(value);
        g.stops[0].color = rgbaToHex(r, green, b);
        onChange(encodeGradient(g));
      } else {
        const existing = decodeGradient(value);
        if (existing && existing.type !== 'radial') {
          onChange(encodeGradient({ ...existing, type: 'radial' }));
        }
      }
    }
  };

  // Compute fixed position from the trigger button whenever the popup opens
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPUP_WIDTH = 288; // w-72
    const POPUP_HEIGHT = 520; // accounts for radial X/Y sliders
    const GAP = 8;
    let style: React.CSSProperties = { position: 'fixed', zIndex: 9999 };

    if (side === 'right') {
      style.left = rect.right + GAP;
      style.top = rect.top;
    } else if (side === 'left') {
      style.left = rect.left - POPUP_WIDTH - GAP;
      style.top = rect.top;
    } else if (side === 'top') {
      style.left = rect.left;
      style.top = rect.top - POPUP_HEIGHT - GAP;
    } else {
      // bottom
      style.left = rect.left;
      style.top = rect.bottom + GAP;
    }

    // Clamp horizontally so popup never goes off-screen
    if (style.left !== undefined) {
      style.left = Math.max(8, Math.min(Number(style.left), window.innerWidth - POPUP_WIDTH - 8));
    }

    // Clamp vertically — if popup would overflow the bottom, flip it to open upward
    if (style.top !== undefined) {
      const top = Number(style.top);
      if (top + POPUP_HEIGHT > window.innerHeight - 8) {
        style.top = Math.max(8, rect.bottom - POPUP_HEIGHT);
      } else {
        style.top = Math.max(8, top);
      }
    }

    setPopoverStyle(style);
  }, [side]);

  const handleToggle = () => {
    if (!open) {
      // Reset any prior drag position so the popup re-anchors near the trigger
      setDragPos(null);
      computePosition();
    }
    setOpen(v => !v);
  };

  // Drag-handle mouse-down: capture offset and track mouse globally
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = popoverRef.current?.getBoundingClientRect();
    if (!rect) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(0, Math.min(me.clientX - dragOffsetRef.current.x, window.innerWidth - 292));
      const newY = Math.max(0, Math.min(me.clientY - dragOffsetRef.current.y, window.innerHeight - 48));
      setDragPos({ x: newX, y: newY });
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Recompute auto-position on scroll/resize — only when user hasn't dragged
  useEffect(() => {
    if (!open || dragPos !== null) return;
    const update = () => computePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, computePosition, dragPos]);

  // Preview CSS
  const previewCss = useMemo(() => colorValueToCss(value), [value]);

  // Effective popup position: dragged coords take precedence over auto-computed
  const effectiveStyle: React.CSSProperties = dragPos !== null
    ? { position: 'fixed', left: dragPos.x, top: dragPos.y, zIndex: 9999 }
    : popoverStyle;

  const tabs: { key: FillType; label: string }[] = [
    { key: 'solid', label: 'Solid' },
    { key: 'linear', label: 'Linear' },
    { key: 'radial', label: 'Radial' },
  ];

  const popup = open ? createPortal(
    <div
      ref={popoverRef}
      style={effectiveStyle}
      className="bg-card border border-border rounded-xl shadow-xl w-72 overflow-hidden"
    >
      {/* ── Drag handle ─────────────────────────────────────────────────── */}
      <div
        onMouseDown={handleDragStart}
        className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border cursor-grab active:cursor-grabbing select-none"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors"
          title="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="p-3">
        {/* Type tabs */}
        <div className="flex bg-muted rounded-lg p-0.5 mb-3">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabSwitch(t.key)}
              className={cn(
                'flex-1 text-[11px] py-1 rounded-md transition-all font-medium',
                fillType === t.key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Editors */}
        {fillType === 'solid' && (
          <SolidEditor value={value} onChange={onChange} />
        )}
        {(fillType === 'linear' || fillType === 'radial') && (() => {
          // Use a default gradient as fallback when value hasn't propagated yet
          // (React batching: fillType updates synchronously, parent value may lag one render)
          const gd = decodeGradient(value)
            ?? (fillType === 'linear' ? makeDefaultLinearGradient() : makeDefaultRadialGradient());
          return (
            <GradientEditor
              data={gd}
              onChange={updated => onChange(encodeGradient(updated))}
            />
          );
        })()}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="inline-flex items-center gap-2">
      {/* Swatch trigger */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-border shadow-sm hover:scale-105 transition-transform shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
        title={label ?? 'Color'}
        type="button"
      >
        <div className="absolute inset-0" style={{ backgroundImage: CHECKER }} />
        <div className="absolute inset-0" style={{ background: previewCss }} />
      </button>

      {label && (
        <span className="text-[10px] text-muted-foreground">{label}</span>
      )}

      {/* Apply-all button */}
      {onApplyAll && (
        <button
          onClick={onApplyAll}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground"
          title="Apply to all frames"
          type="button"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M2 8h12M8 2c-2 2-2 8 0 12M8 2c2 2 2 8 0 12" />
          </svg>
        </button>
      )}

      {/* Portal popup — renders at document.body to escape any parent overflow clip */}
      {popup}
    </div>
  );
};

export default GradientColorPicker;
