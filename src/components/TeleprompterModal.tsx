import React, { useState, useEffect, useRef } from 'react';
import { ScriptData } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FlipHorizontal, 
  Type, 
  Sliders, 
  X, 
  Maximize, 
  Minimize,
  Eye
} from 'lucide-react';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
}

export default function TeleprompterModal({ isOpen, onClose, scriptData }: TeleprompterModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1 to 10
  const [fontSize, setFontSize] = useState(36); // px
  const [isMirrored, setIsMirrored] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Extract speech/audio text from script
  const getTeleprompterText = () => {
    if (scriptData.shots && scriptData.shots.length > 0) {
      return scriptData.shots.map((shot, idx) => (
        <div key={shot.id} className="mb-12 border-b border-zinc-800/80 pb-8">
          <div className="text-sm font-mono text-amber-400 mb-2 font-bold flex items-center gap-2">
            <span>CẢNH #{shot.shotNumber}</span>
            {shot.timeRange && <span>• {shot.timeRange}</span>}
          </div>
          {shot.visual && (
            <div className="text-lg text-zinc-400 italic mb-4 font-sans">
              [Visual: {shot.visual}]
            </div>
          )}
          <div className="font-semibold text-white leading-relaxed tracking-wide">
            {shot.audio || "..."}
          </div>
          {shot.onScreenText && (
            <div className="mt-3 inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-sm font-mono">
              TEXT: {shot.onScreenText}
            </div>
          )}
        </div>
      ));
    }

    if (scriptData.screenplayElements && scriptData.screenplayElements.length > 0) {
      return scriptData.screenplayElements.map((el) => (
        <div key={el.id} className="mb-6">
          {el.type === 'SCENE_HEADING' && (
            <div className="text-amber-400 font-bold uppercase tracking-wider text-xl mb-3">
              {el.text}
            </div>
          )}
          {el.type === 'CHARACTER' && (
            <div className="text-blue-400 font-bold uppercase tracking-widest text-lg mt-4">
              {el.text}
            </div>
          )}
          {el.type === 'DIALOGUE' && (
            <div className="text-white font-medium leading-relaxed pl-6 text-2xl">
              {el.text}
            </div>
          )}
          {el.type === 'ACTION' && (
            <div className="text-zinc-400 italic leading-relaxed text-lg">
              {el.text}
            </div>
          )}
        </div>
      ));
    }

    return <div className="text-white">Không có nội dung lời thoại để đọc.</div>;
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'Escape') {
        onClose();
      } else if (e.code === 'ArrowUp') {
        setScrollSpeed(prev => Math.min(10, prev + 1));
      } else if (e.code === 'ArrowDown') {
        setScrollSpeed(prev => Math.max(1, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);

  // Smooth scroll loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollContainerRef.current) {
        // speed scale: 1 -> 30px/sec, 10 -> 300px/sec
        const pixelsPerSec = scrollSpeed * 35;
        scrollContainerRef.current.scrollTop += (pixelsPerSec * delta) / 1000;
      }

      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animationFrameRef.current = requestAnimationFrame(scrollStep);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, scrollSpeed]);

  const togglePlay = () => {
    if (!isPlaying) {
      // Countdown 3-2-1
      setCountdown(3);
      const timer1 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      const timer3 = setTimeout(() => {
        setCountdown(null);
        setIsPlaying(true);
      }, 3000);
    } else {
      setIsPlaying(false);
      setCountdown(null);
    }
  };

  const resetScroll = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white select-none">
      {/* Top Floating Control Bar */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-zinc-950 rounded-xl font-bold">
            <Eye size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              Teleprompter (Máy Nhắc Chữ)
            </h2>
            <p className="text-[11px] text-zinc-400">{scriptData.title}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950'
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Tạm Dừng (Space)' : 'Bắt Đầu Cuộn (Space)'}
          </button>

          <button
            onClick={resetScroll}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
            title="Cuộn lại từ đầu"
          >
            <RotateCcw size={16} />
          </button>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-zinc-400">Tốc độ:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
            <span className="font-mono font-bold text-amber-400">{scrollSpeed}x</span>
          </div>

          {/* Font Size Slider */}
          <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-xl text-xs">
            <Type size={14} className="text-zinc-400" />
            <input
              type="range"
              min="20"
              max="64"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
            <span className="font-mono text-zinc-300">{fontSize}px</span>
          </div>

          {/* Mirror Mode Toggle (For physical teleprompter glass) */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isMirrored
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
            title="Lật gương chữ"
          >
            <FlipHorizontal size={14} />
            {isMirrored ? 'Đang Lật Gương' : 'Lật Gương'}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Reading Zone with Eye-line guide */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {/* Horizontal Eye-Level Guideline */}
        <div className="pointer-events-none absolute left-0 right-0 top-1/3 h-20 border-y border-amber-500/20 bg-amber-500/5 z-20 flex items-center justify-between px-6">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/60 font-bold">
            ▶ Khung Nhìn Mắt (Eye Level)
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/60 font-bold">
            ◀
          </span>
        </div>

        {/* Scrolling Text Container */}
        <div
          ref={scrollContainerRef}
          className={`h-full overflow-y-auto px-12 md:px-32 py-40 max-w-5xl mx-auto scroll-smooth transition-transform ${
            isMirrored ? 'scale-x-[-1]' : ''
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {getTeleprompterText()}
        </div>

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-in fade-in">
            <span className="text-9xl font-black text-amber-400 animate-pulse">
              {countdown}
            </span>
            <p className="text-lg text-zinc-300 mt-4 font-semibold">Chuẩn bị ghi hình...</p>
          </div>
        )}
      </div>
    </div>
  );
}
