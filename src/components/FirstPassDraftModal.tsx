import React, { useState, useEffect } from 'react';
import { ChannelDNA, ScriptData, AIEngineRoutingConfig } from '../types';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  Clock, 
  Video, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Loader2, 
  Dna, 
  Sliders, 
  Lightbulb, 
  MessageSquareQuote,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AVAILABLE_AI_ENGINES } from '../data/aiEnginePresets';

interface FirstPassDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newScript: ScriptData) => void;
  activeChannel: ChannelDNA;
  aiEngineRouting: AIEngineRoutingConfig;
  onOpenEngineHub?: () => void;
  initialHook?: string;
}

export default function FirstPassDraftModal({
  isOpen,
  onClose,
  onComplete,
  activeChannel,
  aiEngineRouting,
  onOpenEngineHub,
  initialHook = ''
}: FirstPassDraftModalProps) {
  const [hook, setHook] = useState(initialHook);
  const [topic, setTopic] = useState('');
  const [targetDuration, setTargetDuration] = useState(activeChannel.targetDuration || '60s');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill initial hook when opened
  useEffect(() => {
    if (isOpen) {
      if (initialHook) {
        setHook(initialHook);
      } else if (!hook && activeChannel.openingHookRule) {
        // Suggested starter template
        setHook(`Bạn có biết 99% mọi người đều hiểu sai về điều này?`);
      }
      if (activeChannel.targetDuration) {
        setTargetDuration(activeChannel.targetDuration);
      }
    }
  }, [isOpen, initialHook, activeChannel]);

  // Loading animation step progression
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (!isOpen) return null;

  const activeEngineObj = AVAILABLE_AI_ENGINES.find(e => e.id === aiEngineRouting.scriptEngine) || AVAILABLE_AI_ENGINES[0];

  const handleGenerateFirstPass = async () => {
    if (!hook.trim()) {
      setError('Vui lòng nhập hoặc chọn một câu Hook mở đầu cho video.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/script/generate-first-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hook: hook.trim(),
          topic: topic.trim() || undefined,
          channelDNA: activeChannel,
          targetDuration,
          format: activeChannel.defaultFormat || 'short',
          engineId: aiEngineRouting.scriptEngine
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Không thể tạo bản thảo đầu tiên.');
      }

      const generated = json.data;

      const newScriptData: ScriptData = {
        id: uuidv4(),
        title: generated.title || hook.slice(0, 50),
        format: activeChannel.defaultFormat || 'short',
        platform: activeChannel.primaryPlatform || 'tiktok',
        topic: topic.trim() || activeChannel.category || 'business',
        tone: activeChannel.defaultTone || 'energetic_viral',
        targetDuration: targetDuration,
        summary: generated.summary || `Bản thảo đầu tiên tạo từ Hook & DNA Kênh ${activeChannel.channelName}`,
        hook: generated.hook || hook,
        fullTextScript: generated.fullNarrativeScript || '',
        workflowStep: 'breakdown',
        shots: (generated.shots && generated.shots.length > 0)
          ? generated.shots.map((s: any, idx: number) => ({
              id: uuidv4(),
              shotNumber: idx + 1,
              timeRange: s.timeRange || `0:${(idx * 12).toString().padStart(2, '0')} - 0:${((idx + 1) * 12).toString().padStart(2, '0')}`,
              visual: s.visual || 'Mô tả hình ảnh phân cảnh',
              audio: s.audio || 'Lời thoại phân cảnh',
              onScreenText: s.onScreenText || '',
              notes: s.notes || ''
            }))
          : [
              {
                id: uuidv4(),
                shotNumber: 1,
                timeRange: '0:00 - 0:03',
                visual: 'Cận cảnh MC nói trực diện vào ống kính với biểu cảm bất ngờ',
                audio: hook,
                onScreenText: 'HOOK ⚡',
                notes: 'BGM: Drop beat dứt khoát'
              }
            ]
      };

      onComplete(newScriptData);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Đã xảy ra lỗi trong quá trình tạo bản thảo.');
    } finally {
      setLoading(false);
    }
  };

  const sampleHooks = [
    `99% mọi người đang lãng phí tiền vào điều này mà không hề hay biết.`,
    `Nếu bạn muốn bứt phá trong năm 2026, hãy dừng ngay 3 thói quen độc hại này!`,
    `Đây là bí mật trị giá triệu đô mà không trường học nào dạy bạn.`,
    `Sự thật tàn nhẫn về ngành này: Tại sao chỉ 1% người thành công?`
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Tạo Bản Thảo Đầu Tiên (First-Pass Draft)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase">
                  Instant Auto-Draft
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Tự động chuyển hoá Hook thành kịch bản 2 cột hoàn chỉnh bám sát 100% DNA kênh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-zinc-50/50">
          
          {/* Active Channel DNA Preview Card */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  <Dna size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase tracking-wider">
                    DNA Kênh Đang Kích Hoạt
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900">
                    {activeChannel.channelName} • {activeChannel.nicheTopic}
                  </h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                {activeChannel.creatorPersona?.toneStyle || 'Giọng điệu sắc bén'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-zinc-600">
              <div className="p-2 bg-white rounded-xl border border-indigo-100">
                <span className="text-[10px] text-zinc-400 block font-mono">Khán giả:</span>
                <span className="font-semibold text-zinc-800 truncate block">
                  {activeChannel.targetAudience?.primaryPainPoint || 'Người xem mục tiêu'}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-indigo-100">
                <span className="text-[10px] text-zinc-400 block font-mono">Câu nói đặc trưng:</span>
                <span className="font-semibold text-zinc-800 truncate block italic">
                  "{activeChannel.catchphrases?.[0] || 'Cốt lõi vấn đề'}"
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 block font-mono">Nhịp dựng:</span>
                <span className="font-semibold text-zinc-800 truncate block">
                  {activeChannel.pacingStyle?.retentionCutFrequency || '3-5s chuyển cảnh'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Engine Routing Badge */}
          <div className="p-3 bg-white rounded-2xl border border-zinc-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{activeEngineObj.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-900">Động cơ Viết Kịch Bản:</span>
                  <span className="text-xs font-bold text-indigo-600">{activeEngineObj.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${activeEngineObj.badgeColor}`}>
                    {activeEngineObj.provider}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Được điều phối tự động bởi AI Engine Hub
                </p>
              </div>
            </div>

            {onOpenEngineHub && (
              <button
                onClick={onOpenEngineHub}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <Sliders size={12} />
                <span>Đổi AI</span>
              </button>
            )}
          </div>

          {/* Hook Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500" />
                <span>Câu Hook Mở Đầu Video (Phân Cảnh 1) <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">
                3 giây đầu giữ chân khán giả
              </span>
            </label>

            <textarea
              rows={3}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Nhập câu mở đầu gây tò mò hoặc đánh trúng nỗi đau khán giả..."
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-2xs font-medium leading-relaxed"
            />

            {/* Quick Sample Hooks Carousel */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Hoặc chọn nhanh câu Hook mẫu:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {sampleHooks.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHook(sample)}
                    className="p-2 text-left bg-zinc-100/80 hover:bg-amber-50 hover:border-amber-300 border border-zinc-200 rounded-xl text-[11px] text-zinc-700 hover:text-amber-950 transition-all truncate"
                    title={sample}
                  >
                    💡 {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                Chủ Đề / Tên Video (Tùy chọn):
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: 5 sai lầm tài chính tuổi 25..."
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                Thời Lượng Mục Tiêu:
              </label>
              <select
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="30s">⚡ 30 Giây (Shorts / Reels Siêu Nhanh)</option>
                <option value="60s">🔥 60 Giây (TikTok Chuẩn Viral)</option>
                <option value="90s">✨ 90 Giây (Chi Tiết & Giữ Chân)</option>
                <option value="3m">🎬 3 - 5 Phút (Phân Tích Sâu / Mini Doc)</option>
                <option value="8m - 12m">📚 8 - 12 Phút (YouTube Dài)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Animation Card */}
          {loading && (
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-300/80 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-amber-600" />
                <span className="text-xs font-black text-amber-950">
                  {loadingStep === 0 && '1/3 Đang đọc Hồ Sơ DNA Kênh & Giọng điệu Creator...'}
                  {loadingStep === 1 && `2/3 Áp dụng động cơ ${activeEngineObj.name} viết kịch bản 5 nhịp...`}
                  {loadingStep >= 2 && '3/3 Hoàn thiện phân cảnh 2 cột (Visual, Audio sạch & B-roll)...'}
                </span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-600 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${(loadingStep + 1) * 33.3}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-100 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleGenerateFirstPass}
            disabled={loading || !hook.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang Viết Bản Thảo...</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Khởi Tạo Bản Thảo Đầu Tiên (First-Pass Draft)</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
