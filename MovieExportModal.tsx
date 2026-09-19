import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Download, Film, Check } from 'lucide-react';
import { Frame } from '../types';
import { renderFrameToCanvas } from '../utils/canvasRenderer';

interface MovieExportModalProps {
  projectName: string;
  frames: Frame[];
  fps: number;
  canvasW: number;
  canvasH: number;
  onSaveToMovies: (name: string) => void;
  onClose: () => void;
}

export const MovieExportModal: React.FC<MovieExportModalProps> = ({
  projectName,
  frames,
  fps,
  canvasW,
  canvasH,
  onSaveToMovies,
  onClose
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % frames.length);
    }, 1000 / (fps || 12));
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / canvasW, canvas.height / canvasH);
    const frame = frames[currentIdx] || { id: 'empty', strokes: [] };
    renderFrameToCanvas(ctx, frame, canvas.width, canvas.height, scale, 1, '#101013');
  }, [currentIdx, frames, canvasW, canvasH]);

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_frame_${currentIdx + 1}.png`;
    a.click();
  };

  const handleSaveMovie = () => {
    onSaveToMovies(projectName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#18181B] border border-[#252529] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#252529]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#FF3F91]" />
            <h3 className="text-sm font-bold text-white">Make Movie</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#96969D] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Preview */}
        <div className="w-full aspect-video bg-black flex items-center justify-center relative overflow-hidden">
          <canvas ref={canvasRef} width={480} height={270} className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[11px] text-white font-mono">
            {currentIdx + 1} / {frames.length}
          </div>
        </div>

        {/* Controls & Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#96969D]">
            <span>{projectName}</span>
            <span className="font-mono">{fps} FPS • {frames.length} frames</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-[#FF3F91] text-white hover:bg-[#ff2b85] transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleDownloadSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252529] text-white text-xs hover:bg-[#303035] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Frame
            </button>
            <button
              onClick={handleSaveMovie}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3F91]/20 border border-[#FF3F91]/50 text-[#FF3F91] text-xs hover:bg-[#FF3F91]/30 transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
              {saved ? 'Saved!' : 'Save Movie'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
