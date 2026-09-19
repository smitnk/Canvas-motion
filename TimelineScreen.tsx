import React from 'react';
import { ArrowLeft, Trash2, Plus, Copy } from 'lucide-react';
import { Frame } from '../types';
import { FrameThumbnail } from './FrameThumbnail';

interface TimelineScreenProps {
  frames: Frame[];
  currentFrame: number;
  canvasW: number;
  canvasH: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame?: () => void;
  onDeleteFrame: () => void;
  onBack: () => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  frames,
  currentFrame,
  canvasW,
  canvasH,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onBack
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white select-none">
      {/* TopBar */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <button
          id="timeline-back-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[21px] font-bold text-white tracking-tight">Timeline</h1>
      </div>

      {/* Frame stats and actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#26262A]">
        <div className="text-sm font-medium text-white">
          Frame{' '}
          <span className="text-[#FF3F91] font-bold">
            {currentFrame + 1}/{frames.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDuplicateFrame && (
            <button
              id="timeline-duplicate-btn"
              onClick={onDuplicateFrame}
              title="Duplicate Frame"
              className="p-2 text-white/80 hover:text-white hover:bg-[#18181B] rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-5 h-5" />
            </button>
          )}
          <button
            id="timeline-delete-btn"
            onClick={onDeleteFrame}
            disabled={frames.length <= 1}
            title="Delete Frame"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              frames.length > 1
                ? 'text-white/80 hover:text-red-400 hover:bg-[#18181B]'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            id="timeline-add-btn"
            onClick={onAddFrame}
            title="Add Frame"
            className="p-2 text-[#FF3F91] hover:bg-[#FF3F91]/10 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filmstrip row */}
      <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
        <div className="flex items-center gap-3 min-w-max pb-2">
          {frames.map((frame, i) => {
            const isSelected = i === currentFrame;
            return (
              <div
                key={frame.id || i}
                id={`timeline-frame-${i}`}
                onClick={() => onSelectFrame(i)}
                className="flex flex-col items-center w-[70px] cursor-pointer group"
              >
                <div
                  className={`w-[62px] h-[62px] bg-[#252529] rounded-[5px] overflow-hidden flex items-center justify-center relative transition-all ${
                    isSelected
                      ? 'border-2 border-[#FF3F91] shadow-md shadow-[#FF3F91]/20 scale-105'
                      : 'border border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <FrameThumbnail
                    frame={frame}
                    width={62}
                    height={62}
                    canvasW={canvasW}
                    canvasH={canvasH}
                    backgroundColor="#1b1b1f"
                    className="w-full h-full object-contain"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3F91]" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-mono ${
                    isSelected ? 'text-[#FF3F91] font-bold' : 'text-[#96969D]'
                  }`}
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 text-xs text-[#96969D]">
        Tap any frame in the filmstrip to navigate and draw on it directly. Use the + button to add an empty frame or clone your drawing to create smooth flipbook animations.
      </div>
    </div>
  );
};
