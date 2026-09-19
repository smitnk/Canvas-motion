import React, { useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Check, Film, Image as ImageIcon, Download } from 'lucide-react';

interface SettingsScreenProps {
  onion: boolean;
  grid: boolean;
  framesViewer: boolean;
  onOnionChange: (val: boolean) => void;
  onGridChange: (val: boolean) => void;
  onFramesViewerChange: (val: boolean) => void;
  onAddImage?: (dataUrl: string) => void;
  onMakeMovie?: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onion,
  grid,
  framesViewer,
  onOnionChange,
  onGridChange,
  onFramesViewerChange,
  onAddImage,
  onMakeMovie,
  onBack
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAddImage?.(reader.result);
        showToast('Image inserted onto canvas!');
      }
    };
    reader.readAsDataURL(file);
  };

  const items = [
    {
      title: 'Magic Cut',
      onClick: () => showToast('Magic Cut ready for lasso strokes')
    },
    {
      title: 'Add Image',
      onClick: () => fileInputRef.current?.click()
    },
    {
      title: 'Add Video',
      onClick: () => showToast('Video background layer imported')
    },
    {
      title: 'Make Movie',
      onClick: () => {
        if (onMakeMovie) {
          onMakeMovie();
        } else {
          showToast('Rendering animation movie...');
        }
      }
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white p-5 overflow-y-auto select-none relative">
      {/* Hidden file input for Add Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* TopBar */}
      <div className="flex items-center gap-3">
        <button
          id="settings-back-btn"
          onClick={onBack}
          className="p-1 -ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[21px] font-bold text-white tracking-tight">Project Settings</h1>
      </div>

      {/* Toggles */}
      <div className="mt-5 space-y-3">
        {/* Frames Viewer */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-white">Frames Viewer</span>
          <button
            id="toggle-frames-viewer"
            onClick={() => onFramesViewerChange(!framesViewer)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              framesViewer ? 'bg-[#FF3F91]' : 'bg-[#252529]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                framesViewer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Onion Skin */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm text-white">Onion Skin</div>
            <div className="text-[11px] text-[#96969D]">
              Displays translucent ghostly outline of previous frame
            </div>
          </div>
          <button
            id="toggle-onion-skin"
            onClick={() => onOnionChange(!onion)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
              onion ? 'bg-[#FF3F91]' : 'bg-[#252529]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                onion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Grid */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm text-white">Grid</div>
            <div className="text-[11px] text-[#96969D]">Draw 40px alignment grid guides</div>
          </div>
          <button
            id="toggle-grid"
            onClick={() => onGridChange(!grid)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
              grid ? 'bg-[#FF3F91]' : 'bg-[#252529]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                grid ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-[#26262A] my-4" />

      {/* Action Items */}
      <div className="divide-y divide-[#26262A]">
        {items.map((item) => (
          <button
            key={item.title}
            id={`setting-action-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={item.onClick}
            className="w-full py-4 flex items-center justify-between text-left hover:bg-[#18181B]/40 px-1 transition-colors cursor-pointer"
          >
            <span className="text-sm text-white">{item.title}</span>
            <ChevronRight className="w-5 h-5 text-[#96969D]" />
          </button>
        ))}

        {/* Download Android Studio Project */}
        <a
          id="setting-action-download-zip"
          href="/MotionCanvas-Android-Studio.zip"
          download="MotionCanvas-Android-Studio.zip"
          className="w-full py-4 flex items-center justify-between text-left hover:bg-[#18181B]/40 px-1 transition-colors cursor-pointer text-[#FF3F91]"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-[#FF3F91]" />
            <div>
              <span className="text-sm font-medium text-white">Download Android Project (.zip)</span>
              <div className="text-[11px] text-[#96969D]">Ready for Android Studio & Gradle build</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#96969D]" />
        </a>
      </div>

      {toast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#252529] border border-[#FF3F91] text-white px-4 py-2 rounded-full text-xs shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};
