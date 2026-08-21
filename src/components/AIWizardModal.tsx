import React, { useState, useEffect } from 'react';
import { 
  ScriptFormat, 
  PlatformType, 
  TopicCategory, 
  ToneOfVoice, 
  ScriptData,
  AIHookOption,
  AIOutlineBeat,
  ChannelDNA,
  BrainstormIdeaItem
} from '../types';
import { 
  PLATFORM_LABELS, 
  TOPIC_LABELS, 
  TONE_LABELS,
  generateHooksAndAngles,
  generateScriptOutline,
  generateFullScriptAtoZ
} from '../services/geminiService';
import { 
  Sparkles, 
  Wand2, 
  Flame, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  X,
  ShieldAlert,
  Edit3,
  Lightbulb
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AIWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newScript: ScriptData) => void;
  activeChannel?: ChannelDNA;
  channels?: ChannelDNA[];
  onOpenChannelSetup?: () => void;
  onSelectChannel?: (channel: ChannelDNA) => void;
  initialIdea?: BrainstormIdeaItem | null;
  onOpenIdeaBrainstorm?: () => void;
}

export default function AIWizardModal({ 
  isOpen, 
  onClose, 
  onComplete,
  activeChannel,
  channels = [],
  onOpenChannelSetup,
  onSelectChannel,
  initialIdea,
  onOpenIdeaBrainstorm
}: AIWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [promptTopic, setPromptTopic] = useState('');
  const [platform, setPlatform] = useState<PlatformType>(activeChannel?.primaryPlatform || 'tiktok');
  const [format, setFormat] = useState<ScriptFormat>(activeChannel?.defaultFormat || 'short');
  const [topicCategory, setTopicCategory] = useState<TopicCategory>(activeChannel?.category || 'business');
  const [tone, setTone] = useState<ToneOfVoice>(activeChannel?.defaultTone || 'energetic_viral');
  const [duration, setDuration] = useState(activeChannel?.targetDuration || '60s');
  const [extraNotes, setExtraNotes] = useState('');

  // Pre-fill from initialIdea
  useEffect(() => {
    if (initialIdea) {
      if (initialIdea.title) setTitle(initialIdea.title);
      if (initialIdea.title) {
        const fullTopic = initialIdea.angle 
          ? `${initialIdea.title}\n- Góc nhìn: ${initialIdea.angle}\n- Nỗi đau: ${initialIdea.targetPainPoint}` 
          : initialIdea.title;
        setPromptTopic(fullTopic);
      }
      if (initialIdea.hook) setSelectedHook(initialIdea.hook);
      if (initialIdea.suggestedDuration) setDuration(initialIdea.suggestedDuration);
    }
  }, [initialIdea]);

  // Synchronize when activeChannel changes
  useEffect(() => {
    if (activeChannel) {
      if (activeChannel.primaryPlatform) setPlatform(activeChannel.primaryPlatform);
      if (activeChannel.defaultFormat) setFormat(activeChannel.defaultFormat);
      if (activeChannel.category) setTopicCategory(activeChannel.category);
      if (activeChannel.defaultTone) setTone(activeChannel.defaultTone);
      if (activeChannel.targetDuration) setDuration(activeChannel.targetDuration);
    }
  }, [activeChannel]);

  // AI Generated intermediate states
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [hooks, setHooks] = useState<AIHookOption[]>([]);
  const [selectedHook, setSelectedHook] = useState<string>('');

  const [loadingOutline, setLoadingOutline] = useState(false);
  const [outlineBeats, setOutlineBeats] = useState<AIOutlineBeat[]>([]);

  const [generatingFinal, setGeneratingFinal] = useState(false);

  if (!isOpen) return null;

  // Platform duration defaults
  const handlePlatformChange = (p: PlatformType) => {
    setPlatform(p);
    if (p === 'tiktok' || p === 'youtube_shorts' || p === 'reels') {
      setFormat('short');
      setDuration('60s');
    } else if (p === 'youtube_long') {
      setFormat('long');
      setDuration('8m - 10m');
    } else if (p === 'film') {
      setFormat('screenplay');
      setDuration('5m');
    } else if (p === 'commercial_tvc') {
      setFormat('commercial');
      setDuration('45s');
    } else if (p === 'podcast') {
      setFormat('podcast');
      setDuration('15m');
    }
  };

  // Step 1 -> Step 2: Generate Hooks
  const handleProceedToHooks = async () => {
    if (!promptTopic.trim()) return;
    setStep(2);
    setLoadingHooks(true);
    try {
      const generatedHooks = await generateHooksAndAngles({
        topic: promptTopic,
        category: topicCategory,
        platform,
        tone,
        targetAudience: activeChannel?.targetAudience,
        channelDNA: activeChannel,
      });
      setHooks(generatedHooks);
      if (generatedHooks.length > 0) {
        setSelectedHook(generatedHooks[0].hookText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHooks(false);
    }
  };

  // Step 2 -> Step 3: Generate Outline
  const handleProceedToOutline = async () => {
    setStep(3);
    setLoadingOutline(true);
    try {
      const generatedOutline = await generateScriptOutline({
        title: title || promptTopic,
        topic: promptTopic,
        category: topicCategory,
        platform,
        tone,
        duration,
        selectedHook,
        channelDNA: activeChannel,
      });
      setOutlineBeats(generatedOutline);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOutline(false);
    }
  };

  // Step 3 -> Finish: Full Auto Generation
  const handleGenerateFinalScript = async () => {
    setGeneratingFinal(true);
    try {
      const result = await generateFullScriptAtoZ({
        title: title || promptTopic,
        topic: promptTopic,
        category: topicCategory,
        platform,
        format,
        tone,
        duration,
        hook: selectedHook,
        outlineBeats,
        extraInstructions: extraNotes,
        channelDNA: activeChannel,
      });

      const newScriptData: ScriptData = {
        id: uuidv4(),
        title: title || promptTopic || "Kịch bản AI Tự động",
        format,
        platform,
        topic: topicCategory,
        tone,
        targetDuration: duration,
        channelId: activeChannel?.id,
        channelName: activeChannel?.name,
        channelTagline: activeChannel?.tagline,
        summary: result.summary,
        hook: result.hook || selectedHook,
        callToAction: result.callToAction,
        fullTextScript: result.fullTextScript || (result.shots || []).map(s => s.audio).join("\n\n"),
        workflowStep: 'full_text', // Default to Step 1: Full Narrative Script View first
        shots: result.shots,
        screenplayElements: result.screenplayElements,
      };

      onComplete(newScriptData);
      onClose();
    } catch (e) {
      console.error("Error generating final script", e);
    } finally {
      setGeneratingFinal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden">
        {/* Header with Progress Steps */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-amber-500 to-indigo-600 text-white rounded-2xl shadow-xs">
                <Wand2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900">
                    AI Wizard: Tạo Kịch Bản Chuẩn DNA Kênh
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Cpu size={11} className="text-amber-700" />
                    <span>Động cơ: Claude 3.7 Sonnet</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Tự động lấy thông tin từ DNA Kênh để đảm bảo kịch bản đúng phong cách, đúng đối tượng và chuẩn quy tắc
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-3 gap-2 text-xs font-medium">
            <div className={`p-2 rounded-xl border flex items-center gap-2 ${
              step === 1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>DNA Kênh & Ý Tưởng</span>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-2 ${
              step === 2 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Chọn Hook Triệu View</span>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-2 ${
              step === 3 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Dàn Ý & Xuất Bản</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* STEP 1: Configurations */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* ACTIVE CHANNEL DNA HERO CARD */}
              <div className="p-4 bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-purple-900/10 border border-indigo-200 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl text-white shadow-md shadow-indigo-600/30">
                      {activeChannel?.icon || '🧬'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                          DNA Kênh Đang Áp Dụng
                        </span>
                        <span className="text-xs text-zinc-400">
                          {activeChannel?.handle}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 mt-0.5">
                        {activeChannel?.name || "Kênh Mặc Định"}
                      </h3>
                      <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">
                        {activeChannel?.tagline || "Định vị nội dung"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {onOpenChannelSetup && (
                      <button
                        type="button"
                        onClick={onOpenChannelSetup}
                        className="px-3 py-1.5 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Edit3 size={13} />
                        <span>Đổi Kênh / Cấu Hình DNA</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick DNA Pills */}
                {activeChannel && (
                  <div className="mt-3 pt-3 border-t border-indigo-100/80 flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium">
                      🎯 Khán giả: {activeChannel.targetAudience?.slice(0, 38)}...
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                      🎙️ Persona: {activeChannel.creatorPersona?.slice(0, 35)}...
                    </span>
                    {activeChannel.bannedWords && activeChannel.bannedWords.length > 0 && (
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        <ShieldAlert size={12} />
                        Cấm {activeChannel.bannedWords.length} từ sáo rỗng
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Topic Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    1. Ý tưởng video bạn muốn AI viết kịch bản *
                  </label>
                  {onOpenIdeaBrainstorm && (
                    <button
                      type="button"
                      onClick={onOpenIdeaBrainstorm}
                      className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs animate-pulse"
                    >
                      <Lightbulb size={13} className="text-amber-600" />
                      <span>Bí ý tưởng? Nhờ AI Lên Ý Tưởng Triệu View</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  placeholder={`VD: Bóc tách 3 bẫy tài chính khiến người trẻ mất trắng tiền lương trong năm 2026...`}
                  className="w-full p-3.5 border border-zinc-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  2. Tiêu đề dự kiến (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Để trống nếu muốn AI tự đặt tiêu đề hấp dẫn..."
                  className="w-full p-3.5 border border-zinc-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  3. Nền tảng phát hành
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {(Object.keys(PLATFORM_LABELS) as PlatformType[]).map((p) => {
                    const isSelected = platform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePlatformChange(p)}
                        className={`p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20 font-bold'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between mb-1">
                          <span className="capitalize">{p.replace('_', ' ')}</span>
                          {isSelected && <CheckCircle2 size={14} className="text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{PLATFORM_LABELS[p]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Category & Tone of Voice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Lĩnh Vực Chủ Đề
                  </label>
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value as TopicCategory)}
                    className="w-full p-3 bg-white border border-zinc-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Phong cách / Tone Giọng
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ToneOfVoice)}
                    className="w-full p-3 bg-white border border-zinc-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {Object.entries(TONE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Thời Lượng Mục Tiêu
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="VD: 60s hoặc 8m - 10m"
                    className="w-full p-3 border border-zinc-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Viral Hook */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <Flame className="text-amber-500" size={16} />
                    Chọn 1 Hook Mở Đầu Giữ Chân Người Xem (3 Giây Đầu)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Hook được tính toán bám sát tâm lý khán giả và quy chuẩn mở đầu của kênh {activeChannel?.name || ""}
                  </p>
                </div>
              </div>

              {loadingHooks ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-xs font-medium text-zinc-600">
                    AI Đang Quét DNA Kênh & Sáng Tạo 5 Góc Tiếp Cận Triệu View...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hooks.map((h) => {
                    const isSelected = selectedHook === h.hookText;
                    return (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHook(h.hookText)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                            {h.type}
                          </span>
                          {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                        </div>
                        <p className="text-sm font-bold text-zinc-900 mb-1">
                          "{h.hookText}"
                        </p>
                        <p className="text-xs text-zinc-500 italic">
                          💡 Tại sao hiệu quả: {h.whyItWorks}
                        </p>
                      </div>
                    );
                  })}

                  {/* Custom Hook Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-zinc-600 mb-1">
                      Hoặc tự viết câu Hook theo ý bạn:
                    </label>
                    <input
                      type="text"
                      value={selectedHook}
                      onChange={(e) => setSelectedHook(e.target.value)}
                      placeholder="Nhập câu mở đầu của riêng bạn..."
                      className="w-full p-3 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Outline Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Layers className="text-indigo-600" size={16} />
                  Dàn Ý Phân Đoạn (Beat Sheet) Theo Dòng Chảy Cảm Xúc
                </h3>
                <p className="text-xs text-zinc-500">
                  Kiểm tra cấu trúc kịch bản trước khi AI viết trọn vẹn toàn bộ lời thoại và hình ảnh
                </p>
              </div>

              {loadingOutline ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-xs font-medium text-zinc-600">
                    AI Đang Xây Dựng Dàn Bài Chuẩn Hollywood & Tối Ưu Từng Giây Giữ Chân...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outlineBeats.map((beat, idx) => (
                    <div key={beat.id || idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded-md text-[10px] font-bold">
                            {beat.timeCode}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900">{beat.title}</h4>
                        </div>
                      </div>
                      <ul className="text-xs text-zinc-600 list-disc list-inside space-y-1 mb-2">
                        {beat.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-zinc-500 bg-white p-2 rounded-xl border border-zinc-100">
                        🎬 <strong>Ý tưởng hình ảnh:</strong> {beat.visualIdea}
                      </p>
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-zinc-600 mb-1">
                      Chỉ dẫn bổ sung cho AI (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      placeholder="VD: Cài cắm câu cửa miệng của kênh, nhịp nói dồn dập, kêu gọi comment..."
                      className="w-full p-3 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                disabled={generatingFinal}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Quay Lại</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Hủy
            </button>

            {step === 1 && (
              <button
                type="button"
                onClick={handleProceedToHooks}
                disabled={!promptTopic.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Tiếp Tục Chọn Hook</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedToOutline}
                disabled={loadingHooks || !selectedHook}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Lập Dàn Bài Phân Cảnh</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleGenerateFinalScript}
                disabled={generatingFinal || loadingOutline}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white text-xs font-bold hover:from-amber-600 hover:to-purple-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {generatingFinal ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>AI Đang Viết Kịch Bản Toàn Diện...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Sinh Kịch Bản Hoàn Chỉnh Chuẩn DNA</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
