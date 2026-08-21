/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Script, ScriptData, ScriptFormat, ChannelDNA, BrainstormIdeaItem } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TwoColumnEditor from './components/TwoColumnEditor';
import ScreenplayEditor from './components/ScreenplayEditor';
import AIWizardModal from './components/AIWizardModal';
import IdeaBrainstormModal from './components/IdeaBrainstormModal';
import TemplateModal from './components/TemplateModal';
import TeleprompterModal from './components/TeleprompterModal';
import ExportModal from './components/ExportModal';
import OpenSourceModelsModal from './components/OpenSourceModelsModal';
import VoiceStudioModal from './components/VoiceStudioModal';
import HookThumbnailABModal from './components/HookThumbnailABModal';
import NarrativeArcModal from './components/NarrativeArcModal';
import LongFormChapterStudioModal from './components/LongFormChapterStudioModal';
import HumanizeDeAIModal from './components/HumanizeDeAIModal';
import PersonaLibraryModal from './components/PersonaLibraryModal';
import AIEngineHubModal from './components/AIEngineHubModal';
import FirstPassDraftModal from './components/FirstPassDraftModal';
import TrendTrackerModal from './components/TrendTrackerModal';
import DashboardModal from './components/DashboardModal';
import { ChannelSetupModal } from './components/ChannelSetupModal';
import AIAssistantSidebar from './components/AIAssistantSidebar';
import { useToast } from './context/ToastContext';

import { SAMPLE_TEMPLATES } from './data/templates';
import { getStoredEngineRouting, saveStoredEngineRouting } from './data/aiEnginePresets';
import { AIEngineRoutingConfig } from './types';
import { 
  CURATED_CHANNEL_PRESETS, 
  getStoredChannels, 
  saveStoredChannels, 
  getActiveStoredChannel, 
  setActiveStoredChannelId 
} from './data/channelPresets';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Layers, Plus, FileText, Dna, LayoutDashboard } from 'lucide-react';

export default function App() {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentScriptData, setCurrentScriptData] = useState<ScriptData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Channels DNA State
  const [channels, setChannels] = useState<ChannelDNA[]>(() => getStoredChannels());
  const [activeChannel, setActiveChannel] = useState<ChannelDNA>(() => getActiveStoredChannel());
  const [isChannelSetupOpen, setIsChannelSetupOpen] = useState(false);

  // Modals
  const [isAIWizardOpen, setIsAIWizardOpen] = useState(false);
  const [isFirstPassDraftOpen, setIsFirstPassDraftOpen] = useState(false);
  const [firstPassDraftHook, setFirstPassDraftHook] = useState('');
  const [isIdeaBrainstormOpen, setIsIdeaBrainstormOpen] = useState(false);
  const [isTrendTrackerOpen, setIsTrendTrackerOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [selectedIdeaForWizard, setSelectedIdeaForWizard] = useState<BrainstormIdeaItem | null>(null);
  const [isHookStudioOpen, setIsHookStudioOpen] = useState(false);
  const [isNarrativeArcOpen, setIsNarrativeArcOpen] = useState(false);
  const [isLongFormStudioOpen, setIsLongFormStudioOpen] = useState(false);
  const [isHumanizeStudioOpen, setIsHumanizeStudioOpen] = useState(false);
  const [isPersonaLibraryOpen, setIsPersonaLibraryOpen] = useState(false);
  const [isEngineHubOpen, setIsEngineHubOpen] = useState(false);
  const [aiEngineRouting, setAiEngineRouting] = useState<AIEngineRoutingConfig>(() => getStoredEngineRouting());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);


  // Initial Fetch Scripts & Channels
  useEffect(() => {
    fetchScripts();
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data);
          saveStoredChannels(data);
          // Find active channel
          const activeRes = await fetch('/api/channels/active');
          if (activeRes.ok) {
            const activeData = await activeRes.json();
            if (activeData) {
              setActiveChannel(activeData);
              setActiveStoredChannelId(activeData.id);
            }
          }
        }
      }
    } catch (e) {
      console.log("Using local channel presets fallback");
    }
  };

  const handleSaveChannels = async (updatedChannels: ChannelDNA[], newActiveId: string) => {
    setChannels(updatedChannels);
    saveStoredChannels(updatedChannels);
    setActiveStoredChannelId(newActiveId);
    const found = updatedChannels.find(c => c.id === newActiveId) || updatedChannels[0];
    if (found) {
      setActiveChannel(found);
    }

    // Persist to backend
    try {
      await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(found),
      });
      await fetch(`/api/channels/set-active/${newActiveId}`, { method: 'POST' });
      if (found) {
        toastSuccess(`Đã lưu & kích hoạt Channel DNA: ${found.name}`, 'Channel DNA');
      }
    } catch (e: any) {
      console.error("Error saving channel to backend:", e);
      toastError("Không thể lưu cấu hình kênh lên máy chủ.", "Lỗi Kênh");
    }
  };

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data: Script[] = await res.json();
      setScripts(data);

      if (data.length > 0 && !currentScriptData) {
        loadScript(data[0]);
      } else if (data.length === 0) {
        // Initialize with standard template if brand new
        const defaultTemplate = SAMPLE_TEMPLATES[0];
        const initialScript: ScriptData = {
          id: uuidv4(),
          title: defaultTemplate.title.replace(/^[^\s]+\s/, ''),
          format: defaultTemplate.format,
          platform: defaultTemplate.platform,
          topic: defaultTemplate.topic,
          tone: defaultTemplate.tone,
          targetDuration: defaultTemplate.targetDuration,
          summary: defaultTemplate.description,
          hook: defaultTemplate.previewHook,
          shots: defaultTemplate.shots,
          screenplayElements: defaultTemplate.screenplayElements,
        };
        setCurrentScriptData(initialScript);
        saveScriptToBackend(initialScript);
      }
    } catch (err) {
      console.error("Error fetching scripts:", err);
    }
  };

  const loadScript = (script: Script) => {
    try {
      const parsed: ScriptData = JSON.parse(script.content);
      // Fallback format check if legacy
      if (!parsed.format) parsed.format = 'short';
      if (!parsed.shots && !parsed.screenplayElements) {
        parsed.shots = [
          {
            id: uuidv4(),
            shotNumber: 1,
            timeRange: "0:00 - 0:03",
            visual: "Cận cảnh mở đầu",
            audio: "Câu nói mở đầu kịch bản...",
            onScreenText: "HOOK ⚡",
          }
        ];
      }
      setCurrentScriptData(parsed);
    } catch (e) {
      // Legacy compatibility
      const fallback: ScriptData = {
        id: script.id,
        title: script.title,
        format: 'short',
        platform: 'tiktok',
        topic: 'business',
        tone: 'energetic_viral',
        targetDuration: '60s',
        shots: [
          {
            id: uuidv4(),
            shotNumber: 1,
            timeRange: "0:00 - 0:03",
            visual: "Cận cảnh mở đầu",
            audio: "Câu mở đầu video...",
            onScreenText: "",
          }
        ]
      };
      setCurrentScriptData(fallback);
    }
  };

  const saveScriptToBackend = async (dataToSave?: ScriptData, isManual: boolean = false) => {
    const data = dataToSave || currentScriptData;
    if (!data) return;

    setIsSaving(true);
    try {
      const payload: Script = {
        id: data.id,
        title: data.title || "Kịch bản chưa đặt tên",
        content: JSON.stringify(data),
      };

      const resPost = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resPost.ok) {
        throw new Error(`Lỗi máy chủ (${resPost.status}): Không thể lưu kịch bản`);
      }

      const res = await fetch('/api/scripts');
      const updatedList = await res.json();
      setScripts(updatedList);

      if (isManual) {
        toastSuccess(`Đã lưu "${data.title || 'Kịch bản'}" thành công!`, 'Lưu Kịch Bản');
      }
    } catch (error: any) {
      console.error("Error saving script:", error);
      toastError(error?.message || "Không thể lưu kịch bản vào cơ sở dữ liệu.", "Lỗi Lưu Trữ");
    } finally {
      setTimeout(() => setIsSaving(false), 600);
    }
  };

  const handleCreateNewManual = () => {
    const newScript: ScriptData = {
      id: uuidv4(),
      title: "Kịch bản mới",
      format: "short",
      platform: "tiktok",
      topic: "business",
      tone: "energetic_viral",
      targetDuration: "60s",
      summary: "Kịch bản sáng tạo thủ công",
      hook: "Bạn có biết bí mật này chưa?",
      shots: [
        {
          id: uuidv4(),
          shotNumber: 1,
          timeRange: "0:00 - 0:03",
          visual: "Cận cảnh Creator làm động tác thu hút sự chú ý",
          audio: "Dừng lại 3 giây nếu bạn muốn biết bí mật này!",
          onScreenText: "BÍ MẬT 3S ⚡",
          notes: "Nói dứt khoát, âm thanh drop beat"
        },
        {
          id: uuidv4(),
          shotNumber: 2,
          timeRange: "0:03 - 0:15",
          visual: "Chuyển cảnh B-roll mô tả vấn đề thực tế",
          audio: "Hầu hết mọi người đều mắc phải sai lầm cơ bản này...",
          onScreenText: "VẤN ĐỀ NẰM Ở ĐÂU?",
          notes: ""
        }
      ]
    };
    setCurrentScriptData(newScript);
    saveScriptToBackend(newScript);
    toastSuccess('Đã tạo kịch bản mới thành công!', 'Kịch Bản Mới');
  };

  const handleSelectScript = (script: Script) => {
    loadScript(script);
  };

  const handleDeleteScript = async (id: string) => {
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Không thể xóa kịch bản trên máy chủ');
      const remaining = scripts.filter(s => s.id !== id);
      setScripts(remaining);
      if (currentScriptData?.id === id) {
        if (remaining.length > 0) {
          loadScript(remaining[0]);
        } else {
          setCurrentScriptData(null);
        }
      }
      toastInfo('Đã xóa kịch bản khỏi danh sách.', 'Đã Xóa');
    } catch (err: any) {
      toastError(err.message || 'Lỗi khi xóa kịch bản', 'Lỗi Thao Tác');
    }
  };

  const handleDuplicateScript = (script: Script) => {
    try {
      const data: ScriptData = JSON.parse(script.content);
      const cloned: ScriptData = {
        ...data,
        id: uuidv4(),
        title: `${data.title} (Bản sao)`,
      };
      setCurrentScriptData(cloned);
      saveScriptToBackend(cloned);
      toastSuccess(`Đã nhân bản "${cloned.title}"!`, 'Nhân Bản Thành Công');
    } catch (e: any) {
      toastError('Không thể nhân bản kịch bản này.', 'Lỗi');
    }
  };

  const handleScriptChange = (updated: ScriptData) => {
    setCurrentScriptData(updated);
  };

  const handleChangeFormat = (format: ScriptFormat) => {
    if (!currentScriptData) return;
    if (format === 'screenplay' && !currentScriptData.screenplayElements) {
      // Initialize default screenplay elements
      const elements = [
        { id: uuidv4(), type: 'SCENE_HEADING' as const, text: 'NỘI CẢNH. PHÒNG LÀM VIỆC - NGÀY' },
        { id: uuidv4(), type: 'ACTION' as const, text: 'Mô tả diễn biến khung cảnh...' },
        { id: uuidv4(), type: 'CHARACTER' as const, text: 'NHÂN VẬT CHÍNH' },
        { id: uuidv4(), type: 'DIALOGUE' as const, text: currentScriptData.hook || 'Đây là câu thoại đầu tiên.' },
      ];
      const updated = { ...currentScriptData, format, screenplayElements: elements };
      setCurrentScriptData(updated);
      saveScriptToBackend(updated);
      toastInfo('Đã chuyển sang định dạng Kịch bản Điện Ảnh Hollywood', 'Định Dạng Kịch Bản');
    } else {
      const updated = { ...currentScriptData, format };
      setCurrentScriptData(updated);
      saveScriptToBackend(updated);
      toastInfo(`Đã chuyển sang ${format === 'short' ? 'Kịch bản Video Ngắn (TikTok/Reels/Shorts)' : 'Kịch bản 2 Cột Audio/Visual'}`, 'Định Dạng Kịch Bản');
    }
  };

  return (
    <div className="flex h-screen bg-zinc-100 text-zinc-900 overflow-hidden font-sans">
      {/* Sidebar: Projects and Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        scripts={scripts}
        currentScriptId={currentScriptData?.id || null}
        activeChannel={activeChannel}
        onOpenChannelDNA={() => setIsChannelSetupOpen(true)}
        onOpenIdeaBrainstorm={() => setIsIdeaBrainstormOpen(true)}
        onOpenTrendTracker={() => setIsTrendTrackerOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onSelectScript={handleSelectScript}
        onCreateNewManual={handleCreateNewManual}
        onOpenAIWizard={() => {
          setSelectedIdeaForWizard(null);
          setIsAIWizardOpen(true);
        }}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onDeleteScript={handleDeleteScript}
        onDuplicateScript={handleDuplicateScript}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentScript={currentScriptData}
          activeChannel={activeChannel}
          onOpenChannelDNA={() => setIsChannelSetupOpen(true)}
          onOpenIdeaBrainstorm={() => setIsIdeaBrainstormOpen(true)}
          onOpenTrendTracker={() => setIsTrendTrackerOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onOpenFirstPassDraft={() => {
            setFirstPassDraftHook(currentScriptData?.hook || '');
            setIsFirstPassDraftOpen(true);
          }}
          onUpdateTitle={(title) => {
            if (currentScriptData) {
              const updated = { ...currentScriptData, title };
              setCurrentScriptData(updated);
            }
          }}
          onSave={() => saveScriptToBackend(undefined, true)}
          isSaving={isSaving}
          onOpenAIWizard={() => {
            setSelectedIdeaForWizard(null);
            setIsAIWizardOpen(true);
          }}
          onCreateNewManual={handleCreateNewManual}
          onOpenHookStudio={() => setIsHookStudioOpen(true)}
          onOpenNarrativeArc={() => setIsNarrativeArcOpen(true)}
          onOpenLongFormStudio={() => setIsLongFormStudioOpen(true)}
          onOpenHumanizeStudio={() => setIsHumanizeStudioOpen(true)}
          onOpenPersonaLibrary={() => setIsPersonaLibraryOpen(true)}
          onOpenEngineHub={() => setIsEngineHubOpen(true)}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}

          onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenModelSettings={() => setIsModelSettingsOpen(true)}
          onOpenVoiceStudio={() => setIsVoiceStudioOpen(true)}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          toggleAIPanel={() => setAiPanelOpen(!aiPanelOpen)}
          aiPanelOpen={aiPanelOpen}
          onChangeFormat={handleChangeFormat}
        />

        {/* Studio Canvas / Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-100/90">
          {currentScriptData ? (
            currentScriptData.format === 'screenplay' ? (
              <ScreenplayEditor
                scriptData={currentScriptData}
                onChange={handleScriptChange}
                onOpenNarrativeArc={() => setIsNarrativeArcOpen(true)}
                onOpenFirstPassDraft={() => {
                  setFirstPassDraftHook(currentScriptData.hook || '');
                  setIsFirstPassDraftOpen(true);
                }}
              />
            ) : (
              <TwoColumnEditor
                scriptData={currentScriptData}
                onChange={handleScriptChange}
                onOpenModelSettings={() => setIsModelSettingsOpen(true)}
                onOpenVoiceStudio={() => setIsVoiceStudioOpen(true)}
                onOpenFirstPassDraft={() => {
                  setFirstPassDraftHook(currentScriptData.hook || '');
                  setIsFirstPassDraftOpen(true);
                }}
              />
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 max-w-5xl mx-auto overflow-y-auto animate-in fade-in duration-200">
              
              {/* Welcome Header with Active Channel */}
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl text-xs shadow-sm mb-1">
                  <span>{activeChannel?.icon || '🧬'}</span>
                  <span className="text-indigo-200 font-bold">DNA Kênh: {activeChannel?.name || 'Kênh Sáng Tạo'}</span>
                  <button 
                    onClick={() => setIsChannelSetupOpen(true)}
                    className="text-[10px] text-indigo-400 hover:text-white underline font-semibold ml-1"
                  >
                    Đổi kênh
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                  Chào mừng đến với <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ScriptFlow Studio</span>
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 max-w-xl mx-auto">
                  Quy trình sáng tạo kịch bản chuẩn hóa: Bắt trend Google ➔ Lên ý tưởng ➔ Viết bản thảo 2 cột ➔ Tinh chỉnh & Khử văn mẫu AI
                </p>
              </div>

              {/* 4 Core Workflow Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
                
                {/* Card 1: Trend & Idea Lab */}
                <div className="p-5 bg-white border border-amber-200/90 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 text-lg group-hover:scale-110 transition-transform">
                      🔥
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                        1. Săn Trend & Ý Tưởng
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Quét từ khóa Google Search realtime & lên ý tưởng bóc mẽ, phản trực giác.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setIsTrendTrackerOpen(true)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      🔥 Trend Tracker
                    </button>
                    <button
                      onClick={() => setIsIdeaBrainstormOpen(true)}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      💡 Lên Ý Tưởng
                    </button>
                  </div>
                </div>

                {/* Card 2: First-Pass Quick Draft */}
                <div className="p-5 bg-white border border-orange-200/90 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600 text-lg group-hover:scale-110 transition-transform">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
                        2. Bản Thảo Siêu Tốc
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Nhập 1 câu Hook / Tiêu đề ➔ AI tự động viết kịch bản 2 cột hoàn chỉnh theo DNA.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setFirstPassDraftHook('');
                        setIsFirstPassDraftOpen(true);
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                    >
                      ⚡ Tạo Bản Thảo Nhanh
                    </button>
                  </div>
                </div>

                {/* Card 3: AI Full Auto Wizard */}
                <div className="p-5 bg-white border border-indigo-200/90 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-200 flex items-center justify-center text-indigo-600 text-lg group-hover:scale-110 transition-transform">
                      🪄
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        3. AI Tự Động A-Z
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Trợ lý AI hướng dẫn theo từng bước: Chủ đề ➔ Cấu trúc ➔ Phân cảnh chi tiết.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSelectedIdeaForWizard(null);
                        setIsAIWizardOpen(true);
                      }}
                      className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wand2 size={14} className="text-amber-400" /> Mở AI Wizard
                    </button>
                  </div>
                </div>

                {/* Card 4: Templates & Manual */}
                <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 text-lg group-hover:scale-110 transition-transform">
                      📋
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        4. Mẫu Có Sẵn & Thủ Công
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Chọn kịch bản mẫu từ thư viện hoặc tự do viết kịch bản thủ công.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Layers size={13} /> Thư Viện Mẫu
                    </button>
                    <button
                      onClick={handleCreateNewManual}
                      className="w-full py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus size={13} /> Tạo Thủ Công
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Access & Recent Scripts */}
              <div className="w-full bg-white/80 border border-zinc-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsDashboardOpen(true)}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-all"
                  >
                    <LayoutDashboard size={14} className="text-indigo-600" />
                    <span>Xem Dashboard Thống Kê ({scripts.length} kịch bản)</span>
                  </button>
                </div>

                {scripts.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                    <span className="text-zinc-400 text-[11px] shrink-0">Mở gần đây:</span>
                    {scripts.slice(0, 3).map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectScript(s)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-medium truncate max-w-[140px] transition-colors"
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Right AI Co-Pilot Assistant Panel */}
      <AnimatePresence>
        {aiPanelOpen && currentScriptData && (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-80 md:w-96 shrink-0 h-full z-30"
          >
            <AIAssistantSidebar
              scriptData={currentScriptData}
              onUpdateScript={(updated) => {
                setCurrentScriptData(updated);
                saveScriptToBackend(updated);
              }}
              onClose={() => setAiPanelOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modal 1: AI Wizard (Full Auto A-Z) */}
      <AIWizardModal
        isOpen={isAIWizardOpen}
        onClose={() => setIsAIWizardOpen(false)}
        activeChannel={activeChannel}
        channels={channels}
        initialIdea={selectedIdeaForWizard}
        onOpenIdeaBrainstorm={() => {
          setIsAIWizardOpen(false);
          setIsIdeaBrainstormOpen(true);
        }}
        onOpenChannelSetup={() => {
          setIsAIWizardOpen(false);
          setIsChannelSetupOpen(true);
        }}
        onSelectChannel={(chan) => {
          setActiveChannel(chan);
          setActiveStoredChannelId(chan.id);
        }}
        onComplete={(newScript) => {
          setCurrentScriptData(newScript);
          saveScriptToBackend(newScript);
        }}
      />

      {/* Modal: AI Viral Idea Brainstorm Lab & Idea Bank */}
      <IdeaBrainstormModal
        isOpen={isIdeaBrainstormOpen}
        onClose={() => setIsIdeaBrainstormOpen(false)}
        activeChannel={activeChannel}
        onOpenChannelDNA={() => {
          setIsIdeaBrainstormOpen(false);
          setIsChannelSetupOpen(true);
        }}
        onOpenTrendTracker={() => {
          setIsIdeaBrainstormOpen(false);
          setIsTrendTrackerOpen(true);
        }}
        onOpenFirstPassWithIdea={(idea) => {
          setFirstPassDraftHook(idea.hook || idea.title || '');
          setIsIdeaBrainstormOpen(false);
          setIsFirstPassDraftOpen(true);
        }}
        onSelectIdeaForScript={(idea) => {
          setSelectedIdeaForWizard(idea);
          setIsIdeaBrainstormOpen(false);
          setIsAIWizardOpen(true);
        }}
      />

      {/* Modal: Real-time Trend Tracker with Google Search Grounding */}
      <TrendTrackerModal
        isOpen={isTrendTrackerOpen}
        onClose={() => setIsTrendTrackerOpen(false)}
        activeChannel={activeChannel}
        onOpenChannelDNA={() => {
          setIsTrendTrackerOpen(false);
          setIsChannelSetupOpen(true);
        }}
        onOpenFirstPassWithIdea={(idea) => {
          setFirstPassDraftHook(idea.hook || idea.title || '');
          setIsTrendTrackerOpen(false);
          setIsFirstPassDraftOpen(true);
        }}
        onSelectIdeaForScript={(idea) => {
          setSelectedIdeaForWizard(idea);
          setIsTrendTrackerOpen(false);
          setIsAIWizardOpen(true);
        }}
      />

      {/* Modal 0: Channel DNA Architect & Manager */}
      <ChannelSetupModal
        isOpen={isChannelSetupOpen}
        onClose={() => setIsChannelSetupOpen(false)}
        channels={channels}
        activeChannelId={activeChannel?.id || ''}
        onSaveChannels={handleSaveChannels}
        onSelectChannelToUse={(chan) => {
          setActiveChannel(chan);
          setActiveStoredChannelId(chan.id);
        }}
      />

      {/* Modal 2: Template Library */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(templateScript) => {
          setCurrentScriptData(templateScript);
          saveScriptToBackend(templateScript);
        }}
      />

      {/* Modal 3: Teleprompter Mode */}
      {currentScriptData && (
        <TeleprompterModal
          isOpen={isTeleprompterOpen}
          onClose={() => setIsTeleprompterOpen(false)}
          scriptData={currentScriptData}
        />
      )}

      {/* Modal 4: Export & Share */}
      {currentScriptData && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          scriptData={currentScriptData}
        />
      )}

      {/* Modal 5: Open-Source AI Models Config */}
      <OpenSourceModelsModal
        isOpen={isModelSettingsOpen}
        onClose={() => setIsModelSettingsOpen(false)}
      />

      {/* Modal 6: AI Voice Studio & Voice Cloning */}
      {currentScriptData && (
        <VoiceStudioModal
          isOpen={isVoiceStudioOpen}
          onClose={() => setIsVoiceStudioOpen(false)}
          scriptData={currentScriptData}
          onUpdateScript={(updated) => {
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }}
        />
      )}

      {/* Modal 7: Hook A/B Test & CTR Thumbnail Studio */}
      {currentScriptData && (
        <HookThumbnailABModal
          isOpen={isHookStudioOpen}
          onClose={() => setIsHookStudioOpen(false)}
          scriptData={currentScriptData}
          onApplyHook={(hookText) => {
            const updated = { ...currentScriptData, hook: hookText };
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }}
          onApplyTitle={(headlineText) => {
            const updated = { ...currentScriptData, title: headlineText };
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }}
        />
      )}

      {/* Modal 8: Narrative Arc & Retention Beat Optimizer */}
      {currentScriptData && (
        <NarrativeArcModal
          isOpen={isNarrativeArcOpen}
          onClose={() => setIsNarrativeArcOpen(false)}
          scriptData={currentScriptData}
          onApplyBeatToShot={(shotNumber, revisedVisual, revisedAudio) => {
            if (!currentScriptData.shots) return;
            const updatedShots = currentScriptData.shots.map((s, idx) => {
              const currentNum = s.shotNumber || idx + 1;
              if (currentNum === shotNumber) {
                return {
                  ...s,
                  visual: revisedVisual,
                  audio: revisedAudio,
                };
              }
              return s;
            });
            const updated = { ...currentScriptData, shots: updatedShots };
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }}
        />
      )}

      {/* Modal 9: Long-Form Multi-Chapter Studio (10 - 30+ min & Anti-AI) */}
      {currentScriptData && (
        <LongFormChapterStudioModal
          isOpen={isLongFormStudioOpen}
          onClose={() => setIsLongFormStudioOpen(false)}
          scriptData={currentScriptData}
          onApplyFullScript={(updatedScript) => {
            setCurrentScriptData(updatedScript);
            saveScriptToBackend(updatedScript);
          }}
        />
      )}

      {/* Modal 10: Humanize & De-AI Engine Modal */}
      {currentScriptData && (
        <HumanizeDeAIModal
          isOpen={isHumanizeStudioOpen}
          onClose={() => setIsHumanizeStudioOpen(false)}
          scriptData={currentScriptData}
          onApplyHumanizedText={(newFullText, updatedShots) => {
            const updated = {
              ...currentScriptData,
              fullTextScript: newFullText,
              shots: updatedShots || currentScriptData.shots
            };
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }}
        />
      )}

      {/* Modal 11: Persona Library & Deep Domain Styles Modal */}
      <PersonaLibraryModal
        isOpen={isPersonaLibraryOpen}
        onClose={() => setIsPersonaLibraryOpen(false)}
        scriptData={currentScriptData}
        onApplyPersonaToScript={(persona) => {
          if (currentScriptData) {
            const updated = {
              ...currentScriptData,
              summary: currentScriptData.summary 
                ? `${currentScriptData.summary}\n[Persona: ${persona.name}]` 
                : `[Persona: ${persona.name} - ${persona.tagline}]`
            };
            setCurrentScriptData(updated);
            saveScriptToBackend(updated);
          }
        }}
        onOpenDeAIWithPersona={(persona) => {
          setIsPersonaLibraryOpen(false);
          setIsHumanizeStudioOpen(true);
        }}
      />

      {/* Modal 12: Multi-AI Task Engine Hub (ChatGPT, Claude, Gemini, FLUX) */}
      <AIEngineHubModal
        isOpen={isEngineHubOpen}
        onClose={() => setIsEngineHubOpen(false)}
        currentRouting={aiEngineRouting}
        onUpdateRouting={(updated) => setAiEngineRouting(updated)}
      />

      {/* Modal 13: Instant First-Pass Draft Generator from Hook & Channel DNA */}
      <FirstPassDraftModal
        isOpen={isFirstPassDraftOpen}
        onClose={() => setIsFirstPassDraftOpen(false)}
        activeChannel={activeChannel}
        aiEngineRouting={aiEngineRouting}
        initialHook={firstPassDraftHook}
        onOpenEngineHub={() => {
          setIsFirstPassDraftOpen(false);
          setIsEngineHubOpen(true);
        }}
        onComplete={(newScript) => {
          setCurrentScriptData(newScript);
          saveScriptToBackend(newScript);
        }}
      />

      {/* Modal 14: Analytics & Insights Dashboard (recharts) */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        scripts={scripts}
        channels={channels}
        onSelectScript={handleSelectScript}
      />
    </div>
  );
}

