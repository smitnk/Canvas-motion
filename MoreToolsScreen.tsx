import React, { useState } from 'react';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Sliders,
  Ruler,
  Grid,
  Check
} from 'lucide-react';

interface MoreToolsScreenProps {
  onBack: () => void;
  activeSpecialTool?: string;
  onSelectSpecialTool?: (tool: string) => void;
}

export const MoreToolsScreen: React.FC<MoreToolsScreenProps> = ({
  onBack,
  activeSpecialTool,
  onSelectSpecialTool
}) => {
  const [selected, setSelected] = useState(activeSpecialTool || 'Rulers');

  const tools = [
    { name: 'Smudge', icon: Flame, desc: 'Blend adjacent strokes together smoothly' },
    { name: 'Blur', icon: Droplets, desc: 'Soft focus filter on strokes' },
    { name: 'Perspective', icon: Sliders, desc: 'Transform and perspective distort guidelines' },
    { name: 'Rulers', icon: Ruler, desc: 'Precision straight-edge guide for lines' },
    { name: 'Snapping', icon: Grid, desc: 'Snap points to nearest grid intersections' }
  ];

  const handleSelect = (toolName: string) => {
    setSelected(toolName);
    onSelectSpecialTool?.(toolName);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white p-5 overflow-y-auto select-none">
      {/* TopBar */}
      <div className="flex items-center gap-3">
        <button
          id="more-back-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[21px] font-bold text-white tracking-tight">More Tools</h1>
      </div>

      <div className="mt-5 divide-y divide-[#252529]/60">
        {tools.map((t) => {
          const IconComp = t.icon;
          const isSelected = selected === t.name;

          return (
            <button
              key={t.name}
              id={`more-tool-${t.name.toLowerCase()}`}
              onClick={() => handleSelect(t.name)}
              className="w-full py-4 flex items-center gap-4 text-left hover:bg-[#18181B]/60 px-1 rounded-lg transition-colors cursor-pointer"
            >
              <div
                className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#FF3F91]/20 text-[#FF3F91]' : 'bg-[#18181B] text-white'
                }`}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div
                  className={`text-[17px] font-medium leading-tight ${
                    isSelected ? 'text-[#FF3F91]' : 'text-white'
                  }`}
                >
                  {t.name}
                </div>
                <div className="text-xs text-[#96969D] mt-0.5">{t.desc}</div>
              </div>
              {isSelected && <Check className="w-5 h-5 text-[#FF3F91] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
