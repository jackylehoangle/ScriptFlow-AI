import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Flame,
  Layers,
  Image as ImageIcon,
  Check,
  Copy,
  ArrowRight,
  TrendingUp,
  Target,
  Palette,
  Eye,
  RefreshCw,
  Sliders,
  ChevronRight,
  SplitSquareVertical,
  Award,
  Film,
  BarChart2,
  AlertTriangle,
  Lightbulb,
  Hash
} from 'lucide-react';
import {
  HookAndThumbnailBundle,
  HookABVariation,
  ThumbnailCTRConcept,
  ScriptData,
  PlatformType,
  TopicCategory,
  ToneOfVoice,
  CTRAnalysisReport
} from '../types';
import { generateHookABAndThumbnails, analyzeCTRAndOptimizeTitle } from '../services/geminiService';
import { generateGeminiImagenShotImage } from '../services/imageService';

interface HookThumbnailABModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onApplyHook: (hookText: string) => void;
  onApplyTitle?: (titleText: string) => void;
}

export default function HookThumbnailABModal({
  isOpen,
  onClose,
  scriptData,
  onApplyHook,
  onApplyTitle
}: HookThumbnailABModalProps) {
  const [activeTab, setActiveTab] = useState<'hooks_ab' | 'thumbnails_ctr' | 'ctr_optimizer'>('hooks_ab');
  const [isLoading, setIsLoading] = useState(false);
  const [bundle, setBundle] = useState<HookAndThumbnailBundle | null>(null);
  const [selectedHookText, setSelectedHookText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingThumbId, setGeneratingThumbId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CTR Analysis states
  const [isAnalyzingCTR, setIsAnalyzingCTR] = useState(false);
  const [ctrReport, setCtrReport] = useState<CTRAnalysisReport | null>(null);
  const [customTestTitle, setCustomTestTitle] = useState<string>(scriptData?.title || '');

  // Custom Input tweaks if needed
  const [customTargetAudience, setCustomTargetAudience] = useState<string>('Khán giả trẻ, ưa chuộng thông tin nhanh và bổ ích');

  const handleGenerateBundle = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await generateHookABAndThumbnails({
        topic: scriptData.topic ? `${scriptData.title} - ${scriptData.summary || ''}` : scriptData.title,
        title: scriptData.title,
        category: scriptData.topic,
        platform: scriptData.platform,
        tone: scriptData.tone,
        targetAudience: customTargetAudience,
        currentScriptText: scriptData.fullTextScript || scriptData.summary || ''
      });

      setBundle(data);
    } catch (err: any) {
      console.error('Error generating Hook A/B & Thumbnails:', err);
      setErrorMessage(err.message || 'Không thể tạo bộ Hook & Thumbnail. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Image for a specific Thumbnail Concept using Gemini Imagen
  const handleGenerateThumbnailImage = async (concept: ThumbnailCTRConcept) => {
    setGeneratingThumbId(concept.id);
    try {
      const isShorts = scriptData.platform === 'tiktok' || scriptData.platform === 'youtube_shorts' || scriptData.platform === 'reels';
      const aspectRatio = isShorts ? '9:16' : '16:9';

      const res = await generateGeminiImagenShotImage({
        visualDescription: concept.visualComposition,
        customPrompt: `${concept.aiImagePrompt}, YouTube high CTR thumbnail, bold typography "${concept.overlayText}", vivid colors, 8k, master composition`,
        style: 'commercial',
        aspectRatio,
        shotNumber: 1,
        scriptTitle: concept.headlineTitle
      });

      if (bundle) {
        const updatedConcepts = bundle.thumbnailConcepts.map(c => 
          c.id === concept.id ? { ...c, generatedImageUrl: res.imageUrl } : c
        );
        setBundle({
          ...bundle,
          thumbnailConcepts: updatedConcepts
        });
      }
    } catch (err: any) {
      console.error('Error generating thumbnail image:', err);
    } finally {
      setGeneratingThumbId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAndApplyHook = (text: string) => {
    setSelectedHookText(text);
    onApplyHook(text);
    onClose();
  };

  const handleSelectAndApplyTitle = (headline: string) => {
    onApplyTitle?.(headline);
    setCustomTestTitle(headline);
  };

  const handleRunCTRAnalysis = async (titleOverride?: string) => {
    const titleToUse = (titleOverride !== undefined ? titleOverride : customTestTitle || scriptData.title).trim();
    if (!titleToUse) return;

    setIsAnalyzingCTR(true);
    setErrorMessage(null);

    try {
      let scriptFull = scriptData.fullTextScript || scriptData.summary || '';
      if (scriptData.shots && scriptData.shots.length > 0) {
        scriptFull = scriptData.shots.map(s => `Shot ${s.shotNumber}: Visual: ${s.visual || ''} | Audio: ${s.audio || ''}`).join('\n');
      }

      const res = await analyzeCTRAndOptimizeTitle({
        title: titleToUse,
        currentHook: scriptData.hook || '',
        scriptText: scriptFull,
        platform: scriptData.platform,
        category: scriptData.topic,
        targetAudience: customTargetAudience
      });

      setCtrReport(res);
    } catch (err: any) {
      console.error('Error running CTR analysis:', err);
      setErrorMessage(err.message || 'Không thể phân tích CTR.');
    } finally {
      setIsAnalyzingCTR(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-xs border border-white/20">
              <Zap size={22} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Hook A/B Test & CTR Thumbnail Studio</span>
                <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] font-mono rounded-full">
                  AI Viral Booster
                </span>
              </h2>
              <p className="text-xs text-purple-100">
                Tối ưu hóa 3 giây mở đầu giữ chân 95%+ & Bộ Thumbnail giật CTR đỉnh cao theo thuật toán 2026
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

        {/* Tab Selector & Controls */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-zinc-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('hooks_ab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hooks_ab'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <SplitSquareVertical size={14} />
              <span>Phòng Thí Nghiệm Hook A/B</span>
              {bundle && (
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] rounded-full">
                  {bundle.hookVariations.length} Cặp
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('thumbnails_ctr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'thumbnails_ctr'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ImageIcon size={14} />
              <span>Concept Thumbnail & Tiêu Đề CTR</span>
              {bundle && (
                <span className="px-1.5 py-0.2 bg-pink-100 text-pink-800 text-[10px] rounded-full">
                  {bundle.thumbnailConcepts.length} Mẫu
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('ctr_optimizer');
                if (!ctrReport && !isAnalyzingCTR) {
                  handleRunCTRAnalysis();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ctr_optimizer'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <BarChart2 size={14} className="text-blue-600" />
              <span>Dự Đoán & Tối Ưu CTR Tiêu Đề</span>
              {ctrReport && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded-full">
                  {ctrReport.overallScore}/100
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'ctr_optimizer' ? (
              <button
                onClick={() => handleRunCTRAnalysis()}
                disabled={isAnalyzingCTR}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAnalyzingCTR ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Đang Phân Tích CTR...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={14} />
                    <span>{ctrReport ? "Tính Toán Lại CTR" : "Chạy Phân Tích CTR"}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleGenerateBundle}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Đang Phân Tích & Sáng Tạo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{bundle ? "Tạo Lại Bộ Ý Tưởng Mới" : "Khởi Tạo Bộ Hook A/B & Thumbnail"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Prompt / Topic Context Banner */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Chủ Đề Phân Tích Hiện Tại:
              </span>
              <h3 className="font-bold text-zinc-900 text-sm mt-0.5">
                {scriptData.title || "Kịch bản chưa đặt tên"}
              </h3>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Nền tảng: <strong className="text-zinc-700">{scriptData.platform}</strong> • Phong cách: <strong className="text-zinc-700">{scriptData.tone}</strong>
              </p>
            </div>

            {bundle && (
              <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs max-w-md">
                <span className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
                  <Target size={12} className="text-purple-600" />
                  Target Audience Insight:
                </span>
                <p className="text-zinc-700 text-[11px] italic mt-1 leading-snug">
                  "{bundle.targetAudienceInsight}"
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* If No Bundle yet */}
          {!bundle && !isLoading && (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Flame size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-800">Sẵn Sàng Bùng Nổ Lượt Xem</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  AI sẽ áp dụng công thức Viral của MrBeast, phân tích tâm lý người xem để tạo 4 cặp Hook A/B Test so sánh và 4 Concept Thumbnail giật CTR cao nhất.
                </p>
              </div>
              <button
                onClick={handleGenerateBundle}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Khởi Tạo Ngay Bây Giờ
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-14 h-14 mx-auto">
                <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <Sparkles size={20} className="text-purple-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-800">Đang nghiên cứu tâm lý giữ chân người xem...</h4>
                <p className="text-xs text-zinc-500 font-mono">Tính toán Retention Score & CTR Rating</p>
              </div>
            </div>
          )}

          {/* TAB 1: HOOKS A/B TESTING LAB */}
          {bundle && activeTab === 'hooks_ab' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <SplitSquareVertical size={16} className="text-purple-600" />
                    <span>Bộ Thử Nghiệm Đối Đầu Hook A vs Hook B</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    So sánh trực quan 2 cách mở đầu kịch bản để tối đa hóa khả năng giữ chân trong 3 giây đầu tiên
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {bundle.hookVariations.map((pair, index) => (
                  <div
                    key={pair.id || index}
                    className="bg-zinc-50/70 border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-xs hover:border-purple-300 transition-all"
                  >
                    {/* Angle Title & Hypothesis */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg">
                          Góc tiếp cận #{index + 1}: {pair.angleName}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 italic">
                        💡 Giả thuyết A/B: {pair.testingHypothesis}
                      </div>
                    </div>

                    {/* Side by side comparison: Hook A vs Hook B */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Hook A */}
                      <div className="bg-white rounded-2xl p-4 border border-violet-200 hover:border-violet-400 transition-all flex flex-col justify-between space-y-3 relative group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                              <span>Phương Án A</span>
                            </span>

                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <TrendingUp size={11} />
                              <span>Giữ chân {pair.hookA.expectedRetentionScore}%</span>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-zinc-900 leading-relaxed bg-violet-50/40 p-3 rounded-xl border border-violet-100">
                            "{pair.hookA.text}"
                          </div>

                          <div className="text-[11px] text-zinc-600 space-y-1">
                            <div>
                              <strong className="text-zinc-700">Tâm lý:</strong> {pair.hookA.psychologicalTrigger}
                            </div>
                            <div className="text-purple-900 bg-purple-50/50 p-2 rounded-lg border border-purple-100">
                              🎬 <strong>3s Hình ảnh (Visual):</strong> {pair.hookA.visualFirst3Seconds}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                          <button
                            onClick={() => handleSelectAndApplyHook(pair.hookA.text)}
                            className="flex-1 py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                          >
                            <Check size={13} />
                            <span>Áp Dụng Hook A</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(pair.hookA.text, `hook_a_${index}`)}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
                            title="Sao chép câu hook"
                          >
                            {copiedId === `hook_a_${index}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Hook B */}
                      <div className="bg-white rounded-2xl p-4 border border-pink-200 hover:border-pink-400 transition-all flex flex-col justify-between space-y-3 relative group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-pink-100 text-pink-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                              <span>Phương Án B</span>
                            </span>

                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <TrendingUp size={11} />
                              <span>Giữ chân {pair.hookB.expectedRetentionScore}%</span>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-zinc-900 leading-relaxed bg-pink-50/40 p-3 rounded-xl border border-pink-100">
                            "{pair.hookB.text}"
                          </div>

                          <div className="text-[11px] text-zinc-600 space-y-1">
                            <div>
                              <strong className="text-zinc-700">Tâm lý:</strong> {pair.hookB.psychologicalTrigger}
                            </div>
                            <div className="text-pink-900 bg-pink-50/50 p-2 rounded-lg border border-pink-100">
                              🎬 <strong>3s Hình ảnh (Visual):</strong> {pair.hookB.visualFirst3Seconds}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                          <button
                            onClick={() => handleSelectAndApplyHook(pair.hookB.text)}
                            className="flex-1 py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                          >
                            <Check size={13} />
                            <span>Áp Dụng Hook B</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(pair.hookB.text, `hook_b_${index}`)}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
                            title="Sao chép câu hook"
                          >
                            {copiedId === `hook_b_${index}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HIGH-CTR THUMBNAIL STUDIO */}
          {bundle && activeTab === 'thumbnails_ctr' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <Flame size={16} className="text-pink-600" />
                    <span>4 Concept Thumbnail & Tiêu Đề Tối Ưu CTR (Click-Through-Rate)</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Phối màu tương phản cao, text giật tò mò, và khả năng vẽ ảnh trực tiếp bằng Gemini Imagen 3
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundle.thumbnailConcepts.map((concept, idx) => (
                  <div
                    key={concept.id || idx}
                    className="bg-zinc-900 text-white rounded-3xl p-5 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-pink-500/50 transition-all group"
                  >
                    <div className="space-y-3">
                      
                      {/* Top bar: Score and Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[11px] font-bold rounded-full">
                          Concept #{idx + 1}: {concept.conceptTitle}
                        </span>

                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <Award size={13} className="text-amber-400" />
                          <span>CTR Rating: {concept.ctrScore}/100</span>
                        </div>
                      </div>

                      {/* Catchy Headline Title */}
                      <div className="bg-zinc-800/80 p-3 rounded-2xl border border-zinc-700/80 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                          Tiêu Đề Video (YouTube/TikTok Title):
                        </span>
                        <div className="text-xs font-bold text-white flex items-center justify-between gap-2">
                          <span className="line-clamp-2">{concept.headlineTitle}</span>
                          <button
                            onClick={() => handleSelectAndApplyTitle(concept.headlineTitle)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800 shrink-0"
                            title="Chọn làm tiêu đề chính của kịch bản"
                          >
                            Dùng tiêu đề
                          </button>
                        </div>
                      </div>

                      {/* Visual Thumbnail Simulation Box */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center">
                        {concept.generatedImageUrl ? (
                          <img
                            src={concept.generatedImageUrl}
                            alt={concept.conceptTitle}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <div className="inline-block p-3 bg-zinc-800/80 rounded-2xl text-pink-400">
                              <ImageIcon size={24} />
                            </div>
                            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto line-clamp-2">
                              {concept.visualComposition}
                            </p>
                          </div>
                        )}

                        {/* Bold Overlay Text on Thumbnail Simulation */}
                        <div className="absolute bottom-3 left-3 bg-yellow-400 text-black font-black text-xs sm:text-sm uppercase px-3 py-1 rounded-md shadow-2xl tracking-wider transform -rotate-2 border-2 border-black">
                          {concept.overlayText}
                        </div>

                        {concept.badgeTitle && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded shadow-lg">
                            {concept.badgeTitle}
                          </div>
                        )}
                      </div>

                      {/* Color psychology & visual details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                          <Palette size={12} className="text-pink-400" />
                          <span><strong>Màu sắc tương phản:</strong> {concept.colorPsychology}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          <strong>Bố cục:</strong> {concept.visualComposition}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Generate image or copy prompt */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => handleGenerateThumbnailImage(concept)}
                        disabled={generatingThumbId === concept.id}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {generatingThumbId === concept.id ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Gemini Imagen đang vẽ Thumbnail...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>{concept.generatedImageUrl ? "Vẽ Lại Thumbnail" : "Vẽ Thumbnail Bằng Gemini Imagen"}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(concept.aiImagePrompt, `thumb_prompt_${idx}`)}
                        className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors"
                        title="Sao chép prompt tiếng Anh"
                      >
                        {copiedId === `thumb_prompt_${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CTR PREDICTOR & WORD OPTIMIZER */}
          {activeTab === 'ctr_optimizer' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Top search & What-if tweak bar */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customTestTitle}
                    onChange={(e) => setCustomTestTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunCTRAnalysis()}
                    placeholder="Nhập hoặc thử nghiệm tiêu đề mới để phân tích CTR..."
                    className="w-full text-xs font-bold text-zinc-900 bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400">
                    {customTestTitle.length} ký tự
                  </span>
                </div>

                <button
                  onClick={() => handleRunCTRAnalysis()}
                  disabled={isAnalyzingCTR || !customTestTitle.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isAnalyzingCTR ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang Phân Tích CTR...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Tính Toán Lại CTR</span>
                    </>
                  )}
                </button>
              </div>

              {isAnalyzingCTR && !ctrReport && (
                <div className="py-16 text-center space-y-4">
                  <div className="relative w-14 h-14 mx-auto">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    <TrendingUp size={20} className="text-blue-600 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-800">Đang quét thuật toán & dự đoán tỷ lệ nhấp CTR...</h4>
                    <p className="text-xs text-zinc-500 font-mono">Đo lường Curiosity Gap • Power Words • Mobile Clarity</p>
                  </div>
                </div>
              )}

              {ctrReport && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Score Card */}
                    <div className="md:col-span-4 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white rounded-3xl p-5 border border-zinc-800 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Điểm Đánh Giá CTR</span>
                        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold rounded-full">
                          {ctrReport.ratingTier}
                        </span>
                      </div>
                      <div className="my-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                          {ctrReport.overallScore}
                        </span>
                        <span className="text-zinc-500 text-lg font-bold">/ 100</span>
                      </div>
                      <div className="space-y-1 border-t border-zinc-800 pt-3">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Tỷ Lệ Nhấp Dự Kiến:</span>
                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                          <TrendingUp size={16} />
                          <span>{ctrReport.predictedCTRPercentage} (Cao hơn TB ngành)</span>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Banner */}
                    <div className="md:col-span-8 bg-blue-50/60 border border-blue-200/80 rounded-3xl p-5 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1.5">
                          <Lightbulb size={16} className="text-blue-600" />
                          <span>Nhận Định & Cơ Hội Tăng Trưởng Lượt Click</span>
                        </div>
                        <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-medium">
                          {ctrReport.summaryVerdict}
                        </p>
                      </div>

                      {/* 5 Core Metrics Mini Progress Bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-blue-200/60">
                        {[
                          { name: 'Khoảng trống tò mò', data: ctrReport.metrics.curiosityGap },
                          { name: 'Cường độ cảm xúc', data: ctrReport.metrics.emotionalPower },
                          { name: 'Độ rõ & Dễ đọc', data: ctrReport.metrics.clarityAndLength },
                          { name: 'Cấp bách / FOMO', data: ctrReport.metrics.urgencyFOMO },
                          { name: 'Khớp kịch bản', data: ctrReport.metrics.relevanceMatch },
                        ].map((m, idx) => (
                          <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-zinc-600 truncate">{m.name}</span>
                              <span className="text-blue-700 font-mono">{m.data.score}/100</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${m.data.score}%` }} />
                            </div>
                            <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5" title={m.data.feedback}>
                              {m.data.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Word Audit: Power Words & Weak Words */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Found Power Words */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                          <Zap size={15} className="text-emerald-600 fill-emerald-600" />
                          <span>Từ Ngữ Quyền Năng Đã Tìm Thấy (Power Words)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {ctrReport.powerWordAudits.foundPowerWords.length} Từ
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ctrReport.powerWordAudits.foundPowerWords.length > 0 ? (
                          ctrReport.powerWordAudits.foundPowerWords.map((pw, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg shadow-2xs">
                              ✨ {pw}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">Chưa phát hiện từ ngữ kích thích mạnh trong tiêu đề.</p>
                        )}
                      </div>
                    </div>

                    {/* Weak Words & Suggestions */}
                    <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-2">
                          <AlertTriangle size={15} className="text-amber-600" />
                          <span>Gợi Ý Thay Thế Từ Ngữ Mờ Nhạt</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Tối ưu chuyển đổi
                        </span>
                      </div>
                      <div className="space-y-2">
                        {ctrReport.powerWordAudits.weakWordsToReplace.length > 0 ? (
                          ctrReport.powerWordAudits.weakWordsToReplace.map((w, i) => (
                            <div key={i} className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="line-through text-red-600 font-semibold">{w.originalWord}</span>
                                <ArrowRight size={12} className="text-zinc-400" />
                                <div className="flex flex-wrap gap-1">
                                  {w.suggestedReplacements.map((s, si) => (
                                    <span key={si} className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[11px]">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-500 italic">{w.reason}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-emerald-700 font-medium">✓ Từ ngữ trong tiêu đề đã được tối ưu rất tốt!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5 Optimized Title Versions */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                        <Flame size={16} className="text-rose-600" />
                        <span>5 Phiên Bản Tiêu Đề Tối Ưu Hóa CTR (Áp Dụng 1-Click)</span>
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Chọn một trong các phiên bản dưới đây để tăng tỷ lệ nhấp chuột tự nhiên
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {ctrReport.titleOptimizations.map((opt, i) => (
                        <div
                          key={i}
                          className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-blue-300 rounded-2xl transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                                {opt.type}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                                <TrendingUp size={11} />
                                +{opt.predictedBoostPercent}% CTR
                              </span>
                            </div>
                            <h4 className="font-bold text-zinc-900 text-sm group-hover:text-blue-700 transition-colors">
                              {opt.optimizedTitle}
                            </h4>
                            <p className="text-[11px] text-zinc-600 leading-snug">
                              💡 <strong>Tại sao tốt hơn:</strong> {opt.whyBetter}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                handleSelectAndApplyTitle(opt.optimizedTitle);
                                handleRunCTRAnalysis(opt.optimizedTitle);
                              }}
                              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                            >
                              <Check size={13} />
                              <span>Áp Dụng Tiêu Đề</span>
                            </button>

                            <button
                              onClick={() => handleCopyText(opt.optimizedTitle, `title_opt_${i}`)}
                              className="p-2 bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
                              title="Sao chép tiêu đề"
                            >
                              {copiedId === `title_opt_${i}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Script Hook Synchronization & SEO Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50/60 border border-purple-200 rounded-3xl p-5 space-y-3">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-2">
                        <Zap size={15} className="text-purple-600" />
                        <span>Đồng Bộ Câu Mở Đầu (Hook) Với Tiêu Đề</span>
                      </span>
                      <div className="bg-white p-3 rounded-2xl border border-purple-200 space-y-2 text-xs">
                        <span className="text-[10px] text-purple-700 uppercase font-bold block">Hook Đã Tối Ưu:</span>
                        <p className="text-purple-950 font-bold leading-relaxed">
                          "{ctrReport.scriptHookOptimizations.improvedOpening}"
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          🎯 <em>{ctrReport.scriptHookOptimizations.psychologicalImpact}</em>
                        </p>
                        <button
                          onClick={() => handleSelectAndApplyHook(ctrReport.scriptHookOptimizations.improvedOpening)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Check size={13} />
                          <span>Cập Nhật Câu Hook Này Vào Kịch Bản</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-3">
                      <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                        <Hash size={15} className="text-blue-600" />
                        <span>Từ Khóa / Tags SEO YouTube & TikTok</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ctrReport.recommendedTags.map((tag, i) => (
                          <span
                            key={i}
                            onClick={() => handleCopyText(tag, `tag_${i}`)}
                            className="cursor-pointer px-2.5 py-1 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-300 text-zinc-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                            title="Bấm để sao chép"
                          >
                            <span>#{tag}</span>
                            {copiedId === `tag_${i}` && <Check size={12} className="text-emerald-600" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span>Áp dụng phương pháp Viral của <strong>MrBeast</strong> & AI <strong>Gemini 3.7 Flash</strong></span>
          </div>

          <div className="flex items-center gap-2">
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
