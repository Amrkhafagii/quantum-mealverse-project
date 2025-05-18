
import { registerPlugin } from '@capacitor/core';

export interface ARPreviewOptions {
  planeDetection: boolean;
  lightEstimation?: boolean;
  environmentTexturing?: 'none' | 'manual' | 'automatic';
}

export interface ModelLoadOptions {
  modelUrl: string;
  scale: number;
  rotation?: { x: number, y: number, z: number };
}

export interface ModelPosition {
  x: number;
  y: number;
  z: number;
}

export interface ARPreviewPlugin {
  isSupported(): Promise<{ supported: boolean }>;
  loadModel(options: ModelLoadOptions): Promise<{ success: boolean }>;
  startARSession(options: ARPreviewOptions): Promise<void>;
  placeModel(position?: ModelPosition): Promise<void>;
  stopARSession(): Promise<void>;
}

const ARPreview = registerPlugin<ARPreviewPlugin>('ARPreviewPlugin');

export default ARPreview;
