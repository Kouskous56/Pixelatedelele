import { LuminanceFormula, PixelBlock, PixelMove, ProcessingOptions, TransformResult } from '../types';

interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export async function transformImage(
  subjectSrc: string,
  objectSrc: string,
  options: ProcessingOptions,
): Promise<TransformResult> {
  const startedAt = performance.now();
  const blockSize = Math.max(1, Math.floor(options.blockSize));
  const maxDimension = options.maxDimension ?? 800;
  const luminanceFormula = options.luminanceFormula ?? LuminanceFormula.REC709;

  const [subject, object] = await Promise.all([
    loadImage(subjectSrc, options.imageLoadTimeout),
    loadImage(objectSrc, options.imageLoadTimeout),
  ]);

  const { width, height } = fitDimensions(subject.width, subject.height, maxDimension);
  const subjectCanvas = drawImageToCanvas(subject.image, width, height);
  const objectCanvas = drawImageToCanvas(object.image, width, height);

  const subjectBlocks = readBlocks(subjectCanvas, blockSize, luminanceFormula);
  const objectBlocks = readBlocks(objectCanvas, blockSize, luminanceFormula);

  const subjectByLight = [...subjectBlocks].sort((a, b) => a.luminance - b.luminance);
  const objectByLight = [...objectBlocks].sort((a, b) => a.luminance - b.luminance);

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = get2dContext(resultCanvas);

  const moves: PixelMove[] = [];

  subjectByLight.forEach((target, index) => {
    const source = objectByLight[index % objectByLight.length];
    resultCtx.fillStyle = `rgba(${source.r}, ${source.g}, ${source.b}, ${source.a / 255})`;
    resultCtx.fillRect(target.x, target.y, target.w, target.h);

    moves.push({
      startX: source.x,
      startY: source.y,
      endX: target.x,
      endY: target.y,
      r: source.r,
      g: source.g,
      b: source.b,
      a: source.a,
      w: target.w,
      h: target.h,
      hasTransparency: source.hasTransparency,
    });

    if (options.onProgress && index % 100 === 0) {
      options.onProgress(Math.round((index / subjectByLight.length) * 100));
    }
  });

  options.onProgress?.(100);

  return {
    width,
    height,
    blockSize,
    totalBlocks: subjectBlocks.length,
    result: resultCanvas.toDataURL('image/png'),
    pixelatedSubject: renderBlocks(subjectBlocks, width, height).toDataURL('image/png'),
    pixelatedObject: renderBlocks(objectBlocks, width, height).toDataURL('image/png'),
    moves,
    metadata: {
      subjectDimensions: { width: subject.width, height: subject.height },
      objectDimensions: { width: object.width, height: object.height },
      processedDimensions: { width, height },
      luminanceFormula,
      processingTime: Math.round(performance.now() - startedAt),
    },
  };
}

function loadImage(src: string, timeout = 12000): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error('Image load timed out')), timeout);

    image.onload = () => {
      window.clearTimeout(timer);
      resolve({
        image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('Could not load image'));
    };
    image.src = src;
  });
}

function fitDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawImageToCanvas(image: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = get2dContext(canvas);
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

function readBlocks(
  canvas: HTMLCanvasElement,
  blockSize: number,
  luminanceFormula: LuminanceFormula,
): PixelBlock[] {
  const ctx = get2dContext(canvas);
  const blocks: PixelBlock[] = [];
  let originalIndex = 0;

  for (let y = 0; y < canvas.height; y += blockSize) {
    for (let x = 0; x < canvas.width; x += blockSize) {
      const w = Math.min(blockSize, canvas.width - x);
      const h = Math.min(blockSize, canvas.height - y);
      const data = ctx.getImageData(x, y, w, h).data;
      const color = averageColor(data);

      blocks.push({
        ...color,
        luminance: getLuminance(color.r, color.g, color.b, luminanceFormula),
        x,
        y,
        w,
        h,
        originalIndex,
        hasTransparency: color.a < 255,
      });
      originalIndex += 1;
    }
  }

  return blocks;
}

function averageColor(data: Uint8ClampedArray) {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  const pixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    a += data[i + 3];
  }

  return {
    r: Math.round(r / pixels),
    g: Math.round(g / pixels),
    b: Math.round(b / pixels),
    a: Math.round(a / pixels),
  };
}

function getLuminance(r: number, g: number, b: number, formula: LuminanceFormula) {
  if (formula === LuminanceFormula.REC601) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  if (formula === LuminanceFormula.SIMPLE) {
    return (r + g + b) / 3;
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function renderBlocks(blocks: PixelBlock[], width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = get2dContext(canvas);

  for (const block of blocks) {
    ctx.fillStyle = `rgba(${block.r}, ${block.g}, ${block.b}, ${block.a / 255})`;
    ctx.fillRect(block.x, block.y, block.w, block.h);
  }

  return canvas;
}

function get2dContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }
  return ctx;
}
