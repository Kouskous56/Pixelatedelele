export interface PixelBlock {
  r: number;
  g: number;
  b: number;
  a: number;
  luminance: number;
  x: number;
  y: number;
  w: number;
  h: number;
  originalIndex: number;
  hasTransparency?: boolean;
}

export interface PixelMove {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  r: number;
  g: number;
  b: number;
  a: number;
  w: number;
  h: number;
  hasTransparency?: boolean;
}

export interface ProcessingOptions {
  blockSize: number;
  maxDimension?: number;
  onProgress?: (progress: number) => void;
  luminanceFormula?: LuminanceFormula;
  imageLoadTimeout?: number;
}

export interface TransformResult {
  width: number;
  height: number;
  blockSize: number;
  totalBlocks: number;
  result: string;
  pixelatedSubject: string;
  pixelatedObject: string;
  moves: PixelMove[];
  metadata: {
    subjectDimensions: { width: number; height: number };
    objectDimensions: { width: number; height: number };
    processedDimensions: { width: number; height: number };
    luminanceFormula: LuminanceFormula;
    processingTime: number;
  };
}

export enum ProcessingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum LuminanceFormula {
  REC601 = 'rec601',  // Standard for SDTV
  REC709 = 'rec709',  // Standard for HDTV
  SIMPLE = 'simple',  // Simple average
}
