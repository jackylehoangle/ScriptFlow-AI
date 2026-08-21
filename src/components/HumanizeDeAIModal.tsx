import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Sliders,
  Eye,
  FileText,
  AlertTriangle,
  RotateCcw,
  Layers,
  Percent,
  Activity,
  UserCheck,
  TrendingDown,
  TrendingUp,
  SplitSquareVertical,
  Volume2
} from 'lucide-react';
import { 
  ScriptData, 
  TwoColumnShot, 
  HumanizeScriptResult, 
  HumanizePersonaPreset,
  StylePersona 
} from '../types';
import { 
  humanizeScriptText, 
  PERSONA_LABELS 
} from '../services/geminiService';
import { getAllPersonas } from '../data/personaLibrary';

interface HumanizeDeAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onApplyHumanizedText: (newFullText: string, updatedShots?: TwoColumnShot[]) => void;
}

export default function HumanizeDeAIModal({
  isOpen,
  onClose,
  scriptData,
  onApplyHumanizedText
}: HumanizeDeAIModalProps) {
  // Input source: 'master_script' | 'shots_text' | 'custom'
  const [sourceType, setSourceType] = useState<'master_script' | 'shots_text' | 'custom'>('master_script');
  const [customInputText, setCustomInputText] = useState('');
  
  // Settings
  const [selectedPersona, setSelectedPersona] = useState<HumanizePersonaPreset>('deep_essayist');
  const [intensity, setIntensity] = useState<'natural' | 'aggressive' | 'cinematic'>('aggressive');
  const [targetAudience, setTargetAudience] = useState('Khán giả yêu thích chiều sâu, ghét văn mẫu máy móc');
  const [allPersonas, setAllPersonas] = useState<StylePersona[]>([]);

  // Loading & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [humanizeResult, setHumanizeResult] = useState<HumanizeScriptResult | null>(null);
  const [editedOutputText, setEditedOutputText] = useState('');
  const [activeTab, setActiveTab] = useState<'side_by_side' | 'transformations' | 'metrics'>('side_by_side');
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derive initial input text based on source
  const getSourceText = () => {
    if (sourceType === 'master_script') {
      if (scriptData.fullTextScript && scriptData.fullTextScript.trim().length > 0) {
        return scriptData.fullTextScript;
      }
      if (scriptData.shots && scriptData.shots.length > 0) {
        return scriptData.shots.map(s => s.audio).join('\n\n');
      }
      return scriptData.summary || '';
    }
    if (sourceType === 'shots_text') {
      return (scriptData.shots || []).map((s, idx) => `[Shot ${s.shotNumber || idx + 1}] ${s.audio}`).join('\n\n');
    }
    return customInputText;
  };

  useEffect(() => {
    if (isOpen) {
      setCustomInputText(getSourceText());
      setAppliedSuccess(false);
      setErrorMessage(null);
      setAllPersonas(getAllPersonas());
    }
  }, [isOpen, sourceType, scriptData?.id]);

  useEffect(() => {
    if (humanizeResult) {
      setEditedOutputText(humanizeResult.humanizedContent);
    }
  }, [humanizeResult]);

  if (!isOpen) return null;

  const currentInput = sourceType === 'custom' ? customInputText : getSourceText();

  // Run Humanize Engine
  const handleExecuteHumanize = async () => {
    if (!currentInput.trim()) {
      setErrorMessage('Vui lòng cung cấp văn bản kịch bản cần khử AI.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Find matching persona in allPersonas or fallback to default
      const matchedPersona = allPersonas.find(p => p.id === selectedPersona);
      const tonePrompt = matchedPersona
        ? `${matchedPersona.name}: ${matchedPersona.coreDescription}. Cadence: ${matchedPersona.cadenceAndPacing}. Catchphrases: ${matchedPersona.catchphrasesOrTransitions.join(', ')}`
        : (PERSONA_LABELS[selectedPersona]?.desc || 'Tự nhiên, sắc sảo, không sáo rỗng');

      const res = await humanizeScriptText({
        text: currentInput,
        toneStyle: tonePrompt,
        persona: selectedPersona,
        intensity: intensity,
        targetAudience: matchedPersona?.tagline || targetAudience
      });

      setHumanizeResult(res);
      setEditedOutputText(res.humanizedContent);
    } catch (err: any) {
      console.error('Humanize error:', err);
      setErrorMessage(err.message || 'Lỗi trong quá trình khử văn mẫu AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply to Script
  const handleApply = () => {
    if (!editedOutputText.trim()) return;

    // Optional: If shots exist, rewrite shot audio in proportion
    let updatedShots: TwoColumnShot[] | undefined = undefined;
    if (scriptData.shots && scriptData.shots.length > 0) {
      const paragraphs = editedOutputText.split(/\n\n+/).filter(Boolean);
      if (paragraphs.length >= scriptData.shots.length) {
        updatedShots = scriptData.shots.map((s, idx) => ({
          ...s,
          audio: paragraphs[idx] || s.audio
        }));
      }
    }

    onApplyHumanizedText(editedOutputText, updatedShots);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-400 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  De-AI & Humanizer Engine
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono rounded-full font-bold">
                  Zero AI Cliché • 100% Khẩu Ngữ Người Thật
                </span>
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] rounded-full font-semibold">
                  Burstiness Booster
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Quét sạch từ nối máy móc, gia tăng nhịp thở tự nhiên, chi tiết thị giác và cảm xúc thực
              </p>
            </div>
          </div>

          {/* Top Actions & Close */}
          <div className="flex items-center gap-3">
            {humanizeResult && (
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                {appliedSuccess ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Đã Đồng Bộ Vào Kịch Bản!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Áp Dụng Văn Bản Người Thật</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/60">

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Configuration & Persona Selector Card */}
          <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Chọn Persona Giọng Điệu & Cấp Độ Khử AI
                </h3>
              </div>

              {/* Source selector */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-700">
                <button
                  onClick={() => setSourceType('master_script')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    sourceType === 'master_script' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'
                  }`}
                >
                  Toàn bộ Master Script
                </button>
                <button
                  onClick={() => setSourceType('shots_text')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    sourceType === 'shots_text' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'
                  }`}
                >
                  Lời thoại 2 Cột
                </button>
                <button
                  onClick={() => setSourceType('custom')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    sourceType === 'custom' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'
                  }`}
                >
                  Nhập văn bản tùy ý
                </button>
              </div>
            </div>

            {/* Persona Grid (Core 6) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(Object.keys(PERSONA_LABELS) as HumanizePersonaPreset[]).map((key) => {
                const item = PERSONA_LABELS[key];
                const isSelected = selectedPersona === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPersona(key)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                        : 'bg-zinc-50/60 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{item.icon}</span>
                      {isSelected && <CheckCircle2 size={13} className="text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-950' : 'text-zinc-800'}`}>
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Extended Curated & Custom Domain Personas Selector */}
            {allPersonas.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                  <span className="text-indigo-600 font-bold">🌟 Hoặc chọn Persona Chuyên Sâu:</span>
                </div>
                <div className="flex-1 max-w-md">
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="" disabled>-- Chọn Creator & Đạo Diễn Độc Bản --</option>
                    {allPersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name} ({p.archetypeReference})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Intensity & Execution Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-100">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700">Mức độ khử AI:</span>
                  <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => setIntensity('natural')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        intensity === 'natural' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-zinc-600'
                      }`}
                    >
                      Gọt Giũa Tự Nhiên
                    </button>
                    <button
                      onClick={() => setIntensity('aggressive')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        intensity === 'aggressive' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-zinc-600'
                      }`}
                    >
                      Triệt Để (Khuyên dùng)
                    </button>
                    <button
                      onClick={() => setIntensity('cinematic')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        intensity === 'cinematic' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-zinc-600'
                      }`}
                    >
                      Điện Ảnh & Giác Quan
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecuteHumanize}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Sparkles size={15} className={isProcessing ? 'animate-spin' : ''} />
                <span>{isProcessing ? 'Đang Khử Dấu Vết AI & Viết Lại...' : 'Quét & Khử Văn Mẫu AI Ngay'}</span>
              </button>
            </div>
          </div>

          {/* Processing Loading Card */}
          {isProcessing && (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-zinc-200 shadow-xs">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900">
                  Gemini 3.7 Flash đang giải phẫu ngôn từ và loại bỏ 100% cấu trúc máy móc...
                </h4>
                <p className="text-xs text-zinc-500 font-mono">
                  Tăng tính biến thiên độ dài câu • Nhúng chi tiết cảm giác • Xóa bỏ từ nối công thức
                </p>
              </div>
            </div>
          )}

          {/* Humanize Results Dashboard */}
          {humanizeResult && !isProcessing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Metrics & Probability Comparison Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* AI Probability Drop */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Xác Suất Văn Phong AI
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs line-through text-rose-500 font-mono">{humanizeResult.aiProbabilityBefore}%</span>
                      <ArrowRight size={12} className="text-zinc-400" />
                      <span className="text-2xl font-black text-emerald-600 font-mono">{humanizeResult.aiProbabilityAfter}%</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <TrendingDown size={20} />
                  </div>
                </div>

                {/* Burstiness / Rhythm Score */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Độ Tự Nhiên Nhịp Điệu (Burstiness)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs line-through text-zinc-400 font-mono">{humanizeResult.burstinessBefore}/100</span>
                      <ArrowRight size={12} className="text-zinc-400" />
                      <span className="text-2xl font-black text-indigo-600 font-mono">{humanizeResult.burstinessAfter}/100</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                    <Activity size={20} />
                  </div>
                </div>

                {/* Cliches Purged */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Cụm Từ Sáo Rỗng Đã Diệt
                    </span>
                    <span className="text-2xl font-black text-rose-600 font-mono">
                      {humanizeResult.clichesRemoved.length} Cụm Từ
                    </span>
                  </div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    <Flame size={20} />
                  </div>
                </div>

                {/* Readability & Polish Grade */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Độ Trôi Chảy & Hút View
                    </span>
                    <span className="text-sm font-bold text-teal-900 line-clamp-1">
                      {humanizeResult.readabilityGrade}
                    </span>
                  </div>
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>

              {/* Highlight Badges (Purged Cliches & Sensory Added) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                
                {/* Clichés Purged */}
                <div className="bg-rose-50/70 p-4 rounded-3xl border border-rose-200/80 space-y-2">
                  <span className="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
                    <Flame size={14} className="text-rose-600" />
                    <span>Các từ ngữ/câu sáo rỗng AI đã xóa bỏ:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {humanizeResult.clichesRemoved.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-rose-800 border border-rose-200 rounded-lg line-through text-[11px] font-medium shadow-2xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sensory Anchors Added */}
                <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200/80 space-y-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Chi tiết cảm giác & hình ảnh thực đã thêm vào:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {humanizeResult.sensoryDetailsAdded.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-medium shadow-2xs">
                        ✨ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-zinc-200/70 p-1 rounded-2xl text-xs font-bold w-fit">
                <button
                  onClick={() => setActiveTab('side_by_side')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'side_by_side'
                      ? 'bg-white text-emerald-900 shadow-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <SplitSquareVertical size={14} />
                  <span>So Sánh Song Song & Trình Biên Tập</span>
                </button>

                <button
                  onClick={() => setActiveTab('transformations')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'transformations'
                      ? 'bg-white text-emerald-900 shadow-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Eye size={14} />
                  <span>Mổ Xẻ Từng Câu Biến Đổi ({humanizeResult.sentenceTransformations.length})</span>
                </button>
              </div>

              {/* Tab 1: Side-by-Side Comparison & Editor */}
              {activeTab === 'side_by_side' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Left: Original Script */}
                  <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <h4 className="text-xs font-bold text-zinc-800">
                          Văn Bản Ban Đầu (Nhiều dấu vết AI)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {currentInput.split(/\s+/).filter(Boolean).length} từ
                      </span>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-serif leading-relaxed text-zinc-600 max-h-[380px] overflow-y-auto whitespace-pre-wrap">
                      {currentInput}
                    </div>
                  </div>

                  {/* Right: Humanized Script */}
                  <div className="bg-white p-5 rounded-3xl border border-emerald-300 ring-2 ring-emerald-500/10 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                          <span>Văn Bản Người Thật 100% ({PERSONA_LABELS[selectedPersona]?.label})</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      value={editedOutputText}
                      onChange={(e) => setEditedOutputText(e.target.value)}
                      className="w-full p-4 bg-emerald-50/20 border border-emerald-200 rounded-2xl text-xs font-serif leading-relaxed text-zinc-900 focus:outline-emerald-500 shadow-inner"
                    />
                  </div>

                </div>
              )}

              {/* Tab 2: Sentence-by-Sentence Transformation Deep-Dive */}
              {activeTab === 'transformations' && (
                <div className="space-y-3">
                  {humanizeResult.sentenceTransformations.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-3 text-xs">
                      
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <span className="font-bold text-zinc-800">Ví Dụ #{idx + 1}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded-full">
                          💡 {item.humanTouchApplied}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase block">Trước (Văn Mẫu AI):</span>
                          <p className="text-rose-950 font-serif leading-snug">"{item.original}"</p>
                        </div>

                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Sau (Nhân Bản Hóa):</span>
                          <p className="text-emerald-950 font-serif font-medium leading-snug">"{item.rewritten}"</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Initial Empty State Preview */}
          {!humanizeResult && !isProcessing && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <FileText size={15} className="text-emerald-600" />
                  <span>Nội dung kịch bản chuẩn bị quét và khử AI:</span>
                </label>
                <span className="text-[11px] font-mono text-zinc-400">
                  {currentInput.split(/\s+/).filter(Boolean).length} từ
                </span>
              </div>

              {sourceType === 'custom' ? (
                <textarea
                  rows={10}
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  placeholder="Dán bất kỳ đoạn kịch bản hoặc lời thoại nào bạn muốn khử AI vào đây..."
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-serif leading-relaxed text-zinc-900 focus:outline-emerald-500 shadow-inner"
                />
              ) : (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-serif leading-relaxed text-zinc-700 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {currentInput || 'Chưa có nội dung kịch bản trong dự án. Bạn có thể chọn "Nhập văn bản tùy ý" ở trên để dán vào.'}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
