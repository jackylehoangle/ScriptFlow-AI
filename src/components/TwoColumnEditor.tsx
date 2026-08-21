import React, { useState } from 'react';
import { TwoColumnShot, ScriptData } from '../types';
import { 
  Plus, 
  Trash2, 
  Wand2, 
  Clock, 
  Video, 
  Mic, 
  Type, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  Volume2, 
  FileImage,
  Lightbulb,
  Split,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Eye,
  X,
  Flame,
  Download,
  Headphones,
  Play,
  Square,
  FileText,
  Layers,
  ArrowRight,
  Sparkle,
  Images,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FolderArchive,
  Zap,
  SplitSquareVertical,
  Activity,
  BookOpen,
  ShieldCheck,
  Users
} from 'lucide-react';

import AudioSrtExportModal from './AudioSrtExportModal';
import ShotImageStudioModal from './ShotImageStudioModal';
import HookThumbnailABModal from './HookThumbnailABModal';
import NarrativeArcModal from './NarrativeArcModal';
import LongFormChapterStudioModal from './LongFormChapterStudioModal';
import HumanizeDeAIModal from './HumanizeDeAIModal';
import PersonaLibraryModal from './PersonaLibraryModal';
import { useToast } from '../context/ToastContext';
import { v4 as uuidv4 } from 'uuid';
import { generateNextShot, rewriteContentWithInstruction, generateBrollVisualPrompt } from '../services/geminiService';

import { 
  generateOpenSourceImage, 
  getSavedOpenSourceSettings, 
  openExternalAIService,
  generateGeminiImagenShotImage,
  ImageStylePreset
} from '../services/imageService';
import { 
  globalVoicePlayer, 
  getSavedVoiceProfiles, 
  getVoiceStudioSettings,
  saveVoiceStudioSettings,
  cleanTextForSpeech,
  playFullScriptSequential
} from '../services/voiceService';

interface TwoColumnEditorProps {
  scriptData: ScriptData;
  onChange: (updated: ScriptData) => void;
  onOpenAIHelperWithPrompt?: (prompt: string) => void;
  onOpenModelSettings?: () => void;
  onOpenVoiceStudio?: () => void;
  onOpenFirstPassDraft?: () => void;
}

export default function TwoColumnEditor({ 
  scriptData, 
  onChange, 
  onOpenAIHelperWithPrompt,
  onOpenModelSettings,
  onOpenVoiceStudio,
  onOpenFirstPassDraft 
}: TwoColumnEditorProps) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const shots = scriptData.shots || [];
  
  // Step 1 vs Step 2 Workflow Mode
  const currentStep = scriptData.workflowStep || (scriptData.fullTextScript ? 'full_text' : 'breakdown');

  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [aiBrollModalShot, setAiBrollModalShot] = useState<TwoColumnShot | null>(null);
  const [studioShot, setStudioShot] = useState<TwoColumnShot | null>(null);
  const [isHookABModalOpen, setIsHookABModalOpen] = useState(false);
  const [isNarrativeArcModalOpen, setIsNarrativeArcModalOpen] = useState(false);
  const [isLongFormModalOpen, setIsLongFormModalOpen] = useState(false);
  const [isHumanizeModalOpen, setIsHumanizeModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [generatingImageShotId, setGeneratingImageShotId] = useState<string | null>(null);

  const [previewEnlargeImage, setPreviewEnlargeImage] = useState<string | null>(null);
  const [brollResult, setBrollResult] = useState<{ vietnameseExplanation: string; englishAIPrompt: string } | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [playingShotId, setPlayingShotId] = useState<string | null>(null);
  const [isPlayingFullNarrative, setIsPlayingFullNarrative] = useState(false);

  // Batch Image Generation State
  const [isBatchGeneratingImages, setIsBatchGeneratingImages] = useState(false);
  const [batchImageProgress, setBatchImageProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  // Batch Voice Generation / Continuous Playback State
  const [isBatchPlayingVoice, setIsBatchPlayingVoice] = useState(false);
  const [batchVoicePlayingIndex, setBatchVoicePlayingIndex] = useState<number | null>(null);
  const cancelBatchVoiceRef = React.useRef<{ current: boolean }>({ current: false });
  const [isExportAudioModalOpen, setIsExportAudioModalOpen] = useState(false);

  // Quick Voice Selection Toolbar
  const savedProfiles = getSavedVoiceProfiles();
  const [voiceSettings, setVoiceSettings] = useState(getVoiceStudioSettings());
  const activeVoiceProfile = savedProfiles.find(p => p.id === voiceSettings.selectedVoiceId) || savedProfiles[0];

  const handleSelectQuickVoice = (voiceId: string) => {
    const updated = { ...voiceSettings, selectedVoiceId: voiceId };
    setVoiceSettings(updated);
    saveVoiceStudioSettings(updated);
  };

  // Audio Playback for single shot
  const handleTogglePlayShotAudio = (shot: TwoColumnShot, index: number) => {
    if (playingShotId === shot.id) {
      globalVoicePlayer.stop();
      setPlayingShotId(null);
      return;
    }

    if (!activeVoiceProfile || !shot.audio) return;

    globalVoicePlayer.stop();
    setPlayingShotId(shot.id);

    globalVoicePlayer.speak(
      shot.audio,
      activeVoiceProfile,
      voiceSettings,
      () => setPlayingShotId(shot.id),
      () => setPlayingShotId(null),
      () => setPlayingShotId(null)
    );
  };

  // Play full narrative script (Step 1)
  const handleTogglePlayFullNarrative = () => {
    if (isPlayingFullNarrative) {
      globalVoicePlayer.stop();
      setIsPlayingFullNarrative(false);
      return;
    }

    const narrativeText = scriptData.fullTextScript || shots.map(s => s.audio).join("\n\n");
    if (!narrativeText || !activeVoiceProfile) return;

    globalVoicePlayer.stop();
    setIsPlayingFullNarrative(true);

    globalVoicePlayer.speak(
      narrativeText,
      activeVoiceProfile,
      voiceSettings,
      () => setIsPlayingFullNarrative(true),
      () => setIsPlayingFullNarrative(false),
      () => setIsPlayingFullNarrative(false)
    );
  };

  // Batch Voice: Read all shots sequentially with exact active voice
  const handleStartBatchVoicePlayback = () => {
    if (isBatchPlayingVoice) {
      cancelBatchVoiceRef.current.current = true;
      globalVoicePlayer.stop();
      setIsBatchPlayingVoice(false);
      setBatchVoicePlayingIndex(null);
      return;
    }

    if (shots.length === 0 || !activeVoiceProfile) return;

    cancelBatchVoiceRef.current.current = false;
    setIsBatchPlayingVoice(true);

    playFullScriptSequential(
      shots,
      activeVoiceProfile,
      voiceSettings,
      (shotIndex) => {
        setBatchVoicePlayingIndex(shotIndex);
        setActiveShotId(shots[shotIndex]?.id || null);
      },
      () => {
        setIsBatchPlayingVoice(false);
        setBatchVoicePlayingIndex(null);
      },
      cancelBatchVoiceRef.current
    );
  };

  const updateShots = (newShots: TwoColumnShot[]) => {
    const indexed = newShots.map((s, idx) => ({ ...s, shotNumber: idx + 1 }));
    onChange({
      ...scriptData,
      shots: indexed
    });
  };

  const handleShotChange = (id: string, field: keyof TwoColumnShot, value: any) => {
    // Sanitize audio input on the fly
    let processedValue = value;
    if (field === 'audio') {
      processedValue = cleanTextForSpeech(value);
    }
    const newShots = shots.map(s => (s.id === id ? { ...s, [field]: processedValue } : s));
    updateShots(newShots);
  };

  const setWorkflowStep = (step: 'full_text' | 'breakdown') => {
    onChange({
      ...scriptData,
      workflowStep: step
    });
  };

  const handleFullTextChange = (text: string) => {
    onChange({
      ...scriptData,
      fullTextScript: text
    });
  };

  // Convert Master Narrative Text into 2-Column Shots
  const handleBreakdownNarrativeToShots = async () => {
    const textToSplit = scriptData.fullTextScript || "";
    if (!textToSplit.trim()) {
      setWorkflowStep('breakdown');
      return;
    }

    // Split text paragraphs into clean shots
    const paragraphs = textToSplit
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const generatedShots: TwoColumnShot[] = paragraphs.map((para, index) => {
      const cleaned = cleanTextForSpeech(para);
      const isHook = index === 0;
      return {
        id: uuidv4(),
        shotNumber: index + 1,
        timeRange: `Phân cảnh ${index + 1}`,
        visual: isHook 
          ? "Cận cảnh nhân vật mở đầu gây chú ý, hiệu ứng đồ họa bắt mắt" 
          : "Góc quay diễn viên / B-roll minh họa câu chuyện sinh động",
        audio: cleaned,
        onScreenText: isHook ? "ĐIỂM NHẤN QUAN TRỌNG ⚡" : "",
        notes: isHook ? "Nhịp điệu dứt khoát, âm nhạc cuốn hút" : ""
      };
    });

    onChange({
      ...scriptData,
      shots: generatedShots.length > 0 ? generatedShots : shots,
      workflowStep: 'breakdown'
    });
    if (generatedShots.length > 0) {
      toastSuccess(`Đã tự động phân rã thành ${generatedShots.length} phân cảnh chi tiết!`, 'Bước 2: Phân Cảnh');
    }
  };

  const addShot = (index?: number) => {
    const newShot: TwoColumnShot = {
      id: uuidv4(),
      shotNumber: (index !== undefined ? index + 1 : shots.length + 1),
      timeRange: `Phân cảnh ${shots.length + 1}`,
      visual: "",
      audio: "",
      onScreenText: "",
      notes: ""
    };
    if (index !== undefined) {
      const copy = [...shots];
      copy.splice(index + 1, 0, newShot);
      updateShots(copy);
    } else {
      updateShots([...shots, newShot]);
    }
    toastInfo('Đã thêm phân cảnh mới.', 'Phân Cảnh');
  };

  const removeShot = (id: string) => {
    if (shots.length <= 1) return;
    updateShots(shots.filter(s => s.id !== id));
    toastInfo('Đã xóa phân cảnh.', 'Phân Cảnh');
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === shots.length - 1) return;
    const newShots = [...shots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newShots[index];
    newShots[index] = newShots[targetIndex];
    newShots[targetIndex] = temp;
    updateShots(newShots);
  };

  const handleAIGenerateNextShot = async () => {
    setGeneratingNext(true);
    try {
      const nextShot = await generateNextShot(shots, scriptData.title + " - " + (scriptData.summary || ""));
      updateShots([...shots, nextShot]);
      toastSuccess(`Đã tạo AI cảnh tiếp theo (#${nextShot.shotNumber})!`, 'AI Viết Tiếp');
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Không thể tạo cảnh tiếp theo.', 'Lỗi AI');
    } finally {
      setGeneratingNext(false);
    }
  };

  const handleCreateBrollPrompt = async (shot: TwoColumnShot) => {
    setAiBrollModalShot(shot);
    setCopiedPrompt(false);
    try {
      const result = await generateBrollVisualPrompt(shot.visual || scriptData.title);
      setBrollResult(result);
    } catch (e) {
      console.error(e);
      setBrollResult({
        vietnameseExplanation: "Tạo hình ảnh B-roll chuẩn điện ảnh cho phân cảnh",
        englishAIPrompt: `Cinematic commercial scene of ${shot.visual || scriptData.title}, 8k resolution, ultra detailed, photorealistic, cinematic lighting`
      });
    }
  };

  const handleGenerateShotImage = async (shot: TwoColumnShot, customPrompt?: string, style: ImageStylePreset = 'cinematic') => {
    setGeneratingImageShotId(shot.id);
    try {
      const res = await generateGeminiImagenShotImage({
        visualDescription: shot.visual,
        customPrompt: customPrompt || shot.imagePrompt,
        style,
        aspectRatio: '16:9',
        shotNumber: shot.shotNumber,
        scriptTitle: scriptData.title
      });

      const newShots = shots.map(s => s.id === shot.id ? { 
        ...s, 
        imageUrl: res.imageUrl, 
        imagePrompt: res.promptUsed 
      } : s);
      updateShots(newShots);

      if (aiBrollModalShot && aiBrollModalShot.id === shot.id) {
        setAiBrollModalShot({ ...aiBrollModalShot, imageUrl: res.imageUrl, imagePrompt: res.promptUsed });
      }
    } catch (error) {
      console.error("Error generating shot image:", error);
    } finally {
      setGeneratingImageShotId(null);
    }
  };

  const handleGenerateAllShotImages = async () => {
    if (isBatchGeneratingImages || shots.length === 0) return;
    setIsBatchGeneratingImages(true);
    setBatchImageProgress({ current: 0, total: shots.length, message: "Khởi động Gemini Imagen 3..." });

    const updatedShots = [...shots];

    for (let i = 0; i < updatedShots.length; i++) {
      const currentShot = updatedShots[i];
      setBatchImageProgress({
        current: i + 1,
        total: updatedShots.length,
        message: `Đang vẽ cảnh #${currentShot.shotNumber}: ${currentShot.visual ? currentShot.visual.slice(0, 30) + '...' : 'Storyboard'}`
      });

      try {
        const res = await generateGeminiImagenShotImage({
          visualDescription: currentShot.visual,
          style: 'cinematic',
          aspectRatio: '16:9',
          shotNumber: currentShot.shotNumber,
          scriptTitle: scriptData.title
        });

        updatedShots[i] = {
          ...currentShot,
          imageUrl: res.imageUrl,
          imagePrompt: res.promptUsed
        };
        updateShots([...updatedShots]);
      } catch (err) {
        console.warn(`Error batch generating shot #${currentShot.shotNumber}:`, err);
      }
    }

    setIsBatchGeneratingImages(false);
    setBatchImageProgress(null);
    toastSuccess(`Đã hoàn tất vẽ storyboard minh họa cho ${updatedShots.length} phân cảnh!`, 'Storyboard AI');
  };

  const totalWords = shots.reduce((acc, shot) => {
    const words = (shot.audio || "").trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  const estimatedSeconds = Math.round(totalWords / 2.5);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  const shotsWithImagesCount = shots.filter(s => !!s.imageUrl).length;
  const narrativeContent = scriptData.fullTextScript || shots.map(s => s.audio).filter(Boolean).join("\n\n");
  const narrativeWordCount = narrativeContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* 2-STEP WORKFLOW NAVIGATOR */}
      <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWorkflowStep('full_text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 'full_text'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            <FileText size={15} />
            <span>BƯỚC 1: KỊCH BẢN ĐẦY ĐỦ (NARRATIVE)</span>
          </button>

          <ArrowRight size={14} className="text-zinc-400 hidden sm:inline" />

          <button
            onClick={() => setWorkflowStep('breakdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 'breakdown'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            <Layers size={15} />
            <span>BƯỚC 2: PHÂN CHIA CẢNH & HÌNH ẢNH (2 CỘT)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenVoiceStudio && (
            <button
              onClick={onOpenVoiceStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              title="Phòng thu lồng tiếng AI & Clone giọng đọc"
            >
              <Headphones size={14} className="text-rose-600" />
              <span>Phòng Thu Voice AI</span>
            </button>
          )}

          {onOpenModelSettings && (
            <button
              onClick={onOpenModelSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
              title="Cấu hình FLUX / B-roll"
            >
              <Flame size={14} className="text-emerald-600" />
              <span>Mô hình FLUX / 0đ</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW STEP 1: BẢN KỊCH BẢN ĐẦY ĐỦ (MASTER NARRATIVE SCRIPT) */}
      {/* ========================================================================= */}
      {currentStep === 'full_text' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <FileText size={14} />
                <span>Kịch Bản Hoàn Chỉnh Trước Khi Chia Cảnh</span>
              </div>
              <h2 className="text-xl font-black text-zinc-900">
                {scriptData.title || "Kịch bản chưa đặt tên"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportAudioModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
                title="Xuất 1 file Audio MP3/WAV hoàn chỉnh kèm file phụ đề .SRT chuẩn xác"
              >
                <FolderArchive size={14} />
                <span>Xuất Full Audio & SRT</span>
              </button>

              <button
                onClick={handleTogglePlayFullNarrative}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isPlayingFullNarrative 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {isPlayingFullNarrative ? (
                  <>
                    <Square size={13} className="fill-white" />
                    <span>Dừng Đọc Voice</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-rose-700" />
                    <span>Nghe Giọng Đọc Mẫu</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBreakdownNarrativeToShots}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <span>Sang Bước 2: Phân Chia Phân Cảnh (2 Cột)</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Độ dài nội dung</span>
              <span className="font-bold text-zinc-800">{narrativeWordCount} Từ</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Thời lượng đọc ước tính</span>
              <span className="font-bold text-blue-600">~{formatTime(Math.round(narrativeWordCount / 2.5))}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Phong cách / Tone</span>
              <span className="font-bold text-zinc-800">{scriptData.tone}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Nền tảng mục tiêu</span>
              <span className="font-bold text-amber-600">{scriptData.platform}</span>
            </div>
          </div>

          {/* Quick Voice Selection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs">
            <span className="font-bold text-rose-950 flex items-center gap-1.5">
              <Mic size={14} className="text-rose-600" /> Chọn Giọng Đọc Đổi Mẫu:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {savedProfiles.map((p) => {
                const isSelected = p.id === activeVoiceProfile?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectQuickVoice(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-2xs font-bold'
                        : 'bg-white hover:bg-rose-100/70 text-zinc-700 border border-rose-200/50'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hook Highlight & A/B Studio Launcher */}
          <div className="p-4 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-purple-50/70 border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded uppercase flex items-center gap-1">
                  <Zap size={11} className="fill-white" />
                  Câu Mở Đầu Triệu View (Hook)
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">Tối ưu 3 giây vàng & CTR</span>
              </div>
              <p className="text-sm font-semibold text-amber-950 italic">
                "{scriptData.hook || 'Chưa chọn câu Hook mở đầu cho kịch bản'}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFirstPassDraft && (
                <button
                  onClick={onOpenFirstPassDraft}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                  title="Khởi tạo hoặc viết lại toàn bộ bản thảo từ Hook và DNA Kênh"
                >
                  <Zap size={14} className="fill-white" />
                  <span>⚡ Viết Lại Bản Thảo từ Hook</span>
                </button>
              )}

              <button
                onClick={() => setIsHookABModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <SplitSquareVertical size={14} />
                <span>Hook A/B & CTR</span>
              </button>

              <button
                onClick={() => setIsNarrativeArcModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-700 to-cyan-700 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Activity size={14} />
                <span>Cung Truyện AI</span>
              </button>

              <button
                onClick={() => setIsLongFormModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-cyan-200 border border-indigo-500/30 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <BookOpen size={14} className="text-cyan-400" />
                <span>Kịch Bản Dài 10-30m</span>
              </button>

              <button
                onClick={() => setIsHumanizeModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Khử Văn Mẫu AI</span>
              </button>

              <button
                onClick={() => setIsPersonaModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Users size={14} className="text-purple-400" />
                <span>Thư Viện Persona</span>
              </button>
            </div>
          </div>


          {/* Master Narrative Text Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
              Nội dung câu chuyện / Bài thuyết minh đầy đủ:
            </label>
            <p className="text-xs text-zinc-400">
              Bạn có thể đọc, chỉnh sửa hoàn chỉnh bài văn trước khi bấm chia nhỏ sang từng phân cảnh quay hình và âm thanh.
            </p>
            <textarea
              value={narrativeContent}
              onChange={(e) => handleFullTextChange(e.target.value)}
              rows={16}
              placeholder="Nhập toàn bộ nội dung kịch bản văn bản liền mạch tại đây..."
              className="w-full text-sm text-zinc-900 leading-relaxed bg-zinc-50/50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-normal transition-all"
            />
          </div>

          {/* Call To Action */}
          {scriptData.callToAction && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded uppercase">
                Kêu Gọi Hành Động (CTA)
              </span>
              <p className="text-sm font-medium text-emerald-950 mt-1">
                {scriptData.callToAction}
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleBreakdownNarrativeToShots}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-md transition-all"
            >
              <span>Phân Cảnh Chi Tiết Bước 2 (Hình Ảnh, Âm Thanh, Storyboard)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW STEP 2: BẢNG PHÂN CHIA PHÂN CẢNH CHI TIẾT (2 CỘT VISUAL & AUDIO) */}
      {/* ========================================================================= */}
      {currentStep === 'breakdown' && (
        <div className="space-y-6">
          {/* TOP PRODUCTION CONTROLLER: BATCH IMAGES & BATCH VOICE BAR */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-600" />
                  Bảng Phân Cảnh 2 Cột (Visual & Audio Sạch)
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span>{shots.length} Phân cảnh</span>
                  <span>•</span>
                  <span>{totalWords} Từ thoại</span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <Clock size={12} /> Ước tính: {formatTime(estimatedSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWorkflowStep('full_text')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <FileText size={13} />
                  <span>Xem Kịch Bản Đầy Đủ</span>
                </button>

                <button
                  onClick={handleAIGenerateNextShot}
                  disabled={generatingNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-2xs"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{generatingNext ? 'Đang viết...' : 'AI Viết Cảnh Tiếp'}</span>
                </button>
              </div>
            </div>

            {/* BATCH ACTION CONTROLLER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-100">
              {/* Batch Image Generator Box */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl">
                    <Images size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>Tạo Ảnh Hàng Loạt (Batch Storyboard)</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 font-bold rounded">
                        {shotsWithImagesCount}/{shots.length} ảnh
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Tự động vẽ toàn bộ khung hình Storyboard cho tất cả phân cảnh
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAllShotImages}
                  disabled={isBatchGeneratingImages || shots.length === 0}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isBatchGeneratingImages ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>{batchImageProgress ? `${batchImageProgress.current}/${batchImageProgress.total}` : 'Đang tạo...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Tạo Tất Cả Ảnh</span>
                    </>
                  )}
                </button>
              </div>

              {/* Batch Voice / Audio Player Box */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500 text-white rounded-xl">
                    <Radio size={16} className={isBatchPlayingVoice ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>Tạo Voice & Đọc Toàn Bộ (Batch Voice)</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-800 font-bold rounded truncate max-w-[110px]">
                        {activeVoiceProfile?.name || 'Mặc định'}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Khớp chuẩn từng lời thoại sạch theo thứ tự phân cảnh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsExportAudioModalOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    title="Xuất file âm thanh gộp và phụ đề SRT đồng bộ"
                  >
                    <FolderArchive size={14} />
                    <span>Xuất Audio & SRT</span>
                  </button>

                  <button
                    onClick={handleStartBatchVoicePlayback}
                    disabled={shots.length === 0}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      isBatchPlayingVoice
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {isBatchPlayingVoice ? (
                      <>
                        <Square size={13} className="fill-white" />
                        <span>Dừng</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="fill-white" />
                        <span>Phát Voice Toàn Bộ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Voice Profile Selector Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
              <span className="font-bold text-zinc-500 flex items-center gap-1">
                <Mic size={13} /> Giọng đọc áp dụng:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {savedProfiles.map((p) => {
                  const isSelected = p.id === activeVoiceProfile?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectQuickVoice(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-rose-500 text-white shadow-2xs font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hook Highlight & A/B Lab Button in Step 2 */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-purple-50/70 border border-amber-200/70 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 max-w-lg">
                <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded uppercase mt-0.5 flex items-center gap-1 shrink-0">
                  <Zap size={10} className="fill-white" />
                  Hook 3s
                </span>
                <p className="text-xs text-amber-950 font-semibold leading-relaxed italic">
                  "{scriptData.hook || 'Chưa thiết lập câu mở đầu'}"
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenFirstPassDraft && (
                  <button
                    onClick={onOpenFirstPassDraft}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-[11px] font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                    title="Khởi tạo hoặc viết lại toàn bộ bản thảo từ Hook và DNA Kênh"
                  >
                    <Zap size={12} className="fill-white" />
                    <span>⚡ Viết Lại Bản Thảo</span>
                  </button>
                )}

                <button
                  onClick={() => setIsHookABModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <SplitSquareVertical size={13} />
                  <span>Hook A/B & CTR</span>
                </button>

                <button
                  onClick={() => setIsNarrativeArcModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-700 to-cyan-700 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <Activity size={13} />
                  <span>Cung Truyện AI</span>
                </button>

                <button
                  onClick={() => setIsLongFormModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-cyan-200 border border-indigo-500/30 rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <BookOpen size={13} className="text-cyan-400" />
                  <span>Kịch Bản Dài 10-30m</span>
                </button>

                <button
                  onClick={() => setIsHumanizeModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-emerald-200 border border-emerald-500/40 rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Khử Văn Mẫu AI</span>
                </button>

                <button
                  onClick={() => setIsPersonaModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/40 rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <Users size={13} className="text-purple-400" />
                  <span>Thư Viện Persona</span>
                </button>
              </div>
            </div>

          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <div className="col-span-1 text-center">Shot</div>
            <div className="col-span-5 flex items-center gap-1.5">
              <Video size={14} className="text-indigo-500" />
              <span>Hình Ảnh & Góc Quay (Visual / Storyboard)</span>
            </div>
            <div className="col-span-5 flex items-center gap-1.5">
              <Mic size={14} className="text-emerald-500" />
              <span>Lời Thoại Sạch (Audio / Voiceover)</span>
            </div>
            <div className="col-span-1 text-right">Tác vụ</div>
          </div>

          {/* Shots List */}
          <div className="space-y-4">
            {shots.map((shot, index) => {
              const isHook = index === 0;
              const isGeneratingImg = generatingImageShotId === shot.id;
              const isVoicePlayingHere = (isBatchPlayingVoice && batchVoicePlayingIndex === index) || playingShotId === shot.id;

              return (
                <div
                  key={shot.id}
                  onClick={() => setActiveShotId(shot.id)}
                  className={`group bg-white rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs overflow-hidden ${
                    isVoicePlayingHere
                      ? 'border-rose-400 ring-2 ring-rose-400/30 bg-rose-50/20'
                      : activeShotId === shot.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/10' 
                        : isHook 
                          ? 'border-amber-200 bg-gradient-to-b from-amber-50/20 to-white' 
                          : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      {/* Column 1: Shot Number */}
                      <div className="col-span-1 flex flex-col items-center gap-2 pt-1">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isVoicePlayingHere
                            ? 'bg-rose-500 text-white animate-bounce'
                            : isHook 
                              ? 'bg-amber-500 text-white shadow-xs' 
                              : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200'
                        }`}>
                          #{shot.shotNumber}
                        </span>

                        <input
                          type="text"
                          value={shot.timeRange || ""}
                          onChange={(e) => handleShotChange(shot.id, 'timeRange', e.target.value)}
                          placeholder="0:00 - 0:03"
                          className="w-full text-[10px] text-center font-mono font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md py-1 px-0.5 focus:outline-none focus:border-blue-500"
                        />

                        {/* Order Reorder */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveShot(index, 'up'); }}
                            disabled={index === 0}
                            className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded disabled:opacity-20"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveShot(index, 'down'); }}
                            disabled={index === shots.length - 1}
                            className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded disabled:opacity-20"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Column 2: Visual, Camera & Storyboard */}
                      <div className="col-span-5 space-y-2">
                        <textarea
                          value={shot.visual}
                          onChange={(e) => handleShotChange(shot.id, 'visual', e.target.value)}
                          placeholder="Mô tả góc máy (Close-up, Wide), hành động của diễn viên, hiệu ứng hình ảnh, gợi ý B-roll..."
                          rows={3}
                          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-indigo-50/20 hover:bg-indigo-50/40 focus:bg-white border border-indigo-200/80 focus:border-indigo-500 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
                        />

                        {/* Image Preview / Storyboard */}
                        {shot.imageUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-zinc-200 group/img bg-zinc-900 aspect-video max-h-40 flex items-center justify-center">
                            <img 
                              src={shot.imageUrl} 
                              alt={`Shot ${shot.shotNumber}`} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setStudioShot(shot); }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setStudioShot(shot); }}
                                className="p-1.5 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-lg backdrop-blur-xs text-xs font-bold flex items-center gap-1"
                                title="Mở Gemini Imagen Studio"
                              >
                                <Sliders size={13} />
                                <span className="text-[10px]">Studio</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewEnlargeImage(shot.imageUrl || null); }}
                                className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-xs text-xs"
                                title="Xem ảnh lớn"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleGenerateShotImage(shot); }}
                                disabled={isGeneratingImg}
                                className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-xs text-xs"
                                title="Vẽ lại bằng Gemini Imagen"
                              >
                                <RefreshCw size={13} className={isGeneratingImg ? "animate-spin" : ""} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newShots = shots.map(s => s.id === shot.id ? { ...s, imageUrl: undefined, imagePrompt: undefined } : s);
                                  updateShots(newShots);
                                }}
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs text-xs"
                                title="Xóa ảnh phân cảnh này"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Visual & Gemini Imagen Generation Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGenerateShotImage(shot); }}
                              disabled={isGeneratingImg}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-bold shadow-xs transition-all disabled:opacity-50 active:scale-95"
                              title="Tạo ảnh minh họa phân cảnh bằng Gemini Imagen 3"
                            >
                              <Sparkles size={11} className={isGeneratingImg ? "animate-spin" : ""} />
                              <span>{isGeneratingImg ? "Đang vẽ ảnh..." : shot.imageUrl ? "Vẽ lại (Imagen 3)" : "Vẽ ảnh Gemini Imagen"}</span>
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); setStudioShot(shot); }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-[10px] font-semibold transition-colors"
                              title="Tùy chỉnh phong cách nghệ thuật, tỉ lệ, prompt"
                            >
                              <Sliders size={11} />
                              <span>Studio</span>
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleCreateBrollPrompt(shot); }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-lg text-[10px] font-semibold transition-colors"
                              title="Xem AI Prompt để dán vào ChatGPT Plus / Midjourney"
                            >
                              <FileImage size={11} />
                              <span>Prompt</span>
                            </button>
                          </div>
                        </div>

                        {/* On-Screen Text (Captions) */}
                        <div className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-200/60 rounded-lg px-2.5 py-1.5">
                          <Type size={12} className="text-amber-600 shrink-0" />
                          <input
                            type="text"
                            value={shot.onScreenText || ""}
                            onChange={(e) => handleShotChange(shot.id, 'onScreenText', e.target.value)}
                            placeholder="Chữ hiện trên màn hình (Text Caption / Lower Third)..."
                            className="w-full text-xs text-amber-900 placeholder-amber-400/80 bg-transparent border-none focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Column 3: Pure Clean Audio & Voiceover */}
                      <div className="col-span-5 space-y-2">
                        <div className="relative">
                          <textarea
                            value={shot.audio}
                            onChange={(e) => handleShotChange(shot.id, 'audio', e.target.value)}
                            placeholder="Lời thoại sạch 100% của MC/Diễn viên/Voiceover..."
                            rows={3}
                            className={`w-full text-xs text-zinc-900 font-medium placeholder-zinc-400 bg-emerald-50/20 hover:bg-emerald-50/40 focus:bg-white border rounded-xl p-3 focus:outline-none focus:ring-1 leading-relaxed resize-y transition-all ${
                              isVoicePlayingHere 
                                ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-500' 
                                : 'border-emerald-200/80 focus:border-emerald-500 focus:ring-emerald-500'
                            }`}
                          />

                          {/* Action buttons inside Audio Area */}
                          <div className="flex items-center gap-1.5 absolute right-2 bottom-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePlayShotAudio(shot, index); }}
                              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs ${
                                isVoicePlayingHere
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70'
                              }`}
                              title={`Nghe đọc lời thoại phân cảnh này với giọng ${activeVoiceProfile?.name}`}
                            >
                              {isVoicePlayingHere ? (
                                <>
                                  <Square size={11} className="fill-white" />
                                  <span>Dừng</span>
                                </>
                              ) : (
                                <>
                                  <Play size={11} className="fill-rose-700" />
                                  <span>Đọc Voice</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Notes / Director Pacing Tips / SFX & BGM */}
                        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
                          <Lightbulb size={12} className="text-zinc-400 shrink-0" />
                          <input
                            type="text"
                            value={shot.notes || ""}
                            onChange={(e) => handleShotChange(shot.id, 'notes', e.target.value)}
                            placeholder="Chỉ dẫn âm thanh SFX, BGM, nhịp điệu diễn xuất..."
                            className="w-full text-[11px] text-zinc-600 placeholder-zinc-400 bg-transparent border-none focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Column 4: Actions */}
                      <div className="col-span-1 flex flex-col items-end gap-1.5 pt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); addShot(index); }}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chèn cảnh mới bên dưới"
                        >
                          <Plus size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeShot(shot.id); }}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa cảnh này"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => addShot()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded-xl text-xs font-semibold shadow-xs transition-all hover:border-zinc-400"
            >
              <Plus size={16} /> Thêm Phân Cảnh Thủ Công
            </button>
            <button
              onClick={handleGenerateAllShotImages}
              disabled={isBatchGeneratingImages || shots.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Images size={16} /> Tạo Hàng Loạt Ảnh Storyboard
            </button>
            <button
              onClick={handleAIGenerateNextShot}
              disabled={generatingNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles size={16} /> {generatingNext ? "AI đang suy nghĩ..." : "AI Tự Viết Cảnh Tiếp"}
            </button>
          </div>
        </div>
      )}

      {/* Modal: AI B-Roll Image Prompt & Direct Generator */}
      {aiBrollModalShot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <FileImage size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">AI Prompt & Tạo Ảnh Storyboard</h3>
                  <p className="text-xs text-zinc-500">Tạo ảnh trực tiếp (FLUX 0đ) hoặc dán vào ChatGPT Plus / Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setAiBrollModalShot(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
              <span className="font-semibold text-zinc-600">Mô tả phân cảnh #{aiBrollModalShot.shotNumber}:</span>
              <p className="text-zinc-800 mt-1">{aiBrollModalShot.visual || "Chưa có mô tả"}</p>
            </div>

            {brollResult ? (
              <div className="space-y-3">
                <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-xs text-indigo-900">
                  <span className="font-semibold">💡 Ý đồ khung hình: </span>
                  {brollResult.vietnameseExplanation}
                </div>

                <div className="relative bg-zinc-900 text-zinc-100 p-3.5 rounded-xl font-mono text-xs leading-relaxed">
                  <p className="pr-8 select-all">{brollResult.englishAIPrompt}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(brollResult.englishAIPrompt);
                      setCopiedPrompt(true);
                      setTimeout(() => setCopiedPrompt(false), 2000);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
                    title="Sao chép prompt"
                  >
                    {copiedPrompt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (aiBrollModalShot) {
                        handleGenerateShotImage(aiBrollModalShot, brollResult.englishAIPrompt);
                      }
                    }}
                    disabled={generatingImageShotId === aiBrollModalShot.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <ImageIcon size={14} />
                    <span>{generatingImageShotId === aiBrollModalShot.id ? "Đang tạo ảnh FLUX..." : "Tạo ảnh vào phân cảnh"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openExternalAIService('chatgpt', brollResult.englishAIPrompt)}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> ChatGPT Plus
                    </button>
                    <button
                      onClick={() => openExternalAIService('gemini', brollResult.englishAIPrompt)}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Gemini
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                <RefreshCw size={18} className="animate-spin text-indigo-600" />
                <span>AI đang phân tích và tạo visual prompt...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Enlarge Modal */}
      {previewEnlargeImage && (
        <div 
          onClick={() => setPreviewEnlargeImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={previewEnlargeImage} 
              alt="Enlarged preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <button
              onClick={() => setPreviewEnlargeImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      {/* Batch Image Generation Progress Banner */}
      {isBatchGeneratingImages && batchImageProgress && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-4 animate-in slide-in-from-bottom-4 max-w-md">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <RefreshCw size={20} className="animate-spin" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Gemini Imagen 3 Batch ({batchImageProgress.current}/{batchImageProgress.total})</span>
              <span className="text-emerald-400">{Math.round((batchImageProgress.current / batchImageProgress.total) * 100)}%</span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">{batchImageProgress.message}</p>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(batchImageProgress.current / batchImageProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gemini Imagen 3 Shot Studio Modal */}
      <ShotImageStudioModal
        isOpen={!!studioShot}
        onClose={() => setStudioShot(null)}
        shot={studioShot}
        scriptTitle={scriptData.title}
        allShots={shots}
        onApplyImageToShot={(shotId, imageUrl, imagePrompt) => {
          const newShots = shots.map(s => s.id === shotId ? { ...s, imageUrl, imagePrompt } : s);
          updateShots(newShots);
        }}
        onApplyBatchImages={(updatedShots) => {
          updateShots(updatedShots);
        }}
      />

      {/* Audio & Subtitle SRT Export Modal */}
      <AudioSrtExportModal
        isOpen={isExportAudioModalOpen}
        onClose={() => setIsExportAudioModalOpen(false)}
        shots={shots}
        projectTitle={scriptData.title || 'Kich_Ban_Video'}
      />

      {/* Hook A/B Test & CTR Thumbnail Studio Modal */}
      <HookThumbnailABModal
        isOpen={isHookABModalOpen}
        onClose={() => setIsHookABModalOpen(false)}
        scriptData={scriptData}
        onApplyHook={(hookText) => {
          onChange({
            ...scriptData,
            hook: hookText
          });
        }}
        onApplyTitle={(headlineText) => {
          onChange({
            ...scriptData,
            title: headlineText
          });
        }}
      />

      {/* Narrative Arc & Retention Beat Optimizer Modal */}
      <NarrativeArcModal
        isOpen={isNarrativeArcModalOpen}
        onClose={() => setIsNarrativeArcModalOpen(false)}
        scriptData={scriptData}
        onApplyBeatToShot={(shotNumber, revisedVisual, revisedAudio) => {
          const targetIndex = shotNumber - 1;
          const updatedShots = [...shots];
          if (updatedShots[targetIndex]) {
            updatedShots[targetIndex] = {
              ...updatedShots[targetIndex],
              visual: revisedVisual,
              audio: revisedAudio,
            };
            onChange({
              ...scriptData,
              shots: updatedShots
            });
          }
        }}
      />

      {/* Long-Form Multi-Chapter Studio Modal */}
      <LongFormChapterStudioModal
        isOpen={isLongFormModalOpen}
        onClose={() => setIsLongFormModalOpen(false)}
        scriptData={scriptData}
        onApplyFullScript={(updatedScript) => {
          onChange(updatedScript);
        }}
      />

      {/* Humanize & De-AI Engine Modal */}
      <HumanizeDeAIModal
        isOpen={isHumanizeModalOpen}
        onClose={() => setIsHumanizeModalOpen(false)}
        scriptData={scriptData}
        onApplyHumanizedText={(newFullText, updatedShots) => {
          onChange({
            ...scriptData,
            fullTextScript: newFullText,
            shots: updatedShots || scriptData.shots
          });
        }}
      />

      {/* Persona Library & Deep Domain Styles Modal */}
      <PersonaLibraryModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        scriptData={scriptData}
        onApplyPersonaToScript={(persona) => {
          onChange({
            ...scriptData,
            summary: scriptData.summary ? `${scriptData.summary}\n[Persona: ${persona.name}]` : `[Persona: ${persona.name}]`
          });
        }}
        onOpenDeAIWithPersona={(persona) => {
          setIsPersonaModalOpen(false);
          setIsHumanizeModalOpen(true);
        }}
      />
    </div>
  );
}

