import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  FileText, 
  Check, 
  Copy, 
  Sparkles, 
  Layers, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  ExternalLink,
  Sliders,
  RefreshCw,
  FolderArchive,
  Music
} from 'lucide-react';
import { TwoColumnShot, VoiceProfile, VoiceStudioSettings } from '../types';
import { 
  generateFullAudioAndSubtitles, 
  ExportFullAudioResult, 
  downloadZipBundle, 
  downloadBlob, 
  downloadTextFile 
} from '../services/audioExportService';
import { getSavedVoiceProfiles, getVoiceStudioSettings, saveVoiceStudioSettings, cleanTextForSpeech } from '../services/voiceService';

interface AudioSrtExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shots: TwoColumnShot[];
  projectTitle?: string;
}

export default function AudioSrtExportModal({
  isOpen,
  onClose,
  shots,
  projectTitle = 'Kich_Ban_Video'
}: AudioSrtExportModalProps) {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [settings, setSettings] = useState<VoiceStudioSettings>(getVoiceStudioSettings());
  const [projectName, setProjectName] = useState(projectTitle);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{ current: number; total: number; message: string; percent: number }>({
    current: 0,
    total: shots.length,
    message: '',
    percent: 0
  });

  const [exportResult, setExportResult] = useState<ExportFullAudioResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Player State
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [copiedSrt, setCopiedSrt] = useState(false);
  const [copiedVtt, setCopiedVtt] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedProfs = getSavedVoiceProfiles();
      setProfiles(savedProfs);
      const savedStg = getVoiceStudioSettings();
      setSettings(savedStg);
      setProjectName(projectTitle || 'Kich_Ban_Video');
      setErrorMessage(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingFullAudio(false);
      setAudioCurrentTime(0);
    }
  }, [isOpen, projectTitle]);

  const activeProfile = profiles.find(p => p.id === settings.selectedVoiceId) || profiles[0];

  const handleSelectVoice = (id: string) => {
    const updated = { ...settings, selectedVoiceId: id };
    setSettings(updated);
    saveVoiceStudioSettings(updated);
  };

  const handleStartExport = async () => {
    if (!activeProfile) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setExportResult(null);

    try {
      const result = await generateFullAudioAndSubtitles(
        shots,
        activeProfile,
        settings,
        projectName,
        (current, total, message, percent) => {
          setProgressState({ current, total, message, percent });
        }
      );
      setExportResult(result);
      setAudioDuration(result.totalDurationSec);
    } catch (err: any) {
      console.error("Export Error:", err);
      setErrorMessage(err.message || 'Đã có lỗi xảy ra trong quá trình tổng hợp âm thanh.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Audio Player Play/Pause
  const handleTogglePlayAudio = () => {
    if (!exportResult) return;

    if (!audioRef.current) {
      const audio = new Audio(exportResult.audioUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlayingFullAudio(false);
        setAudioCurrentTime(0);
      };

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || exportResult.totalDurationSec);
      };
    }

    if (isPlayingFullAudio) {
      audioRef.current.pause();
      setIsPlayingFullAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingFullAudio(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleCopySrt = () => {
    if (!exportResult) return;
    navigator.clipboard.writeText(exportResult.srtContent);
    setCopiedSrt(true);
    setTimeout(() => setCopiedSrt(false), 2000);
  };

  const handleCopyVtt = () => {
    if (!exportResult) return;
    navigator.clipboard.writeText(exportResult.vttContent);
    setCopiedVtt(true);
    setTimeout(() => setCopiedVtt(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Determine currently active subtitle item based on audioCurrentTime
  const activeSubtitleItem = exportResult?.items.find(
    it => audioCurrentTime >= it.startSec && audioCurrentTime <= it.endSec
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
              <Download size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Xuất Trọn Bộ Audio MP3/WAV & Phụ Đề SRT Đồng Bộ
              </h2>
              <p className="text-xs text-rose-100">
                Tạo 1 file âm thanh lồng tiếng gộp duy nhất kèm file phụ đề .SRT chuẩn xác từng giây cho CapCut / Premiere
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1: Settings & Voice Configuration */}
          <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Tên Gói Dự Án (File Name Prefix):
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ví dụ: Video_TikTok_Lich_Su_VN"
                  className="px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 w-64 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Khoảng Dừng Giữa Các Phân Cảnh (ms):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={settings.pauseBetweenShotsMs}
                    onChange={(e) => {
                      const updated = { ...settings, pauseBetweenShotsMs: parseInt(e.target.value) };
                      setSettings(updated);
                      saveVoiceStudioSettings(updated);
                    }}
                    className="w-32 accent-rose-600"
                  />
                  <span className="text-xs font-mono font-bold text-rose-600 w-14">
                    {settings.pauseBetweenShotsMs}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Select Voice Profile Strip */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
                <Volume2 size={14} className="text-rose-600" />
                Chọn Giọng Đọc Lồng Tiếng Toàn Bộ Kịch Bản:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {profiles.map((p) => {
                  const isSelected = p.id === settings.selectedVoiceId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectVoice(p.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-2xs'
                          : 'bg-white hover:bg-zinc-100/80 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-rose-950' : 'text-zinc-800'}`}>
                          {p.name}
                        </span>
                        {isSelected && <Check size={14} className="text-rose-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-zinc-500 truncate">
                        {p.gender === 'male' ? 'Nam' : 'Nữ'} • {p.tags?.[0] || p.accent}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Action Button */}
            {!exportResult && !isGenerating && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleStartExport}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles size={18} />
                  <span>Tổng Hợp Full Audio & Tạo Phụ Đề SRT Ngay ({shots.length} phân cảnh)</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress Indicator */}
          {isGenerating && (
            <div className="p-6 bg-white border border-rose-100 rounded-3xl shadow-sm text-center space-y-4 animate-in fade-in">
              <div className="flex items-center justify-center gap-3 text-rose-600">
                <RefreshCw size={24} className="animate-spin" />
                <span className="font-bold text-base text-zinc-900">
                  Đang xử lý âm thanh & đo nhịp phụ đề... ({progressState.percent}%)
                </span>
              </div>

              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <p className="text-xs font-mono text-zinc-500">
                {progressState.message}
              </p>
            </div>
          )}

          {/* Result Section: Player & Download Package */}
          {exportResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* 1. Master Audio Player with Real-Time Subtitles */}
              <div className="p-5 bg-zinc-900 text-white rounded-3xl shadow-xl space-y-4 border border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Music size={18} className="text-rose-400" />
                    <span className="font-bold text-sm text-white">
                      Trình Phát Kiểm Âm Toàn Bộ (Master Preview Audio Track)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>Tổng thời lượng: <strong className="text-rose-400">{formatSeconds(exportResult.totalDurationSec)}</strong></span>
                    <span>• {exportResult.totalShots} Phân Cảnh</span>
                  </div>
                </div>

                {/* Subtitle Live Teleprompter / Overlay Box */}
                <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl text-center min-h-[70px] flex flex-col items-center justify-center transition-all">
                  {activeSubtitleItem ? (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold rounded-full border border-rose-500/30">
                        Shot #{activeSubtitleItem.shotNumber} ({formatSeconds(activeSubtitleItem.startSec)} - {formatSeconds(activeSubtitleItem.endSec)})
                      </span>
                      <p className="text-sm font-semibold text-amber-200 leading-snug">
                        "{activeSubtitleItem.cleanedText}"
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      {isPlayingFullAudio ? '(Khoảng dừng giữa các phân cảnh...)' : 'Bấm Phát để nghe toàn bộ kịch bản và xem phụ đề chạy tự động'}
                    </span>
                  )}
                </div>

                {/* Audio Seek & Playbar */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlayAudio}
                      className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
                    >
                      {isPlayingFullAudio ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-white" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <input
                        type="range"
                        min="0"
                        max={audioDuration || exportResult.totalDurationSec}
                        step="0.05"
                        value={audioCurrentTime}
                        onChange={handleSeek}
                        className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-700 rounded-lg"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>{formatSeconds(audioCurrentTime)}</span>
                        <span>{formatSeconds(audioDuration || exportResult.totalDurationSec)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Download Options Card Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Download size={16} className="text-rose-600" />
                  Tải Xuống Gói Dữ Liệu Sản Xuất Video:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Option 1: Full ZIP Package */}
                  <button
                    onClick={() => downloadZipBundle(exportResult)}
                    className="p-4 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl text-left shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FolderArchive size={22} className="text-white" />
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">Khuyên Dùng</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Tải Gói Full (.ZIP)</h4>
                      <p className="text-[10px] text-rose-100 leading-tight mt-0.5">
                        Bao gồm Audio WAV, Phụ đề SRT, VTT & từng shot audio
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Audio File */}
                  <button
                    onClick={() => downloadBlob(exportResult.audioBlob, `${projectName}_Voiceover_Full.wav`)}
                    className="p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-left shadow-2xs transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Music size={20} className="text-zinc-700 group-hover:text-rose-600" />
                      <span className="text-[10px] text-zinc-400 font-mono">WAV Lossless</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">Tải File Audio (.WAV)</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                        Chuẩn PCM 16-bit stereo chất lượng cao
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Subtitle SRT */}
                  <button
                    onClick={() => downloadTextFile(exportResult.srtContent, `${projectName}_PhuDe.srt`, 'text/plain;charset=utf-8')}
                    className="p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-left shadow-2xs transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={20} className="text-zinc-700 group-hover:text-rose-600" />
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">CapCut Ready</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">Tải Phụ Đề (.SRT)</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                        Khớp chuẩn từng giây vào CapCut / Premiere
                      </p>
                    </div>
                  </button>

                  {/* Option 4: Subtitle VTT */}
                  <button
                    onClick={() => downloadTextFile(exportResult.vttContent, `${projectName}_PhuDe.vtt`, 'text/vtt;charset=utf-8')}
                    className="p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-left shadow-2xs transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={20} className="text-zinc-700 group-hover:text-rose-600" />
                      <span className="text-[10px] text-zinc-400 font-mono">Web / YouTube</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">Tải Phụ Đề (.VTT)</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                        Dùng cho Web Video & YouTube Shorts
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Subtitles & Timestamps Inspector Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Layers size={14} className="text-rose-600" />
                    Bảng Phân Bổ Nhịp Thời Gian Từng Phân Cảnh ({exportResult.items.length} phân cảnh):
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySrt}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedSrt ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedSrt ? 'Đã chép SRT!' : 'Sao chép SRT'}</span>
                    </button>

                    <button
                      onClick={handleCopyVtt}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedVtt ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedVtt ? 'Đã chép VTT!' : 'Sao chép VTT'}</span>
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse bg-white">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 text-[11px] font-bold">
                        <th className="py-2 px-3 w-16">Shot #</th>
                        <th className="py-2 px-3 w-40 font-mono">Timestamp (SRT)</th>
                        <th className="py-2 px-3 w-20">Thời lượng</th>
                        <th className="py-2 px-3">Lời thoại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {exportResult.items.map((it) => {
                        const isCurrentActive = activeSubtitleItem?.shotNumber === it.shotNumber;
                        return (
                          <tr 
                            key={it.shotNumber} 
                            className={`transition-colors ${isCurrentActive ? 'bg-rose-50/80 font-semibold' : 'hover:bg-zinc-50/60'}`}
                          >
                            <td className="py-2 px-3 font-mono font-bold text-zinc-900">
                              #{it.shotNumber}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-rose-600">
                              {it.srtTimeFormatted}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-zinc-500 font-mono">
                              {it.durationSec.toFixed(1)}s
                            </td>
                            <td className="py-2 px-3 text-zinc-800">
                              {it.cleanedText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Instructions Card */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-2">
                <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles size={14} className="text-amber-600" />
                  Hướng Dẫn 2 Bước Kéo Thả Vào CapCut & Premiere Pro:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-amber-900/90 leading-relaxed">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                    <strong className="text-amber-950 block mb-0.5">🎬 Dành cho CapCut PC / Mobile:</strong>
                    1. Nhập (Import) file audio <code>.wav</code> vào track âm thanh.<br />
                    2. Nhập file <code>.srt</code> vào phần Văn bản (Text / Subtitles). File phụ đề sẽ tự động khớp hoàn hảo với giọng đọc mà không cần căn chỉnh tay!
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                    <strong className="text-amber-950 block mb-0.5">🎞️ Dành cho Premiere Pro / DaVinci:</strong>
                    1. File -&gt; Import file <code>.wav</code> và file <code>.srt</code>.<br />
                    2. Kéo file <code>.wav</code> vào Track Audio 1 và file <code>.srt</code> vào Captions Track.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div className="text-xs text-zinc-500">
            {exportResult ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" /> Đã tạo xong ({exportResult.totalShots} phân cảnh, {exportResult.totalDurationSec.toFixed(1)}s)
              </span>
            ) : (
              <span>Sẵn sàng xử lý {shots.length} phân cảnh</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {exportResult && (
              <button
                onClick={handleStartExport}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Tạo lại</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
