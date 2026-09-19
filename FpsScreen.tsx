import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface FpsScreenProps {
  currentFps: number;
  onSelect: (fps: number) => void;
  onBack: () => void;
}

export const FpsScreen: React.FC<FpsScreenProps> = ({ currentFps, onSelect, onBack }) => {
  const fpsOptions = [6, 8, 12, 15, 24, 30, 60];

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white p-5 overflow-y-auto select-none">
      {/* TopBar */}
      <div className="flex items-center gap-3">
        <button
          id="fps-back-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[21px] font-bold text-white tracking-tight">Frame Rate</h1>
      </div>

      <div className="mt-7">
        <h2 className="text-[27px] font-bold text-white tracking-tight leading-tight">
          Frame Rate
        </h2>
        <p className="text-xs text-[#96969D] mt-2.5 leading-relaxed">
          Currently you would need to draw{' '}
          <span className="text-[#FF3F91] font-semibold">{currentFps}</span> frames to make 1
          second.
        </p>
      </div>

      <div className="mt-5 divide-y divide-[#252529]/60">
        {fpsOptions.map((v) => {
          const isSelected = v === currentFps;
          return (
            <button
              key={v}
              id={`fps-option-${v}`}
              onClick={() => onSelect(v)}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#18181B]/60 px-1 rounded-lg transition-colors cursor-pointer"
            >
              <span
                className={`text-[17px] ${
                  isSelected ? 'text-[#FF3F91] font-bold' : 'text-white font-normal'
                }`}
              >
                {v} FPS
              </span>
              {isSelected && <Check className="w-5 h-5 text-[#FF3F91]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
