# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Animate 2D

### 1.2 Application Description
A fully browser-based 2D animation studio that enables users to draw sprites, compose scenes, animate with frame-by-frame system, add audio and effects, and export final results as video — all without software installation or account creation.

### 1.3 Core Design Principles
- No login or account required — immediate access
- Automatic progress saving to browser local storage
- Visual-only workflow — no coding required
- Familiar animator workflow: draw, animate, compose, export
- Reusable project-owned assets
- Built-in animation libraries for quick start
- Free tier with watermark, paid tier post-launch

## 2. User & Usage Scenarios

### 2.1 Target Users
- Animators seeking browser-based tools
- Content creators producing short animated videos
- Educators teaching animation fundamentals
- Hobbyists exploring frame-by-frame animation

### 2.2 Core Usage Scenarios
- Creating original 2D animations from scratch
- Producing marketing or promotional animated content
- Developing animated explainer videos
- Learning and practicing animation techniques

## 3. Page Structure & Functionality

### 3.1 Overall Structure

```
Animate 2D Application
├── Splash Screen
├── Project Screen
└── Scene Editor (Main Workspace)
    ├── Sprite Editor Mode
    ├── Scene Mode
    ├── Preview Mode
    └── Export Mode
```

### 3.2 Splash Screen

**Purpose**: First impression and brand communication

**Layout & Elements**:
- Full-screen layout with 'Animate 2D' app name in bold display typography
- Background featuring hand-drawn character art and scrolling city environment
- Animated elements: walking characters, moving road, scrolling buildings

**Functionality**:
- Automatic entrance animation plays on load (2-3 seconds)
- Characters walk in from sides, city scrolls, logo appears
- Transitions to Project Screen after animation or on user click/tap

### 3.3 Project Screen

**Purpose**: Project management hub without login requirement

**Layout & Elements**:
- Create New Project button
- Recent Projects list with thumbnail previews, names, and last-edited dates
- Project settings panel
- Delete project button with confirmation

**Functionality**:
- **Create New Project**: Prompts for project name, opens blank Scene Editor
- **Open Recent Project**: Restores project exactly as last saved from local storage
- **Project Settings**: Configure name, canvas size, scene FPS, background color per project
- **Delete Project**: Removes project with confirmation prompt

### 3.4 Scene Editor — Main Workspace

**Purpose**: Primary animation creation environment

**Layout Structure** (5 zones):

```
┌──────────────────────────────────────────────────────────────┐
│  Top Toolbar: Mode | Tools | Playback | Export               │
├──────────┬───────────────────────────────────┬───────────────┤
│  Scene   │                                   │  Inspector    │
│ Hierarchy│         Canvas                    │  (selected    │
│          │   [Scene/Preview Mode]            │   object)     │
│  Layers  │                                   │               │
│  Objects │                                   │  Properties   │
├──────────┴───────────────────────────────────┴───────────────┤
│  Asset Library: Sprites | Animations | Audio | GIF Clips     │
├──────────────────────────────────────────────────────────────┤
│  Timeline: per-object tracks, playhead scrubbing             │
└──────────────────────────────────────────────────────────────┘
```

**Top Toolbar**:
- Mode switcher: Sprite Editor / Scene / Preview / Export
- Drawing tools (when in Sprite Editor Mode)
- Playback controls: play, pause, stop, scrub
- Export button

**Scene Hierarchy Panel** (left):
- Tree view of all scene objects
- Drag assets from Project Library to add to scene
- Drag objects onto others to create parent-child relationships
- Right-click menu: Rename, Duplicate, Delete, Group, Move to Layer
- Eye icon: toggle visibility
- Lock icon: prevent selection/movement

**Canvas** (center):
- Main visual workspace
- Displays scene composition or sprite drawing depending on mode
- Transform handles for selected objects (move, rotate, scale)
- Grid toggle for pixel-art drawing

**Inspector Panel** (right):
- Displays properties of selected object
- Editable fields for Position X/Y, Rotation, Scale X/Y, Opacity
- Visibility toggle, Flip Horizontal/Vertical
- Blend Mode selector
- Anchor Point adjustment
- Keyframe diamond icons next to animatable properties

**Asset Library Panel** (bottom-left area):
- Organized folders:
  - Sprites (single-frame drawings)
  - Animations (multi-frame drawings)
  - Images (imported PNG/JPG/SVG)
  - GIF Clips (imported GIFs auto-split into frames)
  - Audio (imported MP3/WAV/OGG)
  - Effects (built-in screen effects)
  - Library Samples (pre-made animation sets)
- Drag-and-drop to scene or timeline

**Timeline Panel** (bottom):
- Horizontal time ruler with playhead
- Per-object track types:
  - Position Track
  - Rotation Track
  - Scale Track
  - Opacity Track
  - Visibility Track
  - Animation Track (holds animation clip blocks)
  - Audio Track
  - Effects Track (scene-level)
- Drag playhead to scrub through time
- Click to set keyframes at current playhead position
- Drag clip blocks to reposition
- Resize clip blocks by dragging edges
- Click boundaries between clips to set cross-fade transitions

### 3.5 Sprite Editor Mode

**Purpose**: Dedicated drawing workspace for creating animation assets

**Canvas Characteristics**:
- Always transparent background (no background color)
- Adjustable canvas size: 64×64, 128×128, 256×256, or custom

**Drawing Tools**:
- Pencil
- Line
- Rectangle
- Circle
- Bezier curve
- Fill bucket
- Eraser
- Color picker

**Frame Management**:
- Frame strip at bottom showing all frames in sequence
- Add frame button
- Remove frame button
- Duplicate frame button
- Reorder frames by dragging

**Animation Features**:
- Onion skinning toggle: shows previous frame as faint ghost for reference
- FPS setting per animation
- Preview button: plays all frames in loop within editor

**Trace Layer**:
- Import reference images beneath drawing layer
- Faded, locked, non-exportable
- Single image mode: one reference for all frames
- Frame sequence mode: one reference per frame for rotoscoping
- From Library Sample: opens built-in sample as trace reference

**Save Functionality**:
- Name the asset
- Save as Sprite (1 frame) or Animation (2+ frames)
- Asset stored in Project Library

### 3.6 Scene Mode

**Purpose**: Main composition and animation workspace

**Functionality**:
- Select, move, rotate, scale objects using canvas transform handles
- Set keyframes on any object property at current playhead position
- Drag animation clips from Asset Library onto object Animation Tracks
- Place audio files on Audio Tracks with precise positioning
- Add screen effects to Effects Track
- Scrub playhead to inspect any frame

**Keyframing Process**:
1. Move playhead to desired time
2. Select object in hierarchy
3. Change property value in Inspector
4. Click diamond icon or press K to record keyframe
5. Move to different time, change value, set another keyframe
6. System interpolates values between keyframes

**Easing Options**:
- Linear: constant speed
- Ease In: slow start, accelerates
- Ease Out: fast start, decelerates
- Ease In-Out: slow start, fast middle, slow end
- Step: instant jump, no interpolation

### 3.7 Preview Mode

**Purpose**: Full-canvas playback review before export

**Functionality**:
- All UI panels hidden
- Clean full-canvas view
- Audio plays in sync
- Press Escape or stop button to return to Scene Mode

### 3.8 Export Mode

**Purpose**: Configure and initiate video rendering

**Triggered By**: Export button in Top Toolbar

**Settings Panel**:
- Resolution selector: 480p (free) / 720p / 1080p / 4K (paid tiers locked in v0)
- Frame Rate: 24fps / 30fps / 60fps
- Format: MP4 (H.264)
- Audio: Include / Mute all audio
- Export Range: Full scene / Custom start-to-end time

**Export Process**:
1. User configures settings and initiates rendering
2. App seeks playhead to frame 0
3. Scene rendered to canvas at chosen resolution
4. Free tier: watermark overlay composited before capture
5. Canvas frame captured as PNG image
6. Playhead advances by 1/FPS seconds
7. Steps 4-6 repeat until scene end
8. Frames passed to FFmpeg.wasm as video stream
9. Audio tracks decoded and mixed with OfflineAudioContext
10. FFmpeg muxes video and audio into MP4
11. File offered as browser download

**Quality Tiers**:
- Free: 480p with semi-transparent 'Made with Animate 2D' watermark (lower-right)
- Standard (Paid — future): 720p, no watermark
- Pro (Paid — future): 1080p, no watermark
- Ultra (Paid — future): 4K, no watermark

**Note**: Watermark appears only in exported MP4, not in Preview Mode

## 4. Core Features & Functionality

### 4.1 Asset Pipeline

**Three Asset Entry Points**:
1. **Draw in Sprite Editor**: Original art on transparent canvas
2. **Import Image**: Drag-drop PNG/JPG/SVG becomes static scene object
3. **Import GIF**: Auto-split into frames, becomes ready-made animation asset

**Project Library Structure**:
- Sprites: single-frame drawings
- Animations: multi-frame drawings
- Images: imported PNG/JPG/SVG
- GIF Clips: imported GIFs auto-split
- Audio: imported MP3/WAV/OGG
- Effects: built-in screen effects
- Library Samples: pre-made animation frame sets

**Asset Types**:
- **Sprite (Static)**: One frame, used for props, backgrounds, non-animated objects
- **Animation Asset**: Two or more frames with FPS setting, used for characters, effects, anything that cycles

### 4.2 GIF Import Process

**Functionality**:
1. App reads all frames from imported GIF
2. Each frame extracted as transparent PNG, stored internally
3. Original frame timing preserved, converted to FPS value
4. New Animation Asset automatically created with all frames in order
5. Asset appears in GIF Clips folder of Project Library
6. Immediately draggable into scene, no additional setup

### 4.3 Sprite-Swap Animation Model

**Core Concept**: Every object displays exactly one image at any given frame

**Animation Mechanism**:
- Animation Asset = ordered list of images (frames) shown sequentially at set FPS
- No bones, no transforms on sub-parts, no deformation
- Each frame is independent drawing
- Renderer calculates which frame to display based on playhead position:
  ```
  currentFrame = floor((playheadTime - clipStartTime) * clip.fps) % clip.totalFrames
  ```

**Animation Clip Blocks**:
- Placed on object's Animation Track
- Multiple blocks in sequence create behavior changes
- Drag right edge to extend/shrink duration
- Right-click to set playback mode

**Playback Modes**:
- **Loop**: Frames cycle continuously until clip block ends
- **Play Once**: Frames play start to end once, hold last frame
- **Ping-Pong**: Plays forward then backward repeatedly
- **Hold Last Frame**: Plays once, freezes on final frame

### 4.4 Smooth Animation Transitions (Cross-Fade)

**Purpose**: Blend between two adjacent animation clips

**Configuration**: Click boundary between two clips on Animation Track

**Cross-Fade Mechanism**:
- During transition window, both animations drawn simultaneously with blended opacity
- At transition midpoint (t=0.5): outgoing at 0.5 opacity, incoming at 0.5 opacity
- At t=0.0: outgoing=1.0, incoming=0.0
- At t=1.0: outgoing=0.0, incoming=1.0

**Cross-Fade Options**:
- **None (Hard Cut)**: Default, instant switch
- **Linear Cross-Fade**: Constant rate opacity blend
- **Ease Cross-Fade**: Slow start, faster middle, slow end
- **Hold & Fade**: Outgoing clip holds last frame during fade

**Transition Duration**: User-defined, typically 0.1s - 0.4s

### 4.5 Frame-by-Frame Animation Creation

**Workflow**:
1. Open Sprite Editor
2. Draw Frame 1 (e.g., first pose of walk cycle)
3. Click Add Frame — new blank transparent frame appears
4. Enable Onion Skin — previous frame appears faintly
5. Draw Frame 2 (next pose)
6. Repeat until animation cycle complete
7. Set FPS value
8. Press Preview to watch loop
9. Name animation and Save
10. Animation appears in Project Library under Animations

**Recommended Frame Counts**:
- Walk Cycle: 6-8 frames at 12fps
- Run Cycle: 4-6 frames at 18fps
- Idle/Breathing: 3-4 frames at 8fps
- Jump+Land: 5-6 frames at 24fps
- Punch/Kick: 4-5 frames at 24fps
- Shoot: 4-5 frames at 24fps
- Crouch: 3 frames at 12fps
- Death/Fall: 5-6 frames at 18fps
- Explosion Effect: 6-10 frames at 24fps
- Muzzle Flash: 3-4 frames at 24fps

### 4.6 Built-in Animation Sample Library

**Categories & Assets**:

**Humanoid**:
- Walk Cycle (8 frames, 12fps)
- Run Cycle (6 frames, 18fps)
- Idle/Breathing (4 frames, 8fps)
- Jump+Land (5 frames, 24fps)
- Crouch (3 frames, 12fps)
- Punch (4 frames, 24fps)
- Kick (4 frames, 24fps)
- Shoot (5 frames, 24fps)
- Fall+Hit Ground (6 frames, 18fps)
- Wave (4 frames, 12fps)
- Death (5 frames, 18fps)
- Push (4 frames, 12fps)
- Climb (6 frames, 12fps)

**Quadruped (Side View)**:
- Walk Cycle (8 frames)
- Run Cycle (6 frames)
- Idle (3 frames)
- Jump (4 frames)
- Sit Down (3 frames)

**Bird (Side View)**:
- Flap Cycle (4 frames)
- Glide (2 frames)
- Land (3 frames)

**Effects**:
- Explosion Burst (8 frames)
- Smoke Puff (6 frames)
- Dust Cloud (5 frames)
- Muzzle Flash (3 frames)
- Hit Spark (4 frames)
- Speed Lines (3 frames)
- Water Splash (5 frames)
- Fire Loop (6 frames)
- Electric Zap (4 frames)
- Star Impact (4 frames)

**Environment**:
- Rain Loop (3 frames)
- Falling Leaves (5 frames)
- Water Flow (4 frames)
- Lightning Flash (3 frames)

**Three Usage Modes**:
1. **Use Directly**: Drag sample into Scene Hierarchy, becomes live scene object
2. **Open as Trace**: Opens in Sprite Editor as trace layer for redrawing
3. **Edit Copy**: Opens frames as editable, modify and save as personal asset

### 4.7 Scene Composition

**Layers System**:
- Default layers: Background, Midground, Foreground, Effects
- Users can add, rename, delete, reorder layers
- Entire layers can be hidden, locked, or have opacity reduced
- Controls rendering order (what appears in front)

**Object Hierarchy**:
- Tree structure like Unity
- Objects can be parented, grouped, reordered
- Child inherits parent's position and movement
- Eye icon: toggle visibility
- Lock icon: prevent accidental selection/movement

**Object Properties (All Keyframable)**:
- Position X/Y: location in pixels
- Rotation: degrees around anchor point
- Scale X/Y: size multiplier (1.0 = original)
- Opacity: 0 (invisible) to 1 (fully visible)
- Visibility: boolean show/hide
- Flip Horizontal: mirror along X axis
- Flip Vertical: mirror along Y axis
- Blend Mode: Normal, Multiply, Screen, Add
- Anchor Point: pivot for rotation/scaling

### 4.8 Parallax Scrolling & Infinite Loops

**Parallax Layer Speeds** (relative to subject):
- Sky/Clouds: 15-20%
- Far Buildings: 35-40%
- Mid Buildings: 60-65%
- Near Buildings/Trees: 80-85%
- Road/Ground: 100% (same speed as subject)
- Subject (Car, Character): Appears stationary, world scrolls past

**Infinite Scroll Loop Mechanism**:
1. User draws background tile at least 2× canvas width with matching edges
2. Infinite Scroll clip type moves tile position.x from 0 to -tileWidth
3. Instantly snaps back to 0
4. Seamless tile makes snap invisible
5. Speed set in pixels per second
6. Scroll starts/stops with clip block on timeline

**Note**: Ground/near layer scroll speed must match subject movement speed to prevent feet-sliding effect

### 4.9 Visual State Switching

**Mechanism**: Objects switch states using Visibility or Opacity keyframes

**Example — Building Explosion**:
1. Two versions (BuildingFull, BuildingBroken) stacked at same position
2. BuildingFull visible from start
3. At explosion moment:
   - BuildingFull opacity → 0
   - BuildingBroken opacity → 1
   - Both on same frame
4. Screen Flash effect fires at same timestamp, covering hard cut

**Objects Appearing Mid-Scene**:
- Set Visibility to false or Opacity to 0 initially
- Keyframe at right timestamp switches it on
- Applies to: characters entering, projectiles spawning, debris, enemies, UI overlays

### 4.10 Screen Effects

**Available Effects**:
- **Screen Shake**: Rapidly offsets entire canvas for set duration and intensity
- **Flash**: White or colored full-screen overlay, appears and fades in 2-4 frames
- **Vignette**: Darkens screen edges for tension/atmosphere
- **Zoom Punch**: Briefly scales canvas up then back to normal for impact
- **Slow Motion**: Slows playback speed of all tracks between two timestamps
- **Color Grade**: Applies color tint or desaturation over scene for duration

**Placement**: Added to Effects Track at specific timestamps

### 4.11 Audio System

**Supported Formats**:
- MP3: standard compressed, smallest file size
- WAV: uncompressed, highest quality, larger files
- OGG: open format, good compression

**Audio Track Functionality**:
- Import audio files into Project Library
- Drag onto Audio Track as blocks
- Position block to set start time
- Right-click: set volume, enable loop, set fade-in/fade-out duration
- Multiple audio tracks supported

**Audio Types**:
- **Background Music**: Long looping track from scene beginning
- **Sound Effect**: Short one-shot (gunshot, explosion, footstep, punch)
- **Ambient Loop**: City noise, wind, engine hum beneath scene
- **Voice/Narration**: Dialogue placed precisely against character animation

**Audio on Export**:
- All tracks decoded to raw PCM data
- Mixed together using Web Audio API OfflineAudioContext
- Mixed buffer muxed with video frames using FFmpeg.wasm
- Produces final MP4 with synchronized audio

### 4.12 Timeline System

**Track Types Per Object**:
- **Position Track**: X/Y coordinates, keyframed directly
- **Rotation Track**: Rotation value over time, keyframed
- **Scale Track**: Scale over time, keyframed
- **Opacity Track**: Transparency over time, keyframed
- **Visibility Track**: Boolean show/hide at timestamps
- **Animation Track**: Holds animation clip blocks
- **Audio Track**: Holds audio file blocks
- **Effects Track**: Scene-level effects at timestamps

**Keyframing Process**:
1. Move playhead to desired time
2. Select object
3. Change property in Inspector
4. Click diamond icon or press K
5. Move to different time, change value, set another keyframe
6. System interpolates between keyframes

**Animation Clip Block Operations**:
- Drag from Library onto Animation Track
- Block appears at playhead position
- Drag right edge to extend/shrink duration
- Right-click: set playback mode
- Click boundary between blocks: set cross-fade transition

### 4.13 Local Save & Project Storage

**Storage Method**: Browser IndexedDB via Dexie.js library

**What Is Saved**:
- All project metadata: name, canvas size, FPS, background color
- All sprites and animation assets: frame images as base64-encoded PNG
- All imported images and GIF clips
- Scene hierarchy and object properties
- Timeline data: keyframes, clip blocks, audio placements
- Layer structure and settings

**Auto-Save**: Progress automatically saved to local storage, nothing lost on refresh

**No Account Required**: All data stored entirely in user's browser, no internet connection needed beyond loading app

## 5. Business Rules & Logic

### 5.1 Asset Reusability
- All assets in Project Library are single source of truth
- Scene objects are instances of library assets, not copies
- Modifying library asset does not affect existing scene instances
- Deleting library asset does not remove existing scene instances

### 5.2 Animation Playback Calculation
```
currentFrame = floor((playheadTime - clipStartTime) * clip.fps) % clip.totalFrames
```
- Determines which frame to display at any playhead position
- Loops automatically when playback mode is Loop
- Holds last frame when playback mode is Play Once or Hold Last Frame

### 5.3 Cross-Fade Blending
- During transition window, both animations rendered simultaneously
- Opacity calculated based on transition progress:
  - outgoingOpacity = 1 - transitionProgress
  - incomingOpacity = transitionProgress
- Transition progress = (currentTime - transitionStartTime) / transitionDuration

### 5.4 Parallax Scroll Speed Matching
- Ground/near layer scroll speed must equal subject movement speed
- Prevents feet-sliding effect
- User tunes by eye in Preview Mode

### 5.5 Infinite Scroll Loop Logic
- Tile width must be at least 2× canvas width
- Position.x moves from 0 to -tileWidth
- Snaps instantly back to 0
- Seamless edges make snap invisible

### 5.6 Watermark Application (Free Tier)
- Applied directly to each canvas frame before FFmpeg encoding
- Semi-transparent text overlay: 'Made with Animate 2D'
- Position: lower-right corner
- Cannot be cropped without losing scene content
- Does not appear in Preview Mode
- Only appears in exported MP4

### 5.7 Export Rendering Process
- FFmpeg.wasm loads before first export (~30MB)
- 10-second scene at 1080p may take 1-3 minutes depending on device
- Frames captured sequentially from playhead 0 to scene end
- Audio decoded and mixed separately
- Video and audio muxed into final MP4

## 6. Exception & Boundary Cases

| Scenario | Handling |
|----------|----------|
| User closes browser during work | All progress auto-saved to local storage, restored on next open |
| User clears browser data | All projects permanently lost, no recovery possible |
| Imported GIF has no frames | Import rejected, error message displayed |
| Imported audio file is corrupted | Import rejected, error message displayed |
| User attempts to export with no scene content | Export blocked, prompt to add content |
| User attempts to export with audio but no video | Export proceeds with black frames and audio |
| User drags asset onto locked layer | Action blocked, visual feedback indicating layer is locked |
| User attempts to keyframe non-animatable property | Keyframe button disabled for that property |
| User sets FPS to 0 or negative value | Input rejected, minimum FPS enforced (e.g., 1fps) |
| User creates animation with 1 frame | Treated as static Sprite, not Animation |
| User deletes asset used in scene | Scene instances remain, show placeholder or last known state |
| User attempts to parent object to itself | Action blocked, error message displayed |
| User sets cross-fade duration longer than clip duration | Cross-fade clamped to clip duration |
| Export fails due to browser memory limit | Error message displayed, suggest reducing resolution or scene length |
| FFmpeg.wasm fails to load | Export disabled, error message with troubleshooting steps |
| User attempts to import file over size limit | Import rejected, file size limit message displayed |
| User attempts to use paid tier features in v0 | Feature locked, upgrade prompt displayed (no payment system active) |

## 7. Acceptance Criteria

1. User can open app and immediately start creating without login or account
2. User can draw multi-frame animations in Sprite Editor with onion skinning
3. User can import PNG, JPG, SVG images and they appear in Project Library
4. User can import GIF and it auto-splits into animation frames
5. User can drag assets from Project Library into Scene Hierarchy
6. User can select, move, rotate, scale objects on canvas using transform handles
7. User can set keyframes on Position, Rotation, Scale, Opacity at any playhead position
8. User can drag animation clips onto object Animation Tracks
9. User can configure cross-fade transitions between adjacent animation clips
10. User can place audio files on Audio Tracks with precise timing
11. User can add screen effects (shake, flash, vignette, zoom punch) to Effects Track
12. User can scrub playhead to inspect any frame in timeline
13. User can enter Preview Mode and see full-canvas playback with audio
14. User can configure export settings (resolution, FPS, range) and initiate rendering
15. Free tier export produces MP4 with watermark in lower-right corner
16. Paid tier options visible but locked with upgrade prompt in v0
17. All project data auto-saves to browser local storage
18. User can close and reopen browser, project restores exactly as left
19. User can create multiple projects and switch between them
20. User can delete projects with confirmation prompt
21. Built-in animation library samples are accessible and usable
22. User can use library samples directly, as trace reference, or edit copy
23. Parallax scrolling works with configurable layer speeds
24. Infinite scroll loops work seamlessly with matching tile edges
25. Visual state switching (e.g., building explosion) works with opacity/visibility keyframes
26. Objects can appear mid-scene using visibility/opacity keyframes
27. All UI panels are responsive and functional
28. Canvas renders correctly at different resolutions
29. Audio plays in sync during Preview and Export
30. Export process completes successfully and produces downloadable MP4

## 8. Out of Scope for This Release

- User accounts and cloud storage
- Cross-device project sync
- Collaboration features (multi-user editing)
- Payment system and paid tier activation
- Bone rigging or skeletal animation
- Mesh deformation or morphing
- 3D rendering or camera perspective
- Vector-based drawing tools
- Text tool or typography features
- Advanced color correction or filters beyond basic effects
- Plugin system or third-party integrations
- Mobile app versions (iOS/Android native)
- Offline desktop application
- Project templates or starter kits
- Community asset marketplace
- Tutorial system or guided onboarding
- Undo/redo beyond browser default
- Version control or project history
- Export to formats other than MP4 (GIF, WebM, image sequence)
- Real-time collaboration or live preview sharing
- Advanced audio editing (waveform editing, effects)
- Scripting or code-based animation control
- Physics simulation or particle systems
- AI-assisted drawing or animation generation