import React, { useState, useEffect, useRef } from 'react';
import { 
  VoiceProfile, 
  VoiceStudioSettings, 
  TwoColumnShot, 
  ScriptData, 
  VoiceAccent, 
  VoiceGender 
} from '../types';
import { 
  getSavedVoiceProfiles, 
  saveCustomVoiceProfile, 
  deleteCustomVoiceProfile, 
  getVoiceStudioSettings, 
  saveVoiceStudioSettings, 
  DEFAULT_STUDIO_SETTINGS,
  globalVoicePlayer,
  cleanTextForSpeech,
  playFullScriptSequential,
  getAudioEngineMapping,
  voiceLogger,
  VoiceDiagnosticLog,
  AudioEngineMapping,
  testTTSBackendConnection,
  VOICE_SETTINGS_STORAGE_KEY,
  CLONE_VOICES_STORAGE_KEY
} from '../services/voiceService';
import { 
  Mic, 
  Play, 
  Square, 
  Pause, 
  Volume2, 
  Sparkles, 
  Sliders, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  Radio, 
  Download, 
  Settings2, 
  X, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Zap,
  Flame,
  AudioWaveform,
  UserCheck,
  Terminal,
  Copy,
  CheckCheck,
  Database,
  Cpu,
  Layers,
  Bug,
  Activity,
  ArrowRight,
  Info,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import AudioSrtExportModal from './AudioSrtExportModal';
import { v4 as uuidv4 } from 'uuid';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
  onUpdateScript?: (updated: ScriptData) => void;
}

export default function VoiceStudioModal({
  isOpen,
  onClose,
  scriptData,
  onUpdateScript
}: VoiceStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'voiceover' | 'clone' | 'pro_api' | 'debug'>('voiceover');
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [settings, setSettings] = useState<VoiceStudioSettings>(DEFAULT_STUDIO_SETTINGS);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const isCancelledRef = useRef({ current: false });

  // Clone Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloneAccent, setCloneAccent] = useState<VoiceAccent>('north_vn');
  const [cloneGender, setCloneGender] = useState<VoiceGender>('male');
  const [cloneDesc, setCloneDesc] = useState('Giọng nói clone cá nhân hóa');
  const [isCloningAnalyzing, setIsCloningAnalyzing] = useState(false);
  const [cloneSuccessMessage, setCloneSuccessMessage] = useState<string | null>(null);

  // Debug Console States
  const [diagnosticLogs, setDiagnosticLogs] = useState<VoiceDiagnosticLog[]>([]);
  const [logFilter, setLogFilter] = useState<'ALL' | 'PERSISTENCE' | 'MAPPING' | 'SYNTHESIS' | 'AUDIO_ENGINE' | 'FALLBACK'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [storageCheck, setStorageCheck] = useState<{ raw: string | null; parsed: any; isSynced: boolean }>({ raw: null, parsed: null, isSynced: true });
  const [shotTestResults, setShotTestResults] = useState<Record<string, { durationMs: number; status: number; bufferSize: number; error?: string; timestamp: string }>>({});
  const [testingShotIndex, setTestingShotIndex] = useState<number | null>(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestStatus, setBackendTestStatus] = useState<any>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const shots = scriptData.shots || [];

  // Update storage check info
  const refreshStorageCheck = (currentSettings?: VoiceStudioSettings) => {
    try {
      const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
      let parsed = null;
      if (raw) parsed = JSON.parse(raw);
      const activeId = currentSettings?.selectedVoiceId || settings.selectedVoiceId;
      const isSynced = parsed && parsed.selectedVoiceId === activeId;
      setStorageCheck({ raw, parsed, isSynced: !!isSynced });
    } catch (e) {
      setStorageCheck({ raw: null, parsed: null, isSynced: false });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setProfiles(getSavedVoiceProfiles());
      const savedSettings = getVoiceStudioSettings();
      setSettings(savedSettings);
      refreshStorageCheck(savedSettings);
      setDiagnosticLogs(voiceLogger.getLogs());
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
      isCancelledRef.current.current = false;

      // Subscribe to live diagnostic logger
      const unsubscribe = voiceLogger.subscribe((newLogs) => {
        setDiagnosticLogs(newLogs);
      });

      return () => {
        unsubscribe();
      };
    } else {
      handleStopAudio();
    }
  }, [isOpen]);

  const activeProfile = profiles.find(p => p.id === settings.selectedVoiceId) || profiles[0] || null;
  const currentEngineMapping = activeProfile ? getAudioEngineMapping(activeProfile.id, settings) : null;

  const handleSelectVoice = (id: string) => {
    const updated = { ...settings, selectedVoiceId: id };
    setSettings(updated);
    saveVoiceStudioSettings(updated);
    refreshStorageCheck(updated);
    voiceLogger.log('info', 'PERSISTENCE', `Người dùng chuyển sang Voice ID: [${id}] - Tên: ${profiles.find(p => p.id === id)?.name || id}`);
  };

  const handleSettingsChange = (field: keyof VoiceStudioSettings, val: any) => {
    const updated = { ...settings, [field]: val };
    setSettings(updated);
    saveVoiceStudioSettings(updated);
    refreshStorageCheck(updated);
  };

  const handleForceSaveStorage = () => {
    saveVoiceStudioSettings(settings);
    refreshStorageCheck(settings);
    voiceLogger.log('success', 'PERSISTENCE', `Đã cưỡng bức lưu lại Voice Settings vào localStorage: ${JSON.stringify(settings)}`);
  };

  const handleResetDefaultSettings = () => {
    setSettings(DEFAULT_STUDIO_SETTINGS);
    saveVoiceStudioSettings(DEFAULT_STUDIO_SETTINGS);
    refreshStorageCheck(DEFAULT_STUDIO_SETTINGS);
    voiceLogger.log('warn', 'PERSISTENCE', `Đã reset cấu hình Voice về mặc định (${DEFAULT_STUDIO_SETTINGS.selectedVoiceId})`);
  };

  const handleTestBackendPing = async () => {
    setIsTestingBackend(true);
    setBackendTestStatus(null);
    try {
      const res = await testTTSBackendConnection('Kiểm tra phản hồi âm thanh từ máy chủ AI.', activeProfile?.id || 'vn_male_north_pro');
      setBackendTestStatus(res);
    } finally {
      setIsTestingBackend(false);
    }
  };

  // Test Speak Single Shot from Debug Console
  const handleTestShotInEngine = async (shot: TwoColumnShot, index: number) => {
    if (!activeProfile) return;
    setTestingShotIndex(index);
    const cleaned = cleanTextForSpeech(shot.audio);
    const start = performance.now();

    try {
      voiceLogger.log('info', 'MAPPING', `[Debug Inspector] Kiểm thử Phân cảnh #${shot.shotNumber} với Voice [${activeProfile.id}] -> Model: ${currentEngineMapping?.backendNeuralModel}`);
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleaned,
          voiceId: activeProfile.id,
          rate: (activeProfile.rate || 1.0) * (settings.rate || 1.0),
          pitch: (activeProfile.pitch || 1.0) * (settings.pitch || 1.0),
        })
      });

      const durationMs = Math.round(performance.now() - start);

      if (res.ok) {
        const blob = await res.blob();
        setShotTestResults(prev => ({
          ...prev,
          [shot.id]: {
            durationMs,
            status: res.status,
            bufferSize: blob.size,
            timestamp: new Date().toLocaleTimeString()
          }
        }));

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        const errText = await res.text();
        setShotTestResults(prev => ({
          ...prev,
          [shot.id]: {
            durationMs,
            status: res.status,
            bufferSize: 0,
            error: errText,
            timestamp: new Date().toLocaleTimeString()
          }
        }));
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      setShotTestResults(prev => ({
        ...prev,
        [shot.id]: {
          durationMs,
          status: 0,
          bufferSize: 0,
          error: err.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setTestingShotIndex(null);
    }
  };

  // Copy Full Diagnostic Report
  const handleCopyDiagnosticReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      activeVoiceSelection: {
        inMemorySelectedId: settings.selectedVoiceId,
        activeProfileName: activeProfile?.name,
        activeProfileGender: activeProfile?.gender,
        activeProfileAccent: activeProfile?.accent,
        customSettings: {
          rate: settings.rate,
          pitch: settings.pitch,
          volume: settings.volume,
          pauseBetweenShotsMs: settings.pauseBetweenShotsMs
        }
      },
      persistenceInspection: {
        storageKey: VOICE_SETTINGS_STORAGE_KEY,
        rawLocalStorage: storageCheck.raw,
        parsedLocalStorage: storageCheck.parsed,
        isSynced: storageCheck.isSynced
      },
      mappedAudioEngine: currentEngineMapping,
      shotsCount: shots.length,
      shotEngineOutputs: shots.map((shot, i) => {
        const cleaned = cleanTextForSpeech(shot.audio);
        const mapping = activeProfile ? getAudioEngineMapping(activeProfile.id, settings) : null;
        return {
          shotNumber: shot.shotNumber,
          timeRange: shot.timeRange,
          characterCount: cleaned.length,
          wordCount: cleaned.split(/\s+/).filter(Boolean).length,
          textSnippet: cleaned.slice(0, 50),
          appliedVoiceId: activeProfile?.id,
          appliedModel: mapping?.backendNeuralModel,
          endpoint: mapping?.engineEndpoint,
          effectiveRate: mapping?.calculatedRate,
          effectivePitch: mapping?.calculatedPitch,
          recentTest: shotTestResults[shot.id] || null
        };
      }),
      recentLogs: diagnosticLogs.slice(0, 30)
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Test Speak Single Voice
  const handleTestVoice = (profile: VoiceProfile) => {
    handleStopAudio();
    setIsPlaying(true);
    const sampleText = profile.accent.includes('en')
      ? `Hello! This is a test sample for ${profile.name}. ScriptFlow AI creates engaging video scripts effortlessly.`
      : `Xin chào bạn! Đây là giọng đọc mẫu của ${profile.name}. Chúc bạn tạo ra những video kịch bản triệu view!`;

    globalVoicePlayer.speak(
      sampleText,
      profile,
      settings,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  // Play Entire Script
  const handlePlayFullScript = () => {
    if (isPlaying) {
      handleStopAudio();
      return;
    }

    if (!activeProfile || shots.length === 0) return;

    setIsPlaying(true);
    isCancelledRef.current.current = false;

    playFullScriptSequential(
      shots,
      activeProfile,
      settings,
      (index) => setCurrentPlayingIndex(index),
      () => {
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
      },
      isCancelledRef.current
    );
  };

  // Play Specific Shot
  const handlePlaySingleShot = (shot: TwoColumnShot, index: number) => {
    if (!activeProfile) return;
    handleStopAudio();
    setIsPlaying(true);
    setCurrentPlayingIndex(index);

    globalVoicePlayer.speak(
      shot.audio,
      activeProfile,
      settings,
      () => {},
      () => {
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
      },
      () => {
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
      }
    );
  };

  const handleStopAudio = () => {
    isCancelledRef.current.current = true;
    globalVoicePlayer.stop();
    setIsPlaying(false);
    setCurrentPlayingIndex(null);
  };

  // ================= VOICE CLONING (MIC & UPLOAD) ================= //
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedAudioUrl(url);
      if (!cloneName) {
        setCloneName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSaveClonedVoice = () => {
    if (!cloneName.trim()) {
      alert("Vui lòng đặt tên cho giọng clone");
      return;
    }

    setIsCloningAnalyzing(true);

    setTimeout(() => {
      const newProfile: VoiceProfile = {
        id: `clone_${uuidv4().slice(0, 8)}`,
        name: cloneName.trim(),
        gender: cloneGender,
        accent: cloneAccent,
        description: cloneDesc || 'Giọng AI được clone từ mẫu thu âm cá nhân',
        provider: 'custom_clone',
        rate: 1.0,
        pitch: cloneGender === 'male' ? 0.95 : 1.1,
        isCustomClone: true,
        sampleAudioUrl: recordedAudioUrl || undefined,
        avatarColor: 'from-amber-500 to-rose-600',
        tags: ['Clone Cá Nhân', 'Neural AI', cloneAccent === 'north_vn' ? 'Miền Bắc' : 'Miền Nam']
      };

      const updatedProfiles = saveCustomVoiceProfile(newProfile);
      setProfiles(updatedProfiles);
      handleSelectVoice(newProfile.id);
      setIsCloningAnalyzing(false);
      setCloneSuccessMessage(`Đã clone thành công giọng "${newProfile.name}"! Bạn có thể sử dụng ngay để đọc kịch bản.`);

      setRecordedAudioUrl(null);
      setCloneName('');
      setRecordingTime(0);

      setTimeout(() => {
        setCloneSuccessMessage(null);
        setActiveTab('voiceover');
      }, 1500);
    }, 1200);
  };

  const handleDeleteClone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa giọng clone này không?")) {
      const updated = deleteCustomVoiceProfile(id);
      setProfiles(updated);
      if (settings.selectedVoiceId === id) {
        handleSelectVoice(updated[0]?.id || 'vn_male_north_pro');
      }
    }
  };

  const filteredLogs = diagnosticLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.tag === logFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 text-white rounded-2xl shadow-md">
              <Headphones size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Phòng Thu AI & Lồng Tiếng (Voice Studio)
                </h2>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono rounded-full font-bold">
                  Active ID: {settings.selectedVoiceId}
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Tạo lồng tiếng Voiceover chuẩn studio, kiểm tra ánh xạ âm thanh & chẩn đoán kết nối
              </p>
            </div>
          </div>
          <button
            onClick={() => { handleStopAudio(); onClose(); }}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('voiceover')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'voiceover'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Volume2 size={15} />
              <span>1. Thư Viện Giọng & Đọc Kịch Bản</span>
            </button>

            <button
              onClick={() => setActiveTab('clone')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'clone'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Sparkles size={15} className="text-amber-500" />
              <span>2. Clone Giọng Nói (Thu Âm)</span>
            </button>

            <button
              onClick={() => setActiveTab('pro_api')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'pro_api'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Zap size={15} className="text-blue-500" />
              <span>3. Tích Hợp Pro</span>
            </button>

            <button
              onClick={() => setActiveTab('debug')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'debug'
                  ? 'border-rose-500 text-rose-600 bg-rose-50/40 rounded-t-lg'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Terminal size={15} className="text-purple-600" />
              <span className="flex items-center gap-1.5">
                4. Debug Console & Audio Engine
                <span className={`w-2 h-2 rounded-full ${storageCheck.isSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              </span>
            </button>
          </div>

          <div className="pb-2 hidden sm:block">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono font-medium flex items-center gap-1.5 ${
              storageCheck.isSynced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Database size={12} />
              {storageCheck.isSynced ? 'Storage Synced' : 'Storage Pending'}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: VOICEOVER & SCRIPT READING */}
          {activeTab === 'voiceover' && (
            <div className="space-y-6">
              {/* Voice Profiles Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 text-sm flex items-center gap-2">
                    <UserCheck size={16} className="text-rose-500" />
                    Chọn Giọng Đọc Phù Hợp Cho Kịch Bản ({profiles.length} giọng)
                  </label>
                  <button
                    onClick={() => setActiveTab('clone')}
                    className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> + Clone Giọng Của Tôi
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profiles.map((p) => {
                    const isSelected = p.id === settings.selectedVoiceId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectVoice(p.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/40 shadow-xs ring-1 ring-rose-500/30'
                            : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${p.avatarColor || 'from-zinc-700 to-zinc-900'} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                              {p.gender === 'male' ? '👨' : '👩'}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                {p.name}
                                {p.isCustomClone && (
                                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                                    Clone
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400">
                                {p.gender === 'male' ? 'Nam' : 'Nữ'} • {p.accent.includes('north') ? 'Miền Bắc' : p.accent.includes('south') ? 'Miền Nam' : 'Quốc tế'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTestVoice(p); }}
                              className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 shadow-2xs transition-colors"
                              title="Nghe thử giọng"
                            >
                              <Play size={12} className="fill-zinc-700" />
                            </button>
                            {p.isCustomClone && (
                              <button
                                onClick={(e) => handleDeleteClone(p.id, e)}
                                className="p-1.5 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg border border-zinc-200 transition-colors"
                                title="Xóa giọng clone này"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                          {p.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {(p.tags || []).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white text-zinc-600 rounded-md text-[9px] font-medium border border-zinc-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voice Tuning Sliders */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-700 font-bold text-xs">
                    <span>Tốc độ đọc (Speed)</span>
                    <span className="font-mono text-rose-600">{settings.rate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.05"
                    value={settings.rate}
                    onChange={(e) => handleSettingsChange('rate', parseFloat(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Chậm (0.7x)</span>
                    <span>Chuẩn (1.0x)</span>
                    <span>Nhanh (1.5x)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-700 font-bold text-xs">
                    <span>Cao độ (Pitch)</span>
                    <span className="font-mono text-rose-600">{settings.pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={settings.pitch}
                    onChange={(e) => handleSettingsChange('pitch', parseFloat(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Trầm ấm</span>
                    <span>Tự nhiên</span>
                    <span>Sôi nổi</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-700 font-bold text-xs">
                    <span>Nghỉ giữa các phân cảnh</span>
                    <span className="font-mono text-rose-600">{settings.pauseBetweenShotsMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    step="100"
                    value={settings.pauseBetweenShotsMs}
                    onChange={(e) => handleSettingsChange('pauseBetweenShotsMs', parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>0.2s (Nhanh)</span>
                    <span>0.6s (Chuẩn)</span>
                    <span>1.5s</span>
                  </div>
                </div>
              </div>

              {/* Master Audio Controller */}
              <div className="p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500 text-white rounded-xl">
                    <Radio size={20} className={isPlaying ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      Trình Phát Toàn Bộ Kịch Bản ({shots.length} phân cảnh)
                    </div>
                    <p className="text-xs text-zinc-400">
                      {isPlaying 
                        ? `Đang đọc phân cảnh #${(currentPlayingIndex !== null ? currentPlayingIndex + 1 : 1)} với giọng ${activeProfile?.name}...`
                        : `Sẵn sàng phát với giọng ${activeProfile?.name || 'Mặc định'}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    title="Xuất file âm thanh gộp MP3/WAV kèm file phụ đề .SRT đồng bộ"
                  >
                    <FolderArchive size={14} />
                    <span>Xuất Full Audio & SRT (.zip)</span>
                  </button>

                  <button
                    onClick={handlePlayFullScript}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white'
                    }`}
                  >
                    {isPlaying ? <Square size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                    <span>{isPlaying ? 'Dừng Phát' : 'Phát Lồng Tiếng Toàn Bộ'}</span>
                  </button>
                </div>
              </div>

              {/* Shot List with Direct Play Buttons */}
              <div className="space-y-2">
                <label className="font-bold text-zinc-800 text-xs block">
                  Danh sách phân cảnh & Lời thoại đọc:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {shots.map((shot, idx) => {
                    const isCurrent = isPlaying && currentPlayingIndex === idx;
                    return (
                      <div
                        key={shot.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isCurrent
                            ? 'bg-rose-50 border-rose-400 shadow-xs ring-1 ring-rose-400/40'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isCurrent ? 'bg-rose-500 text-white' : 'bg-zinc-200 text-zinc-700'
                          }`}>
                            #{shot.shotNumber}
                          </span>
                          <p className="text-xs text-zinc-800 truncate font-medium">
                            {cleanTextForSpeech(shot.audio) || "(Chưa có lời thoại)"}
                          </p>
                        </div>

                        <button
                          onClick={() => handlePlaySingleShot(shot, idx)}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Play size={10} className="fill-zinc-700" /> Nghe cảnh này
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE CLONING (RECORD & UPLOAD) */}
          {activeTab === 'clone' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-zinc-900 flex items-center justify-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Clone Giọng Nói Cá Nhân Chỉ Với 10-30 Giây Thu Âm
                </h3>
                <p className="text-xs text-zinc-500">
                  Hệ thống AI sẽ phân tích tần số âm thanh, ngữ điệu và sắc thái để tạo ra bản sao giọng đọc độc quyền của bạn.
                </p>
              </div>

              {cloneSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 font-semibold animate-in fade-in">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{cloneSuccessMessage}</span>
                </div>
              )}

              {/* Recording Box */}
              <div className="p-6 bg-gradient-to-b from-zinc-50 to-zinc-100 border border-zinc-200 rounded-3xl text-center space-y-4">
                <div className="flex justify-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 scale-105 animate-pulse'
                        : 'bg-gradient-to-tr from-rose-500 to-amber-500 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <Square size={24} className="fill-white" /> : <Mic size={28} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-zinc-800">
                    {isRecording ? `Đang thu âm: ${recordingTime}s` : 'Bấm nút micro để bắt đầu thu âm'}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {isRecording ? 'Hãy đọc to đoạn văn mẫu bên dưới để AI nhận diện rõ nhất' : 'Khuyến nghị thu âm trong không gian yên tĩnh từ 10 đến 30 giây'}
                  </p>
                </div>

                {/* Sample Reading Prompt */}
                <div className="p-3 bg-white border border-zinc-200 rounded-2xl text-left text-xs text-zinc-700 leading-relaxed shadow-2xs">
                  <span className="font-bold text-rose-600 block mb-1">📜 Đoạn văn bản đọc mẫu gợi ý:</span>
                  "Chào mừng bạn đến với kênh của tôi. Hôm nay tôi sẽ chia sẻ với bạn những bí quyết sáng tạo nội dung video ngắn thu hút hàng triệu lượt xem một cách dễ dàng và hiệu quả nhất!"
                </div>

                {/* File Upload Option */}
                <div className="pt-2 flex items-center justify-center gap-2 text-zinc-400 text-xs">
                  <span>Hoặc tải lên file ghi âm có sẵn:</span>
                  <label className="text-rose-600 hover:underline cursor-pointer font-bold inline-flex items-center gap-1">
                    <Upload size={12} /> Chọn file (.mp3, .wav)
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Recorded Audio */}
                {recordedAudioUrl && (
                  <div className="p-3 bg-white rounded-2xl border border-zinc-200 flex items-center justify-between gap-3 animate-in fade-in">
                    <span className="font-bold text-zinc-700 text-xs flex items-center gap-1.5">
                      <AudioWaveform size={14} className="text-emerald-600" /> Mẫu giọng đã sẵn sàng
                    </span>
                    <audio src={recordedAudioUrl} controls className="h-8 max-w-[240px]" />
                  </div>
                )}
              </div>

              {/* Voice Metadata Form */}
              <div className="space-y-3 p-5 bg-zinc-50 rounded-2xl border border-zinc-200">
                <h4 className="font-bold text-zinc-800 text-xs">Thông tin nhận diện Giọng Clone:</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-600 text-[11px] block">Tên Giọng:</label>
                    <input
                      type="text"
                      value={cloneName}
                      onChange={(e) => setCloneName(e.target.value)}
                      placeholder="Ví dụ: Giọng MC Phong Lê (Miền Bắc)"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-600 text-[11px] block">Chất giọng vùng miền:</label>
                    <select
                      value={cloneAccent}
                      onChange={(e) => setCloneAccent(e.target.value as VoiceAccent)}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800"
                    >
                      <option value="north_vn">Giọng Miền Bắc (Hà Nội)</option>
                      <option value="south_vn">Giọng Miền Nam (Sài Gòn)</option>
                      <option value="central_vn">Giọng Miền Trung</option>
                      <option value="us_en">Tiếng Anh (US English)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveClonedVoice}
                    disabled={isCloningAnalyzing || (!recordedAudioUrl && !cloneName)}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isCloningAnalyzing ? (
                      <>
                        <Sparkles size={14} className="animate-spin" /> Đang xử lý Clone AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Hoàn Tất & Lưu Giọng Clone
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRO API INTEGRATION (ElevenLabs, FPT, Vbee) */}
          {activeTab === 'pro_api' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-zinc-900 flex items-center justify-center gap-2">
                  <Zap size={18} className="text-blue-500" />
                  Kết Nối Dịch Vụ Giọng Đọc Pro (ElevenLabs / FPT.AI / Vbee)
                </h3>
                <p className="text-xs text-zinc-500">
                  Nếu bạn sở hữu API Key của các nhà cung cấp TTS chuyên nghiệp hàng đầu thế giới hoặc Việt Nam
                </p>
              </div>

              <div className="space-y-4">
                {/* ElevenLabs */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-xs flex items-center gap-2">
                      <Flame size={14} className="text-orange-500" /> ElevenLabs Voice Cloning API
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      Toàn cầu
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Nền tảng Voice Cloning AI chân thực nhất thế giới, hỗ trợ đa ngôn ngữ và cảm xúc điện ảnh.
                  </p>
                  <input
                    type="password"
                    value={settings.elevenLabsApiKey || ''}
                    onChange={(e) => handleSettingsChange('elevenLabsApiKey', e.target.value)}
                    placeholder="Nhập ElevenLabs API Key: xi-api-key-xxxxxxxx"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                {/* FPT.AI & Vbee (Vietnam) */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-xs flex items-center gap-2">
                      🇻🇳 FPT.AI / Vbee TTS (Giọng đọc Việt Nam)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Chuẩn VTV
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Các giọng đọc quen thuộc của BTV Đài truyền hình Việt Nam, đọc số, tên riêng và từ ghép tiếng Việt chuẩn xác 100%.
                  </p>
                  <input
                    type="password"
                    value={settings.fptApiKey || ''}
                    onChange={(e) => handleSettingsChange('fptApiKey', e.target.value)}
                    placeholder="Nhập FPT.AI API Key: xxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEDICATED DEBUGGING CONSOLE & AUDIO ENGINE INSPECTOR */}
          {activeTab === 'debug' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Banner: Real-time Selected Voice & Persistence Status */}
              <div className="p-5 bg-zinc-900 text-zinc-100 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        Bảng Điều Khiển Chẩn Đoán & Ánh Xạ Âm Thanh (Audio Engine Debugger)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Kiểm tra chi tiết luồng persistence localStorage, ánh xạ Model Neural và payload cho từng phân cảnh kịch bản
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Xuất file âm thanh gộp MP3/WAV và file SRT"
                    >
                      <FolderArchive size={13} />
                      <span>Xuất Audio & SRT</span>
                    </button>

                    <button
                      onClick={handleCopyDiagnosticReport}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Sao chép toàn bộ JSON chẩn đoán"
                    >
                      {copiedReport ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedReport ? 'Đã sao chép Report!' : 'Copy Diagnostic JSON'}</span>
                    </button>

                    <button
                      onClick={handleTestBackendPing}
                      disabled={isTestingBackend}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                    >
                      <Activity size={13} className={isTestingBackend ? 'animate-spin' : ''} />
                      <span>{isTestingBackend ? 'Testing...' : 'Ping TTS Engine'}</span>
                    </button>
                  </div>
                </div>

                {/* 3 Metric Diagnostics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Card 1: Selected Voice ID */}
                  <div className="p-3.5 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center justify-between">
                      <span>1. Selected Voice ID</span>
                      <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[9px]">Active</span>
                    </span>
                    <div className="font-mono text-xs font-bold text-rose-400 break-all">
                      {settings.selectedVoiceId}
                    </div>
                    <div className="text-[11px] text-zinc-300 font-medium flex items-center gap-1">
                      <span>{activeProfile?.name || 'Không tìm thấy'}</span>
                      <span className="text-zinc-500">({activeProfile?.gender === 'male' ? 'Nam' : 'Nữ'} • {activeProfile?.accent})</span>
                    </div>
                  </div>

                  {/* Card 2: LocalStorage Persistence */}
                  <div className="p-3.5 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center justify-between">
                      <span>2. LocalStorage Persistence</span>
                      {storageCheck.isSynced ? (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[9px] flex items-center gap-1">
                          <Check size={10} /> Synced
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold text-[9px] flex items-center gap-1">
                          <AlertCircle size={10} /> Desynced
                        </span>
                      )}
                    </span>
                    <div className="font-mono text-[11px] text-zinc-300 truncate">
                      Key: <code className="text-emerald-400 font-mono">{VOICE_SETTINGS_STORAGE_KEY}</code>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      Stored: {storageCheck.parsed?.selectedVoiceId || 'null'}
                    </div>
                  </div>

                  {/* Card 3: Backend Neural Mapping */}
                  <div className="p-3.5 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center justify-between">
                      <span>3. Backend Neural Model</span>
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[9px]">Edge TTS</span>
                    </span>
                    <div className="font-mono text-xs font-bold text-blue-400">
                      {currentEngineMapping?.backendNeuralModel}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Rate: {currentEngineMapping?.calculatedRate}x | Pitch: {currentEngineMapping?.calculatedPitch}
                    </div>
                  </div>
                </div>

                {/* Storage Controls & Quick Action Tools */}
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Thao tác Persistence:</span>
                    <button
                      onClick={handleForceSaveStorage}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Database size={11} /> Cưỡng bức Lưu (Force Save)
                    </button>
                    <button
                      onClick={handleResetDefaultSettings}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <RotateCcw size={11} /> Reset Defaults
                    </button>
                  </div>

                  {backendTestStatus && (
                    <div className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 ${
                      backendTestStatus.success ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' : 'bg-red-900/40 text-red-300 border border-red-700/50'
                    }`}>
                      <span>Ping: {backendTestStatus.status} OK ({backendTestStatus.durationMs}ms)</span>
                      <span>• {(backendTestStatus.bufferSize / 1024).toFixed(1)} KB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Mapped Audio Engine Output for Each Shot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Layers size={16} className="text-rose-500" />
                    Ánh Xạ Đầu Ra Audio Engine Cho Từng Phân Cảnh ({shots.length} shots)
                  </h4>
                  <span className="text-zinc-400 text-[11px]">
                    Hiển thị thông số gửi đến backend và kết quả âm thanh từng shot
                  </span>
                </div>

                {shots.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500">
                    Kịch bản hiện tại chưa có phân cảnh nào. Hãy tạo phân cảnh ở Bảng phân cảnh trước.
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-700 font-bold text-[11px]">
                            <th className="py-2.5 px-3 w-14">Shot #</th>
                            <th className="py-2.5 px-3 min-w-[200px]">Lời Thoại (Cleaned Narration)</th>
                            <th className="py-2.5 px-3 min-w-[130px]">Voice ID Đang Chọn</th>
                            <th className="py-2.5 px-3 min-w-[150px]">Mapped Neural Engine</th>
                            <th className="py-2.5 px-3 min-w-[100px]">Tốc Độ / Cao Độ</th>
                            <th className="py-2.5 px-3 w-36 text-right">Test Synth Output</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {shots.map((shot, idx) => {
                            const cleanedText = cleanTextForSpeech(shot.audio);
                            const shotTest = shotTestResults[shot.id];
                            const isTestingThis = testingShotIndex === idx;
                            const mapping = activeProfile ? getAudioEngineMapping(activeProfile.id, settings) : null;

                            return (
                              <tr key={shot.id} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="py-3 px-3 align-top font-bold text-zinc-900 font-mono">
                                  <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md">
                                    #{shot.shotNumber}
                                  </span>
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <p className="text-zinc-800 font-medium leading-relaxed mb-1">
                                    {cleanedText || <span className="text-zinc-400 italic">(Không có lời thoại)</span>}
                                  </p>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    {cleanedText.length} ký tự • {cleanedText.split(/\s+/).filter(Boolean).length} từ
                                  </span>
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <div className="font-mono font-bold text-rose-600 text-[11px]">
                                    {settings.selectedVoiceId}
                                  </div>
                                  <div className="text-zinc-500 text-[10px]">
                                    {activeProfile?.name}
                                  </div>
                                </td>
                                <td className="py-3 px-3 align-top font-mono">
                                  <div className="font-bold text-blue-700 text-[11px] flex items-center gap-1">
                                    <Cpu size={12} className="text-blue-500" />
                                    {mapping?.backendNeuralModel}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-sans">
                                    {mapping?.audioFormat}
                                  </div>
                                </td>
                                <td className="py-3 px-3 align-top font-mono text-[11px] text-zinc-600">
                                  <div>Speed: <strong className="text-zinc-900">{mapping?.calculatedRate}x</strong></div>
                                  <div>Pitch: <strong className="text-zinc-900">{mapping?.calculatedPitch}</strong></div>
                                </td>
                                <td className="py-3 px-3 align-top text-right space-y-1">
                                  <button
                                    onClick={() => handleTestShotInEngine(shot, idx)}
                                    disabled={isTestingThis || !cleanedText}
                                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition-all disabled:opacity-40"
                                  >
                                    <Play size={10} className={isTestingThis ? 'animate-spin' : 'fill-rose-600'} />
                                    <span>{isTestingThis ? 'Synthesizing...' : 'Test Synth'}</span>
                                  </button>

                                  {shotTest && (
                                    <div className="text-[9px] font-mono">
                                      {shotTest.status === 200 ? (
                                        <span className="text-emerald-600 font-bold block">
                                          ✓ 200 OK ({(shotTest.bufferSize / 1024).toFixed(1)}KB • {shotTest.durationMs}ms)
                                        </span>
                                      ) : (
                                        <span className="text-red-600 font-bold block truncate max-w-[120px]">
                                          ✕ Err: {shotTest.error || shotTest.status}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Real-time Audio Engine Log Terminal */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                      <Terminal size={14} className="text-purple-600" />
                      Nhật Ký Sự Kiện Real-Time (Live Event Logs - {diagnosticLogs.length} events)
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Log Filter Chips */}
                    {(['ALL', 'PERSISTENCE', 'MAPPING', 'SYNTHESIS', 'AUDIO_ENGINE', 'FALLBACK'] as const).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setLogFilter(tag)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                          logFilter === tag
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    <button
                      onClick={() => voiceLogger.clear()}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-red-50 text-zinc-500 hover:text-red-600 rounded-lg text-[10px] font-bold ml-1 transition-colors"
                      title="Xóa logs"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Log Terminal Window */}
                <div className="bg-zinc-950 text-zinc-200 rounded-2xl p-3 font-mono text-[11px] max-h-64 overflow-y-auto border border-zinc-800 space-y-1.5 shadow-inner">
                  {filteredLogs.length === 0 ? (
                    <div className="text-zinc-500 py-6 text-center italic text-xs">
                      Chưa có sự kiện nào. Hãy thử chọn giọng đọc hoặc bấm nút nghe để ghi nhận nhật ký.
                    </div>
                  ) : (
                    filteredLogs.map(log => {
                      const isExpanded = expandedLogId === log.id;
                      let badgeColor = 'bg-zinc-800 text-zinc-300';
                      if (log.tag === 'PERSISTENCE') badgeColor = 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50';
                      if (log.tag === 'MAPPING') badgeColor = 'bg-blue-900/60 text-blue-300 border border-blue-700/50';
                      if (log.tag === 'SYNTHESIS') badgeColor = 'bg-purple-900/60 text-purple-300 border border-purple-700/50';
                      if (log.tag === 'AUDIO_ENGINE') badgeColor = 'bg-amber-900/60 text-amber-300 border border-amber-700/50';
                      if (log.tag === 'FALLBACK') badgeColor = 'bg-red-900/60 text-red-300 border border-red-700/50';

                      return (
                        <div 
                          key={log.id} 
                          onClick={() => log.data && setExpandedLogId(isExpanded ? null : log.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-900' : 'hover:bg-zinc-900/60'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-zinc-500 text-[10px] shrink-0">{log.timestamp}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${badgeColor}`}>
                              {log.tag}
                            </span>
                            <span className={`flex-1 ${
                              log.level === 'error' ? 'text-red-400 font-bold' : log.level === 'warn' ? 'text-amber-300' : log.level === 'success' ? 'text-emerald-300' : 'text-zinc-200'
                            }`}>
                              {log.message}
                            </span>
                            {log.data && (
                              <span className="text-[10px] text-zinc-500 hover:text-zinc-300 underline shrink-0">
                                {isExpanded ? 'ẩn json' : '+ json'}
                              </span>
                            )}
                          </div>
                          {isExpanded && log.data && (
                            <pre className="mt-2 p-2 bg-black/70 rounded-lg text-[10px] text-emerald-400 overflow-x-auto border border-zinc-800">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="text-zinc-600 text-xs flex items-center gap-2">
            <Volume2 size={14} className="text-rose-500" />
            <span>
              Giọng đang chọn: <strong className="text-zinc-900 font-bold">{activeProfile?.name || 'Mặc định'}</strong>
              <span className="text-zinc-400 font-mono ml-1 text-[11px]">({settings.selectedVoiceId})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'debug' ? 'voiceover' : 'debug')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'debug'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300 font-bold'
                  : 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-700'
              }`}
            >
              <Terminal size={13} />
              <span>{activeTab === 'debug' ? 'Quay lại Thư viện' : 'Mở Debug Console'}</span>
            </button>

            <button
              onClick={() => { handleStopAudio(); onClose(); }}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Đóng Phòng Thu
            </button>
          </div>
        </div>
      </div>
      {/* Full Audio & Subtitle SRT Export Modal */}
      <AudioSrtExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        shots={shots}
        projectTitle={scriptData.title || 'Kich_Ban_Video'}
      />
    </div>
  );
}
