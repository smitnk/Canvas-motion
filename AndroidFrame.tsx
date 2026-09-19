import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Monitor, Download, FolderArchive, X, Check } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState('12:00');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'responsive'>('mobile');
  const [showZipModal, setShowZipModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070709] text-white selection:bg-[#FF3F91] selection:text-white p-0 sm:p-4 overflow-x-hidden">
      {/* Top Device Switcher / Toolbar */}
      <div className="w-full max-w-md md:max-w-2xl flex items-center justify-between px-3 py-2 text-xs text-[#96969D] mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3F91] animate-pulse" />
          <span className="font-semibold text-white tracking-wider">MotionCanvas</span>
          <span className="bg-[#252529] px-2 py-0.5 rounded text-[10px] text-[#FF3F91] font-mono">
            Android Compose v1.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download ZIP Button */}
          <a
            id="download-android-zip-btn"
            href="/MotionCanvas-Android-Studio.zip"
            download="MotionCanvas-Android-Studio.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3F91] hover:bg-[#ff2b85] active:scale-95 text-white font-medium text-xs shadow-md shadow-[#FF3F91]/20 transition-all cursor-pointer"
            title="Download full Android Studio project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project .ZIP</span>
          </a>

          <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-lg border border-[#252529]">
            <button
              id="view-mobile-btn"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-[#252529] text-white font-medium shadow-sm'
                  : 'text-[#96969D] hover:text-white'
              }`}
              title="Android Phone Mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Phone</span>
            </button>
            <button
              id="view-responsive-btn"
              onClick={() => setDeviceMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                deviceMode === 'responsive'
                  ? 'bg-[#252529] text-white font-medium shadow-sm'
                  : 'text-[#96969D] hover:text-white'
              }`}
              title="Expand Full View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Expanded</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Expanded */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceMode === 'mobile'
            ? 'max-w-[420px] h-[870px] max-h-[96vh] rounded-[42px] border-[6px] border-[#222227] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] bg-[#0D0D0F] relative flex flex-col overflow-hidden ring-1 ring-black'
            : 'max-w-4xl h-[92vh] rounded-2xl border border-[#252529] bg-[#0D0D0F] relative flex flex-col overflow-hidden shadow-2xl'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full flex-shrink-0 flex items-center justify-between px-6 pt-2.5 pb-1 bg-[#0D0D0F] z-50 select-none text-[11px] font-medium text-white/90">
          <div className="w-16 pl-1 font-semibold tracking-tight">{currentTime}</div>

          {/* Punch hole camera for phone mode */}
          {deviceMode === 'mobile' ? (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#181824]" />
            </div>
          ) : (
            <div className="text-[10px] text-[#96969D] tracking-wider uppercase font-mono">
              MotionCanvas Studio
            </div>
          )}

          <div className="w-16 flex items-center justify-end gap-1.5 pr-1 text-white/80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Inner App Content Screen */}
        <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col bg-[#0D0D0F]">
          {children}
        </div>

        {/* Android Bottom Navigation Pill */}
        {deviceMode === 'mobile' && (
          <div className="w-full flex-shrink-0 h-4 bg-[#0D0D0F] flex items-center justify-center pb-1 select-none">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
