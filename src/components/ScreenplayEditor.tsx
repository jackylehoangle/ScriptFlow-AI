import React, { useState } from 'react';
import { ScreenplayElement, ScreenplayElementType, ScriptData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { 
  Hash, 
  AlignLeft, 
  User, 
  MessageSquare, 
  Type, 
  ArrowRight, 
  Plus, 
  Sparkles,
  Trash2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { rewriteContentWithInstruction } from '../services/geminiService';

interface ScreenplayEditorProps {
  scriptData: ScriptData;
  onChange: (updated: ScriptData) => void;
  onOpenNarrativeArc?: () => void;
  onOpenFirstPassDraft?: () => void;
}

const ELEMENT_TYPES: { type: ScreenplayElementType; label: string; icon: any; placeholder: string; shortcut: string }[] = [
  { type: 'SCENE_HEADING', label: 'Bối cảnh (Slugline)', icon: Hash, placeholder: 'NỘI CẢNH. PHÒNG KHÁCH - ĐÊM', shortcut: 'Alt+1' },
  { type: 'ACTION', label: 'Hành động (Action)', icon: AlignLeft, placeholder: 'Mô tả những gì diễn ra trên màn hình...', shortcut: 'Alt+2' },
  { type: 'CHARACTER', label: 'Tên nhân vật', icon: User, placeholder: 'TÊN NHÂN VẬT', shortcut: 'Alt+3' },
  { type: 'PARENTHETICAL', label: 'Ghi chú diễn xuất', icon: Type, placeholder: '(thì thầm, cười khẩy)', shortcut: 'Alt+4' },
  { type: 'DIALOGUE', label: 'Lời thoại', icon: MessageSquare, placeholder: 'Nội dung câu nói của nhân vật...', shortcut: 'Alt+5' },
  { type: 'TRANSITION', label: 'Chuyển cảnh', icon: ArrowRight, placeholder: 'CẮT SANG:', shortcut: 'Alt+6' },
];

export default function ScreenplayEditor({ scriptData, onChange, onOpenNarrativeArc, onOpenFirstPassDraft }: ScreenplayEditorProps) {
  const elements = scriptData.screenplayElements || [
    { id: uuidv4(), type: 'SCENE_HEADING', text: 'NỘI CẢNH. PHÒNG KHÁCH - NGÀY' },
    { id: uuidv4(), type: 'ACTION', text: 'Ánh nắng rọi qua rèm cửa. Không khí tĩnh lặng.' }
  ];

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [refiningId, setRefiningId] = useState<string | null>(null);

  const updateElements = (newElements: ScreenplayElement[]) => {
    onChange({
      ...scriptData,
      screenplayElements: newElements
    });
  };

  const handleTextChange = (id: string, text: string) => {
    const updated = elements.map(el => (el.id === id ? { ...el, text } : el));
    updateElements(updated);
  };

  const changeType = (id: string, type: ScreenplayElementType) => {
    const updated = elements.map(el => (el.id === id ? { ...el, type } : el));
    updateElements(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const current = elements[index];
      let nextType: ScreenplayElementType = 'ACTION';

      if (current.type === 'SCENE_HEADING') nextType = 'ACTION';
      else if (current.type === 'ACTION') nextType = 'CHARACTER';
      else if (current.type === 'CHARACTER') nextType = 'DIALOGUE';
      else if (current.type === 'PARENTHETICAL') nextType = 'DIALOGUE';
      else if (current.type === 'DIALOGUE') nextType = 'CHARACTER';

      const newEl: ScreenplayElement = { id: uuidv4(), type: nextType, text: '' };
      const copy = [...elements];
      copy.splice(index + 1, 0, newEl);
      updateElements(copy);
      setFocusedId(newEl.id);
    } else if (e.key === 'Backspace' && elements[index].text === '' && elements.length > 1) {
      e.preventDefault();
      const copy = elements.filter((_, i) => i !== index);
      updateElements(copy);
      if (index > 0) setFocusedId(elements[index - 1].id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle through element types
      const current = elements[index];
      const types: ScreenplayElementType[] = ['SCENE_HEADING', 'ACTION', 'CHARACTER', 'PARENTHETICAL', 'DIALOGUE', 'TRANSITION'];
      const nextIdx = (types.indexOf(current.type) + 1) % types.length;
      changeType(current.id, types[nextIdx]);
    }
  };

  const handleAIRefineLine = async (el: ScreenplayElement) => {
    setRefiningId(el.id);
    try {
      const refined = await rewriteContentWithInstruction(el.text, "Làm cho câu thoại/hành động này sắc sảo và điện ảnh hơn");
      handleTextChange(el.id, refined);
    } finally {
      setRefiningId(null);
    }
  };

  const addElement = () => {
    const newEl: ScreenplayElement = { id: uuidv4(), type: 'ACTION', text: '' };
    updateElements([...elements, newEl]);
    setFocusedId(newEl.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Quick Toolbar */}
      <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-800">Chuẩn Hollywood:</span>
          <span className="text-zinc-400">|</span>
          <span>Tab: Đổi kiểu dòng</span>
          <span>•</span>
          <span>Enter: Nhảy dòng tiếp theo</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFirstPassDraft && (
            <button
              onClick={onOpenFirstPassDraft}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>⚡ Bản Thảo Nhanh</span>
            </button>
          )}

          {onOpenNarrativeArc && (
            <button
              onClick={onOpenNarrativeArc}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-700 to-cyan-700 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Activity size={13} />
              <span>Cung Truyện & Nhịp Độ AI</span>
            </button>
          )}

          <button
            onClick={addElement}
            className="px-3 py-1.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1"
          >
            <Plus size={14} /> Thêm Dòng
          </button>
        </div>
      </div>

      {/* Screenplay Page Container (simulate 8.5 x 11 inch standard page) */}
      <div className="bg-white shadow-xl min-h-[11in] p-12 md:p-20 font-mono text-[12pt] leading-normal border border-zinc-200 rounded-sm">
        {elements.map((el, index) => {
          const typeMeta = ELEMENT_TYPES.find(t => t.type === el.type);

          return (
            <div key={el.id} className="relative group mb-3">
              {/* Type Switcher Floating Menu on Hover */}
              <div className="absolute -left-14 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-white p-1 rounded-lg border border-zinc-200 shadow-md z-10">
                {ELEMENT_TYPES.map(et => (
                  <button
                    key={et.type}
                    onClick={() => changeType(el.id, et.type)}
                    className={cn(
                      "p-1.5 rounded hover:bg-zinc-100 transition-colors",
                      el.type === et.type ? "text-blue-600 bg-blue-50 font-bold" : "text-zinc-400"
                    )}
                    title={`${et.label} (${et.shortcut})`}
                  >
                    <et.icon size={13} />
                  </button>
                ))}

                {el.text.trim().length > 0 && (
                  <button
                    onClick={() => handleAIRefineLine(el)}
                    disabled={refiningId === el.id}
                    className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors border-t border-zinc-100"
                    title="AI trau chuốt câu này"
                  >
                    <Sparkles size={13} className={refiningId === el.id ? "animate-spin" : ""} />
                  </button>
                )}
              </div>

              {/* Text Area with Hollywood Standard Alignment */}
              <textarea
                autoFocus={focusedId === el.id}
                value={el.text}
                onChange={(e) => handleTextChange(el.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedId(el.id)}
                placeholder={typeMeta?.placeholder}
                className={cn(
                  "w-full resize-none overflow-hidden focus:outline-none bg-transparent placeholder-zinc-300 transition-all",
                  // Scene Heading (All Caps, Bold, Margin)
                  el.type === 'SCENE_HEADING' && "uppercase font-bold tracking-wide mt-8 mb-4 text-zinc-900 border-b border-dashed border-zinc-200 pb-1",
                  // Action description
                  el.type === 'ACTION' && "text-zinc-800 mb-3",
                  // Character name (Centered, uppercase)
                  el.type === 'CHARACTER' && "w-[50%] mx-auto text-center uppercase font-semibold text-zinc-900 tracking-wider mt-5 mb-1",
                  // Parenthetical (Centered italic)
                  el.type === 'PARENTHETICAL' && "w-[40%] mx-auto text-center italic text-zinc-600 text-[11pt] mb-1",
                  // Dialogue (Centered block)
                  el.type === 'DIALOGUE' && "w-[65%] mx-auto text-zinc-800 leading-relaxed mb-4",
                  // Transition (Right aligned)
                  el.type === 'TRANSITION' && "text-right uppercase font-bold text-zinc-700 tracking-widest mt-6 mb-6"
                )}
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
