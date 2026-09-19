import { DrawStroke, Frame, Point } from '../types';

export function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  width: number,
  height: number,
  scale: number = 1,
  alpha: number = 1,
  backgroundColor?: string
) {
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  for (const stroke of frame.strokes) {
    if (stroke.points.length < 2) {
      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        if (stroke.eraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.fillStyle = stroke.color;
          ctx.fill();
        }
      }
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.width;

    if (stroke.eraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 40,
  gridColor: string = '#303036'
) {
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}
