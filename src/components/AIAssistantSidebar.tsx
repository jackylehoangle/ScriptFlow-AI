import React, { useState } from 'react';
import { ScriptData, TwoColumnShot, PlatformType, ToneOfVoice } from '../types';
import { 
  analyzeScriptVirality, 
  generateHooksAndAngles, 
  rewriteContentWithInstruction,
  TONE_LABELS
} from '../services/geminiService';
import { 
  Sparkles, 
  Flame, 
  Wand2, 
  RefreshCw, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Copy, 
  Check, 
  MessageSquare, 
  Send,
  Loader2,
  X,
  Gauge
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AIAssistantSidebarProps {
  scriptData: ScriptData;
  onUpdateScript: (updated: ScriptData) => void;
  onClose: () => void;
}

export default function AIAssistantSidebar({ scriptData, onUpdateScript, onClose }: AIAssistantSidebarProps) {
  const [activeTab, setActiveTab] = useState<'viral' | 'tone' | 'doctor' | 'chat'>('viral');

  // Viral Audit State
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    hookRating: string;
    retentionAdvice: string[];
    estimatedWpm: number;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  // Hook Generator State
  const [generatingHooks, setGeneratingHooks] = useState(false);
  const [newHooks, setNewHooks] = useState<{ type: string; hookText: string; whyItWorks: string }[]>([]);

  // Tone Rewrite State
  const [rewritingTone, setRewritingTone] = useState(false);
  const [targetTone, setTargetTone] = useState<ToneOfVoice>('humorous_witty');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Combine full script text for analysis
  const getFullScriptText = () => {
    if (scriptData.shots && scriptData.shots.length > 0) {
      return scriptData.shots.map(s => `[${s.timeRange || `Shot ${s.shotNumber}`}] Visual: ${s.visual} | Audio: ${s.audio} | Text: ${s.onScreenText}`).join('\n');
    }
    if (scriptData.screenplayElements) {
      return scriptData.screenplayElements.map(e => `${e.type}: ${e.text}`).join('\n');
    }
    return scriptData.title;
  };

  const handleRunAudit = async () => {
    setAnalyzing(true);
    try {
      const fullText = getFullScriptText();
      const res = await analyzeScriptVirality(fullText, scriptData.platform);
      setAuditResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateHooks = async () => {
    setGeneratingHooks(true);
    try {
      const hooks = await generateHooksAndAngles({
        topic: scriptData.title + (scriptData.summary ? ` - ${scriptData.summary}` : ''),
        category: scriptData.topic,
        platform: scriptData.platform,
        tone: scriptData.tone,
      });
      setNewHooks(hooks);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingHooks(false);
    }
  };

  const applyHookToScript = (hookText: string) => {
    if (scriptData.shots && scriptData.shots.length > 0) {
      const updatedShots = [...scriptData.shots];
      updatedShots[0] = {
        ...updatedShots[0],
        audio: hookText,
      };
      onUpdateScript({
        ...scriptData,
        hook: hookText,
        shots: updatedShots,
      });
    } else {
      onUpdateScript({
        ...scriptData,
        hook: hookText,
      });
    }
  };

  const handleRewriteTone = async () => {
    setRewritingTone(true);
    try {
      const instruction = `Hãy viết lại toàn bộ kịch bản này theo phong cách: ${TONE_LABELS[targetTone]}. Giữ nguyên cốt truyện nhưng thay đổi câu từ cho đúng chất.`;
      
      if (scriptData.shots && scriptData.shots.length > 0) {
        const updatedShots: TwoColumnShot[] = [];
        for (const shot of scriptData.shots) {
          const rewrittenAudio = await rewriteContentWithInstruction(shot.audio, `Viết lại lời thoại theo tone ${TONE_LABELS[targetTone]}`);
          updatedShots.push({
            ...shot,
            audio: rewrittenAudio,
          });
        }
        onUpdateScript({
          ...scriptData,
          tone: targetTone,
          shots: updatedShots,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRewritingTone(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const fullContext = `Kịch bản hiện tại (${scriptData.title}):\n${getFullScriptText()}\n\nYêu cầu của người dùng: ${userMsg}`;
      const reply = await rewriteContentWithInstruction(fullContext, "Hãy trả lời hoặc hỗ trợ tối ưu kịch bản theo yêu cầu của người dùng. Viết bằng tiếng Việt chuyên nghiệp.");
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Có lỗi xảy ra khi xử lý yêu cầu.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 text-zinc-100 border-l border-zinc-800 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-wide">AI Script Co-Pilot</h3>
            <p className="text-[10px] text-zinc-400">Trợ lý tối ưu kịch bản thông minh</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="grid grid-cols-3 p-2 gap-1 bg-zinc-950/50 border-b border-zinc-800 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab('viral')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'viral' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Flame size={13} /> Viral & Hook
        </button>
        <button
          onClick={() => setActiveTab('tone')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tone' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Wand2 size={13} /> Đổi Tone
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'chat' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <MessageSquare size={13} /> Trò chuyện
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: Viral & Hook Audit */}
        {activeTab === 'viral' && (
          <div className="space-y-5">
            {/* Run Audit Button */}
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Gauge size={14} className="text-amber-400" />
                  Đánh Giá Tiềm Năng Viral
                </span>
                <button
                  onClick={handleRunAudit}
                  disabled={analyzing}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-[10px] transition-all disabled:opacity-50"
                >
                  {analyzing ? 'Đang chấm...' : 'Chấm điểm ngay'}
                </button>
              </div>

              {auditResult && (
                <div className="space-y-3 pt-2 border-t border-zinc-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Điểm Viral Score:</span>
                    <span className="text-xl font-black text-amber-400">
                      {auditResult.score}/100
                    </span>
                  </div>

                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-400 font-semibold">Đánh giá 3s đầu:</div>
                    <div className="text-zinc-200 font-medium">{auditResult.hookRating}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-400 font-semibold">Mẹo giữ chân người xem (Retention):</div>
                    <ul className="list-disc list-inside text-zinc-300 space-y-1 text-[11px]">
                      {auditResult.retentionAdvice.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Hook Generator Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-400" />
                  Sáng Tạo 5 Hook Mở Đầu Khác
                </span>
                <button
                  onClick={handleGenerateHooks}
                  disabled={generatingHooks}
                  className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
                >
                  <RefreshCw size={11} className={generatingHooks ? 'animate-spin' : ''} />
                  Tạo mới
                </button>
              </div>

              {newHooks.length > 0 && (
                <div className="space-y-2.5">
                  {newHooks.map((h, i) => (
                    <div key={i} className="p-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded-md">
                          {h.type}
                        </span>
                        <button
                          onClick={() => applyHookToScript(h.hookText)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Áp dụng vào Cảnh 1
                        </button>
                      </div>
                      <p className="text-zinc-200 font-medium leading-snug">"{h.hookText}"</p>
                      <p className="text-[10px] text-zinc-400 italic">💡 {h.whyItWorks}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Tone Rewrite */}
        {activeTab === 'tone' && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/70 rounded-2xl space-y-3">
              <span className="font-semibold text-zinc-200 block">
                Chuyển Đổi Phong Cách (Tone of Voice)
              </span>
              <p className="text-zinc-400 text-[11px]">
                AI sẽ viết lại các câu thoại và lời dẫn theo đúng phong cách mà bạn chọn.
              </p>

              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value as ToneOfVoice)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {(Object.keys(TONE_LABELS) as ToneOfVoice[]).map(t => (
                  <option key={t} value={t}>{TONE_LABELS[t]}</option>
                ))}
              </select>

              <button
                onClick={handleRewriteTone}
                disabled={rewritingTone}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rewritingTone ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang viết lại kịch bản...
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    Áp Dụng Tone Mới Toàn Bộ Kịch Bản
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Chat with AI */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px]">
              {chatMessages.length === 0 ? (
                <div className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-2xl text-center text-zinc-400 space-y-2">
                  <MessageSquare size={24} className="mx-auto text-zinc-500" />
                  <p className="text-xs">Bạn cần AI hỗ trợ gì cho kịch bản này?</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <button
                      onClick={() => setChatInput("Hãy gợi ý cho tôi 3 kết bài kêu gọi hành động CTA thật ấn tượng")}
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg text-zinc-300"
                    >
                      💡 Gợi ý CTA
                    </button>
                    <button
                      onClick={() => setChatInput("Kiểm tra xem kịch bản này có quá dài cho video 60s không")}
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg text-zinc-300"
                    >
                      ⏱️ Check độ dài
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-medium ml-4'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-200 mr-4'
                    }`}
                  >
                    <div className="prose prose-invert prose-xs max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                ))
              )}

              {chatLoading && (
                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs text-zinc-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  AI đang phân tích...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Hỏi AI bất kỳ điều gì về kịch bản..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl disabled:opacity-40 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
