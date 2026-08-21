import React, { useState } from 'react';
import { ChannelDNA, TopicCategory, PlatformType, ToneOfVoice, ScriptFormat } from '../types';
import { CURATED_CHANNEL_PRESETS } from '../data/channelPresets';
import { generateAIChannelDNA, TOPIC_LABELS, PLATFORM_LABELS, TONE_LABELS } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface ChannelSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelDNA[];
  activeChannelId: string;
  onSaveChannels: (channels: ChannelDNA[], activeId: string) => void;
  onSelectChannelToUse?: (channel: ChannelDNA) => void;
}

export const ChannelSetupModal: React.FC<ChannelSetupModalProps> = ({
  isOpen,
  onClose,
  channels,
  activeChannelId,
  onSaveChannels,
  onSelectChannelToUse,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    activeChannelId || channels[0]?.id || CURATED_CHANNEL_PRESETS[0].id
  );
  const [editingChannel, setEditingChannel] = useState<ChannelDNA>(() => {
    const found = channels.find(c => c.id === (activeChannelId || channels[0]?.id));
    return found ? { ...found } : { ...CURATED_CHANNEL_PRESETS[0] };
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'audience' | 'persona' | 'pillars' | 'ai_architect'>('profile');
  
  // AI Architect State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<TopicCategory>('finance');
  const [aiPlatform, setAiPlatform] = useState<PlatformType>('tiktok');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiCreatorVibe, setAiCreatorVibe] = useState('');
  const [isGeneratingAiDna, setIsGeneratingAiDna] = useState(false);
  const [aiError, setAiError] = useState('');

  // Temp input states for array fields
  const [tempPainPoint, setTempPainPoint] = useState('');
  const [tempDesire, setTempDesire] = useState('');
  const [tempCatchphrase, setTempCatchphrase] = useState('');
  const [tempBannedWord, setTempBannedWord] = useState('');
  const [tempPillarTitle, setTempPillarTitle] = useState('');
  const [tempPillarDesc, setTempPillarDesc] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ChannelDNA) => {
    const newChan: ChannelDNA = {
      ...preset,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = [newChan, ...channels];
    setSelectedChannelId(newChan.id);
    setEditingChannel(newChan);
    onSaveChannels(updatedList, newChan.id);
  };

  const handleSwitchChannel = (id: string) => {
    const found = channels.find(c => c.id === id);
    if (found) {
      setSelectedChannelId(id);
      setEditingChannel({ ...found });
    }
  };

  const handleSaveCurrentChannel = () => {
    const exists = channels.some(c => c.id === editingChannel.id);
    let updatedList: ChannelDNA[];
    if (exists) {
      updatedList = channels.map(c => c.id === editingChannel.id ? { ...editingChannel, updatedAt: new Date().toISOString() } : c);
    } else {
      updatedList = [editingChannel, ...channels];
    }
    onSaveChannels(updatedList, editingChannel.id);
    if (onSelectChannelToUse) {
      onSelectChannelToUse(editingChannel);
    }
    onClose();
  };

  const handleCreateBlankChannel = () => {
    const newChan: ChannelDNA = {
      id: uuidv4(),
      name: 'Kênh Mới Của Tôi',
      handle: '@kenhmoi',
      tagline: 'Định vị cốt lõi của kênh bạn',
      icon: '🚀',
      avatarColor: 'bg-indigo-600',
      category: 'business',
      primaryPlatform: 'tiktok',
      defaultFormat: 'short',
      defaultTone: 'expert_analytical',
      targetDuration: '60s',
      targetAudience: 'Khán giả 20 - 35 tuổi quan tâm đến lĩnh vực...',
      audiencePainPoints: ['Thiếu kiến thức thực tế', 'Chưa có lộ trình bài bản'],
      audienceDesires: ['Đạt được kết quả nhanh chóng, an toàn', 'Tiết kiệm thời gian'],
      knowledgeLevel: 'beginner',
      creatorPersona: 'Chân thực, đanh thép, dẫn chứng số liệu thực tế, không lý thuyết suông.',
      catchphrases: ['Sự thật là...', 'Đừng bỏ qua điều này.'],
      openingHookRule: 'Bóc mẽ ngộ nhận tai hại trong 3 giây đầu.',
      endingCtaRule: 'Kêu gọi follow kênh ngắn gọn.',
      bannedWords: ['làm giàu không khó', 'chào mừng các bạn quay trở lại'],
      contentPillars: [
        { title: '1. Giải mã sai lầm', description: 'Chỉ ra các bẫy phổ biến' },
        { title: '2. Hướng dẫn từng bước', description: 'Lộ trình thực chiến áp dụng ngay' }
      ],
      visualPacingGuideline: 'Quay rõ nét, cắt cảnh nhanh 2-3s/shot, chữ to tương phản cao.',
      createdAt: new Date().toISOString()
    };
    const updatedList = [newChan, ...channels];
    setSelectedChannelId(newChan.id);
    setEditingChannel(newChan);
    onSaveChannels(updatedList, newChan.id);
  };

  const handleDeleteChannel = (id: string) => {
    if (channels.length <= 1) {
      alert('Bạn cần giữ lại ít nhất 1 Hồ sơ Kênh DNA trong hệ thống.');
      return;
    }
    const filtered = channels.filter(c => c.id !== id);
    const newActive = filtered[0].id;
    setSelectedChannelId(newActive);
    setEditingChannel(filtered[0]);
    onSaveChannels(filtered, newActive);
  };

  const handleGenerateAiDna = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Vui lòng nhập ý tưởng kênh bạn muốn xây dựng.');
      return;
    }
    setIsGeneratingAiDna(true);
    setAiError('');
    try {
      const generated = await generateAIChannelDNA({
        userPrompt: aiPrompt,
        category: aiCategory,
        platform: aiPlatform,
        targetAudienceInput: aiTargetAudience,
        creatorVibe: aiCreatorVibe
      });
      const updatedList = [generated, ...channels];
      setSelectedChannelId(generated.id);
      setEditingChannel(generated);
      onSaveChannels(updatedList, generated.id);
      setActiveTab('profile');
    } catch (err: any) {
      setAiError(err.message || 'Không thể tạo DNA Kênh từ AI. Vui lòng thử lại.');
    } finally {
      setIsGeneratingAiDna(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Kiến Trúc Sư DNA Kênh (Channel DNA Architect)
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Bộ lọc cốt lõi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Định hình bản sắc, chân dung khán giả, phong cách thoại và quy tắc cấm kỵ để AI viết kịch bản chuẩn 100%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateBlankChannel}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
            >
              <span>➕</span> Tạo Kênh Mới
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Channels Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Kênh của bạn:
          </span>
          {channels.map((chan) => (
            <button
              key={chan.id}
              onClick={() => handleSwitchChannel(chan.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all border ${
                selectedChannelId === chan.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{chan.icon || '📺'}</span>
              <span>{chan.name}</span>
              {chan.id === activeChannelId && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Đang kích hoạt"></span>
              )}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('ai_architect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
              activeTab === 'ai_architect'
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-amber-950/20 border-amber-600/40 text-amber-400 hover:bg-amber-900/30'
            }`}
          >
            <span>✨</span> AI Sinh DNA Kênh Tự Động
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📌</span> 1. Định Vị & Nền Tảng
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audience'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯</span> 2. Khán Giả & Nỗi Đau
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'persona'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎙️</span> 3. Persona & Quy Tắc Khẩu Khí
          </button>
          <button
            onClick={() => setActiveTab('pillars')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pillars'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏛️</span> 4. Trụ Cột & Thị Giác
          </button>
          <button
            onClick={() => setActiveTab('ai_architect')}
            className={`py-3 border-b-2 transition-all ml-auto flex items-center gap-1.5 ${
              activeTab === 'ai_architect'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-amber-500/80 hover:text-amber-300'
            }`}
          >
            <span>🤖</span> Trợ Lý AI Thiết Kế DNA
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Icon Biểu Tượng</label>
                  <input
                    type="text"
                    value={editingChannel.icon || '📺'}
                    onChange={e => setEditingChannel({ ...editingChannel, icon: e.target.value })}
                    className="w-full text-center text-2xl py-2 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none"
                    maxLength={4}
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Kênh Chính Thức *</label>
                  <input
                    type="text"
                    value={editingChannel.name}
                    onChange={e => setEditingChannel({ ...editingChannel, name: e.target.value })}
                    placeholder="VD: Tài Chính Thực Chiến - Din Finance"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Handle / Username</label>
                  <input
                    type="text"
                    value={editingChannel.handle || ''}
                    onChange={e => setEditingChannel({ ...editingChannel, handle: e.target.value })}
                    placeholder="@taichinhthucchien"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Tagline / Tuyên Ngôn Định Vị Kênh * (1 câu đanh thép nói rõ giá trị khác biệt)
                </label>
                <input
                  type="text"
                  value={editingChannel.tagline}
                  onChange={e => setEditingChannel({ ...editingChannel, tagline: e.target.value })}
                  placeholder="VD: Bóc tách sự thật về tiền bạc & đầu tư • Không an ủi suông • Không lùa gà"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none text-amber-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lĩnh Vực Cốt Lõi (Niche)</label>
                  <select
                    value={editingChannel.category}
                    onChange={e => setEditingChannel({ ...editingChannel, category: e.target.value as TopicCategory })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nền Tảng Phân Phối Chính</label>
                  <select
                    value={editingChannel.primaryPlatform}
                    onChange={e => setEditingChannel({ ...editingChannel, primaryPlatform: e.target.value as PlatformType })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tone Giọng Chủ Đạo</label>
                  <select
                    value={editingChannel.defaultTone}
                    onChange={e => setEditingChannel({ ...editingChannel, defaultTone: e.target.value as ToneOfVoice })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {Object.entries(TONE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Thời Lượng Video Mục Tiêu</label>
                  <input
                    type="text"
                    value={editingChannel.targetDuration}
                    onChange={e => setEditingChannel({ ...editingChannel, targetDuration: e.target.value })}
                    placeholder="VD: 60s hoặc 8m - 12m"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Trình Độ Khán Giả Mục Tiêu</label>
                  <select
                    value={editingChannel.knowledgeLevel || 'beginner'}
                    onChange={e => setEditingChannel({ ...editingChannel, knowledgeLevel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="beginner">Người Mới Bắt Đầu (Giải thích dễ hiểu, ẩn dụ đời thường)</option>
                    <option value="intermediate">Trung Cấp (Đã có kiến thức nền, cần chiến thuật thực chiến)</option>
                    <option value="advanced">Chuyên Sâu (Thuật ngữ chuyên ngành, phân tích số liệu vĩ mô)</option>
                    <option value="all">Mọi Đối Tượng (Đại chúng toàn dân)</option>
                  </select>
                </div>
              </div>

              {/* Curated Channel Presets Library quick picker */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📚</span> Thư Viện Mẫu DNA Kênh Triệu View (Curated Presets)
                  </span>
                  <span className="text-[11px] text-slate-400">Nhấn để nhập mẫu DNA chuẩn</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CURATED_CHANNEL_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 bg-slate-800/40 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/80 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{preset.icon}</span>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{preset.tagline}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Target Audience & Pain Points */}
          {activeTab === 'audience' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Chân Dung Khán Giả Mục Tiêu (Target Audience Persona) *
                </label>
                <textarea
                  value={editingChannel.targetAudience}
                  onChange={e => setEditingChannel({ ...editingChannel, targetAudience: e.target.value })}
                  rows={3}
                  placeholder="Mô tả độ tuổi, nghề nghiệp, tình trạng tâm lý, thói quen tiêu thụ nội dung..."
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Audience Pain Points */}
              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡</span> Nỗi Đau & Nỗi Sợ Hãi Thầm Kín Nhất Của Khán Giả (Pain Points)
                  </span>
                  <span className="text-[11px] text-red-400/80">AI sẽ dùng để tạo Hook trúng tim đen</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempPainPoint}
                    onChange={e => setTempPainPoint(e.target.value)}
                    placeholder="VD: Sợ mất tiền oan vào bẫy lừa đảo tài chính..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs focus:border-red-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tempPainPoint.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          audiencePainPoints: [...(editingChannel.audiencePainPoints || []), tempPainPoint.trim()]
                        });
                        setTempPainPoint('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempPainPoint.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          audiencePainPoints: [...(editingChannel.audiencePainPoints || []), tempPainPoint.trim()]
                        });
                        setTempPainPoint('');
                      }
                    }}
                    className="px-3 py-2 bg-red-800/60 hover:bg-red-700 text-xs font-bold text-red-100 rounded-lg"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingChannel.audiencePainPoints || []).map((pain, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-red-900/40 border border-red-700/50 text-red-200 text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <span>🔥 {pain}</span>
                      <button
                        onClick={() => {
                          const updated = (editingChannel.audiencePainPoints || []).filter((_, i) => i !== idx);
                          setEditingChannel({ ...editingChannel, audiencePainPoints: updated });
                        }}
                        className="text-red-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Audience Desires */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌟</span> Khao Khát & Mục Tiêu Muốn Đạt Được (Audience Desires)
                  </span>
                  <span className="text-[11px] text-emerald-400/80">AI sẽ dùng để định vị giải pháp cuối video</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempDesire}
                    onChange={e => setTempDesire(e.target.value)}
                    placeholder="VD: Đạt tự do tài chính trước 35 tuổi, có nguồn thu nhập thụ động..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs focus:border-emerald-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tempDesire.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          audienceDesires: [...(editingChannel.audienceDesires || []), tempDesire.trim()]
                        });
                        setTempDesire('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempDesire.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          audienceDesires: [...(editingChannel.audienceDesires || []), tempDesire.trim()]
                        });
                        setTempDesire('');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-800/60 hover:bg-emerald-700 text-xs font-bold text-emerald-100 rounded-lg"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingChannel.audienceDesires || []).map((desire, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-emerald-900/40 border border-emerald-700/50 text-emerald-200 text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <span>✨ {desire}</span>
                      <button
                        onClick={() => {
                          const updated = (editingChannel.audienceDesires || []).filter((_, i) => i !== idx);
                          setEditingChannel({ ...editingChannel, audienceDesires: updated });
                        }}
                        className="text-emerald-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Creator Persona, Catchphrases & Anti-AI Rules */}
          {activeTab === 'persona' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Hình Mẫu Creator & Khẩu Khí Giọng Kể (Persona Blueprint) *
                </label>
                <textarea
                  value={editingChannel.creatorPersona}
                  onChange={e => setEditingChannel({ ...editingChannel, creatorPersona: e.target.value })}
                  rows={3}
                  placeholder="VD: Alex Hormozi vibe - Đanh thép, nói thẳng vào bản chất, dùng con số thực chiến thay vì lý thuyết suông..."
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Catchphrases */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💬</span> Câu Cửa Miệng / Khẩu Hiệu Đặc Trưng (Catchphrases)
                  </span>
                  <span className="text-[11px] text-indigo-400">Đóng dấu phong cách độc bản</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempCatchphrase}
                    onChange={e => setTempCatchphrase(e.target.value)}
                    placeholder="VD: Con số không bao giờ biết nói dối | Đừng để tiền nằm chết..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tempCatchphrase.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          catchphrases: [...(editingChannel.catchphrases || []), tempCatchphrase.trim()]
                        });
                        setTempCatchphrase('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempCatchphrase.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          catchphrases: [...(editingChannel.catchphrases || []), tempCatchphrase.trim()]
                        });
                        setTempCatchphrase('');
                      }
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingChannel.catchphrases || []).map((phrase, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-900/50 border border-indigo-700/60 text-indigo-200 text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <span>"{phrase}"</span>
                      <button
                        onClick={() => {
                          const updated = (editingChannel.catchphrases || []).filter((_, i) => i !== idx);
                          setEditingChannel({ ...editingChannel, catchphrases: updated });
                        }}
                        className="text-indigo-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Quy Chuẩn Hook Mở Đầu 3s (Opening Hook Rule)
                  </label>
                  <textarea
                    value={editingChannel.openingHookRule}
                    onChange={e => setEditingChannel({ ...editingChannel, openingHookRule: e.target.value })}
                    rows={2}
                    placeholder="VD: Phản trực giác + Bóc mẽ ngộ nhận tai hại trong 3s đầu..."
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Quy Chuẩn Kêu Gọi Hành Động Cuối Video (Ending CTA Rule)
                  </label>
                  <textarea
                    value={editingChannel.endingCtaRule}
                    onChange={e => setEditingChannel({ ...editingChannel, endingCtaRule: e.target.value })}
                    rows={2}
                    placeholder="VD: Kêu gọi follow bảo vệ túi tiền, không xin xỏ dài dòng..."
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banned Words (Strict Anti-Cliché) */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🚫</span> Bộ Lọc Từ Cấm Kỵ & Văn Mẫu AI (Strict Banned Words)
                  </span>
                  <span className="text-[11px] text-rose-400/90">AI bị cấm tuyệt đối sử dụng các từ này</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempBannedWord}
                    onChange={e => setTempBannedWord(e.target.value)}
                    placeholder="VD: làm giàu không khó, trong thời đại 4.0, hãy cùng khám phá..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs focus:border-rose-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tempBannedWord.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          bannedWords: [...(editingChannel.bannedWords || []), tempBannedWord.trim()]
                        });
                        setTempBannedWord('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempBannedWord.trim()) {
                        setEditingChannel({
                          ...editingChannel,
                          bannedWords: [...(editingChannel.bannedWords || []), tempBannedWord.trim()]
                        });
                        setTempBannedWord('');
                      }
                    }}
                    className="px-3 py-2 bg-rose-800/60 hover:bg-rose-700 text-xs font-bold text-rose-100 rounded-lg"
                  >
                    + Thêm Từ Cấm
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingChannel.bannedWords || []).map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-rose-900/40 border border-rose-700/50 text-rose-200 text-xs rounded-lg flex items-center gap-1.5 line-through opacity-80 hover:opacity-100"
                    >
                      <span>❌ {word}</span>
                      <button
                        onClick={() => {
                          const updated = (editingChannel.bannedWords || []).filter((_, i) => i !== idx);
                          setEditingChannel({ ...editingChannel, bannedWords: updated });
                        }}
                        className="text-rose-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Content Pillars & Visual Guideline */}
          {activeTab === 'pillars' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Chỉ Dẫn Thị Giác & Dựng Hình (Visual & Pacing Guidelines) *
                </label>
                <textarea
                  value={editingChannel.visualPacingGuideline}
                  onChange={e => setEditingChannel({ ...editingChannel, visualPacingGuideline: e.target.value })}
                  rows={2}
                  placeholder="VD: Tỉ lệ 9:16, nhịp cắt nhanh 2-3s/shot, biểu đồ đồ họa sắc nét, chữ số to tương phản cao..."
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Content Pillars list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏛️</span> Các Trụ Cột Nội Dung Cốt Lõi (Content Pillars)
                  </span>
                  <span className="text-[11px] text-slate-400">Các chủ đề độc quyền của kênh</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(editingChannel.contentPillars || []).map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-800/50 border border-slate-700/80 rounded-xl relative group"
                    >
                      <button
                        onClick={() => {
                          const updated = (editingChannel.contentPillars || []).filter((_, i) => i !== idx);
                          setEditingChannel({ ...editingChannel, contentPillars: updated });
                        }}
                        className="absolute top-2.5 right-2.5 text-slate-500 hover:text-red-400 text-xs"
                        title="Xóa trụ cột"
                      >
                        ✕
                      </button>
                      <h4 className="text-xs font-bold text-indigo-300 pr-6 mb-1">{pillar.title}</h4>
                      <p className="text-xs text-slate-400">{pillar.description}</p>
                    </div>
                  ))}
                </div>

                {/* Add new Pillar */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Thêm Trụ Cột Mới:</span>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={tempPillarTitle}
                      onChange={e => setTempPillarTitle(e.target.value)}
                      placeholder="Tên trụ cột (VD: 1. Bóc phốt bẫy tài chính)"
                      className="md:col-span-4 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={tempPillarDesc}
                      onChange={e => setTempPillarDesc(e.target.value)}
                      placeholder="Mô tả nội dung cụ thể..."
                      className="md:col-span-6 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (tempPillarTitle.trim()) {
                          setEditingChannel({
                            ...editingChannel,
                            contentPillars: [
                              ...(editingChannel.contentPillars || []),
                              { title: tempPillarTitle.trim(), description: tempPillarDesc.trim() }
                            ]
                          });
                          setTempPillarTitle('');
                          setTempPillarDesc('');
                        }
                      }}
                      className="md:col-span-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI Channel Architect Generator */}
          {activeTab === 'ai_architect' && (
            <div className="space-y-5 animate-fadeIn bg-gradient-to-b from-indigo-950/20 to-slate-900 p-5 rounded-2xl border border-indigo-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Kiến Trúc Sư AI - Sinh Toàn Bộ DNA Kênh Trong 5 Giây
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chỉ cần mô tả ý tưởng sơ khai, AI sẽ lập chiến lược định vị, chân dung khán giả, Persona, và bộ quy tắc cấm kỵ hoàn chỉnh
                  </p>
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">
                  ⚠️ {aiError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Ý Tưởng Kênh Hoặc Sản Phẩm Bạn Muốn Xây Dựng *
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="VD: Tôi muốn xây dựng kênh TikTok về quản lý tài chính cho các bạn trẻ mới đi làm (Gen Z), phong cách đanh thép, bóc mẽ các chiêu trò FOMO và lừa đảo tài chính, đưa ra case study thực tế..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lĩnh Vực Dự Kiến</label>
                  <select
                    value={aiCategory}
                    onChange={e => setAiCategory(e.target.value as TopicCategory)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nền Tảng Ưu Tiên</label>
                  <select
                    value={aiPlatform}
                    onChange={e => setAiPlatform(e.target.value as PlatformType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Khán Giả Nhắm Tới (Tùy chọn)</label>
                  <input
                    type="text"
                    value={aiTargetAudience}
                    onChange={e => setAiTargetAudience(e.target.value)}
                    placeholder="VD: Dân văn phòng 22-30 tuổi"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phong Thái / Creator Vibe (Tùy chọn)</label>
                  <input
                    type="text"
                    value={aiCreatorVibe}
                    onChange={e => setAiCreatorVibe(e.target.value)}
                    placeholder="VD: Alex Hormozi, dí dỏm, hài hước, điện ảnh..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAiDna}
                disabled={isGeneratingAiDna}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingAiDna ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>AI Đang Thiết Kế Trọn Bộ Hồ Sơ DNA Kênh...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Tạo Toàn Bộ DNA Kênh Tự Động Với Gemini 3.7 Flash</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {channels.length > 1 && (
              <button
                onClick={() => handleDeleteChannel(editingChannel.id)}
                className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline transition-colors"
              >
                🗑️ Xóa Kênh Này
              </button>
            )}
            <span className="text-xs text-slate-400">
              Kênh đang cấu hình: <strong className="text-white">{editingChannel.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveCurrentChannel}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>💾</span>
              <span>Lưu & Kích Hoạt Kênh Này</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
