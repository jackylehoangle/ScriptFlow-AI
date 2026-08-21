import React, { useState } from 'react';
import { Script, ScriptData, PlatformType, ChannelDNA } from '../types';
import { PLATFORM_LABELS } from '../services/geminiService';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  Sparkles, 
  Layers, 
  Video, 
  Film, 
  Clock,
  X,
  Wand2,
  FolderOpen,
  Dna,
  Edit3,
  Lightbulb,
  LayoutDashboard,
  Flame
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: Script[];
  currentScriptId: string | null;
  activeChannel?: ChannelDNA;
  onOpenChannelDNA?: () => void;
  onOpenIdeaBrainstorm?: () => void;
  onOpenTrendTracker?: () => void;
  onOpenDashboard?: () => void;
  onSelectScript: (script: Script) => void;
  onCreateNewManual: () => void;
  onOpenAIWizard: () => void;
  onOpenTemplates: () => void;
  onDeleteScript: (id: string) => void;
  onDuplicateScript: (script: Script) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  scripts,
  currentScriptId,
  activeChannel,
  onOpenChannelDNA,
  onOpenIdeaBrainstorm,
  onOpenTrendTracker,
  onOpenDashboard,
  onSelectScript,
  onCreateNewManual,
  onOpenAIWizard,
  onOpenTemplates,
  onDeleteScript,
  onDuplicateScript,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const filteredScripts = scripts.filter(s => {
    let scriptData: Partial<ScriptData> = {};
    try {
      scriptData = JSON.parse(s.content);
    } catch {}

    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (platformFilter === 'all') return true;
    if (platformFilter === 'short') return scriptData.format === 'short';
    if (platformFilter === 'long') return scriptData.format === 'long';
    if (platformFilter === 'screenplay') return scriptData.format === 'screenplay';
    if (platformFilter === 'commercial') return scriptData.format === 'commercial';
    return true;
  });

  if (!isOpen) return null;

  return (
    <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-xs">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-zinc-900">
              ScriptFlow <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">Studio Viết Kịch Bản Đa Nền Tảng</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      {/* Active Channel DNA Widget */}
      {activeChannel && onOpenChannelDNA && (
        <div className="px-3 pt-3">
          <div 
            onClick={onOpenChannelDNA}
            className="p-2.5 bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-purple-900/10 hover:from-indigo-900/15 hover:to-purple-900/15 border border-indigo-200/80 rounded-2xl cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                <Dna size={12} />
                DNA Kênh Hoạt Động
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold group-hover:underline flex items-center gap-0.5">
                Cấu hình <Edit3 size={10} />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">{activeChannel.icon || '📺'}</span>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-zinc-900 truncate">{activeChannel.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{activeChannel.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="p-3 space-y-2 border-b border-zinc-100 bg-zinc-50/40">
        <button
          onClick={onOpenAIWizard}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
        >
          <Wand2 size={14} /> AI Tự Động A-Z
        </button>

        {onOpenTrendTracker && (
          <button
            onClick={onOpenTrendTracker}
            className="w-full py-2 px-3 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 hover:bg-orange-500/20 text-orange-950 border border-orange-300/80 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all"
          >
            <Flame size={14} className="text-orange-600 animate-pulse" />
            <span>Trend Tracker (Google)</span>
          </button>
        )}

        {onOpenIdeaBrainstorm && (
          <button
            onClick={onOpenIdeaBrainstorm}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all"
          >
            <Lightbulb size={14} className="text-amber-600" />
            <span>Phòng Lên Ý Tưởng (Idea Lab)</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCreateNewManual}
            className="py-2 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus size={13} /> Tạo Thủ Công
          </button>
          <button
            onClick={onOpenTemplates}
            className="py-2 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Layers size={13} /> Mẫu Có Sẵn
          </button>
        </div>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="w-full py-2 px-3 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all"
          >
            <LayoutDashboard size={14} className="text-indigo-600" />
            <span>Dashboard Thống Kê</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3 space-y-2.5 border-b border-zinc-100">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm kịch bản..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-medium no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'short', label: '⚡ Shorts' },
            { id: 'long', label: '🎬 Dài' },
            { id: 'screenplay', label: '🎥 Phim' },
            { id: 'commercial', label: '🛍️ TVC' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPlatformFilter(f.id)}
              className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                platformFilter === f.id
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Script List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1">
          <span>Dự án của bạn ({filteredScripts.length})</span>
        </div>

        {filteredScripts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
            <FolderOpen size={28} className="mx-auto text-zinc-300" />
            <p>Chưa có kịch bản nào phù hợp</p>
          </div>
        ) : (
          filteredScripts.map(s => {
            const isSelected = currentScriptId === s.id;
            let scriptData: Partial<ScriptData> = {};
            try {
              scriptData = JSON.parse(s.content);
            } catch {}

            return (
              <div
                key={s.id}
                onClick={() => onSelectScript(s)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-2xs font-semibold'
                    : 'hover:bg-zinc-50 border border-transparent text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                  }`}>
                    {scriptData.format === 'screenplay' ? <Film size={13} /> : <Video size={13} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate font-medium">{s.title || "Kịch bản chưa đặt tên"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                      <span>{scriptData.targetDuration || (scriptData.format === 'screenplay' ? 'Phim' : '60s')}</span>
                      <span>•</span>
                      <span className="capitalize">{scriptData.platform?.replace('_', ' ') || 'video'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Duplicate & Delete */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateScript(s); }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition-colors"
                    title="Nhân bản"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteScript(s.id); }}
                    className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Xóa kịch bản"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 text-[10px] text-zinc-400 text-center">
        Powered by Gemini 2.5 • Chuẩn Production
      </div>
    </aside>
  );
}
