/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ScriptData, ScriptFormat, PlatformType, ChannelDNA } from '../types';
import { PLATFORM_LABELS } from '../services/geminiService';
import { 
  FileText, 
  Save, 
  Sparkles, 
  Layers, 
  Download, 
  Eye, 
  Menu, 
  Clock, 
  Film, 
  Table, 
  Wand2,
  Check,
  Cpu,
  Flame,
  Headphones,
  Activity,
  BookOpen,
  ShieldCheck,
  Users,
  Dna,
  Lightbulb,
  LayoutDashboard,
  ChevronDown,
  Zap,
  Sliders,
  Settings,
  Plus
} from 'lucide-react';

interface NavbarProps {
  currentScript: ScriptData | null;
  activeChannel?: ChannelDNA;
  onOpenChannelDNA?: () => void;
  onOpenIdeaBrainstorm?: () => void;
  onOpenTrendTracker?: () => void;
  onOpenDashboard?: () => void;
  onUpdateTitle: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onOpenFirstPassDraft?: () => void;
  onOpenAIWizard: () => void;
  onCreateNewManual?: () => void;
  onOpenHookStudio?: () => void;
  onOpenNarrativeArc?: () => void;
  onOpenLongFormStudio?: () => void;
  onOpenHumanizeStudio?: () => void;
  onOpenPersonaLibrary?: () => void;
  onOpenEngineHub?: () => void;
  onOpenTemplates: () => void;
  onOpenTeleprompter: () => void;
  onOpenExport: () => void;
  onOpenModelSettings: () => void;
  onOpenVoiceStudio: () => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  aiPanelOpen: boolean;
  onChangeFormat: (format: ScriptFormat) => void;
}

export default function Navbar({
  currentScript,
  activeChannel,
  onOpenChannelDNA,
  onOpenIdeaBrainstorm,
  onOpenTrendTracker,
  onOpenDashboard,
  onUpdateTitle,
  onSave,
  isSaving,
  onOpenFirstPassDraft,
  onOpenAIWizard,
  onCreateNewManual,
  onOpenHookStudio,
  onOpenNarrativeArc,
  onOpenLongFormStudio,
  onOpenHumanizeStudio,
  onOpenPersonaLibrary,
  onOpenEngineHub,
  onOpenTemplates,
  onOpenTeleprompter,
  onOpenExport,
  onOpenModelSettings,
  onOpenVoiceStudio,
  toggleSidebar,
  toggleAIPanel,
  aiPanelOpen,
  onChangeFormat,
}: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<'ideas' | 'create' | 'ai_polish' | 'tools' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Word count & read time calculation
  let totalWords = 0;
  if (currentScript?.shots) {
    totalWords = currentScript.shots.reduce((acc, s) => acc + s.audio.trim().split(/\s+/).filter(Boolean).length, 0);
  } else if (currentScript?.screenplayElements) {
    totalWords = currentScript.screenplayElements.reduce((acc, e) => acc + e.text.trim().split(/\s+/).filter(Boolean).length, 0);
  }

  const estimatedSeconds = Math.round(totalWords / 2.5);
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}p ` : ''}${s}s`;
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-3 md:px-5 flex items-center justify-between z-30 shrink-0 select-none">
      
      {/* 1. LEFT ZONE: Hamburger, Project Title, Channel DNA Badge */}
      <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-zinc-100 text-zinc-600 rounded-xl transition-colors shrink-0"
          title="Mở danh sách kịch bản"
        >
          <Menu size={18} />
        </button>

        {currentScript ? (
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={currentScript.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="text-xs md:text-sm font-bold text-zinc-900 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 max-w-[140px] sm:max-w-[200px] md:max-w-[260px] truncate"
              placeholder="Tên kịch bản..."
            />

            {/* Platform Tag */}
            <span className="hidden xl:inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-md uppercase shrink-0">
              {PLATFORM_LABELS[currentScript.platform]?.split('(')[0] || 'Kịch bản'}
            </span>

            {/* Word count & read time */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md shrink-0">
              <Clock size={11} />
              <span>~{formatDuration(estimatedSeconds)}</span>
              <span className="text-blue-300">•</span>
              <span>{totalWords} từ</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
              SF
            </div>
            <span className="text-xs md:text-sm font-bold text-zinc-800">
              ScriptFlow <span className="text-blue-600">AI</span>
            </span>
          </div>
        )}

        {/* Compact Channel DNA Pill */}
        {onOpenChannelDNA && (
          <button
            onClick={onOpenChannelDNA}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-200 border border-slate-700/80 rounded-xl text-[11px] font-bold transition-all shrink-0 hover:scale-[1.02] shadow-2xs"
            title="Nhấn để đổi Kênh hoặc chỉnh sửa Channel DNA"
          >
            <span>{activeChannel?.icon || '🧬'}</span>
            <span className="max-w-[90px] sm:max-w-[120px] truncate text-white">
              {activeChannel?.name || 'Kênh Mặc Định'}
            </span>
          </button>
        )}
      </div>

      {/* 2. CENTER ZONE: Grouped Dropdown Menus (Workflow Hierarchy) */}
      <div ref={dropdownRef} className="hidden lg:flex items-center gap-1.5 shrink-0">
        
        {/* GROUP 1: Ý TƯỞNG & XU HƯỚNG */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'ideas' ? null : 'ideas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              openDropdown === 'ideas'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
            }`}
          >
            <Lightbulb size={14} className={openDropdown === 'ideas' ? 'text-white' : 'text-amber-600'} />
            <span>Ý Tưởng & Xu Hướng</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === 'ideas' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'ideas' && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {onOpenTrendTracker && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenTrendTracker();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-orange-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Flame size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Trend Tracker (Google)</span>
                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[9px] font-extrabold rounded">Live</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Bắt từ khóa hot realtime theo Niche của DNA Kênh
                    </p>
                  </div>
                </button>
              )}

              {onOpenIdeaBrainstorm && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenIdeaBrainstorm();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-amber-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Lightbulb size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Lên Ý Tưởng Triệu View
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Brainstorm phản trực giác, bóc mẽ & kho ý tưởng kênh
                    </p>
                  </div>
                </button>
              )}

              {onOpenChannelDNA && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenChannelDNA();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-indigo-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Dna size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Kiến Trúc Sư DNA Kênh
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Chân dung khán giả, Persona & bộ lọc cấm kỵ AI
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 2: TẠO KỊCH BẢN */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'create' ? null : 'create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              openDropdown === 'create'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
            }`}
          >
            <Zap size={14} className={openDropdown === 'create' ? 'text-amber-400' : 'text-amber-500'} />
            <span>Tạo Kịch Bản</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === 'create' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'create' && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {onOpenFirstPassDraft && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenFirstPassDraft();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-orange-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Zap size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Tạo Bản Thảo Nhanh</span>
                      <span className="px-1.5 py-0.2 bg-orange-100 text-orange-700 text-[9px] font-extrabold rounded">Siêu tốc</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Nhập Hook ➔ Ra kịch bản 2 cột hoàn chỉnh theo DNA Kênh
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setOpenDropdown(null);
                  onOpenAIWizard();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-50 text-left flex items-start gap-2.5 transition-colors group"
              >
                <div className="p-1.5 bg-zinc-100 text-zinc-700 rounded-lg group-hover:bg-zinc-200 transition-colors">
                  <Wand2 size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    AI Tự Động A-Z (Full Wizard)
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Trợ lý thông minh từng bước từ ý tưởng đến kịch bản
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setOpenDropdown(null);
                  onOpenTemplates();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-blue-50 text-left flex items-start gap-2.5 transition-colors group"
              >
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Layers size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    Mẫu Kịch Bản Có Sẵn
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Thư viện mẫu TikTok, YouTube, TVC, Phim điện ảnh
                  </p>
                </div>
              </button>

              {onCreateNewManual && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onCreateNewManual();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-zinc-100 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-zinc-200 text-zinc-800 rounded-lg group-hover:bg-zinc-300 transition-colors">
                    <Plus size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Tạo Kịch Bản Thủ Công
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Viết kịch bản trống từ đầu không qua wizard
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 3: ĐẠO DIỄN & TINH CHỈNH AI */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'ai_polish' ? null : 'ai_polish')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              openDropdown === 'ai_polish'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80'
            }`}
          >
            <Sparkles size={14} className={openDropdown === 'ai_polish' ? 'text-white' : 'text-purple-600'} />
            <span>Đạo Diễn & Tinh Chỉnh AI</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === 'ai_polish' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'ai_polish' && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              
              {/* Humanize & De-AI */}
              {onOpenHumanizeStudio && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenHumanizeStudio();
                  }}
                  disabled={!currentScript}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 transition-colors group disabled:opacity-40"
                >
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Khử Văn Mẫu AI & Humanize</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded">Cần thiết</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Xóa sạch sáo rỗng, tăng nhịp thở tự nhiên của con người
                    </p>
                  </div>
                </button>
              )}

              {/* Hook A/B & CTR */}
              {onOpenHookStudio && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenHookStudio();
                  }}
                  disabled={!currentScript}
                  className="w-full p-2.5 rounded-xl hover:bg-purple-50 text-left flex items-start gap-2.5 transition-colors group disabled:opacity-40"
                >
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Hook A/B Test & CTR Thumbnail
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Tối ưu 3 giây đầu & điểm kích thích bấm xem (Click-Through)
                    </p>
                  </div>
                </button>
              )}

              {/* Narrative Arc */}
              {onOpenNarrativeArc && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenNarrativeArc();
                  }}
                  disabled={!currentScript}
                  className="w-full p-2.5 rounded-xl hover:bg-indigo-50 text-left flex items-start gap-2.5 transition-colors group disabled:opacity-40"
                >
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Activity size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Cung Truyện & Nhịp Độ Giữ Chân
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Phân tích nhịp độ retention và cao trào cảm xúc
                    </p>
                  </div>
                </button>
              )}

              {/* Long-form 10-30m */}
              {onOpenLongFormStudio && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenLongFormStudio();
                  }}
                  disabled={!currentScript}
                  className="w-full p-2.5 rounded-xl hover:bg-cyan-50 text-left flex items-start gap-2.5 transition-colors group disabled:opacity-40"
                >
                  <div className="p-1.5 bg-cyan-100 text-cyan-700 rounded-lg group-hover:bg-cyan-200 transition-colors">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Kịch Bản Dài Đa Chương (10-30m)
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Dựng cốt truyện chương hồi cho Video Essay, Documentary
                    </p>
                  </div>
                </button>
              )}

              {/* Persona Library */}
              {onOpenPersonaLibrary && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenPersonaLibrary();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-purple-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Thư Viện Persona & Giọng Kể
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      10+ Persona chuyên gia & tạo phong cách cá nhân
                    </p>
                  </div>
                </button>
              )}

              {/* Voice Studio */}
              {onOpenVoiceStudio && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenVoiceStudio();
                  }}
                  disabled={!currentScript}
                  className="w-full p-2.5 rounded-xl hover:bg-rose-50 text-left flex items-start gap-2.5 transition-colors group disabled:opacity-40"
                >
                  <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-200 transition-colors">
                    <Headphones size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Phòng Thu Lồng Tiếng AI & Clone
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Lồng tiếng tự động từng shot & nhân bản giọng nói
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 4: TIỆN ÍCH & CẤU HÌNH */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              openDropdown === 'tools'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80'
            }`}
          >
            <Sliders size={14} className={openDropdown === 'tools' ? 'text-white' : 'text-blue-600'} />
            <span>Tiện Ích & Cấu Hình</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'tools' && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenDashboard();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-indigo-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <LayoutDashboard size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Dashboard Thống Kê
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Biểu đồ số lượng theo tháng, tỷ lệ định dạng & niche
                    </p>
                  </div>
                </button>
              )}

              {onOpenEngineHub && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenEngineHub();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-purple-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Cpu size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Kho Động Cơ AI Chuyên Biệt
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Phân công ChatGPT, Claude, Gemini theo từng bước
                    </p>
                  </div>
                </button>
              )}

              {onOpenModelSettings && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenModelSettings();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 transition-colors group"
                >
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Flame size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      Mô Hình Ảnh FLUX (0đ)
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Kết nối tạo ảnh Storyboard miễn phí qua Pollinations/FLUX
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 3. RIGHT ZONE: Format Switcher, Actions (Teleprompter, Export, Save, AI Assistant) */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        
        {/* Quick Format Switcher */}
        {currentScript && (
          <div className="hidden sm:flex items-center bg-zinc-100 p-0.5 rounded-xl text-xs font-semibold mr-1">
            <button
              onClick={() => onChangeFormat('short')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                currentScript.format !== 'screenplay'
                  ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Bảng 2 cột Video ngắn, TikTok, YouTube"
            >
              <Table size={13} /> 2 Cột
            </button>
            <button
              onClick={() => onChangeFormat('screenplay')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                currentScript.format === 'screenplay'
                  ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Kịch bản Điện ảnh Hollywood chuẩn"
            >
              <Film size={13} /> Điện Ảnh
            </button>
          </div>
        )}

        {/* Teleprompter Button */}
        <button
          onClick={onOpenTeleprompter}
          disabled={!currentScript}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
          title="Mở máy nhắc chữ để quay video"
        >
          <Eye size={14} />
          <span className="hidden md:inline">Nhắc chữ</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          disabled={!currentScript}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
          title="Xuất file PDF Hollywood, SRT phụ đề, CSV hoặc copy text"
        >
          <Download size={14} />
          <span className="hidden md:inline">Xuất bản</span>
        </button>

        {/* Primary Save Button */}
        <button
          onClick={onSave}
          disabled={!currentScript || isSaving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40"
        >
          {isSaving ? <Check size={14} /> : <Save size={14} />}
          <span>{isSaving ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        {/* AI Co-Pilot Assistant Toggle */}
        <button
          onClick={toggleAIPanel}
          className={`p-2 rounded-xl border transition-all ${
            aiPanelOpen
              ? 'bg-amber-50 border-amber-300 text-amber-600 ring-2 ring-amber-500/20'
              : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
          }`}
          title="Bật/Tắt Trợ lý AI Co-Pilot đồng hành"
        >
          <Sparkles size={16} />
        </button>

      </div>
    </header>
  );
}
