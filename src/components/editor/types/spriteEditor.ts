export type ToolType = 'select' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'text';

export interface CanvasState {
  width: number;
  height: number;
  showTransparentFrame: boolean;
  backgroundColor: string;
}

export interface AnimationSettings {
  name: string;
  fps: number;
}

export interface EditorFrame {
  id: string;
  fabricData: any | null; // JSON representation of the fabric canvas objects
  thumbnail: string | null; // Base64 image data URL
}
