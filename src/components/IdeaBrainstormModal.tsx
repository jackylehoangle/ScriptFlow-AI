import React, { useState, useEffect } from 'react';
import { 
  ChannelDNA, 
  BrainstormIdeaItem, 
  BrainstormFrameworkType, 
  BrainstormContentGoal 
} from '../types';
import { 
  brainstormChannelIdeas, 
  fetchIdeaBank, 
  saveIdeaToBank, 
  deleteIdeaFromBank, 
  updateIdeaStatus 
} from '../services/geminiService';
import { 
  Lightbulb, 
  Sparkles, 
  Flame, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  Copy, 
  Check, 
  Loader2, 
  X, 
  Compass, 
  RotateCw, 
  Shuffle, 
  Target, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Plus,
  Zap,
  BookOpen,
  Cpu
} from 'lucide-react';

interface IdeaBrainstormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChannel?: ChannelDNA;
  onSelectIdeaForScript: (idea: BrainstormIdeaItem) => void;
  onOpenFirstPassWithIdea?: (idea: BrainstormIdeaItem) => void;
  onOpenChannelDNA?: () => void;
  onOpenTrendTracker?: () => void;
}

const FRAMEWORK_OPTIONS: { id: BrainstormFrameworkType; label: string; icon: string; desc: string }[] = [
  { 
    id: 'all', 
    label: 'Tất Cả Góc Nhìn Đa Chiều', 
    icon: '✨', 
    desc: 'Kết hợp đa dạng phản trực giác, case study, cảnh báo bẫy và xu hướng' 
  },
  { 
    id: 'counter_intuitive', 
    label: 'Phản Trực Giác & Bóc Mẽ', 
    icon: '💥', 
    desc: 'Bẻ gãy niềm tin cũ, nói sự thật trần trụi mà 99% số đông không dám nói' 
  },
  { 
    id: 'urgent_warning', 
    label: 'Cảnh Báo Cấp Bách & Bẫy Sai Lầm', 
    icon: '🚨', 
    desc: 'Chỉ ra những cạm bẫy vô hình, ngăn chặn mất tiền, mất thời gian' 
  },
  { 
    id: 'case_study', 
    label: 'Case Study & Bóc Tách Thực Tế', 
    icon: '📊', 
    desc: 'Mổ xẻ người thật việc thật, bài học thành công hoặc thất bại hàng chục tỷ' 
  },
  { 
    id: 'step_by_step', 
    label: 'Lộ Trình 0 - 100 & Quy Trình', 
    icon: '🚀', 
    desc: 'Bí kíp thực chiến từng bước rõ ràng, người mới áp dụng được ngay' 
  },
  { 
    id: 'versus_battle', 
    label: 'So Sánh Đối Đầu & Tier List', 
    icon: '🥊', 
    desc: 'Phương án A vs Phương án B, lựa chọn tối ưu nhất và phân hạng' 
  },
  { 
    id: 'future_trend', 
    label: 'Dự Đoán Tương Lai & Đón Đầu', 
    icon: '🔮', 
    desc: 'Cơ hội và bước chuyển dịch lớn của ngành trong 1-3 năm tới' 
  },
  { 
    id: 'challenge_experiment', 
    label: 'Thử Nghiệm & Thách Thức', 
    icon: '💡', 
    desc: 'Thử nghiệm thực tế trong 7 - 30 ngày, kết quả vượt ngoài dự đoán' 
  },
];

export default function IdeaBrainstormModal({
  isOpen,
  onClose,
  activeChannel,
  onSelectIdeaForScript,
  onOpenFirstPassWithIdea,
  onOpenChannelDNA,
  onOpenTrendTracker
}: IdeaBrainstormModalProps) {
  const [activeTab, setActiveTab] = useState<'brainstorm' | 'idea_bank'>('brainstorm');
  
  // Generator form state
  const [topicPrompt, setTopicPrompt] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<BrainstormFrameworkType>('all');
  const [selectedGoal, setSelectedGoal] = useState<BrainstormContentGoal>('viral_fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<BrainstormIdeaItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Idea Bank state
  const [savedIdeas, setSavedIdeas] = useState<BrainstormIdeaItem[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankFilterStatus, setBankFilterStatus] = useState<string>('all');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load Idea Bank on mount / channel switch
  useEffect(() => {
    if (isOpen) {
      loadSavedIdeas();
    }
  }, [isOpen, activeChannel?.id]);

  const loadSavedIdeas = async () => {
    setLoadingBank(true);
    try {
      const list = await fetchIdeaBank(activeChannel?.id);
      setSavedIdeas(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBank(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerateIdeas = async (customCount = 6, expandIdea?: BrainstormIdeaItem) => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const generated = await brainstormChannelIdeas({
        topic: topicPrompt.trim() || undefined,
        channelDNA: activeChannel,
        framework: selectedFramework,
        contentGoal: selectedGoal,
        count: customCount,
        expandFromIdea: expandIdea
      });

      // Check which ideas might already be in savedIdeas
      const mapped = generated.map(g => {
        const isAlreadySaved = savedIdeas.some(s => s.title.toLowerCase() === g.title.toLowerCase());
        return {
          ...g,
          isSaved: isAlreadySaved
        };
      });

      setIdeas(mapped);
      if (expandIdea) {
        setTopicPrompt(`Biến tấu từ: ${expandIdea.title}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo ý tưởng từ AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSaveIdea = async (idea: BrainstormIdeaItem) => {
    const isCurrentlySaved = idea.isSaved || savedIdeas.some(s => s.id === idea.id);

    if (isCurrentlySaved) {
      // Remove
      await deleteIdeaFromBank(idea.id);
      setSavedIdeas(prev => prev.filter(s => s.id !== idea.id));
      setIdeas(prev => prev.map(item => item.id === idea.id ? { ...item, isSaved: false } : item));
    } else {
      // Save
      const ideaToSave = { ...idea, isSaved: true, channelId: activeChannel?.id };
      await saveIdeaToBank(ideaToSave);
      setSavedIdeas(prev => [ideaToSave, ...prev]);
      setIdeas(prev => prev.map(item => item.id === idea.id ? { ...item, isSaved: true } : item));
    }
  };

  const handleStatusChange = async (ideaId: string, newStatus: any) => {
    await updateIdeaStatus(ideaId, newStatus);
    setSavedIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, status: newStatus } : i));
  };

  const handleDeleteBankIdea = async (id: string) => {
    await deleteIdeaFromBank(id);
    setSavedIdeas(prev => prev.filter(s => s.id !== id));
    setIdeas(prev => prev.map(item => item.id === id ? { ...item, isSaved: false } : item));
  };

  const handleCopyIdea = (idea: BrainstormIdeaItem) => {
    const text = `💡 TIÊU ĐỀ: ${idea.title}\n⚡ HOOK: ${idea.hook}\n🎯 GÓC TIẾP CẬN: ${idea.angle} (${idea.framework})\n🔥 NỖI ĐAU GIẢI QUYẾT: ${idea.targetPainPoint}\n📝 DÀN Ý:\n${idea.keyTakeaways.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n')}\n🌟 VÌ SAO DỄ VIRAL: ${idea.whyItWillWin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSavedIdeas = savedIdeas.filter(idea => {
    if (bankFilterStatus === 'all') return true;
    return idea.status === bankFilterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/20">
              <Lightbulb size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Phòng Lên Ý Tưởng Triệu View (AI Viral Content Lab)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  Trị Bí Ý Tưởng 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sáng tạo các chủ đề phản trực giác, bóc mẽ ngộ nhận và bám sát tuyệt đối DNA Kênh {activeChannel?.name ? `(${activeChannel.name})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Top Control Bar & Channel Info */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Active Channel Badge & Engine Selector */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-xs">
              <span>{activeChannel?.icon || '🧬'}</span>
              <span className="font-bold text-indigo-200">{activeChannel?.name || 'Kênh Mặc Định'}</span>
              <span className="text-[11px] text-indigo-400">({activeChannel?.category || 'Tổng hợp'})</span>
            </div>
            {onOpenChannelDNA && (
              <button
                onClick={onOpenChannelDNA}
                className="text-[11px] text-indigo-400 hover:text-indigo-200 underline font-medium"
              >
                Đổi kênh / Sửa DNA
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs">
              <Cpu size={13} className="text-emerald-400" />
              <span className="text-emerald-300 font-bold">Động cơ: OpenAI GPT-4o Omnimodel</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('brainstorm')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'brainstorm'
                  ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Brainstorm Ý Tưởng Mới</span>
            </button>
            <button
              onClick={() => setActiveTab('idea_bank')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'idea_bank'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark size={13} />
              <span>Kho Ý Tưởng Của Kênh ({savedIdeas.length})</span>
            </button>
            {onOpenTrendTracker && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrendTracker();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30 transition-all flex items-center gap-1.5"
                title="Bắt Trend Google Search theo thời gian thực"
              >
                <Flame size={13} className="text-orange-400 animate-pulse" />
                <span>Bắt Trend Google Search</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: BRAINSTORM STUDIO */}
          {activeTab === 'brainstorm' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Input Control Box */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-700/80 rounded-2xl space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Target size={14} />
                    1. Chủ đề / Từ khóa trọng tâm (Để trống nếu muốn AI tự quét toàn bộ DNA Kênh)
                  </label>

                  {/* Lucky Wheel Surprise Me */}
                  <button
                    onClick={() => {
                      const samplePrompts = [
                        'Bóc mẽ sai lầm chí mạng khiến 99% người thất bại',
                        'Case study thực tế từ con số 0 lên triệu view',
                        'Dự đoán xu hướng đột phá trong 12 tháng tới',
                        'Cảnh báo bẫy tâm lý vô hình',
                        'Lộ trình 7 ngày thay đổi hoàn toàn kết quả'
                      ];
                      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
                      setTopicPrompt(randomPrompt);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <Shuffle size={12} />
                    <span>Gợi Ý Ngẫu Nhiên Độc Lạ</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    placeholder="VD: Quản lý dòng tiền cho người trẻ, Sai lầm đầu tư, AI Workflow tự động hóa, Mẹo tăng hiệu suất..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateIdeas(6);
                    }}
                  />
                  {topicPrompt && (
                    <button
                      onClick={() => setTopicPrompt('')}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Framework Selector Pills */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    2. Chọn Khung Chiến Lược Tiếp Cận (Ideation Framework)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FRAMEWORK_OPTIONS.map((f) => {
                      const isSelected = selectedFramework === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFramework(f.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold shadow-sm ring-1 ring-indigo-400'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <span>{f.icon}</span>
                            <span className="truncate">{f.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{f.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Goal & Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400 font-semibold">Mục tiêu:</span>
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setSelectedGoal('viral_fast')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          selectedGoal === 'viral_fast' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🔥 Bùng Nổ View
                      </button>
                      <button
                        onClick={() => setSelectedGoal('evergreen')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          selectedGoal === 'evergreen' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🌲 Giá Trị Trường Tồn
                      </button>
                      <button
                        onClick={() => setSelectedGoal('deep_dive')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          selectedGoal === 'deep_dive' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🔍 Chuyên Sâu
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateIdeas(6)}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>AI Đang Brainstorm Ý Tưởng Độc Bản...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Lên 6 Ý Tưởng Video Triệu View</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message & Retry */}
              {errorMsg && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-300">
                        Hệ thống AI tạm thời bận do lưu lượng truy cập cao (503 / High Demand)
                      </p>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">
                        Tình trạng này thường tự hết sau vài giây. Chúng tôi đã kích hoạt chế độ dự phòng. Hãy nhấn Thử Lại Ngay:
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateIdeas(6)}
                    disabled={isGenerating}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCw size={12} className={isGenerating ? "animate-spin" : ""} />
                    <span>Thử Lại Ngay</span>
                  </button>
                </div>
              )}

              {/* IDEAS GRID DISPLAY */}
              {ideas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="text-amber-500" size={16} />
                      <span>{ideas.length} Ý Tưởng Video Đã Sẵn Sàng Sản Xuất</span>
                    </h3>
                    <button
                      onClick={() => handleGenerateIdeas(6)}
                      disabled={isGenerating}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCw size={12} /> Tạo đợt ý tưởng khác
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideas.map((idea, idx) => (
                      <div
                        key={idea.id || idx}
                        className="p-4 bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl transition-all flex flex-col justify-between group shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Card Header: Score, Framework & Save */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-md flex items-center gap-1">
                                <Zap size={11} className="text-amber-400" />
                                Viral Score: {idea.viralScore}%
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-700/50 text-indigo-300 text-[10px] font-semibold rounded-md">
                                {idea.framework}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyIdea(idea)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                                title="Sao chép toàn bộ ý tưởng"
                              >
                                {copiedId === idea.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                              <button
                                onClick={() => handleToggleSaveIdea(idea)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  idea.isSaved 
                                    ? 'text-amber-400 bg-amber-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                                title={idea.isSaved ? "Đã lưu trong Kho Ý Tưởng" : "Lưu vào Kho Ý Tưởng"}
                              >
                                {idea.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {idea.title}
                          </h4>

                          {/* Hook 3s */}
                          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                              ⚡ Hook 3 Giây Mở Đầu:
                            </span>
                            <p className="text-xs text-slate-200 italic">
                              "{idea.hook}"
                            </p>
                          </div>

                          {/* Pain point & Angle */}
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-400">
                              🎯 <strong className="text-slate-300">Nỗi đau giải quyết:</strong> {idea.targetPainPoint}
                            </p>
                            <p className="text-slate-400">
                              💡 <strong className="text-slate-300">Góc nhìn mới:</strong> {idea.angle}
                            </p>
                          </div>

                          {/* Key Takeaways */}
                          {idea.keyTakeaways && idea.keyTakeaways.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                                📝 Dàn ý 3 bước triển khai:
                              </span>
                              <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                                {idea.keyTakeaways.map((takeaway, k) => (
                                  <li key={k} className="line-clamp-1">{takeaway}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Why It Will Win */}
                          <p className="text-[11px] text-emerald-400/90 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-xl">
                            🌟 <strong>Tại sao dễ nổ view:</strong> {idea.whyItWillWin}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleGenerateIdeas(5, idea)}
                            disabled={isGenerating}
                            className="text-[11px] text-slate-400 hover:text-indigo-300 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-700/60 transition-colors"
                            title="Tạo thêm 5 biến thể mở rộng từ ý tưởng này"
                          >
                            <RotateCw size={11} />
                            <span>Nhánh con</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {onOpenFirstPassWithIdea && (
                              <button
                                onClick={() => {
                                  onOpenFirstPassWithIdea(idea);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                                title="Tạo ngay bản thảo đầu tiên bám sát Hook & DNA Kênh"
                              >
                                <Zap size={12} className="fill-white" />
                                <span>Bản Thảo Nhanh</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onSelectIdeaForScript(idea);
                                onClose();
                              }}
                              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <span>AI Wizard</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Initial State Helper */}
              {ideas.length === 0 && !isGenerating && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Chưa có ý tưởng nào được sinh ra</h4>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      Nhấn nút <strong>"Lên 6 Ý Tưởng Video Triệu View"</strong> ở trên để AI quét DNA kênh {activeChannel?.name || ""} và tạo bộ ý tưởng giải cứu creator's block ngay lập tức!
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateIdeas(6)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:scale-105 transition-all"
                  >
                    🚀 Bắt Đầu Brainstorm Ngay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IDEA BANK (KHO Ý TƯỞNG CỦA KÊNH) */}
          {activeTab === 'idea_bank' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Lọc theo trạng thái:</span>
                  <div className="flex gap-1 text-xs">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'backlog', label: 'Ý tưởng chờ' },
                      { id: 'in_progress', label: 'Đang viết kịch bản' },
                      { id: 'filmed', label: 'Đã quay xong' },
                      { id: 'published', label: 'Đã đăng tải' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setBankFilterStatus(st.id)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          bankFilterStatus === st.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  Tổng cộng: <strong className="text-white">{filteredSavedIdeas.length}</strong> ý tưởng
                </span>
              </div>

              {loadingBank ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                  Đang tải kho ý tưởng...
                </div>
              ) : filteredSavedIdeas.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2 bg-slate-950/30 border border-slate-800 rounded-2xl p-6">
                  <Bookmark size={32} className="mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">Kho ý tưởng của bạn đang trống</p>
                  <p className="text-[11px] text-slate-500">
                    Hãy chuyển sang tab <strong>"Brainstorm Ý Tưởng Mới"</strong> và nhấn biểu tượng bookmark để lưu lại các ý tưởng tâm đắc!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSavedIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {idea.framework || 'Ý tưởng'}
                          </span>

                          {/* Status Picker */}
                          <select
                            value={idea.status || 'backlog'}
                            onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="backlog">📋 Ý tưởng chờ</option>
                            <option value="in_progress">✍️ Đang viết kịch bản</option>
                            <option value="filmed">🎬 Đã quay xong</option>
                            <option value="published">🚀 Đã đăng tải</option>
                          </select>
                        </div>

                        <h4 className="text-sm font-bold text-white">{idea.title}</h4>
                        <p className="text-xs text-slate-300 italic">"{idea.hook}"</p>
                        <p className="text-[11px] text-slate-400">🎯 {idea.targetPainPoint}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleDeleteBankIdea(idea.id)}
                          className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Xóa</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {onOpenFirstPassWithIdea && (
                            <button
                              onClick={() => {
                                onOpenFirstPassWithIdea(idea);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                              title="Tạo bản thảo nhanh từ Hook & DNA kênh"
                            >
                              <Zap size={12} className="fill-white" />
                              <span>Bản Thảo Nhanh</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onSelectIdeaForScript(idea);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                          >
                            <span>AI Wizard</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 Mẹo: Nhấn <strong>"Viết Kịch Bản Ngay"</strong> để AI Wizard tự động điền tiêu đề và câu hook vào quy trình sản xuất A-Z.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
