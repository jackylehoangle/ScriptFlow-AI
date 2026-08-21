/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChannelDNA, 
  TrendTrackerReport, 
  HotTrendKeyword, 
  TrendTitleSuggestion,
  BrainstormIdeaItem,
  TopicCategory
} from '../types';
import { trackNicheTrends, saveIdeaToBank } from '../services/geminiService';
import { 
  Flame, 
  Search, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  TrendingUp, 
  Zap, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  Loader2, 
  X, 
  RotateCw, 
  Layers, 
  Target, 
  Clock, 
  ShieldCheck, 
  Film, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Hash
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface TrendTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChannel?: ChannelDNA;
  onOpenChannelDNA?: () => void;
  onSelectIdeaForScript: (idea: BrainstormIdeaItem) => void;
  onOpenFirstPassWithIdea?: (idea: BrainstormIdeaItem) => void;
}

const CATEGORY_NAMES: Record<TopicCategory, string> = {
  finance: 'Tài Chính & Đầu Tư',
  tech: 'Công Nghệ & AI',
  business: 'Kinh Doanh & Khởi Nghiệp',
  storytelling: 'Kể Chuyện & Đời Sống',
  education: 'Giáo Dục & Kỹ Năng',
  lifestyle: 'Phong Cách Sống & Phát Triển',
  entertainment: 'Giải Trí & Xu Hướng',
  health: 'Sức Khỏe & Thể Thao',
  horror_mystery: 'Kỳ Bí & Trinh Thám',
  marketing_sales: 'Marketing & Bán Hàng'
};

export default function TrendTrackerModal({
  isOpen,
  onClose,
  activeChannel,
  onOpenChannelDNA,
  onSelectIdeaForScript,
  onOpenFirstPassWithIdea
}: TrendTrackerModalProps) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  
  const [customKeyword, setCustomKeyword] = useState<string>('');
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<TrendTrackerReport | null>(null);
  const [savedIdeaIds, setSavedIdeaIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto scan on initial open if empty
  useEffect(() => {
    if (isOpen && !report && !isLoading) {
      handleScanTrends();
    }
  }, [isOpen, activeChannel?.id]);

  const handleScanTrends = async (keywordOverride?: string) => {
    setIsLoading(true);
    setSelectedKeywordFilter(null);
    try {
      const result = await trackNicheTrends({
        channelDNA: activeChannel,
        customKeyword: keywordOverride !== undefined ? keywordOverride : customKeyword,
        timeframe: 'recent'
      });
      setReport(result);
      toastSuccess(
        `Đã quét xong Google Search! Tìm thấy ${result.hotKeywords.length} từ khóa bùng nổ và ${result.titleSuggestions.length} ý tưởng tiêu đề.`,
        'Trend Tracker'
      );
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Lỗi khi quét xu hướng Google Search', 'Lỗi Quét Trend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = async (suggestion: TrendTitleSuggestion) => {
    try {
      const ideaItem: BrainstormIdeaItem = {
        id: suggestion.id,
        channelId: activeChannel?.id,
        title: suggestion.title,
        hook: suggestion.hook,
        angle: suggestion.angle,
        framework: suggestion.framework,
        targetPainPoint: suggestion.targetPainPoint,
        viralScore: suggestion.viralScore,
        suggestedDuration: suggestion.suggestedDuration,
        keyTakeaways: suggestion.keyPoints || [],
        difficulty: 'medium',
        whyItWillWin: suggestion.whyItWillWin,
        status: 'backlog',
        isSaved: true
      };

      await saveIdeaToBank(ideaItem);
      setSavedIdeaIds(prev => new Set([...prev, suggestion.id]));
      toastSuccess(`Đã lưu "${suggestion.title}" vào Kho Ý Tưởng!`, 'Lưu Ý Tưởng');
    } catch (err: any) {
      toastError(err.message || 'Không thể lưu ý tưởng', 'Lỗi Lưu');
    }
  };

  const handleCopyTitleAndHook = (suggestion: TrendTitleSuggestion) => {
    const text = `🎬 TIÊU ĐỀ BẮT TREND: ${suggestion.title}\n⚡ HOOK 3S: ${suggestion.hook}\n🎯 GÓC TIẾP CẬN: ${suggestion.angle}\n💡 KHUNG TÂM LÝ: ${suggestion.framework}\n📊 VIRAL SCORE: ${suggestion.viralScore}/100`;
    navigator.clipboard.writeText(text);
    setCopiedId(suggestion.id);
    toastSuccess('Đã sao chép Tiêu đề & Hook vào bộ nhớ tạm!', 'Đã Sao Chép');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDraftScript = (suggestion: TrendTitleSuggestion, isFirstPass: boolean = false) => {
    const ideaItem: BrainstormIdeaItem = {
      id: suggestion.id,
      channelId: activeChannel?.id,
      title: suggestion.title,
      hook: suggestion.hook,
      angle: suggestion.angle,
      framework: suggestion.framework,
      targetPainPoint: suggestion.targetPainPoint,
      viralScore: suggestion.viralScore,
      suggestedDuration: suggestion.suggestedDuration,
      keyTakeaways: suggestion.keyPoints || [],
      difficulty: 'medium',
      whyItWillWin: suggestion.whyItWillWin
    };

    onClose();
    if (isFirstPass && onOpenFirstPassWithIdea) {
      onOpenFirstPassWithIdea(ideaItem);
    } else {
      onSelectIdeaForScript(ideaItem);
    }
  };

  const filteredTitles = useMemo(() => {
    if (!report?.titleSuggestions) return [];
    if (!selectedKeywordFilter) return report.titleSuggestions;
    return report.titleSuggestions.filter(t => 
      t.matchedKeyword.toLowerCase().includes(selectedKeywordFilter.toLowerCase()) ||
      t.title.toLowerCase().includes(selectedKeywordFilter.toLowerCase())
    );
  }, [report, selectedKeywordFilter]);

  if (!isOpen) return null;

  const currentNicheName = activeChannel?.category 
    ? (CATEGORY_NAMES[activeChannel.category] || activeChannel.category) 
    : 'Kinh doanh & Công nghệ';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-rose-50/30 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-2xl shadow-sm">
                <Flame size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                    Trend Tracker • Săn Xu Hướng Google Search
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black rounded-full shadow-xs">
                    <Globe size={11} /> Google Search Grounding
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Quét dữ liệu tìm kiếm thời gian thực theo lĩnh vực của <strong>{activeChannel?.name || 'Channel DNA'}</strong> để gợi ý góc tiếp cận triệu view
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-white/80 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Channel DNA Badge */}
          <div className="mt-3 flex items-center justify-between gap-2 p-2.5 bg-white/90 border border-orange-200/80 rounded-2xl shadow-xs text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{activeChannel?.icon || '🎬'}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900 truncate">{activeChannel?.name || 'Chưa gắn Channel DNA'}</span>
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    {currentNicheName}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">
                  Persona: {activeChannel?.creatorPersona || 'Tự nhiên, sắc bén'}
                </p>
              </div>
            </div>

            {onOpenChannelDNA && (
              <button
                onClick={() => { onClose(); onOpenChannelDNA(); }}
                className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors shrink-0"
              >
                Đổi Kênh
              </button>
            )}
          </div>
        </div>

        {/* Search & Custom Keyword Toolbar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/70 shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanTrends()}
                placeholder={`Nhập từ khóa đào sâu (VD: AI Agents, Bitcoin, Luật mới, v.v.) hoặc để trống để quét toàn ngành...`}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
              />
            </div>

            <button
              onClick={() => handleScanTrends()}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang Quét Google Search...</span>
                </>
              ) : (
                <>
                  <RotateCw size={15} />
                  <span>Quét Xu Hướng Realtime</span>
                </>
              )}
            </button>
          </div>

          {/* Preset quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-zinc-400 font-semibold shrink-0 flex items-center gap-1">
              <Hash size={12} /> Gợi ý ngách:
            </span>
            {['AI Coding & DeepSeek', 'Xu hướng Tiền tệ & Vàng', 'Chiến lược Bán hàng 2026', 'Tâm lý & Đời sống Gen Z', 'Bất động sản & Luật Mới'].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  setCustomKeyword(chip);
                  handleScanTrends(chip);
                }}
                className="px-2.5 py-1 bg-white border border-zinc-200 hover:border-orange-300 hover:bg-orange-50/50 text-zinc-600 hover:text-orange-700 rounded-lg shrink-0 transition-colors font-medium shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-orange-500 border-t-transparent animate-spin"></div>
                <Globe className="absolute inset-0 m-auto text-orange-500 animate-pulse" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Google Search Engine đang quét dữ liệu nóng...
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Đang phân tích các chủ đề thảo luận, tin tức và từ khóa bùng nổ theo DNA kênh {activeChannel?.name || ''}...
                </p>
              </div>
            </div>
          )}

          {!isLoading && report && (
            <>
              {/* 1. Grounding Queries & Sources Bar */}
              <div className="p-3.5 bg-zinc-900 text-white rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-500/20 text-blue-400 rounded-lg">
                      <Globe size={14} />
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      Dữ Liệu Google Search Đã Thu Thập
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Cập nhật: {new Date(report.fetchedAt).toLocaleTimeString('vi-VN')}
                  </span>
                </div>

                {/* Market Overview */}
                <p className="text-xs text-zinc-300 leading-relaxed font-sans border-l-2 border-orange-500 pl-2.5">
                  {report.marketOverview}
                </p>

                {/* Grounding Source Links */}
                {report.sources && report.sources.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-800 text-[11px]">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold">Nguồn tin:</span>
                    {report.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md transition-colors text-[10px]"
                      >
                        <ExternalLink size={10} />
                        <span className="max-w-[140px] truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Hot Trend Keywords Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-orange-500" />
                    Từ Khóa & Chủ Đề Đang Bùng Nổ ({report.hotKeywords.length})
                  </span>
                  {selectedKeywordFilter && (
                    <button
                      onClick={() => setSelectedKeywordFilter(null)}
                      className="text-[11px] text-orange-600 hover:text-orange-800 font-semibold"
                    >
                      Bỏ lọc ({selectedKeywordFilter}) ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.hotKeywords.map((kw) => {
                    const isSelected = selectedKeywordFilter === kw.keyword;
                    const isBreakout = kw.searchVolumeLevel.includes('Bùng nổ') || kw.searchVolumeLevel.includes('Rất cao');

                    return (
                      <div
                        key={kw.id}
                        onClick={() => setSelectedKeywordFilter(isSelected ? null : kw.keyword)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20'
                            : 'bg-white border-zinc-200/90 hover:border-orange-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black text-zinc-900 line-clamp-1">
                            #{kw.keyword}
                          </h4>
                          <span className={`px-2 py-0.2 text-[10px] font-black rounded-full shrink-0 ${
                            isBreakout
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {kw.searchVolumeLevel}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {kw.summary || kw.whyTrending}
                        </p>

                        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="truncate">🎯 {kw.targetAudienceInterest || 'Thu hút cao'}</span>
                          <span className="text-orange-600 font-bold shrink-0 ml-1">
                            {isSelected ? 'Đang lọc' : 'Lọc ý tưởng'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Viral Title Suggestions Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Gợi Ý Tiêu Đề & Hook Triệu View Bắt Trend ({filteredTitles.length})
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Được tối ưu theo Persona & Nỗi đau của {activeChannel?.name || 'Kênh'}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredTitles.map((idea) => {
                    const isSaved = savedIdeaIds.has(idea.id);

                    return (
                      <div
                        key={idea.id}
                        className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs hover:border-orange-300 transition-all space-y-3"
                      >
                        {/* Title & Viral Score Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md">
                                #{idea.matchedKeyword}
                              </span>
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-medium rounded-md">
                                {idea.framework}
                              </span>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-md flex items-center gap-1">
                                <Clock size={10} /> {idea.suggestedDuration}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-zinc-900 leading-snug">
                              {idea.title}
                            </h3>
                          </div>

                          <div className="p-2 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 text-amber-900 rounded-xl text-center shrink-0">
                            <span className="text-[10px] block font-bold uppercase text-amber-700">Viral</span>
                            <span className="text-sm font-black flex items-center justify-center gap-0.5">
                              <Flame size={12} className="text-orange-500" /> {idea.viralScore}
                            </span>
                          </div>
                        </div>

                        {/* 3-Second Hook */}
                        <div className="p-3 bg-gradient-to-r from-amber-50/60 to-orange-50/60 border-l-3 border-amber-500 rounded-r-xl text-xs">
                          <span className="font-bold text-amber-900 text-[11px] block mb-0.5 flex items-center gap-1">
                            <Zap size={12} className="text-amber-600" /> HOOK 3S ĐẦU TIÊN:
                          </span>
                          <p className="text-zinc-800 font-medium italic">
                            "{idea.hook}"
                          </p>
                        </div>

                        {/* Angle & Why it will win */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600">
                          <div className="p-2 bg-zinc-50 rounded-xl">
                            <span className="font-bold text-zinc-800 text-[11px] block">💡 Góc Nhìn Độc Bản:</span>
                            <p className="text-[11px] mt-0.5">{idea.angle}</p>
                          </div>
                          <div className="p-2 bg-zinc-50 rounded-xl">
                            <span className="font-bold text-zinc-800 text-[11px] block">🎯 Nỗi Đau Giải Quyết:</span>
                            <p className="text-[11px] mt-0.5">{idea.targetPainPoint || 'Thỏa mãn cơn khát thông tin'}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyTitleAndHook(idea)}
                              className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              {copiedId === idea.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              <span>{copiedId === idea.id ? 'Đã copy' : 'Copy'}</span>
                            </button>

                            <button
                              onClick={() => handleSaveIdea(idea)}
                              disabled={isSaved}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs ${
                                isSaved
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                              }`}
                            >
                              {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                              <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {onOpenFirstPassWithIdea && (
                              <button
                                onClick={() => handleDraftScript(idea, true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                title="Tạo Bản Thảo Tự Động Đầu Tiên từ Ý Tưởng này"
                              >
                                <Zap size={13} />
                                <span>Tạo Bản Thảo Nhanh</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDraftScript(idea, false)}
                              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                            >
                              <span>Dựng Kịch Bản</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 px-5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Google Search Grounding giúp tránh bịa đặt tin tức và bắt trúng trend nóng 24h.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-xl font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
