import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  FileText,
  Sliders,
  Zap,
  Wand2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  ListTree,
  Compass,
  MessageSquare,
  Volume2,
  Users,
  Cpu
} from 'lucide-react';
import { 
  ScriptData, 
  TwoColumnShot, 
  LongFormChapter, 
  LongFormScriptOutline, 
  HumanizeScriptResult,
  PlatformType,
  TopicCategory,
  ToneOfVoice,
  StylePersona
} from '../types';
import { 
  generateLongFormOutline, 
  expandChapterDeep, 
  humanizeScriptText,
  PLATFORM_LABELS,
  TOPIC_LABELS,
  TONE_LABELS
} from '../services/geminiService';
import { getAllPersonas } from '../data/personaLibrary';
import { v4 as uuidv4 } from 'uuid';

interface LongFormChapterStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onApplyFullScript?: (updatedScript: ScriptData) => void;
}

export default function LongFormChapterStudioModal({
  isOpen,
  onClose,
  scriptData,
  onApplyFullScript
}: LongFormChapterStudioModalProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'outline' | 'expand' | 'humanize' | 'full_preview'>('outline');

  // Outline Config
  const [targetDuration, setTargetDuration] = useState<string>(scriptData.targetDuration || '15m');
  const [targetAudience, setTargetAudience] = useState<string>('Khán giả yêu thích nội dung chiều sâu, tư duy phản biện');
  const [extraContext, setExtraContext] = useState<string>('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('johnny_harris_essayist');
  const [availablePersonas, setAvailablePersonas] = useState<StylePersona[]>([]);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [outline, setOutline] = useState<LongFormScriptOutline | null>(null);

  // Chapter Expansion State
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [expandingChapterId, setExpandingChapterId] = useState<string | null>(null);
  const [isExpandingAll, setIsExpandingAll] = useState(false);

  // Humanize State
  const [humanizing, setHumanizing] = useState(false);
  const [humanizeResult, setHumanizeResult] = useState<HumanizeScriptResult | null>(null);
  const [copiedChapterId, setCopiedChapterId] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize from existing script data chapters if any
  useEffect(() => {
    if (isOpen) {
      setAvailablePersonas(getAllPersonas());
      if (scriptData) {
        if (scriptData.chapters && scriptData.chapters.length > 0) {
          setOutline({
            projectTitle: scriptData.title,
            totalDurationEstimate: scriptData.targetDuration || '15 - 20 phút',
            totalTargetWords: scriptData.chapters.reduce((acc, c) => acc + (c.targetWordCount || 600), 0),
            narrativeThesis: scriptData.summary || 'Kịch bản dài chuyên sâu',
            targetAudienceProfile: 'Khán giả đại chúng',
            styleToneGuide: 'Văn phong tự nhiên, sắc sảo, không văn mẫu AI',
            chapters: scriptData.chapters
          });
          setSelectedChapterId(scriptData.chapters[0].id);
        }
      }
    }
  }, [isOpen, scriptData?.id]);

  if (!isOpen) return null;

  // Handle Generate Outline
  const handleGenerateOutline = async () => {
    setGeneratingOutline(true);
    setErrorMessage(null);

    try {
      const matchedPersona = availablePersonas.find(p => p.id === selectedPersonaId);
      const personaTonePrompt = matchedPersona
        ? `[Persona: ${matchedPersona.name} • Archetype: ${matchedPersona.archetypeReference}]. ${matchedPersona.coreDescription}. Cadence: ${matchedPersona.cadenceAndPacing}`
        : 'Chuyên sâu, sắc sảo, tự nhiên không văn mẫu AI';

      const res = await generateLongFormOutline({
        title: scriptData.title || 'Dự án kịch bản dài',
        topic: scriptData.summary || scriptData.fullTextScript || scriptData.title,
        platform: scriptData.platform || 'youtube_long',
        targetDuration: targetDuration,
        tone: scriptData.tone || 'expert_analytical',
        targetAudience: matchedPersona?.tagline || targetAudience,
        extraContext: extraContext ? `${extraContext}\nChỉ dẫn phong cách: ${personaTonePrompt}` : `Chỉ dẫn phong cách: ${personaTonePrompt}`
      });

      setOutline(res);
      if (res.chapters && res.chapters.length > 0) {
        setSelectedChapterId(res.chapters[0].id);
      }
      setActiveTab('outline');
    } catch (err: any) {
      console.error('Error generating longform outline:', err);
      setErrorMessage(err.message || 'Không thể tạo dàn bài kịch bản dài. Vui lòng thử lại.');
    } finally {
      setGeneratingOutline(false);
    }
  };

  // Handle Expand Single Chapter
  const handleExpandSingleChapter = async (chapter: LongFormChapter) => {
    if (!outline) return;
    setExpandingChapterId(chapter.id);
    setErrorMessage(null);

    try {
      const chapterIdx = outline.chapters.findIndex(c => c.id === chapter.id);
      const prevChapter = chapterIdx > 0 ? outline.chapters[chapterIdx - 1] : null;
      const nextChapter = chapterIdx < outline.chapters.length - 1 ? outline.chapters[chapterIdx + 1] : null;

      const result = await expandChapterDeep({
        projectTitle: outline.projectTitle,
        narrativeThesis: outline.narrativeThesis,
        styleToneGuide: outline.styleToneGuide,
        chapter: chapter,
        previousChapterSummary: prevChapter ? `${prevChapter.title}: ${prevChapter.coreObjective}` : undefined,
        nextChapterSummary: nextChapter ? `${nextChapter.title}: ${nextChapter.coreObjective}` : undefined
      });

      // Update chapter in outline
      const updatedChapters = outline.chapters.map(c => {
        if (c.id === chapter.id) {
          return {
            ...c,
            contentScript: result.contentScript,
            shots: result.shots,
            isExpanded: true
          };
        }
        return c;
      });

      setOutline({
        ...outline,
        chapters: updatedChapters
      });
    } catch (err: any) {
      console.error('Error expanding chapter:', err);
      setErrorMessage(err.message || `Lỗi khi viết chương #${chapter.chapterNumber}.`);
    } finally {
      setExpandingChapterId(null);
    }
  };

  // Handle Expand All Chapters Sequentially
  const handleExpandAllChapters = async () => {
    if (!outline || !outline.chapters.length) return;
    setIsExpandingAll(true);
    setErrorMessage(null);

    try {
      let currentChapters = [...outline.chapters];

      for (let i = 0; i < currentChapters.length; i++) {
        const c = currentChapters[i];
        if (c.isExpanded && c.contentScript) continue; // Skip already written

        setExpandingChapterId(c.id);
        const prevChapter = i > 0 ? currentChapters[i - 1] : null;
        const nextChapter = i < currentChapters.length - 1 ? currentChapters[i + 1] : null;

        const result = await expandChapterDeep({
          projectTitle: outline.projectTitle,
          narrativeThesis: outline.narrativeThesis,
          styleToneGuide: outline.styleToneGuide,
          chapter: c,
          previousChapterSummary: prevChapter ? `${prevChapter.title}: ${prevChapter.coreObjective}` : undefined,
          nextChapterSummary: nextChapter ? `${nextChapter.title}: ${nextChapter.coreObjective}` : undefined
        });

        currentChapters[i] = {
          ...c,
          contentScript: result.contentScript,
          shots: result.shots,
          isExpanded: true
        };

        setOutline(prev => prev ? { ...prev, chapters: [...currentChapters] } : null);
      }
    } catch (err: any) {
      console.error('Error in batch expand:', err);
      setErrorMessage(err.message || 'Lỗi trong quá trình viết tự động toàn bộ chương.');
    } finally {
      setExpandingChapterId(null);
      setIsExpandingAll(false);
    }
  };

  // Handle Humanize
  const handleHumanizeCurrentScript = async (textToHumanize: string) => {
    if (!textToHumanize.trim()) return;
    setHumanizing(true);
    setErrorMessage(null);

    try {
      const res = await humanizeScriptText({
        text: textToHumanize,
        toneStyle: outline?.styleToneGuide || 'Tự nhiên, sắc sảo, không văn mẫu AI'
      });
      setHumanizeResult(res);
    } catch (err: any) {
      console.error('Error humanizing script:', err);
      setErrorMessage(err.message || 'Không thể nhân bản hóa văn bản.');
    } finally {
      setHumanizing(false);
    }
  };

  // Compile entire script into unified text & unified shots
  const getCompiledMasterScript = () => {
    if (!outline || !outline.chapters) return { fullText: '', shots: [] };

    let fullTextParts: string[] = [];
    let combinedShots: TwoColumnShot[] = [];
    let shotCounter = 1;

    outline.chapters.forEach((c) => {
      fullTextParts.push(`\n=== CHƯƠNG ${c.chapterNumber}: ${c.title.toUpperCase()} (${c.timestampRange}) ===\n`);
      if (c.contentScript) {
        fullTextParts.push(c.contentScript);
      } else {
        fullTextParts.push(`(Chương chưa mở rộng: ${c.coreObjective})`);
      }

      if (c.shots && c.shots.length > 0) {
        c.shots.forEach(s => {
          combinedShots.push({
            ...s,
            id: s.id || uuidv4(),
            shotNumber: shotCounter++
          });
        });
      }
    });

    return {
      fullText: fullTextParts.join('\n\n'),
      shots: combinedShots
    };
  };

  // Apply to project
  const handleApplyToProject = () => {
    if (!outline || !onApplyFullScript) return;

    const compiled = getCompiledMasterScript();

    const updated: ScriptData = {
      ...scriptData,
      title: outline.projectTitle || scriptData.title,
      summary: outline.narrativeThesis || scriptData.summary,
      targetDuration: outline.totalDurationEstimate || scriptData.targetDuration,
      chapters: outline.chapters,
      fullTextScript: compiled.fullText,
      shots: compiled.shots.length > 0 ? compiled.shots : scriptData.shots,
      workflowStep: compiled.shots.length > 0 ? 'breakdown' : 'full_text'
    };

    onApplyFullScript(updated);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  // Selected chapter
  const selectedChapter = outline?.chapters.find(c => c.id === selectedChapterId) || outline?.chapters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-zinc-950 via-slate-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Long-Form Chapter Studio
                </h2>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono rounded-full font-bold">
                  10 - 30+ Phút • Deep Essay & Documentary
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] rounded-full font-semibold">
                  Zero AI Cliché
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] rounded-full font-bold flex items-center gap-1">
                  <Cpu size={10} />
                  <span>Claude 3.7 Sonnet</span>
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Kiến trúc đa chương (Multi-Act), kể chuyện chiều sâu và văn phong 100% tự nhiên không dấu vết AI
              </p>
            </div>
          </div>

          {/* Top Actions & Close */}
          <div className="flex items-center gap-3">
            {outline && outline.chapters.length > 0 && (
              <button
                onClick={handleApplyToProject}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                {appliedSuccess ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Đã Đồng Bộ Vào Dự Án!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Áp Dụng Toàn Bộ Vào Kịch Bản</span>
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

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-100 border-b border-zinc-200 text-xs font-bold">
          <div className="flex items-center gap-1 bg-zinc-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('outline')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'outline'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ListTree size={14} />
              <span>1. Dàn Ý & Cấu Trúc Các Chương</span>
              {outline && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] rounded-full">
                  {outline.chapters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('expand')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'expand'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FileText size={14} />
              <span>2. Xưởng Viết Sâu Từng Chương</span>
              {outline && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full">
                  {outline.chapters.filter(c => c.isExpanded).length}/{outline.chapters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('humanize')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'humanize'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ShieldCheck size={14} />
              <span>3. Khử Văn Mẫu AI (Humanizer)</span>
            </button>

            <button
              onClick={() => setActiveTab('full_preview')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'full_preview'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Eye size={14} />
              <span>4. Xem Toàn Bộ Kịch Bản</span>
            </button>
          </div>

          {outline && (
            <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
              <span>Thời lượng ước tính: <strong>{outline.totalDurationEstimate}</strong></span>
              <span>•</span>
              <span>Tổng số từ: <strong>~{outline.totalTargetWords} từ</strong></span>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/60">

          {errorMessage && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">
                    {errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")
                      ? "Hệ thống AI đang tiếp nhận lưu lượng truy cập lớn (503 High Demand)"
                      : "Thông báo từ hệ thống AI"}
                  </p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    {errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")
                      ? "Lượng yêu cầu xử lý trên toàn cầu tăng đột biến. Hệ thống đã kích hoạt chế độ dự phòng thông minh, bạn hãy bấm Thử lại ngay."
                      : errorMessage}
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateOutline}
                disabled={generatingOutline}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw size={13} className={generatingOutline ? "animate-spin" : ""} />
                <span>Thử Lại Ngay</span>
              </button>
            </div>
          )}

          {/* ================= TAB 1: OUTLINE ARCHITECT ================= */}
          {activeTab === 'outline' && (
            <div className="space-y-6">
              
              {/* Configuration Bar */}
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Thiết Lập Thông Số Kịch Bản Dài (10 - 30+ Phút)
                    </h3>
                  </div>

                  <button
                    onClick={handleGenerateOutline}
                    disabled={generatingOutline}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Wand2 size={14} className={generatingOutline ? 'animate-spin' : ''} />
                    <span>{generatingOutline ? 'Đang Lập Cấu Trúc Các Chương...' : (outline ? 'Tạo Lại Dàn Ý Nhiều Chương' : 'Khởi Tạo Dàn Ý Nhiều Chương')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Thời lượng mục tiêu:
                    </label>
                    <select
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold text-zinc-800 focus:outline-indigo-500"
                    >
                      <option value="10m">10 Phút (~1,800 - 2,200 từ • 5 Chương)</option>
                      <option value="15m">15 Phút (~2,500 - 3,200 từ • 6 Chương)</option>
                      <option value="20m">20 Phút (~3,500 - 4,500 từ • 7 Chương)</option>
                      <option value="30m">30 Phút (~5,000 - 6,500 từ • 8 Chương Chuyên Sâu)</option>
                      <option value="45m">45 Phút (Phim Tài Liệu / Full Video Essay)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-700 mb-1 flex items-center gap-1">
                      <Users size={12} />
                      <span>Persona & Giọng Kể:</span>
                    </label>
                    <select
                      value={selectedPersonaId}
                      onChange={(e) => setSelectedPersonaId(e.target.value)}
                      className="w-full px-3 py-2 bg-indigo-50/60 border border-indigo-200 rounded-xl font-bold text-indigo-950 focus:outline-indigo-500"
                    >
                      {availablePersonas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Khán giả mục tiêu & Chân dung:
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="vd: Người quan tâm đầu tư, thích phân tích sắc sảo"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-zinc-800 focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Ghi chú / Luận điểm cần nhấn mạnh:
                    </label>
                    <input
                      type="text"
                      value={extraContext}
                      onChange={(e) => setExtraContext(e.target.value)}
                      placeholder="vd: Đưa dẫn chứng số liệu 2024, kết bài thức tỉnh"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-zinc-800 focus:outline-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Generating Animation */}
              {generatingOutline && (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-zinc-200">
                  <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900">
                      Gemini 3.7 Flash đang phân tầng cấu trúc Multi-Act & cài cắm nhịp giữ chân...
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono">
                      Khử toàn bộ văn mẫu AI • Phân bổ thời lượng • Thiết kế điểm ngoặt Midpoint Twist
                    </p>
                  </div>
                </div>
              )}

              {/* Outline Presentation */}
              {outline && !generatingOutline && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* Master Project Thesis Card */}
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-5 rounded-3xl shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-white/10 text-cyan-200 rounded-xl text-[10px] font-mono uppercase font-bold border border-white/10">
                        Luận Điểm Trung Tâm (Core Narrative Thesis)
                      </span>
                      <span className="text-xs text-zinc-300">
                        {outline.chapters.length} Chương Phân Tầng
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-cyan-100">
                      "{outline.projectTitle}"
                    </h3>

                    <p className="text-xs text-zinc-200 leading-relaxed italic">
                      "{outline.narrativeThesis}"
                    </p>

                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-300">
                      <span>🎯 <strong>Văn phong:</strong> {outline.styleToneGuide}</span>
                      <span>👥 <strong>Khán giả:</strong> {outline.targetAudienceProfile}</span>
                    </div>
                  </div>

                  {/* Batch Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200">
                    <div className="text-xs text-zinc-700">
                      <strong>Tiến độ viết sâu:</strong> {outline.chapters.filter(c => c.isExpanded).length}/{outline.chapters.length} chương đã hoàn thành
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExpandAllChapters}
                        disabled={isExpandingAll}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                      >
                        <Sparkles size={14} className={isExpandingAll ? 'animate-spin' : ''} />
                        <span>{isExpandingAll ? 'Đang Viết Tự Động Toàn Bộ Chương...' : '⚡ Viết Tự Động Toàn Bộ Chương (Sequential AI)'}</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('expand')}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <span>Soạn Thảo Chi Tiết</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Chapters Cards Timeline List */}
                  <div className="space-y-3">
                    {outline.chapters.map((chapter, idx) => (
                      <div
                        key={chapter.id}
                        className={`bg-white rounded-3xl border p-5 transition-all space-y-3 ${
                          selectedChapterId === chapter.id
                            ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                            : 'border-zinc-200 hover:border-zinc-300 shadow-xs'
                        }`}
                      >
                        {/* Chapter Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                              {chapter.chapterNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-zinc-900">
                                  {chapter.title}
                                </h4>
                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-mono text-[10px] rounded-md font-semibold">
                                  {chapter.timestampRange}
                                </span>
                              </div>
                              <span className="text-[11px] text-indigo-700 font-bold">
                                {chapter.actRole}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Tension score */}
                            <span className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-200/80 flex items-center gap-1">
                              <Flame size={12} />
                              <span>Căng thẳng: {chapter.emotionalTension}%</span>
                            </span>

                            {/* Word count target */}
                            <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-mono font-semibold rounded-lg">
                              ~{chapter.targetWordCount} từ ({chapter.estimatedDuration})
                            </span>

                            {/* Status badge */}
                            {chapter.isExpanded ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>Đã Viết Sâu</span>
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-semibold rounded-lg">
                                Dàn ý
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chapter Objectives & Key Points */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                          <div className="lg:col-span-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                              Mục tiêu cốt lõi chương:
                            </span>
                            <p className="text-zinc-800 font-medium leading-snug">
                              {chapter.coreObjective}
                            </p>
                            {chapter.continuityNotes && (
                              <div className="pt-1.5 border-t border-zinc-200 text-[10px] text-indigo-800">
                                🔗 <strong>Liên kết:</strong> {chapter.continuityNotes}
                              </div>
                            )}
                          </div>

                          <div className="lg:col-span-6 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                              Các luận điểm & phân cảnh chính:
                            </span>
                            <ul className="space-y-1">
                              {chapter.keyBeatPoints.map((pt, pIdx) => (
                                <li key={pIdx} className="text-zinc-800 flex items-start gap-1.5 text-[11px]">
                                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="lg:col-span-2 flex flex-col justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                handleExpandSingleChapter(chapter);
                                setActiveTab('expand');
                              }}
                              disabled={expandingChapterId === chapter.id}
                              className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs disabled:opacity-50"
                            >
                              <Wand2 size={13} className={expandingChapterId === chapter.id ? 'animate-spin' : ''} />
                              <span>{chapter.isExpanded ? 'Viết Lại Sâu' : 'Viết Sâu Ngay'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                setActiveTab('expand');
                              }}
                              className="w-full px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                            >
                              <span>Mở Xưởng Viết</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ================= TAB 2: DEEP CHAPTER EXPANDER STUDIO ================= */}
          {activeTab === 'expand' && outline && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Chapter List Selector */}
              <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs space-y-2 sticky top-0">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                    Danh Sách Các Chương
                  </h3>
                  <button
                    onClick={handleExpandAllChapters}
                    disabled={isExpandingAll}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    {isExpandingAll ? 'Đang viết tự động...' : 'Viết tất cả'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                  {outline.chapters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChapterId(c.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-2.5 ${
                        selectedChapter?.id === c.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedChapter?.id === c.id ? 'bg-white text-indigo-900' : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {c.chapterNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">
                          {c.title}
                        </div>
                        <div className={`text-[10px] flex items-center justify-between mt-0.5 ${
                          selectedChapter?.id === c.id ? 'text-indigo-200' : 'text-zinc-500'
                        }`}>
                          <span>{c.timestampRange}</span>
                          <span>{c.isExpanded ? '✓ Đã viết' : '• Dàn ý'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Chapter Writing Canvas */}
              {selectedChapter && (
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-5">
                  
                  {/* Chapter Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
                          Chương #{selectedChapter.chapterNumber}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900">
                          {selectedChapter.title}
                        </h3>
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold mt-1">
                        {selectedChapter.actRole} • Thời lượng: {selectedChapter.timestampRange}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExpandSingleChapter(selectedChapter)}
                        disabled={expandingChapterId === selectedChapter.id}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                      >
                        <Wand2 size={13} className={expandingChapterId === selectedChapter.id ? 'animate-spin' : ''} />
                        <span>{expandingChapterId === selectedChapter.id ? 'Đang Soạn Thảo Sâu...' : (selectedChapter.isExpanded ? 'Viết Lại Chương Này' : 'Viết Sâu Bằng AI (De-AI)')}</span>
                      </button>

                      {selectedChapter.contentScript && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedChapter.contentScript || '');
                            setCopiedChapterId(selectedChapter.id);
                            setTimeout(() => setCopiedChapterId(null), 2000);
                          }}
                          className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedChapterId === selectedChapter.id ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="text-emerald-600">Đã Sao Chép</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Sao Chép</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Objective & Key Points Reminder */}
                  <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1.5">
                    <p className="text-indigo-950 font-semibold">
                      🎯 <strong>Mục tiêu:</strong> {selectedChapter.coreObjective}
                    </p>
                    <p className="text-zinc-600 text-[11px]">
                      📌 <strong>Các ý triển khai:</strong> {selectedChapter.keyBeatPoints.join(' • ')}
                    </p>
                  </div>

                  {/* Loading State */}
                  {expandingChapterId === selectedChapter.id && (
                    <div className="py-16 text-center space-y-3 bg-zinc-50 rounded-2xl border border-dashed border-indigo-300">
                      <div className="w-10 h-10 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-zinc-800">
                          Đang viết kịch bản chi tiết cho Chương #{selectedChapter.chapterNumber}...
                        </h4>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Xóa văn mẫu AI • Cài cắm chi tiết cảm giác • Tạo bảng phân cảnh 2 cột
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Written Content Text Area */}
                  {selectedChapter.contentScript && expandingChapterId !== selectedChapter.id && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                            <FileText size={14} className="text-indigo-600" />
                            <span>Văn Bản Hoàn Chỉnh Của Chương (Master Narrative Script):</span>
                          </label>
                          <span className="text-[11px] text-zinc-400 font-mono font-semibold">
                            {selectedChapter.contentScript.split(/\s+/).filter(Boolean).length} từ • ~{Math.ceil(selectedChapter.contentScript.split(/\s+/).filter(Boolean).length / 150)} phút đọc
                          </span>
                        </div>

                        <textarea
                          rows={12}
                          value={selectedChapter.contentScript}
                          onChange={(e) => {
                            const newText = e.target.value;
                            const updated = outline.chapters.map(c => c.id === selectedChapter.id ? { ...c, contentScript: newText } : c);
                            setOutline({ ...outline, chapters: updated });
                          }}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-serif text-sm leading-relaxed text-zinc-900 focus:outline-indigo-500 shadow-inner"
                        />
                      </div>

                      {/* Associated 2-Column Shots for this Chapter */}
                      {selectedChapter.shots && selectedChapter.shots.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={14} className="text-indigo-600" />
                            <span>Bảng Phân Cảnh 2 Cột Dành Cho Chương Này ({selectedChapter.shots.length} Shots)</span>
                          </h4>

                          <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                            <div className="grid grid-cols-12 bg-zinc-100 font-bold p-2.5 border-b border-zinc-200 text-zinc-700">
                              <span className="col-span-1">Shot</span>
                              <span className="col-span-2">Thời Gian</span>
                              <span className="col-span-4">Thị Giác (Visual / B-Roll)</span>
                              <span className="col-span-5">Âm Thanh / Lời Thoại (Audio)</span>
                            </div>
                            <div className="divide-y divide-zinc-100">
                              {selectedChapter.shots.map((s, sIdx) => (
                                <div key={s.id || sIdx} className="grid grid-cols-12 p-3 gap-2 hover:bg-zinc-50">
                                  <span className="col-span-1 font-bold text-zinc-500">#{s.shotNumber || sIdx + 1}</span>
                                  <span className="col-span-2 font-mono text-[11px] text-zinc-400">{s.timeRange || '0:05'}</span>
                                  <span className="col-span-4 text-zinc-800 text-[11px]">{s.visual}</span>
                                  <span className="col-span-5 text-zinc-900 font-medium text-[11px]">{s.audio}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state prompt to write */}
                  {!selectedChapter.contentScript && expandingChapterId !== selectedChapter.id && (
                    <div className="py-16 text-center space-y-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <BookOpen size={32} className="text-zinc-400 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-zinc-800">
                          Chương này chưa được viết nội dung chi tiết
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                          Bấm nút bên dưới để AI tự động mở rộng theo đúng mục tiêu, số lượng từ và phong cách không văn mẫu AI.
                        </p>
                      </div>
                      <button
                        onClick={() => handleExpandSingleChapter(selectedChapter)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                      >
                        <Wand2 size={14} />
                        <span>Bắt Đầu Viết Sâu Chương #{selectedChapter.chapterNumber}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ================= TAB 3: HUMANIZER & DE-AI ENGINE ================= */}
          {activeTab === 'humanize' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        Bộ Khử Dấu Vết Văn Mẫu AI & Nhân Bản Hóa (Humanize Engine)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Quét sạch từ nối máy móc, gia tăng tính biến thiên độ dài câu (Burstiness) và nhịp thở người thật
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const text = selectedChapter?.contentScript || scriptData.fullTextScript || scriptData.summary || '';
                      handleHumanizeCurrentScript(text);
                    }}
                    disabled={humanizing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Sparkles size={14} className={humanizing ? 'animate-spin' : ''} />
                    <span>{humanizing ? 'Đang Khử Dấu Vết AI...' : 'Khử Văn Mẫu AI Chương Hiện Tại'}</span>
                  </button>
                </div>

                {/* Humanize Results Presentation */}
                {humanizeResult && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Score Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Độ Tự Nhiên Nhịp Điệu (Burstiness)</span>
                        <span className="text-3xl font-black text-emerald-700">{humanizeResult.burstinessAfter || 90}/100</span>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                        <span className="text-[10px] font-bold text-blue-800 uppercase block">Đánh Giá Độ Cuốn Hút</span>
                        <span className="text-sm font-bold text-blue-900 mt-1 block">{humanizeResult.readabilityGrade}</span>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                        <span className="text-[10px] font-bold text-purple-800 uppercase block">Cụm Từ Sáo Rỗng Đã Loại Bỏ</span>
                        <span className="text-2xl font-black text-purple-700">{humanizeResult.clichesRemoved.length} cụm từ</span>
                      </div>
                    </div>

                    {/* Cliches Removed list */}
                    {humanizeResult.clichesRemoved.length > 0 && (
                      <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1.5 text-xs">
                        <span className="font-bold text-rose-900 block">🚫 Các câu/từ máy móc đã xóa sạch:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {humanizeResult.clichesRemoved.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white text-rose-800 rounded-md border border-rose-200 line-through text-[11px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Humanized Text Preview & Apply */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800">
                          Văn Bản Sau Khi Nhân Bản Hóa (100% Khẩu Ngữ & Cảm Xúc Người Thật):
                        </label>
                        <button
                          onClick={() => {
                            if (!outline || !selectedChapter) return;
                            const updated = outline.chapters.map(c => 
                              c.id === selectedChapter.id ? { ...c, contentScript: humanizeResult.humanizedContent } : c
                            );
                            setOutline({ ...outline, chapters: updated });
                            alert('Đã thay thế văn bản chương bằng bản đã khử AI!');
                          }}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                        >
                          Áp Dụng Thay Thế Chương
                        </button>
                      </div>

                      <textarea
                        rows={10}
                        readOnly
                        value={humanizeResult.humanizedContent}
                        className="w-full p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl font-serif text-sm leading-relaxed text-zinc-900"
                      />
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          {/* ================= TAB 4: FULL SCRIPT PREVIEW ================= */}
          {activeTab === 'full_preview' && outline && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Bản Xem Toàn Bộ Kịch Bản ({outline.chapters.length} Chương)
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Thời lượng: {outline.totalDurationEstimate} • Ước tính: ~{getCompiledMasterScript().fullText.split(/\s+/).filter(Boolean).length} từ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getCompiledMasterScript().fullText);
                      setCopiedChapterId('master');
                      setTimeout(() => setCopiedChapterId(null), 2000);
                    }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedChapterId === 'master' ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-600">Đã Sao Chép Toàn Bộ</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Sao Chép Toàn Bộ Kịch Bản</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleApplyToProject}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 size={14} />
                    <span>Lưu & Đồng Bộ Vào Trình Biên Tập</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={18}
                readOnly
                value={getCompiledMasterScript().fullText}
                className="w-full p-5 bg-zinc-50 border border-zinc-200 rounded-2xl font-serif text-sm leading-relaxed text-zinc-900"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Powered by <strong>Gemini 3.7 Flash</strong> Long-Form & Anti-AI Engine</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
