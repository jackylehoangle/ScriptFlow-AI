import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Flame,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Award,
  BarChart2,
  Lightbulb,
  CheckCircle2,
  Hash,
  Share2,
  Sliders
} from 'lucide-react';
import { ScriptData, CTRAnalysisReport } from '../types';
import { analyzeCTRAndOptimizeTitle } from '../services/geminiService';

interface CTRPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onApplyTitle: (newTitle: string) => void;
  onApplyHook?: (newHook: string) => void;
}

export default function CTRPredictorModal({
  isOpen,
  onClose,
  scriptData,
  onApplyTitle,
  onApplyHook
}: CTRPredictorModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<CTRAnalysisReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable fields for what-if testing
  const [testTitle, setTestTitle] = useState<string>('');
  const [testHook, setTestHook] = useState<string>('');

  useEffect(() => {
    if (isOpen && scriptData) {
      setTestTitle(scriptData.title || '');
      setTestHook(scriptData.hook || '');
      setErrorMessage(null);
      // Auto run analysis on open if not yet analyzed or if title changed
      handleRunAnalysis(scriptData.title, scriptData.hook);
    }
  }, [isOpen, scriptData?.title, scriptData?.hook]);

  const handleRunAnalysis = async (titleOverride?: string, hookOverride?: string) => {
    const titleToAnalyze = (titleOverride !== undefined ? titleOverride : testTitle).trim();
    if (!titleToAnalyze) {
      setErrorMessage('Vui lòng nhập tiêu đề cần phân tích CTR.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      // Gather script text
      let scriptFull = scriptData.fullTextScript || scriptData.summary || '';
      if (scriptData.shots && scriptData.shots.length > 0) {
        scriptFull = scriptData.shots.map(s => `Shot ${s.shotNumber}: Visual: ${s.visual || ''} | Audio: ${s.audio || ''}`).join('\n');
      }

      const res = await analyzeCTRAndOptimizeTitle({
        title: titleToAnalyze,
        currentHook: (hookOverride !== undefined ? hookOverride : testHook) || scriptData.hook,
        scriptText: scriptFull,
        platform: scriptData.platform,
        category: scriptData.topic
      });

      setReport(res);
    } catch (err: any) {
      console.error('Error analyzing CTR:', err);
      setErrorMessage(err.message || 'Không thể phân tích CTR. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyNewTitle = (title: string) => {
    onApplyTitle(title);
    setTestTitle(title);
    // Optionally trigger quick re-analysis
    handleRunAnalysis(title, testHook);
  };

  const handleApplyNewHook = (hook: string) => {
    onApplyHook?.(hook);
    setTestHook(hook);
  };

  if (!isOpen) return null;

  // Helper to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-500 text-emerald-600 border-emerald-500/20 bg-emerald-50';
    if (score >= 70) return 'from-blue-500 to-cyan-500 text-blue-600 border-blue-500/20 bg-blue-50';
    if (score >= 50) return 'from-amber-500 to-yellow-500 text-amber-600 border-amber-500/20 bg-amber-50';
    return 'from-rose-500 to-red-500 text-rose-600 border-rose-500/20 bg-rose-50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-xs border border-white/20">
              <TrendingUp size={22} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>AI CTR Predictor & Word Optimizer</span>
                <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] font-mono rounded-full">
                  Click-Through Engine
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Phân tích dự đoán tỷ lệ nhấp chuột, kiểm tra từ ngữ quyền năng & đề xuất tối ưu tiêu đề
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

        {/* Input & Quick What-If Test Bar */}
        <div className="px-6 py-3.5 bg-zinc-50 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
                placeholder="Nhập tiêu đề video cần phân tích & tối ưu hóa CTR..."
                className="w-full text-xs font-bold text-zinc-900 bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400">
                {testTitle.length} ký tự
              </span>
            </div>

            <button
              onClick={() => handleRunAnalysis()}
              disabled={analyzing || !testTitle.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              {analyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Đang Tính Toán CTR...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Phân Tích Lại</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {analyzing && !report && (
            <div className="py-20 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <TrendingUp size={24} className="text-blue-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-800">Đang quét thuật toán & dự đoán tỷ lệ nhấp CTR...</h3>
                <p className="text-xs text-zinc-500 font-mono">Đo lường Curiosity Gap • Power Words • Mobile Clarity</p>
              </div>
            </div>
          )}

          {report && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* 1. TOP STATS: OVERALL SCORE & PREDICTED CTR RANGE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Overall Score Card */}
                <div className="md:col-span-4 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white rounded-3xl p-5 border border-zinc-800 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Điểm Đánh Giá CTR
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold rounded-full">
                      {report.ratingTier}
                    </span>
                  </div>

                  <div className="my-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      {report.overallScore}
                    </span>
                    <span className="text-zinc-500 text-lg font-bold">/ 100</span>
                  </div>

                  <div className="space-y-1 border-t border-zinc-800 pt-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                      Tỷ Lệ Nhấp Dự Kiến:
                    </span>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <TrendingUp size={16} />
                      <span>{report.predictedCTRPercentage} (Cao hơn TB ngành)</span>
                    </div>
                  </div>
                </div>

                {/* Summary Verdict Banner */}
                <div className="md:col-span-8 bg-blue-50/60 border border-blue-200/80 rounded-3xl p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <Lightbulb size={16} className="text-blue-600" />
                      <span>Nhận Định Tổng Thể & Cơ Hội Tăng Trưởng</span>
                    </div>
                    <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-medium">
                      {report.summaryVerdict}
                    </p>
                  </div>

                  {/* 5 Core CTR Metrics Mini Progress Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-blue-200/60">
                    {[
                      { name: 'Khoảng trống tò mò', data: report.metrics.curiosityGap },
                      { name: 'Sức mạnh cảm xúc', data: report.metrics.emotionalPower },
                      { name: 'Độ rõ & Dễ đọc', data: report.metrics.clarityAndLength },
                      { name: 'Cấp bách / FOMO', data: report.metrics.urgencyFOMO },
                      { name: 'Khớp kịch bản', data: report.metrics.relevanceMatch },
                    ].map((m, idx) => (
                      <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-zinc-600 truncate">{m.name}</span>
                          <span className="text-blue-700 font-mono">{m.data.score}/100</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${m.data.score}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5" title={m.data.feedback}>
                          {m.data.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 2. POWER WORDS & WEAK WORDS AUDIT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Found Power Words */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                      <Zap size={15} className="text-emerald-600 fill-emerald-600" />
                      <span>Từ Ngữ Quyền Năng Đã Tìm Thấy (Power Words)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {report.powerWordAudits.foundPowerWords.length} Từ
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {report.powerWordAudits.foundPowerWords.length > 0 ? (
                      report.powerWordAudits.foundPowerWords.map((pw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg shadow-2xs"
                        >
                          ✨ {pw}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">
                        Chưa phát hiện từ ngữ kích thích mạnh. Hãy thêm các từ như "Bí mật", "Sốc", "Sai lầm", "Ngay lập tức".
                      </p>
                    )}
                  </div>
                </div>

                {/* Weak Words & Replacements */}
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
                    {report.powerWordAudits.weakWordsToReplace.length > 0 ? (
                      report.powerWordAudits.weakWordsToReplace.map((w, i) => (
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
                      <p className="text-xs text-emerald-700 font-medium">
                        ✓ Từ ngữ trong tiêu đề đã được tối ưu rất tốt!
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* 3. 5 HIGH-CTR TITLE OPTIMIZATIONS (1-CLICK APPLY) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Flame size={16} className="text-rose-600" />
                      <span>5 Phiên Bản Tiêu Đề Đã Được Tối Ưu Hóa CTR</span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Chọn và áp dụng 1-click vào kịch bản để tăng lượt click ngay lập tức
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {report.titleOptimizations.map((opt, i) => (
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
                          onClick={() => handleApplyNewTitle(opt.optimizedTitle)}
                          className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                        >
                          <Check size={13} />
                          <span>Áp Dụng Tiêu Đề</span>
                        </button>

                        <button
                          onClick={() => handleCopy(opt.optimizedTitle, `title_opt_${i}`)}
                          className="p-2 bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
                          title="Sao chép tiêu đề"
                        >
                          {copiedKey === `title_opt_${i}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. SCRIPT HOOK SYNC & SEO TAGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Script Hook Synchronization */}
                <div className="bg-purple-50/60 border border-purple-200 rounded-3xl p-5 space-y-3">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-2">
                    <Zap size={15} className="text-purple-600" />
                    <span>Đồng Bộ Câu Mở Đầu (Hook Sync) Với Tiêu Đề</span>
                  </span>

                  <div className="bg-white p-3 rounded-2xl border border-purple-200 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Hook Hiện Tại:</span>
                      <p className="text-zinc-600 italic mt-0.5">"{report.scriptHookOptimizations.originalOpening || testHook || 'Chưa có'}"</p>
                    </div>

                    <div className="border-t border-zinc-100 pt-2">
                      <span className="text-[10px] text-purple-700 uppercase font-bold block">Hook Đã Tối Ưu (Khớp Tuyệt Đối Tiêu Đề):</span>
                      <p className="text-purple-950 font-bold mt-0.5 leading-relaxed">
                        "{report.scriptHookOptimizations.improvedOpening}"
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        🎯 <em>{report.scriptHookOptimizations.psychologicalImpact}</em>
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyNewHook(report.scriptHookOptimizations.improvedOpening)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Check size={13} />
                      <span>Cập Nhật Câu Hook Vào Kịch Bản</span>
                    </button>
                  </div>
                </div>

                {/* SEO Tags / Keywords */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-3">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <Hash size={15} className="text-blue-600" />
                    <span>Thẻ Tags / Từ Khóa Đề Xuất (YouTube & TikTok SEO)</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {report.recommendedTags.map((tag, i) => (
                      <span
                        key={i}
                        onClick={() => handleCopy(tag, `tag_${i}`)}
                        className="cursor-pointer px-2.5 py-1 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-300 text-zinc-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                        title="Bấm để sao chép tag"
                      >
                        <span>#{tag}</span>
                        {copiedKey === `tag_${i}` && <Check size={12} className="text-emerald-600" />}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopy(report.recommendedTags.join(', '), 'all_tags')}
                    className="py-1.5 px-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'all_tags' ? 'Đã chép toàn bộ tags!' : 'Sao chép tất cả Tags'}</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span>Powered by <strong>Gemini 3.7 Flash</strong> CTR Scoring Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Hoàn Tất
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
