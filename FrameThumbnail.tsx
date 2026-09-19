import React, { useEffect, useRef } from 'react';
import { Frame } from '../types';
import { renderFrameToCanvas } from '../utils/canvasRenderer';

interface FrameThumbnailProps {
  frame: Frame;
  width?: number;
  height?: number;
  canvasW?: number;
  canvasH?: number;
  className?: string;
  backgroundColor?: string;
}

export const FrameThumbnail: React.FC<FrameThumbnailProps> = ({
  frame,
  width = 120,
  height = 80,
  canvasW = 1280,
  canvasH = 720,
  className = '',
  backgroundColor = '#18181B'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / canvasW, height / canvasH);
    renderFrameToCanvas(ctx, frame, width, height, scale, 1, backgroundColor);
  }, [frame, width, height, canvasW, canvasH, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block object-contain ${className}`}
    />
  );
};
