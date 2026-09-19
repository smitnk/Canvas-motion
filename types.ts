export interface Point {
  x: number;
  y: number;
}

export interface DrawStroke {
  id?: string;
  points: Point[];
  color: string;
  width: number;
  eraser?: boolean;
}

export interface Frame {
  id: string;
  strokes: DrawStroke[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

export interface Project {
  id: string;
  name: string;
  fps: number;
  canvasW: number;
  canvasH: number;
  frames: Frame[];
  layers: Layer[];
  backgroundColor: string;
  createdAt: number;
  updatedAt: number;
}

export type ScreenType =
  | 'HOME'
  | 'CREATE'
  | 'SIZE'
  | 'FPS'
  | 'EDITOR'
  | 'SETTINGS'
  | 'MORE'
  | 'TIMELINE'
  | 'LAYERS';

export type ToolType = 'Brush' | 'Eraser' | 'Lasso' | 'Fill' | 'Text' | 'More';

export const COLORS = {
  appBackground: '#0D0D0F',
  panel: '#18181B',
  panel2: '#252529',
  pink: '#FF3F91',
  textSecondary: '#96969D',
};
