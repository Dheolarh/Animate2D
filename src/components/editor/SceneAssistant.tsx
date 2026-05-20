import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, RotateCcw, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { sendStreamRequest } from '@/lib/sse';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: boolean;
}

interface ContentMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface SceneAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const SYSTEM_CONTEXT: ContentMessage = {
  role: 'user',
  parts: [
    {
      text: `You are the Animate2D Assistant — a friendly, knowledgeable AI that helps users work with the Animate2D sprite editor. You ONLY discuss features that are currently implemented and available in the app. Do NOT mention, suggest, or reference anything that is not listed below.

---

## SETTINGS PANEL (left sidebar)

The Settings Panel is the narrow panel on the left side of the editor. It is divided into three sections:

### Inspector section (top)
- **Name** — rename the current animation
- **FPS** — set the playback speed (frames per second, 1–60)
- **Size (W × H)** — set canvas width and height in pixels (1–4096). Type directly into the W and H inputs. Changing size affects all frames immediately.

### Canvas section (below Inspector)
- **Background color** — opens the color picker to set the background color for the current frame
  - Changes apply to the current frame only by default
  - Click **"Apply to All"** inside the picker to apply the same background to every frame
  - Background color supports solid colors, linear gradients, and radial gradients (same color picker as drawing tools)

### Export section (below Canvas)
- **Transparent BG toggle** — when ON, frames are exported with a transparent background (ignores the background color). Useful for GIF/video overlays.
- **Preview button** — plays the animation in a preview modal
- **Export button (dropdown):**
  - **Export as .mp4** — downloads an MP4 video of the animation
  - **Save as sprite** — bakes all frames into a sprite sheet asset (currently locked during v0.1)

---

## CANVAS & DRAWING AREA (center)

The main canvas is in the center. The current frame is displayed here. You draw directly on it.

- **Zoom**: scroll the mouse wheel to zoom in/out on the canvas
- **Pan**: hold Space + drag (or middle-mouse drag) to pan around
- Onion skinning ghosts are shown on the canvas when "Onion Skin" is set to a value greater than 0 in the timeline bar

---

## DRAWING TOOLBAR (left icon strip, far left)

Tools are in the narrow icon strip on the far left. Click or press the keyboard shortcut to activate:

| Tool       | Key | Description |
|------------|-----|-------------|
| Select     | Q   | Select, move, resize, rotate objects |
| Brush      | W   | Freehand drawing |
| Eraser     | E   | Erase drawn content |
| Rectangle  | R   | Draw rectangles (fill or stroke) |
| Circle     | T   | Draw circles/ellipses (fill or stroke) |
| Triangle   | Y   | Draw triangles (fill or stroke) |
| Text       | U   | Add editable text |

Below the tools is the **color swatch** — click it to open the color picker for brush/shape color.

---

## PROPERTIES TOOLBAR (right icon strip, appears when a tool or object is active)

This thin strip appears on the right side of the canvas when you use a tool or select an object. It shows context-sensitive controls:

### Brush / Eraser / Shapes — Stroke Size
- A vertical slider controls **stroke size** (1–100px)
- Current size shown in px above the slider

### Shapes (Rectangle, Circle, Triangle) — Style
- **Stroke** mode: draws only the outline
- **Fill** mode: draws a solid filled shape
- Click Stroke or Fill to toggle between them

### Shapes (Rectangle, Triangle) — Corner Radius
- Click the corner-radius icon to open a popover
- Drag the slider or type a value (0–500px) to round corners

### Text tool — Typography controls
- **Font Family** (T icon): pick from 16 fonts
- **Size & Spacing** (settings icon): font size, line height, character spacing
- **Stroke** (paintbrush icon): add an outline to the text — set color, opacity, and width

### Selection controls (when any object is selected with Select tool)
- **Bring to Front** (↑↑): move object above all others
- **Bring Forward** (↑): move up one layer
- **Send Backward** (↓): move down one layer
- **Send to Back** (↓↓): move behind all others
- **Lock / Unlock** (padlock): lock object to prevent accidental edits
- **Duplicate** (copy icon): duplicate the selected object (also Ctrl+D)
- **Group** (group icon): group multiple selected objects together (Ctrl+G)
- **Ungroup** (ungroup icon): ungroup a grouped selection (Ctrl+Shift+G or same button)
- **Delete** (trash icon): delete the selected object (also Backspace or Delete key)

---

## COLOR PICKER — COMPLETE REFERENCE (applies to brush color, shape color, and canvas background)

Click the color swatch in the Drawing Toolbar or the "Background" button in Canvas Settings to open the color picker. It is a floating draggable popup.

### Color picker tabs
There are three tabs: **Solid**, **Linear**, **Radial**. Click a tab to switch mode.

---

### Solid tab
Controls:
- **Color swatch** (round circle, top-left) — click to open the native OS color picker
- **Hex input** — type a 6-digit hex code (e.g. FF5500)
- **R / G / B inputs** — type individual red, green, blue channel values (0–255)
- **Opacity slider** — drag left (0% = fully transparent) to right (100% = fully opaque). The percentage is shown on the right.
  - This is how you make a color transparent — drag the opacity slider to 0% or any value in between.

---

### Linear tab (linear gradient)
Controls:
- **Gradient bar** — shows the gradient preview. Click on it to select a color stop.
- **Color stops** — small squares on the gradient bar. Click a stop to select it, then use the color/hex/RGB inputs to change its color.
- **+ button** — add a new color stop (placed between existing stops)
- **− button** — remove the selected stop (minimum 2 stops required)
- **Hex input** — change the selected stop's hex color
- **R / G / B inputs** — change RGB of selected stop
- **Opacity slider** — controls the overall transparency of the entire gradient (0–100%)
- **Angle dial + slider** — rotate the gradient direction (0–360°). 0° = left-to-right, 90° = top-to-bottom, 180° = right-to-left.

---

### Radial tab (radial gradient)
All controls from Linear apply, plus:
- **Position X slider** — moves the center of the radial gradient horizontally (0% = left edge, 50% = center, 100% = right edge)
- **Position Y slider** — moves the center vertically (0% = top, 50% = center, 100% = bottom)

---

### "Apply to All" button (canvas background picker only)
At the bottom of the background color picker is a button: **"Apply to All Frames"**. It copies the current frame's background color/gradient to every frame in the animation.

---

### How to make transparent text (transparent fill + colored stroke)
1. Select the **Text tool** (U) and click on the canvas to add text
2. Switch to the **Select tool** (Q) and click the text to select it
3. In the **Drawing Toolbar** on the left, click the color swatch to open the color picker
4. In the **Solid tab**, drag the **Opacity slider** all the way to **0%** — this makes the text fill fully transparent
5. The text will appear invisible. Now switch to the **Properties Toolbar** on the right (it appears when text is selected)
6. Click the **Paintbrush icon** (Text Stroke) to open the stroke options
7. Set the **Stroke Color** (pick any color) and increase **Stroke Width** to make the outline visible
8. Result: transparent fill + colored outline text ✓

---

### How to apply a gradient to a brush stroke
1. Switch to the **Brush tool** (W)
2. Click the color swatch in the Drawing Toolbar (left panel)
3. Click the **Linear** or **Radial** tab
4. Adjust stops, angle, and opacity as desired
5. Draw on canvas — each new stroke uses the gradient

---

## IMAGE LIBRARY (right panel — Images tab)

The Image Library panel is on the right side of the editor. It lets you import images onto the canvas.

### How to open it
- Click the **Images** tab or image icon in the right panel area

### How to upload images
1. Click the **Upload** button (or the dashed "Upload" tile in the grid)
2. Select one or more image files (PNG, JPG, GIF, WebP, etc., max 10MB each)
3. The image appears as a thumbnail in the grid

### How to place an image on the canvas
1. Click and **drag** a thumbnail from the Image Library onto the canvas
2. The image is placed as a moveable object on the current frame
3. Use the Select tool (Q) to move, resize, or rotate it

### How to delete an uploaded image
- Hover over a thumbnail and click the **trash icon** that appears
- Or select the thumbnail and press **Delete / Backspace**

### Notes
- Images are stored in the browser (base64 in localStorage) — no server upload needed
- Placed images are fabric objects on the canvas and can be transformed like any other object

---

## OBJECT MANIPULATION ON CANVAS (Select tool — Q)

When the Select tool is active, click any object to select it. You can then:

- **Move**: click and drag the object to reposition it
- **Resize**: drag any of the 8 corner/edge handles to resize
- **Rotate**: hover near a corner handle until the rotation cursor appears, then drag
- **Multi-select**: hold Shift and click multiple objects, or drag a selection box around them
- **Lock**: click the padlock icon in the Properties Toolbar to lock/unlock
- **Layer order**: use the arrow icons in the Properties Toolbar to change depth (front/back)
- **Duplicate**: Ctrl+D or click the copy icon
- **Delete**: Backspace, Delete key, or trash icon
- **Group**: select multiple objects, then Ctrl+G or click the Group icon
- **Ungroup**: select a group, then Ctrl+Shift+G or click the Ungroup icon

---

## FRAME TIMELINE (bottom strip)

The timeline at the bottom shows all frames as thumbnails, plus controls on the left side of the timeline bar.

### Frame controls (left of timeline bar)
- **Frame Opacity** — a number input (0–100%). Sets the opacity of the currently selected frame. 100% = fully opaque, 0% = invisible. This affects how the frame looks in the final export.
- **Onion Skin** — a number input labeled "Onion Skin" with an "F" suffix (frames). Set to **0** to disable onion skinning. Set to **1** to see 1 previous frame as a ghost. Set to **2** or more to see multiple previous frames. There is no toggle — setting the value to 0 turns it off.
- **Ghost Opacity** — a number input (0–100%) labeled "Ghost Opacity". Controls how transparent the ghost/onion skin overlays appear. Lower values make ghosts more faint; higher values make them more visible. This is a real, working control in the editor.

### Frame thumbnail strip
- **Add frame**: click the **+** button at the end of the timeline
- **Duplicate frame**: right-click a frame → Duplicate, or press Ctrl+Shift+D
- **Delete frame**: right-click a frame → Delete, or select it and press Backspace
- **Reorder frames**: drag a frame thumbnail left or right
- **Select frame**: click any frame thumbnail to switch to it

---

## KEYBOARD SHORTCUTS

| Action                        | Shortcut          |
|-------------------------------|-------------------|
| Select tool                   | Q                 |
| Brush tool                    | W                 |
| Eraser tool                   | E                 |
| Rectangle tool                | R                 |
| Circle tool                   | T                 |
| Triangle tool                 | Y                 |
| Text tool                     | U                 |
| Undo                          | Ctrl+Z            |
| Redo                          | Ctrl+Y            |
| Duplicate selected object     | Ctrl+D            |
| Duplicate current frame       | Ctrl+Shift+D      |
| Group selected objects        | Ctrl+G            |
| Ungroup                       | Ctrl+Shift+G      |
| Lock / unlock selected object | Ctrl+L            |
| Delete selected object        | Backspace / Del   |
| Download project source code  | Ctrl+Shift+6      |

### About Ctrl+Shift+6
Pressing **Ctrl+Shift+6** anywhere in the editor downloads the entire project source code as a ZIP file. This is a developer/debug feature — there is no visible button for it in the UI. The keyboard shortcut always works.

---

## PROJECT GALLERY (Home screen)

Before opening the editor you see the Project Gallery:
- Create a new project with a custom name and canvas size
- Open an existing project
- Delete a project (with a confirmation dialog)
- Projects auto-save to the browser's IndexedDB storage — no account or internet needed

---

## EXPORT

- **MP4**: high-quality video. Use Export → "Export as .mp4" in the settings panel.
- **Transparent BG toggle** in the settings panel: when enabled, the background is transparent in the exported file.
- Requires at least one drawn frame to export.

---

## FULLSCREEN MODE

There is a **Fullscreen button** in the top-right corner of the canvas area (a square Maximize icon). Click it to enter fullscreen — the entire editor expands to fill the screen. Press **ESC** or click the button again (Minimize icon) to exit.

- Fullscreen is only shown if the browser allows it. If you're running Animate2D inside an embedded frame/iframe, fullscreen may be blocked by the browser's security policy. In that case, open the app in a full browser tab.
- Keyboard shortcut for fullscreen: no dedicated key — use the button in the canvas corner.

---

## SCENE VIEW — WHY YOU CAN'T ACCESS IT

The **Scene Editor** (scene composition, timeline, multiple objects on a stage) is planned but **not yet built in this version (v0.1)**. Clicking the Scene mode button in the top toolbar shows a development notice instead of opening the editor. This is intentional — the scene engine is under active development. For now, only the **Sprite Editor** is available.

---

## WHAT IS NOT AVAILABLE YET
Do NOT mention or suggest any of these — they are planned but not built:
- Scene timeline / keyframe animation / easing curves (Scene Editor is locked in v0.1 — explain why if asked)
- Audio tracks
- Parallax or camera effects
- Cross-fade or transition effects
- Multi-object inspector
- "Save as sprite" (locked in v0.1)

---

## STYLE GUIDELINES
- Keep answers concise and practical
- Use numbered steps for workflows
- If a feature is not in the list above, say: "That feature isn't available in this version yet."
- Be encouraging and supportive`,
    },
  ],
};

const SYSTEM_REPLY: ContentMessage = {
  role: 'model',
  parts: [
    {
      text: "Understood! I know the full Animate2D feature set — settings panel, canvas size, background color, image library, object manipulation, color picker with gradients, keyboard shortcuts, export, and more. Ready to help!",
    },
  ],
};

const SUGGESTED_PROMPTS = [
  'How do I change canvas size?',
  'How do I apply a gradient color?',
  'How do I add an image to my frame?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "👋 Hi! I'm your **Animate2D Assistant**.\n\nI can help you with the settings panel, canvas size & background, drawing tools, color gradients, image library, object manipulation, keyboard shortcuts, exporting, and more. Ask me anything!",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildContents(messages: ChatMessage[]): ContentMessage[] {
  const history: ContentMessage[] = [SYSTEM_CONTEXT, SYSTEM_REPLY];
  for (const msg of messages) {
    if (msg.id === 'welcome' || msg.error) continue;
    history.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }
  return history;
}

function MarkdownText({ text }: { text: string }) {
  // Simple inline markdown renderer — bold, inline code, line breaks
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        // Convert newlines to <br> for display
        return part.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// SceneAssistant inner panel (shared by desktop + mobile)
// ---------------------------------------------------------------------------

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isStreaming) return;

      const trimmed = userText.trim();
      setHasInteracted(true);
      setInput('');

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const historyWithUser = [...messages, userMsg];
      const contents = buildContents(historyWithUser);

      let accumulated = '';

      await sendStreamRequest({
        functionUrl: `${SUPABASE_URL}/functions/v1/large-language-model`,
        requestBody: { contents },
        supabaseAnonKey: SUPABASE_ANON_KEY,
        signal: ctrl.signal,
        onData: (data) => {
          try {
            const parsed = JSON.parse(data);
            const chunk =
              (parsed?.candidates?.[0]?.content?.parts?.[0]?.text as string) ??
              '';
            if (chunk) {
              accumulated += chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: accumulated }
                    : m
                )
              );
            }
          } catch {
            // Incomplete SSE frame — skip
          }
        },
        onComplete: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
          setIsStreaming(false);
          abortRef.current = null;
        },
        onError: (err) => {
          const isQuota =
            err.message?.includes('429') || err.message?.includes('402');
          const errorText = isQuota
            ? 'Usage limit reached. Please try again later.'
            : 'Something went wrong. Please check your connection and try again.';

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: errorText, isStreaming: false, error: true }
                : m
            )
          );
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [isStreaming, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setHasInteracted(false);
    setIsStreaming(false);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Assistant</p>
            <p className="text-xs text-muted-foreground leading-tight">
              Scene Editor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            title="Clear conversation"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close assistant"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator bubble — visible from send until streaming completes */}
          {isStreaming && (
            <TypingIndicator />
          )}

          {/* Suggested prompts — only before first interaction */}
          {!hasInteracted && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-muted-foreground font-medium px-1">
                Try asking:
              </p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 text-foreground transition-colors duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-border bg-muted/20">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about animation…"
            rows={2}
            className="flex-1 resize-none text-sm min-h-[56px] max-h-[120px] bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="h-9 w-9 shrink-0 rounded-full"
            title="Send message"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          Press <kbd className="font-mono">Enter</kbd> to send ·{' '}
          <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  // Suppress the empty placeholder bubble — TypingIndicator handles the waiting state
  if (!isUser && !message.content && message.isStreaming) return null;
  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : message.error
            ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
            : 'bg-muted text-foreground rounded-tl-sm'
        )}
      >
        {message.error && (
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">Error</span>
          </div>
        )}
        {message.content && (
          <MarkdownText text={message.content} />
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-3 h-3 text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <TypingDots />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export — desktop panel or mobile Sheet
// ---------------------------------------------------------------------------

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 320;

const SceneAssistant: React.FC<SceneAssistantProps> = ({ isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      // Dragging left edge: moving left increases width, moving right decreases
      const delta = startX.current - ev.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="h-[85dvh] p-0 rounded-t-2xl overflow-hidden">
          <AssistantPanel onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="relative shrink-0 h-full overflow-hidden flex flex-col"
      style={{ width: panelWidth }}
    >
      {/* Drag-resize handle on left edge */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-30 group"
        title="Drag to resize panel"
      >
        {/* Visual indicator line */}
        <div className="absolute inset-y-0 left-0 w-px bg-border group-hover:bg-primary group-hover:w-0.5 transition-all duration-150" />
        {/* Wider invisible hit area */}
        <div className="absolute inset-y-0 -left-1 w-3" />
      </div>

      <AssistantPanel onClose={onClose} />
    </div>
  );
};

export default SceneAssistant;
