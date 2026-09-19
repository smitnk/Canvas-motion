import React from 'react';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Layer } from '../types';

interface LayersScreenProps {
  layers: Layer[];
  activeLayerIndex: number;
  onSelectLayer: (index: number) => void;
  onChange: (layers: Layer[]) => void;
  onBack: () => void;
}

export const LayersScreen: React.FC<LayersScreenProps> = ({
  layers,
  activeLayerIndex,
  onSelectLayer,
  onChange,
  onBack
}) => {
  const toggleVisibility = (index: number) => {
    const updated = layers.map((l, i) => (i === index ? { ...l, visible: !l.visible } : l));
    onChange(updated);
  };

  const changeOpacity = (index: number, opacity: number) => {
    const updated = layers.map((l, i) => (i === index ? { ...l, opacity } : l));
    onChange(updated);
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1
    };
    onChange([...layers, newLayer]);
  };

  const deleteLayer = (index: number) => {
    if (layers.length <= 1) return;
    const updated = layers.filter((_, i) => i !== index);
    onChange(updated);
    if (activeLayerIndex >= updated.length) {
      onSelectLayer(Math.max(0, updated.length - 1));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white select-none relative">
      {/* TopBar */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <button
          id="layers-back-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[21px] font-bold text-white tracking-tight">Layers</h1>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#26262A]">
        {layers.map((l, i) => {
          const isActive = i === activeLayerIndex;

          return (
            <div
              key={l.id || i}
              id={`layer-item-${i}`}
              onClick={() => onSelectLayer(i)}
              className={`p-3 transition-colors cursor-pointer ${
                isActive ? 'bg-[#18181B]/70' : 'hover:bg-[#18181B]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visibility Toggle */}
                <button
                  id={`layer-visibility-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(i);
                  }}
                  className="p-1 text-white/80 hover:text-white transition-colors"
                  title={l.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {l.visible ? (
                    <Eye className="w-5 h-5 text-white" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-[#96969D]" />
                  )}
                </button>

                {/* Layer Thumbnail Placeholder / Preview Box */}
                <div className="w-[52px] h-[52px] bg-[#252529] rounded-[5px] flex items-center justify-center flex-shrink-0 border border-zinc-700">
                  <span className="text-xs font-mono text-[#96969D]">#{i + 1}</span>
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm truncate ${
                      isActive ? 'text-[#FF3F91] font-bold' : 'text-white font-normal'
                    }`}
                  >
                    {l.name}
                  </div>
                  <div className="text-[11px] text-[#96969D] font-mono mt-0.5">
                    {Math.round(l.opacity * 100)}% Opacity
                  </div>
                </div>

                {/* Delete button (if > 1 layer) */}
                {layers.length > 1 && (
                  <button
                    id={`layer-delete-${i}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(i);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Opacity Slider */}
              <div className="mt-2 pl-[76px] pr-4 flex items-center gap-2">
                <span className="text-[10px] text-[#96969D]">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={l.opacity}
                  onChange={(e) => {
                    e.stopPropagation();
                    changeOpacity(i, parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#FF3F91] h-1.5 bg-[#252529] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB: Add Layer */}
      <button
        id="btn-add-layer"
        onClick={addLayer}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF3F91] hover:bg-[#ff2b85] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#FF3F91]/30 transition-all z-20 cursor-pointer"
        aria-label="Add Layer"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
