export type EditorMode = 'sprite' | 'scene' | 'preview' | 'export';

export type PlaybackMode = 'loop' | 'once' | 'pingpong' | 'hold';

export type AssetType = 'sprite' | 'animation' | 'image' | 'gif' | 'audio' | 'effect' | 'spritesheet';

export type TrackType = 'position' | 'rotation' | 'scale' | 'opacity' | 'visibility' | 'animation' | 'audio' | 'effect';

export interface FrameImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  flipX?: boolean;
  flipY?: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  zIndex: number; // Layer order - higher numbers render on top
}

export interface FrameText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface Frame {
  id: string;
  imageData: string;
  duration?: number;
  images?: FrameImage[];
  texts?: FrameText[];
  drawingZIndex?: number; // Z-index of the drawing layer
  fabricData?: any; // Fabric.js canvas JSON data
  backgroundColor?: string; // Frame-specific background color
  width?: number; // Frame-specific width
  height?: number; // Frame-specific height
}

export interface SceneObject {
  id: string;
  name: string;
  type: 'sprite' | 'animation' | 'image' | 'text';
  assetId?: string;
  transform: Transform;
  opacity: number;
  visible: boolean;
  flipHorizontal: boolean;
  flipVertical: boolean;
  layer: string;
  parentId?: string;
  locked: boolean;
}

export interface SpriteAsset {
  id: string;
  name: string;
  type: 'sprite';
  frame: Frame;
  width: number;
  height: number;
  createdAt: number;
}

export interface AnimationAsset {
  id: string;
  name: string;
  type: 'animation';
  frames: Frame[];
  fps: number;
  width: number;
  height: number;
  createdAt: number;
}

export interface ImageAsset {
  id: string;
  name: string;
  type: 'image';
  url: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface AudioAsset {
  id: string;
  name: string;
  type: 'audio';
  url: string;
  duration: number;
  createdAt: number;
}

export interface SpriteSheetAsset {
  id: string;
  name: string;
  type: 'spritesheet';
  url: string;
  cols: number;
  rows: number;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  createdAt: number;
}

export type Asset = SpriteAsset | AnimationAsset | ImageAsset | AudioAsset | SpriteSheetAsset;

export interface Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Keyframe {
  id: string;
  time: number;
  value: number | boolean;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'step';
}

export interface AnimationClip {
  id: string;
  assetId: string;
  startTime: number;
  duration: number;
  playbackMode: PlaybackMode;
}

export interface Track {
  id: string;
  objectId: string;
  type: TrackType;
  keyframes?: Keyframe[];
  clips?: AnimationClip[];
}

export interface Timeline {
  duration: number;
  fps: number;
  tracks: Track[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

export interface Scene {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
  objects: SceneObject[];
  timeline: Timeline;
}

export interface ProjectSettings {
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  fps: number;
  backgroundColor: string;
}

export interface Project {
  id: string;
  name: string;
  settings: ProjectSettings;
  scene: Scene;
  assets: Asset[];
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DrawingTool {
  type: 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'fill' | 'picker';
  color: string;
  size: number;
}

export interface SpriteEditorState {
  frames: Frame[];
  currentFrameIndex: number;
  fps: number;
  tool: DrawingTool;
  onionSkinEnabled: boolean;
  gridEnabled: boolean;
  canvasWidth: number;
  canvasHeight: number;
}
