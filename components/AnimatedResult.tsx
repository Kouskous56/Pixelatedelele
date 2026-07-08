import React, { useEffect, useRef } from 'react';
import { PixelMove } from '../types';

interface AnimatedResultProps {
  moves: PixelMove[];
  width: number;
  height: number;
}

export function AnimatedResult({ moves, width, height }: AnimatedResultProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    const duration = 900;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      for (const move of moves) {
        const x = move.startX + (move.endX - move.startX) * eased;
        const y = move.startY + (move.endY - move.startY) * eased;
        ctx.fillStyle = `rgba(${move.r}, ${move.g}, ${move.b}, ${move.a / 255})`;
        ctx.fillRect(x, y, move.w, move.h);
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(draw);
      }
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [height, moves, width]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-lg font-medium text-zinc-100">Result</h3>
        <span className="text-xs text-zinc-500">
          {width} x {height}px
        </span>
      </div>
      <div className="relative flex min-h-[500px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
        />
      </div>
    </div>
  );
}
