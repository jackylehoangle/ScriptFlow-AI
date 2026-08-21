import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Users,
  Search,
  Check,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  Eye,
  ArrowRight,
  Flame,
  Zap,
  Activity,
  Layers,
  FileText,
  Volume2,
  Copy,
  BookOpen,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  StylePersona, 
  PersonaCategory, 
  ScriptData, 
  TwoColumnShot 
} from '../types';
import { 
  PERSONA_CATEGORIES_META, 
  getAllPersonas, 
  saveCustomPersona, 
  deleteCustomPersona 
} from '../data/personaLibrary';
import { humanizeScriptText } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface PersonaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData | null;
  onApplyPersonaToScript: (persona: StylePersona) => void;
  onOpenDeAIWithPersona?: (persona: StylePersona) => void;
}

export default function PersonaLibraryModal({
  isOpen,
  onClose,
  scriptData,
  onApplyPersonaToScript,
  onOpenDeAIWithPersona
}: PersonaLibraryModalProps) {
  const [personas, setPersonas] = useState<StylePersona[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Modal / Inspector
  const [inspectingPersona, setInspectingPersona] = useState<StylePersona | null>(null);
  
  // Custom Persona Creator
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customForm, setCustomForm] = useState<Partial<StylePersona>>({
    name: '',
    category: 'essay_philosophy',
    icon: '🎙️',
    avatarColor: 'from-cyan-600 to-blue-800',
    tagline: '',
    archetypeReference: '',
    coreDescription: '',
    voiceCharacteristics: [''],
    cadenceAndPacing: '',
    catchphrasesOrTransitions: [''],
    bannedClichés: [''],
    idealForFormats: ['Video Essay', 'YouTube Long-form'],
    burstinessLevel: 92
  });

  // Sandbox Live Test
  const [sandboxPrompt, setSandboxPrompt] = useState('Nêu tác hại của việc thức khuya và nghiện lướt điện thoại');
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [isSandboxTesting, setIsSandboxTesting] = useState(false);
  const [appliedPersonaId, setAppliedPersonaId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllPersonas();
      setAppliedPersonaId(null);
    }
  }, [isOpen]);

  const loadAllPersonas = () => {
    const all = getAllPersonas();
    setPersonas(all);
    if (!inspectingPersona && all.length > 0) {
      setInspectingPersona(all[0]);
    }
  };

  if (!isOpen) return null;

  // Filter logic
  const filteredPersonas = personas.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery = !searchQuery.trim() || 
      p.name.toLowerCase().includes(q) || 
      p.tagline.toLowerCase().includes(q) ||
      p.archetypeReference.toLowerCase().includes(q) ||
      p.coreDescription.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  // Handle Create Custom Persona Submit
  const handleSaveCustomPersona = () => {
    if (!customForm.name || !customForm.coreDescription) {
      alert('Vui lòng nhập Tên Persona và Mô tả cốt lõi.');
      return;
    }

    const newPersona: StylePersona = {
      id: `custom_${uuidv4().slice(0, 8)}`,
      name: customForm.name,
      category: customForm.category || 'essay_philosophy',
      icon: customForm.icon || '🎙️',
      avatarColor: customForm.avatarColor || 'from-indigo-600 to-purple-800',
      tagline: customForm.tagline || 'Persona người kể tùy biến độc bản',
      archetypeReference: customForm.archetypeReference || 'Tác giả sáng tạo',
      coreDescription: customForm.coreDescription,
      voiceCharacteristics: (customForm.voiceCharacteristics || []).filter(s => s.trim().length > 0),
      cadenceAndPacing: customForm.cadenceAndPacing || 'Tự nhiên, biến thiên theo cảm xúc',
      catchphrasesOrTransitions: (customForm.catchphrasesOrTransitions || []).filter(s => s.trim().length > 0),
      bannedClichés: (customForm.bannedClichés || []).filter(s => s.trim().length > 0),
      sampleExcerpts: [
        {
          topic: 'Ví dụ tùy chỉnh',
          beforeAI: 'Văn mẫu AI thông thường thiếu nhịp điệu và cảm xúc.',
          afterPersona: 'Văn phong mới sắc nét, không từ thừa, đậm chất riêng.'
        }
      ],
      idealForFormats: customForm.idealForFormats || ['Kịch bản đa nền tảng'],
      burstinessLevel: customForm.burstinessLevel || 90,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updated = saveCustomPersona(newPersona);
    setPersonas(updated);
    setInspectingPersona(newPersona);
    setIsCreatingCustom(false);
  };

  const handleDeleteCustom = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Persona tùy chỉnh này?')) {
      const updated = deleteCustomPersona(id);
      setPersonas(updated);
      if (inspectingPersona?.id === id) {
        setInspectingPersona(updated[0] || null);
      }
    }
  };

  // Run Sandbox Test
  const handleRunSandbox = async (persona: StylePersona) => {
    if (!sandboxPrompt.trim()) return;
    setIsSandboxTesting(true);
    setSandboxResult(null);

    try {
      const res = await humanizeScriptText({
        text: sandboxPrompt,
        toneStyle: `${persona.name}: ${persona.coreDescription}`,
        intensity: 'aggressive',
        targetAudience: persona.tagline
      });
      setSandboxResult(res.humanizedContent);
    } catch (e: any) {
      console.error('Sandbox error:', e);
      setSandboxResult(`Lỗi thử nghiệm: ${e.message}`);
    } finally {
      setIsSandboxTesting(false);
    }
  };

  const handleApply = (persona: StylePersona) => {
    onApplyPersonaToScript(persona);
    setAppliedPersonaId(persona.id);
    setTimeout(() => {
      setAppliedPersonaId(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Thư Viện Persona & Đạo Diễn Kể Chuyện Chuyên Sâu
                </h2>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] font-mono rounded-full font-bold">
                  {personas.length} Persona Độc Bản
                </span>
                <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] rounded-full font-semibold">
                  10+ Lĩnh Vực Chuyên Sâu
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Định hình linh hồn và giọng điệu kịch bản với phong cách của các Creator & Học giả hàng đầu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingCustom(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={15} />
              <span>+ Tạo Persona Mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden bg-zinc-50/60">
          
          {/* Left / Main Panel: Filters, Search & Persona Catalog */}
          <div className="w-full lg:w-3/5 flex flex-col border-r border-zinc-200 overflow-hidden">
            
            {/* Category Chips Bar */}
            <div className="p-4 bg-white border-b border-zinc-200 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên Creator, phong cách (Johnny Harris, Hormozi, Dan Carlin, Stoic...)..."
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100/80 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-indigo-500"
                />
              </div>

              {/* Category horizontal scrolling bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                {PERSONA_CATEGORIES_META.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-indigo-900 text-white shadow-xs font-bold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredPersonas.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 space-y-2">
                  <Users size={32} className="mx-auto opacity-40" />
                  <p className="text-xs">Không tìm thấy Persona nào phù hợp với bộ lọc.</p>
                </div>
              ) : (
                filteredPersonas.map((p) => {
                  const isInspecting = inspectingPersona?.id === p.id;
                  const isApplied = appliedPersonaId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setInspectingPersona(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative group ${
                        isInspecting
                          ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/15 shadow-md'
                          : 'bg-white/80 border-zinc-200 hover:border-zinc-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${p.avatarColor} text-white flex items-center justify-center text-xl shadow-xs shrink-0`}>
                            {p.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                                {p.name}
                              </h3>
                              {p.isCustom && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                                  Tùy chỉnh
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-indigo-600 block mt-0.5">
                              {p.archetypeReference}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold">
                            ⚡ Burstiness: {p.burstinessLevel}%
                          </span>

                          {p.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustom(p.id);
                              }}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa Persona tùy chỉnh"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {p.tagline}
                      </p>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px]">
                        <div className="flex flex-wrap gap-1">
                          {p.idealForFormats.slice(0, 2).map((fmt, i) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-medium">
                              {fmt}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(p);
                            }}
                            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                              isApplied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:scale-105 active:scale-95'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Đã Chọn!</span>
                              </>
                            ) : (
                              <>
                                <Check size={12} />
                                <span>Áp Dụng Persona Này</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Persona Deep Inspector & Sandbox Tester */}
          <div className="hidden lg:flex w-2/5 flex-col bg-white overflow-y-auto p-6 space-y-6">
            {inspectingPersona ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Profile Header */}
                <div className="space-y-3 pb-4 border-b border-zinc-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${inspectingPersona.avatarColor} text-white flex items-center justify-center text-3xl shadow-md`}>
                        {inspectingPersona.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight">
                          {inspectingPersona.name}
                        </h3>
                        <span className="text-xs text-indigo-600 font-semibold block">
                          Archetype: {inspectingPersona.archetypeReference}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(inspectingPersona)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span>Áp Dụng Vào Kịch Bản</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed font-serif bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    "{inspectingPersona.coreDescription}"
                  </p>
                </div>

                {/* Voice Traits & Cadence */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Đặc Điểm Giọng Kể & Nhịp Thở</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-700">
                    {inspectingPersona.voiceCharacteristics.map((trait, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium">
                    <span className="font-bold">Nhịp điệu: </span>
                    <span>{inspectingPersona.cadenceAndPacing}</span>
                  </div>
                </div>

                {/* Catchphrases & Triggers */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span>Cụm Từ Chuyển Đoạn Đắt Giá (Catchphrases)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {inspectingPersona.catchphrasesOrTransitions.map((phrase, i) => (
                      <div key={i} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-serif text-zinc-800">
                        "{phrase}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banned AI Clichés */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={14} className="text-rose-600" />
                    <span>Từ Khóa Cấm Tiệt (Banned Clichés)</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingPersona.bannedClichés.map((cliche, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-medium line-through">
                        {cliche}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side Sample Excerpt */}
                {inspectingPersona.sampleExcerpts && inspectingPersona.sampleExcerpts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye size={14} className="text-teal-600" />
                      <span>Mẫu Thực Tế (Trước vs Sau Khi Áp Dụng Persona)</span>
                    </h4>
                    {inspectingPersona.sampleExcerpts.map((ex, i) => (
                      <div key={i} className="space-y-2 text-xs">
                        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase block">❌ Văn Mẫu AI:</span>
                          <p className="text-rose-950 font-serif leading-snug">"{ex.beforeAI}"</p>
                        </div>
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">✨ Sau Persona ({inspectingPersona.name}):</span>
                          <p className="text-emerald-950 font-serif font-medium leading-snug">"{ex.afterPersona}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sandbox Live Tester */}
                <div className="p-4 bg-zinc-900 text-white rounded-3xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
                      <Sparkles size={14} />
                      <span>Thử Nghiệm Nhanh (Persona Sandbox)</span>
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">Gemini 3.7 Flash</span>
                  </div>

                  <input
                    type="text"
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    placeholder="Nhập câu hoặc chủ đề muốn viết thử..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-indigo-400"
                  />

                  <button
                    onClick={() => handleRunSandbox(inspectingPersona)}
                    disabled={isSandboxTesting}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} className={isSandboxTesting ? 'animate-spin' : ''} />
                    <span>{isSandboxTesting ? 'Đang viết thử...' : 'Viết Thử Bằng Persona Này'}</span>
                  </button>

                  {sandboxResult && (
                    <div className="p-3 bg-zinc-800/90 border border-zinc-700 rounded-2xl text-xs font-serif leading-relaxed text-zinc-200 animate-in fade-in">
                      {sandboxResult}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-zinc-400">
                <p className="text-xs">Chọn một Persona bên trái để xem phân tích chi tiết.</p>
              </div>
            )}
          </div>

        </div>

        {/* Custom Persona Creator Modal */}
        {isCreatingCustom && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-bold">Tạo Persona Người Kể Tùy Biến Mới</h3>
                </div>
                <button onClick={() => setIsCreatingCustom(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Tên Persona / Người Kể *</label>
                    <input
                      type="text"
                      value={customForm.name || ''}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      placeholder="Ví dụ: Shark David / Nhà Đầu Tư Sát Phạt"
                      className="w-full p-2.5 border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Lĩnh vực / Chuyên môn</label>
                    <select
                      value={customForm.category}
                      onChange={(e) => setCustomForm({ ...customForm, category: e.target.value as PersonaCategory })}
                      className="w-full p-2.5 border border-zinc-300 rounded-xl bg-white"
                    >
                      {PERSONA_CATEGORIES_META.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Tagline (Câu định vị ngắn)</label>
                  <input
                    type="text"
                    value={customForm.tagline || ''}
                    onChange={(e) => setCustomForm({ ...customForm, tagline: e.target.value })}
                    placeholder="Ví dụ: Bóc trần sự thật về dòng tiền và các cạm bẫy tài chính..."
                    className="w-full p-2.5 border border-zinc-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Hình mẫu tham chiếu (Archetype)</label>
                  <input
                    type="text"
                    value={customForm.archetypeReference || ''}
                    onChange={(e) => setCustomForm({ ...customForm, archetypeReference: e.target.value })}
                    placeholder="Ví dụ: Jordan Belfort / Ray Dalio"
                    className="w-full p-2.5 border border-zinc-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Mô tả cốt lõi giọng điệu (Core Tone Instruction) *</label>
                  <textarea
                    rows={3}
                    value={customForm.coreDescription || ''}
                    onChange={(e) => setCustomForm({ ...customForm, coreDescription: e.target.value })}
                    placeholder="Mô tả cách persona này mở đầu, cách dùng từ, thái độ với người xem..."
                    className="w-full p-2.5 border border-zinc-300 rounded-xl font-serif"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Cụm từ cửa miệng / Chuyển cảnh (ngăn cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={(customForm.catchphrasesOrTransitions || []).join(', ')}
                    onChange={(e) => setCustomForm({ ...customForm, catchphrasesOrTransitions: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Ví dụ: Nói thẳng ra là, Đừng tự lừa mình nữa, Con số này mới đáng sợ..."
                    className="w-full p-2.5 border border-zinc-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-900">Từ ngữ cấm tiệt (Banned Clichés)</label>
                  <input
                    type="text"
                    value={(customForm.bannedClichés || []).join(', ')}
                    onChange={(e) => setCustomForm({ ...customForm, bannedClichés: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Ví dụ: Chào mừng các bạn, Tóm lại là, Trong bài viết hôm nay..."
                    className="w-full p-2.5 border border-zinc-300 rounded-xl"
                  />
                </div>

              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsCreatingCustom(false)}
                  className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCustomPersona}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Lưu Persona Mới
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
