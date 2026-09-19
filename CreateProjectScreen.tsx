import React from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface CreateProjectScreenProps {
  name: string;
  onNameChange: (name: string) => void;
  fps: number;
  w: number;
  h: number;
  bg: string;
  onBgChange: (bg: string) => void;
  onSizeClick: () => void;
  onFpsClick: () => void;
  onCreate: () => void;
  onBack: () => void;
}

export const CreateProjectScreen: React.FC<CreateProjectScreenProps> = ({
  name,
  onNameChange,
  fps,
  w,
  h,
  bg,
  onBgChange,
  onSizeClick,
  onFpsClick,
  onCreate,
  onBack
}) => {
  const backgrounds = [
    { color: '#FFFFFF', label: 'White' },
    { color: '#000000', label: 'Black' },
    { color: '#808080', label: 'Gray' }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white p-5 overflow-y-auto select-none">
      {/* Close button */}
      <div>
        <button
          id="create-close-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-[25px] font-bold mt-1 text-white tracking-tight">Create Project</h1>

      {/* Project name input */}
      <div className="mt-5">
        <label className="text-xs text-[#96969D] font-medium block mb-1.5">Project name</label>
        <div className="relative">
          <input
            id="create-project-name-input"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="My Animation"
            className="w-full bg-[#18181B] border border-[#252529] focus:border-[#FF3F91] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors"
          />
        </div>
      </div>

      {/* Background selection */}
      <div className="mt-5">
        <label className="text-xs text-[#96969D] font-medium block mb-2.5">Background</label>
        <div className="flex items-center gap-3">
          {backgrounds.map((item) => {
            const isSelected = bg.toLowerCase() === item.color.toLowerCase();
            return (
              <button
                key={item.color}
                id={`bg-swatch-${item.label.toLowerCase()}`}
                onClick={() => onBgChange(item.color)}
                className={`w-[55px] h-[55px] rounded-[8px] border transition-all flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#FF3F91] ring-2 ring-[#FF3F91]/30'
                    : 'border-zinc-700 hover:border-zinc-500'
                }`}
                style={{ backgroundColor: item.color }}
                aria-label={`Background ${item.label}`}
              >
                {isSelected && (
                  <Check
                    className={`w-5 h-5 ${
                      item.color === '#FFFFFF' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Setting Rows: Canvas Size & FPS */}
      <div className="mt-5 divide-y divide-[#252529]">
        <button
          id="setting-canvas-size"
          onClick={onSizeClick}
          className="w-full py-4 flex items-center justify-between text-left hover:bg-[#18181B]/40 px-1 rounded-lg transition-colors cursor-pointer"
        >
          <div>
            <div className="text-sm font-medium text-white">Canvas Size</div>
            <div className="text-[13px] text-[#96969D] mt-0.5 font-mono">
              {w} × {h}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#96969D]" />
        </button>

        <button
          id="setting-fps"
          onClick={onFpsClick}
          className="w-full py-4 flex items-center justify-between text-left hover:bg-[#18181B]/40 px-1 rounded-lg transition-colors cursor-pointer"
        >
          <div>
            <div className="text-sm font-medium text-white">FPS</div>
            <div className="text-[13px] text-[#96969D] mt-0.5 font-mono">{fps}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#96969D]" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[40px]" />

      {/* Create Project Button */}
      <button
        id="btn-confirm-create-project"
        onClick={onCreate}
        className="w-full h-[54px] rounded-xl bg-[#FF3F91] hover:bg-[#ff2b85] active:scale-[0.99] font-medium text-white text-base shadow-lg shadow-[#FF3F91]/25 flex items-center justify-center transition-all cursor-pointer"
      >
        Create Project
      </button>
    </div>
  );
};
