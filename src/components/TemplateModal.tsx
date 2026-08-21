import React, { useState } from 'react';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { ScriptTemplate, ScriptData, ScriptFormat, PlatformType } from '../types';
import { PLATFORM_LABELS, TOPIC_LABELS } from '../services/geminiService';
import { 
  Layers, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  X, 
  Check, 
  Film, 
  Video, 
  ShoppingBag, 
  Smartphone,
  BookOpen
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (newScript: ScriptData) => void;
}

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<ScriptTemplate | null>(SAMPLE_TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tất cả mẫu' },
    { id: 'short', label: '⚡ Video Ngắn (TikTok / Shorts)' },
    { id: 'long', label: '🎬 YouTube Dài & Video Essay' },
    { id: 'commercial', label: '🛍️ TVC & Bán hàng' },
    { id: 'screenplay', label: '🎥 Phim ngắn Điện ảnh' },
  ];

  const filteredTemplates = SAMPLE_TEMPLATES.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.format === selectedCategory;
  });

  const handleUseTemplate = (template: ScriptTemplate) => {
    const newScript: ScriptData = {
      id: uuidv4(),
      title: template.title.replace(/^[^\s]+\s/, ''), // remove emoji
      format: template.format,
      platform: template.platform,
      topic: template.topic,
      tone: template.tone,
      targetDuration: template.targetDuration,
      summary: template.description,
      hook: template.previewHook,
      shots: template.shots,
      screenplayElements: template.screenplayElements,
    };
    onSelectTemplate(newScript);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Thư Viện Mẫu Kịch Bản Chuẩn Viral
              </h2>
              <p className="text-xs text-zinc-500">
                Chọn mẫu kịch bản đã được chứng minh hiệu quả giữ chân người xem cao
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid (Left list, Right preview) */}
        <div className="grid grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Template Cards */}
          <div className="col-span-5 border-r border-zinc-100 p-4 overflow-y-auto space-y-3 bg-zinc-50/30">
            {filteredTemplates.map(t => {
              const isSelected = previewTemplate?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setPreviewTemplate(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold text-[10px] rounded-md">
                      {PLATFORM_LABELS[t.platform]?.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock size={11} /> {t.targetDuration}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-1 leading-snug">{t.title}</h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Template Preview & Apply */}
          <div className="col-span-7 p-6 overflow-y-auto flex flex-col justify-between bg-white space-y-6">
            {previewTemplate ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full uppercase">
                      {TOPIC_LABELS[previewTemplate.topic]}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Thời lượng: {previewTemplate.targetDuration}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">{previewTemplate.title}</h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{previewTemplate.description}</p>
                </div>

                {/* Hook Box */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Sparkles size={12} /> Câu Hook Mở Đầu
                  </span>
                  <p className="text-xs font-semibold text-zinc-900 italic">
                    "{previewTemplate.previewHook}"
                  </p>
                </div>

                {/* Shots or Screenplay Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Cấu trúc chi tiết kịch bản:
                  </span>
                  <div className="space-y-2">
                    {previewTemplate.shots?.map((shot) => (
                      <div key={shot.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                          <span className="font-bold text-zinc-800">Cảnh #{shot.shotNumber}</span>
                          <span>{shot.timeRange}</span>
                        </div>
                        <p className="text-[11px] text-indigo-700">🎥 {shot.visual}</p>
                        <p className="text-zinc-800 font-medium">🎙️ {shot.audio}</p>
                      </div>
                    ))}

                    {previewTemplate.screenplayElements?.map((el, i) => (
                      <div key={el.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-xs">
                        <span className="text-zinc-400 text-[10px] block">{el.type}</span>
                        <span className="text-zinc-900">{el.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-zinc-400">
                Chọn một mẫu để xem trước
              </div>
            )}

            {/* Bottom Button */}
            {previewTemplate && (
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end">
                <button
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Sử Dụng Mẫu Này <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
