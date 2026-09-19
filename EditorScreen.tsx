import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Share2,
  MoreVertical,
  Pen,
  Eraser,
  Maximize2,
  PaintBucket,
  Type,
  MoreHorizontal,
  Volume2,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Layers,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  List,
  Plus
} from 'lucide-react';
import { Frame, DrawStroke, Point, ToolType, COLORS } from '../types';
import { renderFrameToCanvas, drawGrid } from '../utils/canvasRenderer';

interface EditorScreenProps {
  projectName: string;
  frames: Frame[];
  currentFrame: number;
  fps: number;
  onion: boolean;
  grid: boolean;
  canvasW: number;
  canvasH: number;
  onFrameChange: (index: number | ((prev: number) => number)) => void;
  onFramesChange: (frames: Frame[]) => void;
  onBack: () => void;
  onSettings: () => void;
  onTimeline: () => void;
  onLayers: () => void;
  onMore: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  projectName,
  frames,
  currentFrame,
  fps,
  onion,
  grid,
  canvasW,
  canvasH,
  onFrameChange,
  onFramesChange,
  onBack,
  onSettings,
  onTimeline,
  onLayers,
  onMore
}) => {
  const [tool, setTool] = useState<ToolType>('Brush');
  const [color, setColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [clipboardStrokes, setClipboardStrokes] = useState<DrawStroke[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Undo & Redo stacks for the current frame
  const [undoStack, setUndoStack] = useState<DrawStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawStroke[][]>([]);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<Point[]>([]);

  const currentStrokes = frames[currentFrame]?.strokes || [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Play flipbook audio click
  const playAudioTick = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [isAudioEnabled]);

  // Animation Playback Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onFrameChange((prev) => {
        const next = (prev + 1) % frames.length;
        playAudioTick();
        return next;
      });
    }, 1000 / (fps || 12));

    return () => clearInterval(interval);
  }, [isPlaying, fps, frames.length, onFrameChange, playAudioTick]);

  // Update strokes for current frame
  const updateCurrentFrameStrokes = useCallback(
    (newStrokes: DrawStroke[]) => {
      const newFrames = [...frames];
      newFrames[currentFrame] = {
        ...newFrames[currentFrame],
        strokes: newStrokes
      };
      onFramesChange(newFrames);
    },
    [frames, currentFrame, onFramesChange]
  );

  // Redraw Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute scale to fit container while maintaining canvasW/canvasH aspect ratio
    const scale = Math.min(canvas.width / canvasW, canvas.height / canvasH);
    const offsetX = (canvas.width - canvasW * scale) / 2;
    const offsetY = (canvas.height - canvasH * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Background fill
    ctx.fillStyle = '#101013';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Grid (if enabled)
    if (grid) {
      drawGrid(ctx, canvasW, canvasH, 40, '#303036');
    }

    // Onion skinning (previous frame at 0.2 alpha)
    if (onion && currentFrame > 0 && frames[currentFrame - 1]) {
      renderFrameToCanvas(
        ctx,
        frames[currentFrame - 1],
        canvasW,
        canvasH,
        1,
        0.25
      );
    }

    // Current frame strokes
    renderFrameToCanvas(
      ctx,
      frames[currentFrame] || { id: 'temp', strokes: [] },
      canvasW,
      canvasH,
      1,
      1
    );

    // Active in-progress stroke
    if (currentPointsRef.current.length > 0) {
      const activeStroke: DrawStroke = {
        points: currentPointsRef.current,
        color,
        width: size,
        eraser: tool === 'Eraser'
      };
      renderFrameToCanvas(
        ctx,
        { id: 'active', strokes: [activeStroke] },
        canvasW,
        canvasH,
        1,
        1
      );
    }

    ctx.restore();
  }, [canvasW, canvasH, currentFrame, frames, grid, onion, color, size, tool]);

  // Handle Resize of drawing area
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Convert client pointer coordinates to virtual canvas (canvasW x canvasH) coordinates
  const getCanvasCoordinates = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const xInCanvas = clientX - rect.left;
    const yInCanvas = clientY - rect.top;

    const scale = Math.min(canvas.width / canvasW, canvas.height / canvasH);
    const offsetX = (canvas.width - canvasW * scale) / 2;
    const offsetY = (canvas.height - canvasH * scale) / 2;

    const virtualX = (xInCanvas - offsetX) / scale;
    const virtualY = (yInCanvas - offsetY) / scale;

    return { x: virtualX, y: virtualY };
  };

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlaying) setIsPlaying(false);
    const pt = getCanvasCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    if (tool === 'Fill') {
      // Flood / background fill action
      setUndoStack((prev) => [...prev, currentStrokes]);
      setRedoStack([]);
      // Create big background fill stroke
      const fillStroke: DrawStroke = {
        points: [
          { x: 0, y: 0 },
          { x: canvasW, y: 0 },
          { x: canvasW, y: canvasH },
          { x: 0, y: canvasH },
          { x: 0, y: 0 }
        ],
        color,
        width: 4
      };
      updateCurrentFrameStrokes([...currentStrokes, fillStroke]);
      showToast('Canvas color filled');
      return;
    }

    if (tool === 'Text') {
      const textVal = window.prompt('Enter text to insert:', 'Hello');
      if (textVal) {
        setUndoStack((prev) => [...prev, currentStrokes]);
        setRedoStack([]);
        // Create letter strokes roughly or text note
        const pts: Point[] = [];
        for (let i = 0; i < textVal.length * 15; i += 4) {
          pts.push({ x: pt.x + i, y: pt.y });
        }
        const textStroke: DrawStroke = {
          points: pts.length > 0 ? pts : [{ x: pt.x, y: pt.y }, { x: pt.x + 20, y: pt.y }],
          color,
          width: size
        };
        updateCurrentFrameStrokes([...currentStrokes, textStroke]);
      }
      return;
    }

    isDrawingRef.current = true;
    currentPointsRef.current = [pt];
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getCanvasCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    currentPointsRef.current.push(pt);
    redrawCanvas();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      setUndoStack((prev) => [...prev, currentStrokes]);
      setRedoStack([]);

      const newStroke: DrawStroke = {
        points: [...currentPointsRef.current],
        color,
        width: size,
        eraser: tool === 'Eraser'
      };
      updateCurrentFrameStrokes([...currentStrokes, newStroke]);
    }

    currentPointsRef.current = [];
    redrawCanvas();
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentStrokes]);
    updateCurrentFrameStrokes(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentStrokes]);
    updateCurrentFrameStrokes(next);
  };

  // Copy / Paste
  const handleCopy = () => {
    setClipboardStrokes(currentStrokes);
    showToast('Frame strokes copied!');
  };

  const handlePaste = () => {
    if (!clipboardStrokes || clipboardStrokes.length === 0) {
      showToast('Clipboard is empty');
      return;
    }
    setUndoStack((prev) => [...prev, currentStrokes]);
    setRedoStack([]);
    updateCurrentFrameStrokes([...currentStrokes, ...clipboardStrokes]);
    showToast('Strokes pasted!');
  };

  // Add Frame
  const handleAddFrame = () => {
    const newFrames = [...frames];
    const newFrame: Frame = {
      id: `frame_${Date.now()}`,
      strokes: []
    };
    newFrames.splice(currentFrame + 1, 0, newFrame);
    onFramesChange(newFrames);
    onFrameChange(currentFrame + 1);
    setUndoStack([]);
    setRedoStack([]);
    showToast(`Added Frame ${currentFrame + 2}`);
  };

  // Share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: projectName,
          text: `Check out my 2D animation "${projectName}" made with MotionCanvas!`
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Project link copied!');
    }
  };

  const paletteColors = [
    '#000000',
    '#FFFFFF',
    '#EF4444',
    '#3B82F6',
    '#22C55E',
    '#EAB308',
    '#FF3F91'
  ];

  return (
    <div className="flex flex-col h-full w-full bg-black text-white select-none relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0D0D0F] border-b border-[#18181B] flex-shrink-0 z-30">
        <button
          id="editor-close-btn"
          onClick={onBack}
          className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Return to Home"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0 px-2.5">
          <div className="text-sm font-bold text-white truncate leading-tight">
            {projectName}
          </div>
          <div className="text-[11px] text-[#96969D] leading-none mt-0.5 font-mono">
            Frame {currentFrame + 1}/{frames.length} • {fps} FPS
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="editor-share-btn"
            onClick={handleShare}
            className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            id="editor-settings-btn"
            onClick={onSettings}
            className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Project Settings"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Drawing Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full bg-[#101013] relative overflow-hidden flex items-center justify-center touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Floating Tool Palette on Center-Left */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-[#17171A] p-1.5 rounded-[14px] shadow-2xl border border-[#252529]/80 z-20">
          {/* Brush */}
          <button
            id="tool-brush"
            onClick={() => setTool('Brush')}
            className={`w-[42px] h-[42px] rounded-[9px] flex items-center justify-center transition-all cursor-pointer ${
              tool === 'Brush'
                ? 'bg-[#FF3F91]/25 text-[#FF3F91]'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title="Brush Tool"
          >
            <Pen className="w-5 h-5" />
          </button>

          {/* Eraser */}
          <button
            id="tool-eraser"
            onClick={() => setTool('Eraser')}
            className={`w-[42px] h-[42px] rounded-[9px] flex items-center justify-center transition-all cursor-pointer ${
              tool === 'Eraser'
                ? 'bg-[#FF3F91]/25 text-[#FF3F91]'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Lasso */}
          <button
            id="tool-lasso"
            onClick={() => {
              setTool('Lasso');
              showToast('Lasso selection ready');
            }}
            className={`w-[42px] h-[42px] rounded-[9px] flex items-center justify-center transition-all cursor-pointer ${
              tool === 'Lasso'
                ? 'bg-[#FF3F91]/25 text-[#FF3F91]'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title="Lasso Selection"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Fill */}
          <button
            id="tool-fill"
            onClick={() => setTool('Fill')}
            className={`w-[42px] h-[42px] rounded-[9px] flex items-center justify-center transition-all cursor-pointer ${
              tool === 'Fill'
                ? 'bg-[#FF3F91]/25 text-[#FF3F91]'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title="Color Fill"
          >
            <PaintBucket className="w-5 h-5" />
          </button>

          {/* Text */}
          <button
            id="tool-text"
            onClick={() => setTool('Text')}
            className={`w-[42px] h-[42px] rounded-[9px] flex items-center justify-center transition-all cursor-pointer ${
              tool === 'Text'
                ? 'bg-[#FF3F91]/25 text-[#FF3F91]'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title="Insert Text"
          >
            <Type className="w-5 h-5" />
          </button>

          {/* More Tools */}
          <button
            id="tool-more"
            onClick={onMore}
            className="w-[42px] h-[42px] rounded-[9px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="More Tools"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stroke Size & Color Controls Bar */}
      <div className="flex flex-col bg-[#18181B] px-3 py-1.5 border-t border-[#252529] flex-shrink-0 z-20 space-y-1.5">
        {/* Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#96969D] font-medium w-7">Size</span>
          <input
            id="stroke-size-slider"
            type="range"
            min="1"
            max="40"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
            className="flex-1 accent-[#FF3F91] h-1.5 bg-[#252529] rounded-lg cursor-pointer"
          />
          <span className="text-[11px] text-white font-mono w-5 text-right">{Math.round(size)}</span>
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {paletteColors.map((c) => {
            const isSelected = color.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                id={`color-${c.replace('#', '')}`}
                onClick={() => setColor(c)}
                className={`w-[26px] h-[26px] rounded-full flex-shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#FF3F91] scale-110 shadow-sm'
                    : 'border border-zinc-700 hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            );
          })}

          {/* Custom Color Input */}
          <label
            htmlFor="custom-color-picker"
            className="w-[26px] h-[26px] rounded-full border border-dashed border-zinc-500 hover:border-[#FF3F91] flex items-center justify-center cursor-pointer text-[10px] text-[#96969D] hover:text-[#FF3F91] flex-shrink-0"
            title="Custom Color"
          >
            +
            <input
              id="custom-color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Action Bar (Audio, Undo, Redo, Copy, Paste, Layers) */}
      <div className="flex items-center justify-around bg-[#18181B] py-1 px-2 border-t border-[#252529]/60 flex-shrink-0 z-20">
        {/* Audio Toggle */}
        <button
          id="action-audio"
          onClick={() => {
            setIsAudioEnabled(!isAudioEnabled);
            showToast(isAudioEnabled ? 'Audio muted' : 'Audio enabled');
          }}
          className="flex flex-col items-center p-1 text-white hover:text-[#FF3F91] transition-colors cursor-pointer"
        >
          <Volume2 className={`w-5 h-5 ${isAudioEnabled ? 'text-white' : 'text-zinc-600'}`} />
          <span className="text-[9px] text-[#96969D] mt-0.5">Audio</span>
        </button>

        {/* Undo */}
        <button
          id="action-undo"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className={`flex flex-col items-center p-1 transition-colors cursor-pointer ${
            undoStack.length > 0 ? 'text-white hover:text-[#FF3F91]' : 'text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-5 h-5" />
          <span className="text-[9px] text-[#96969D] mt-0.5">Undo</span>
        </button>

        {/* Redo */}
        <button
          id="action-redo"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className={`flex flex-col items-center p-1 transition-colors cursor-pointer ${
            redoStack.length > 0 ? 'text-white hover:text-[#FF3F91]' : 'text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-5 h-5" />
          <span className="text-[9px] text-[#96969D] mt-0.5">Redo</span>
        </button>

        {/* Copy */}
        <button
          id="action-copy"
          onClick={handleCopy}
          className="flex flex-col items-center p-1 text-white hover:text-[#FF3F91] transition-colors cursor-pointer"
        >
          <Copy className="w-5 h-5" />
          <span className="text-[9px] text-[#96969D] mt-0.5">Copy</span>
        </button>

        {/* Paste */}
        <button
          id="action-paste"
          onClick={handlePaste}
          className="flex flex-col items-center p-1 text-white hover:text-[#FF3F91] transition-colors cursor-pointer"
        >
          <Clipboard className="w-5 h-5" />
          <span className="text-[9px] text-[#96969D] mt-0.5">Paste</span>
        </button>

        {/* Layers */}
        <button
          id="action-layers"
          onClick={onLayers}
          className="flex flex-col items-center p-1 text-white hover:text-[#FF3F91] transition-colors cursor-pointer"
        >
          <Layers className="w-5 h-5 text-white" />
          <span className="text-[9px] text-[#96969D] mt-0.5">Layers</span>
        </button>
      </div>

      {/* Playback & Frame Navigation Bar (Bottom) */}
      <div className="flex items-center justify-between bg-[#111114] px-3 py-1.5 border-t border-[#252529] flex-shrink-0 z-20">
        {/* Frame Label */}
        <div className="text-xs text-white font-medium min-w-[75px]">
          Frame{' '}
          <span className="text-[#FF3F91] font-bold">
            {currentFrame + 1} / {frames.length}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          {/* Previous Frame */}
          <button
            id="editor-btn-prev-frame"
            onClick={() => {
              if (currentFrame > 0) onFrameChange(currentFrame - 1);
            }}
            disabled={currentFrame <= 0}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              currentFrame > 0 ? 'text-white hover:bg-[#252529]' : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Previous Frame"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            id="editor-btn-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#FF3F91] hover:bg-[#ff2b85] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#FF3F91]/25 transition-all cursor-pointer"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Frame */}
          <button
            id="editor-btn-next-frame"
            onClick={() => {
              if (currentFrame < frames.length - 1) onFrameChange(currentFrame + 1);
            }}
            disabled={currentFrame >= frames.length - 1}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              currentFrame < frames.length - 1
                ? 'text-white hover:bg-[#252529]'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Next Frame"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline & Add Frame */}
        <div className="flex items-center gap-1">
          <button
            id="editor-btn-timeline"
            onClick={onTimeline}
            className="p-1.5 text-white hover:bg-[#252529] rounded-lg transition-colors cursor-pointer"
            title="Timeline Filmstrip"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            id="editor-btn-add-frame"
            onClick={handleAddFrame}
            className="p-1.5 text-[#FF3F91] hover:bg-[#FF3F91]/15 rounded-lg transition-colors cursor-pointer"
            title="Add New Frame"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#252529] border border-[#FF3F91] text-white px-3.5 py-1.5 rounded-full text-xs shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {toast}
        </div>
      )}
    </div>
  );
};
