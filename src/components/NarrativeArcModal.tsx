import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Flame,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  Compass,
  Play,
  Film,
  Layers,
  ShieldAlert,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { ScriptData, TwoColumnShot, NarrativeArcAnalysis, NarrativeArcBeat } from '../types';
import { analyzeNarrativeArcAndPacing } from '../services/geminiService';

interface NarrativeArcModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onApplyBeatToShot?: (shotNumber: number, revisedVisual: string, revisedAudio: string) => void;
  onApplyFullRestructure?: (updatedShots: TwoColumnShot[]) => void;
}

export default function NarrativeArcModal({
  isOpen,
  onClose,
  scriptData,
  onApplyBeatToShot,
  onApplyFullRestructure
}: NarrativeArcModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NarrativeArcAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_risk' | 'pacing_issue'>('all');
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [appliedBeats, setAppliedBeats] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scriptData) {
      setErrorMessage(null);
      handleRunAnalysis();
    }
  }, [isOpen, scriptData?.id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setErrorMessage(null);

    try {
      let scriptFull = scriptData.fullTextScript || scriptData.summary || '';
      const res = await analyzeNarrativeArcAndPacing({
        title: scriptData.title || 'Dự án kịch bản',
        hook: scriptData.hook || '',
        shots: scriptData.shots || [],
        fullTextScript: scriptFull,
        platform: scriptData.platform,
        category: scriptData.topic,
        duration: scriptData.targetDuration || '60s'
      });

      setAnalysis(res);
      if (res.beats && res.beats.length > 0) {
        setSelectedBeatId(res.beats[0].id);
      }
    } catch (err: any) {
      console.error('Error analyzing narrative arc:', err);
      setErrorMessage(err.message || 'Không thể phân tích Narrative Arc. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyBeat = (beat: NarrativeArcBeat) => {
    if (!beat.shotNumber) {
      // If shotNumber is missing, try parsing from beat or index
      return;
    }

    if (onApplyBeatToShot) {
      onApplyBeatToShot(
        beat.shotNumber,
        beat.suggestedBeatImprovement.revisedVisual,
        beat.suggestedBeatImprovement.revisedAudio
      );
      setAppliedBeats(prev => ({ ...prev, [beat.id]: true }));
    }
  };

  const handleCopyBeat = (beat: NarrativeArcBeat) => {
    const textToCopy = `[CẢI TIẾN BEAT - PHÂN CẢNH #${beat.shotNumber || '1'} (${beat.timestampRange})]\n- Visual: ${beat.suggestedBeatImprovement.revisedVisual}\n- Audio: ${beat.suggestedBeatImprovement.revisedAudio}\n- Đòn bẩy tâm lý: ${beat.suggestedBeatImprovement.psychologicalLever} (${beat.suggestedBeatImprovement.expectedRetentionGain})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(beat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  // Filter beats
  const filteredBeats = (analysis?.beats || []).filter(b => {
    if (selectedFilter === 'high_risk') return b.retentionRiskScore >= 50;
    if (selectedFilter === 'pacing_issue') return b.currentPacing !== 'Good';
    return true;
  });

  // Calculate SVG curve path for tension & pacing
  const graphPoints = analysis?.pacingRhythmGraph || [];
  const svgWidth = 800;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const tensionPath = graphPoints.length > 1
    ? graphPoints.map((pt, i) => {
        const x = paddingX + (pt.timePercent / 100) * (svgWidth - paddingX * 2);
        const y = svgHeight - paddingY - (pt.tensionScore / 100) * (svgHeight - paddingY * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  const pacingPath = graphPoints.length > 1
    ? graphPoints.map((pt, i) => {
        const x = paddingX + (pt.timePercent / 100) * (svgWidth - paddingX * 2);
        const y = svgHeight - paddingY - (pt.pacingScore / 100) * (svgHeight - paddingY * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  const getLeverColor = (lever: string) => {
    switch (lever) {
      case 'Pattern Interrupt': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Open Loop': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Micro-Cliffhanger': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Stakes Escalation': return 'bg-red-100 text-red-800 border-red-300';
      case 'Dopamine Payoff': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPacingBadge = (pacing: string) => {
    switch (pacing) {
      case 'Good':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">✓ Chuẩn nhịp</span>;
      case 'Too Slow':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full">⚠️ Quá chậm / Dài dòng</span>;
      case 'Rushed':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">⚡ Quá nhanh / Thiếu lắng đọng</span>;
      default:
        return <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 font-bold text-[10px] rounded-full">Đơn điệu (Flat)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-zinc-900 via-indigo-950 to-purple-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
              <Activity size={22} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Narrative Arc & Retention Beat Optimizer</span>
                <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-mono rounded-full uppercase">
                  Pacing & Emotional Stakes AI
                </span>
              </h2>
              <p className="text-xs text-zinc-300">
                Chẩn đoán nhịp độ câu chuyện, cường độ cảm xúc và tối ưu từng Beat giữ chân khán giả
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 disabled:opacity-50"
            >
              <RefreshCw size={13} className={analyzing ? 'animate-spin' : ''} />
              <span>{analyzing ? 'Đang Chẩn Đoán...' : 'Chẩn Đoán Lại'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {analyzing && !analysis && (
            <div className="py-24 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <Activity size={24} className="text-indigo-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-800">
                  AI đang quét toàn bộ phân cảnh, tính toán cung cảm xúc & nhịp độ...
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Đo lường Tension Curves • 3-Second Drop-off • Micro-Cliffhangers • Emotional Stakes
                </p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 1. TOP SCORE CARDS & ARC DIAGNOSIS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Score 1: Overall Pacing Score */}
                <div className="md:col-span-3 bg-white p-4.5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Điểm Nhịp Độ (Pacing)
                    </span>
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Sliders size={14} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-zinc-900">{analysis.overallPacingScore}</span>
                    <span className="text-zinc-400 text-sm font-bold">/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${analysis.overallPacingScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Nhịp độ chuyển cảnh & thông tin dẫn dắt</p>
                </div>

                {/* Score 2: Emotional Stakes Score */}
                <div className="md:col-span-3 bg-white p-4.5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Cường Độ Cảm Xúc (Stakes)
                    </span>
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                      <Flame size={14} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-rose-600">{analysis.emotionalStakesScore}</span>
                    <span className="text-zinc-400 text-sm font-bold">/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${analysis.emotionalStakesScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Mức độ đặt cược & kịch tính cuốn hút</p>
                </div>

                {/* Score 3: Predicted Retention Score */}
                <div className="md:col-span-3 bg-white p-4.5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Dự Đoán Tỷ Lệ Giữ Chân
                    </span>
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <TrendingUp size={14} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-emerald-600">{analysis.predictedRetentionScore}%</span>
                    <span className="text-zinc-400 text-xs font-bold">Completion</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${analysis.predictedRetentionScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Tỷ lệ khán giả xem đến cuối video</p>
                </div>

                {/* Shape Diagnosis Banner */}
                <div className="md:col-span-3 bg-gradient-to-br from-indigo-900 to-purple-950 text-white p-4.5 rounded-3xl shadow-md flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                      Hình Thái Cốt Truyện:
                    </span>
                    <h3 className="font-bold text-sm text-cyan-200 mt-1">
                      {analysis.arcShapeDiagnosis}
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug line-clamp-3">
                    {analysis.storyArcSummary}
                  </p>
                </div>

              </div>

              {/* 2. DYNAMIC PACING & TENSION RHYTHM GRAPH */}
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Activity size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                        Biểu Đồ Cung Cảm Xúc & Nhịp Độ Theo Dòng Thời Gian (Tension & Pacing Curve)
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Đường biểu diễn mức độ căng thẳng/hào hứng qua từng mốc thời gian của kịch bản
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <span className="w-3 h-1 bg-indigo-600 rounded-full inline-block" />
                      Cường Độ Cảm Xúc (Tension)
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-500">
                      <span className="w-3 h-1 bg-blue-400 rounded-full inline-block" />
                      Tốc Độ Nhịp Điệu (Pacing)
                    </span>
                  </div>
                </div>

                {/* SVG Graph */}
                <div className="w-full bg-zinc-950 rounded-2xl p-4 relative overflow-hidden border border-zinc-800">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-20">
                    <div className="border-b border-zinc-600" />
                    <div className="border-b border-zinc-600" />
                    <div className="border-b border-zinc-600" />
                    <div className="border-b border-zinc-600" />
                  </div>

                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-40 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="tensionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    {graphPoints.length > 1 && (
                      <path
                        d={`${tensionPath} L ${paddingX + (graphPoints[graphPoints.length - 1].timePercent / 100) * (svgWidth - paddingX * 2)} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`}
                        fill="url(#tensionGrad)"
                      />
                    )}

                    {/* Pacing line */}
                    {pacingPath && (
                      <path
                        d={pacingPath}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Tension line */}
                    {tensionPath && (
                      <path
                        d={tensionPath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Data Points */}
                    {graphPoints.map((pt, i) => {
                      const cx = paddingX + (pt.timePercent / 100) * (svgWidth - paddingX * 2);
                      const cy = svgHeight - paddingY - (pt.tensionScore / 100) * (svgHeight - paddingY * 2);
                      return (
                        <g key={i} className="cursor-pointer group">
                          <circle
                            cx={cx}
                            cy={cy}
                            r="5"
                            className="fill-indigo-400 stroke-zinc-950 stroke-2 group-hover:r-7 transition-all"
                          />
                          <text
                            x={cx}
                            y={cy - 10}
                            textAnchor="middle"
                            className="fill-zinc-300 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {pt.beatTitle} ({pt.tensionScore}đ)
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* X-Axis labels */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                    <span>0:00 (Hook 3s)</span>
                    <span>25% (Mở Vòng Lặp)</span>
                    <span>50% (Đẩy Cao Xung Đột)</span>
                    <span>75% (Cao Trào / Twist)</span>
                    <span>100% (CTA / Kết thúc)</span>
                  </div>
                </div>
              </div>

              {/* 3. 3-SECOND RULE & KEY DROP-OFF AUDIT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 3-Second Rule Audit */}
                <div className={`p-4.5 rounded-3xl border space-y-2.5 ${
                  analysis.threeSecondRuleAudit.passed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-800">
                      <Zap size={15} className={analysis.threeSecondRuleAudit.passed ? 'text-emerald-600 fill-emerald-600' : 'text-amber-600 fill-amber-600'} />
                      <span>Kiểm Toán 3 Giây Vàng Đầu Tiên (First 3s Rule)</span>
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      analysis.threeSecondRuleAudit.passed
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {analysis.threeSecondRuleAudit.passed ? '✓ Đạt Chuẩn Giữ Chân' : '⚠️ Cần Cải Thiện Gấp'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-800 font-medium">
                    {analysis.threeSecondRuleAudit.assessment}
                  </p>

                  <div className="p-2.5 bg-white/80 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-700">
                    💡 <strong>Gợi ý khắc phục:</strong> {analysis.threeSecondRuleAudit.fixSuggestion}
                  </div>
                </div>

                {/* Key Retention Drop-off Risks */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-4.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={15} className="text-rose-600" />
                      <span>Các Điểm Nghẽn Dễ Mất Khán Giả (Drop-Off Risks)</span>
                    </span>
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                      {analysis.keyRetentionRisks.length} Vị Trí
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {analysis.keyRetentionRisks.map((risk, i) => (
                      <li key={i} className="text-xs text-rose-900 flex items-start gap-2 bg-white/70 p-2 rounded-xl border border-rose-100">
                        <span className="text-rose-500 font-bold mt-0.5">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 4. BEAT-BY-BEAT RETENTION IMPROVEMENT STUDIO */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Layers size={16} className="text-indigo-600" />
                      <span>Chi Tiết Từng Beat & Gợi Ý Cải Tiến Tăng Giữ Chân</span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Xem chẩn đoán chi tiết và áp dụng 1-click vào kịch bản đang soạn
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center bg-zinc-200/80 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Tất Cả ({analysis.beats.length})
                    </button>
                    <button
                      onClick={() => setSelectedFilter('high_risk')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFilter === 'high_risk' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Điểm Rủi Ro Cao
                    </button>
                    <button
                      onClick={() => setSelectedFilter('pacing_issue')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFilter === 'pacing_issue' ? 'bg-white text-amber-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Lỗi Nhịp Độ
                    </button>
                  </div>
                </div>

                {/* Beats Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredBeats.map((beat) => {
                    const isApplied = appliedBeats[beat.id];
                    return (
                      <div
                        key={beat.id}
                        className="bg-white rounded-3xl border border-zinc-200 hover:border-indigo-300 p-5 space-y-4 transition-all shadow-xs hover:shadow-md"
                      >
                        {/* Beat Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-zinc-900 text-white font-bold text-xs rounded-xl">
                              Shot #{beat.shotNumber || '1'}
                            </span>
                            <h4 className="font-bold text-sm text-zinc-900">
                              {beat.beatName}
                            </h4>
                            <span className="text-xs font-mono text-zinc-400">
                              ({beat.timestampRange})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getPacingBadge(beat.currentPacing)}
                            
                            {/* Retention Risk Tag */}
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              beat.retentionRiskScore >= 50
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              Rủi ro rớt xem: {beat.retentionRiskScore}%
                            </span>

                            {/* Psychological Lever Tag */}
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getLeverColor(beat.suggestedBeatImprovement.psychologicalLever)}`}>
                              ✨ {beat.suggestedBeatImprovement.psychologicalLever}
                            </span>
                          </div>
                        </div>

                        {/* Current State vs AI Improvement */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          
                          {/* Left: What happens now & Diagnosis */}
                          <div className="lg:col-span-5 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Diễn biến hiện tại:
                              </span>
                              <p className="text-zinc-800 font-medium mt-0.5 line-clamp-3">
                                {beat.whatHappensNow}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-zinc-200">
                              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                                Chẩn đoán điểm yếu:
                              </span>
                              <p className="text-zinc-600 italic mt-0.5">
                                {beat.critiqueAndDiagnosis}
                              </p>
                            </div>
                          </div>

                          {/* Right: Suggested Fix & Rewrite */}
                          <div className="lg:col-span-7 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                <Zap size={14} className="text-indigo-600" />
                                <span>Giải Pháp Cải Tiến & Viết Lại</span>
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                                {beat.suggestedBeatImprovement.expectedRetentionGain}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-800 font-medium">
                              <strong>Hành động:</strong> {beat.suggestedBeatImprovement.actionableFix}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 space-y-1">
                                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Thị giác mới (Visual):</span>
                                <p className="text-zinc-800 text-[11px] leading-relaxed">
                                  {beat.suggestedBeatImprovement.revisedVisual}
                                </p>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 space-y-1">
                                <span className="text-[10px] font-bold text-purple-700 uppercase block">Lời thoại mới (Audio):</span>
                                <p className="text-zinc-800 text-[11px] leading-relaxed">
                                  {beat.suggestedBeatImprovement.revisedAudio}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleCopyBeat(beat)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                {copiedId === beat.id ? (
                                  <>
                                    <Check size={13} className="text-emerald-600" />
                                    <span className="text-emerald-600">Đã Sao Chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Sao Chép Beat</span>
                                  </>
                                )}
                              </button>

                              {onApplyBeatToShot && beat.shotNumber && (
                                <button
                                  onClick={() => handleApplyBeat(beat)}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                                    isApplied
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                >
                                  {isApplied ? (
                                    <>
                                      <CheckCircle2 size={14} />
                                      <span>Đã Cập Nhật Vào Shot #{beat.shotNumber}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check size={14} />
                                      <span>Áp Dụng Vào Shot #{beat.shotNumber}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. MASTER RESTRUCTURE PLAN */}
              <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Compass size={16} className="text-cyan-300" />
                  <span>Kế Hoạch Tái Cấu Trúc Tổng Thể (Director Blueprint)</span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-line">
                  {analysis.recommendedRestructurePlan}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-200">
          <div className="text-xs text-zinc-500">
            <span>Powered by <strong>Gemini 3.7 Flash</strong> Narrative & Pacing AI</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>
  );
}
