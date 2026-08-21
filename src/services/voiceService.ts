import { VoiceProfile, VoiceStudioSettings, TwoColumnShot } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'vn_male_north_pro',
    name: 'Hoàng Nam (Miền Bắc)',
    gender: 'male',
    accent: 'north_vn',
    description: 'Giọng đọc nam truyền cảm, trầm ấm, chuẩn MC thời sự & video tài liệu',
    provider: 'browser_tts',
    rate: 0.98,
    pitch: 0.90, // Deep resonant male
    avatarColor: 'from-blue-600 to-indigo-700',
    tags: ['MC Truyền hình', 'Tài liệu', 'Trầm ấm']
  },
  {
    id: 'vn_female_history_story',
    name: 'Ngọc Mai (Lịch Sử & Văn Hoá)',
    gender: 'female',
    accent: 'north_vn',
    description: 'Giọng nữ đọc lịch sử, khám phá, huyền bí cổ trang, truyền cảm trang trọng',
    provider: 'browser_tts',
    rate: 0.92,
    pitch: 1.05, // Elegant distinct female cadence
    avatarColor: 'from-amber-600 to-rose-700',
    tags: ['Lịch Sử', 'Cổ Trang', 'Trang Trọng']
  },
  {
    id: 'vn_female_storyteller',
    name: 'Hải Yến (Kể Chuyện & Podcast)',
    gender: 'female',
    accent: 'north_vn',
    description: 'Giọng kể chuyện đêm khuya, podcast, tâm sự nhẹ nhàng, du dương và sâu lắng',
    provider: 'browser_tts',
    rate: 0.88,
    pitch: 1.0, // Soft melodic female storyteller
    avatarColor: 'from-purple-500 to-indigo-600',
    tags: ['Podcast', 'Tâm sự', 'Sâu lắng']
  },
  {
    id: 'vn_female_south_viral',
    name: 'Mỹ Linh (Miền Nam)',
    gender: 'female',
    accent: 'south_vn',
    description: 'Giọng nữ Sài Gòn trẻ trung, bắt trend, năng lượng cao cho TikTok & Reels',
    provider: 'browser_tts',
    rate: 1.15,
    pitch: 1.15, // High energetic female tone
    avatarColor: 'from-pink-500 to-rose-600',
    tags: ['TikTok Viral', 'Reels', 'Bắt Trend']
  },
  {
    id: 'vn_male_reviewer',
    name: 'Đức Huy (Reviewer)',
    gender: 'male',
    accent: 'north_vn',
    description: 'Giọng review công nghệ, bán hàng dứt khoát, tự nhiên và dồi dào năng lượng',
    provider: 'browser_tts',
    rate: 1.12,
    pitch: 1.05,
    avatarColor: 'from-emerald-500 to-teal-700',
    tags: ['Reviewer', 'Bán hàng', 'Năng động']
  },
  {
    id: 'vn_male_mystery',
    name: 'Bảo Long (Kịch Tính & Vụ Án)',
    gender: 'male',
    accent: 'north_vn',
    description: 'Giọng đọc bí ẩn, gay cấn, phù hợp truyện ma, trinh thám, vụ án giật gân',
    provider: 'browser_tts',
    rate: 0.85,
    pitch: 0.85, // Deep suspenseful tone
    avatarColor: 'from-zinc-800 to-red-900',
    tags: ['Bí ẩn', 'Trinh thám', 'Gay cấn']
  },
  {
    id: 'en_male_us',
    name: 'David (US English Male)',
    gender: 'male',
    accent: 'us_en',
    description: 'Professional American accent for international commercial & tech videos',
    provider: 'browser_tts',
    rate: 1.0,
    pitch: 1.0,
    avatarColor: 'from-cyan-600 to-blue-700',
    tags: ['Global', 'Commercial', 'Tech']
  },
  {
    id: 'en_female_us',
    name: 'Sarah (US English Female)',
    gender: 'female',
    accent: 'us_en',
    description: 'Warm and articulate American female voice for explainers & lifestyle',
    provider: 'browser_tts',
    rate: 1.05,
    pitch: 1.1,
    avatarColor: 'from-teal-500 to-blue-600',
    tags: ['Global', 'Explainer', 'Lifestyle']
  }
];

export const DEFAULT_STUDIO_SETTINGS: VoiceStudioSettings = {
  selectedVoiceId: 'vn_male_north_pro',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  pauseBetweenShotsMs: 500,
};

export const VOICE_SETTINGS_STORAGE_KEY = 'scriptflow_voice_settings';
export const CLONE_VOICES_STORAGE_KEY = 'scriptflow_cloned_voices';

export interface AudioEngineMapping {
  voiceId: string;
  voiceName: string;
  gender: string;
  accent: string;
  backendNeuralModel: string;
  neuralModelDescription: string;
  engineEndpoint: string;
  audioFormat: string;
  calculatedRate: number;
  calculatedPitch: number;
  browserFallbackVoice: string;
  storagePersistenceKey: string;
  isPersistedInStorage: boolean;
  persistedVoiceId: string | null;
}

export interface VoiceDiagnosticLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  tag: 'PERSISTENCE' | 'MAPPING' | 'SYNTHESIS' | 'AUDIO_ENGINE' | 'FALLBACK';
  message: string;
  data?: any;
}

class VoiceLogger {
  private logs: VoiceDiagnosticLog[] = [];
  private listeners: ((logs: VoiceDiagnosticLog[]) => void)[] = [];

  public log(level: 'info' | 'success' | 'warn' | 'error', tag: VoiceDiagnosticLog['tag'], message: string, data?: any) {
    const entry: VoiceDiagnosticLog = {
      id: uuidv4(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0'),
      level,
      tag,
      message,
      data
    };
    this.logs = [entry, ...this.logs.slice(0, 99)];
    this.notify();
  }

  public getLogs(): VoiceDiagnosticLog[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    this.notify();
  }

  public subscribe(fn: (logs: VoiceDiagnosticLog[]) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn([...this.logs]));
  }
}

export const voiceLogger = new VoiceLogger();

export function getAudioEngineMapping(
  voiceId: string,
  customSettings?: Partial<VoiceStudioSettings>
): AudioEngineMapping {
  const profiles = getSavedVoiceProfiles();
  const profile = profiles.find(p => p.id === voiceId) || profiles[0] || DEFAULT_VOICE_PROFILES[0];
  const settings = { ...getVoiceStudioSettings(), ...customSettings };

  const vId = (voiceId || '').toLowerCase();
  let backendNeuralModel = "vi-VN-NamMinhNeural";
  let neuralModelDescription = "Nam Minh Neural (Giọng Nam MC VTV / Chuẩn Miền Bắc)";

  if (vId.includes("female") || vId.includes("mai") || vId.includes("yen") || vId.includes("linh") || vId.includes("history") || vId.includes("storyteller") || vId.includes("south")) {
    backendNeuralModel = "vi-VN-HoaiMyNeural";
    neuralModelDescription = "Hoài My Neural (Giọng Nữ Truyền Cảm / Lịch Sử & Kể Chuyện)";
  } else if (vId.includes("en_female") || vId.includes("sarah") || vId.includes("jenny")) {
    backendNeuralModel = "en-US-JennyNeural";
    neuralModelDescription = "Jenny Neural (US English Female Natural & Articulate)";
  } else if (vId.includes("en_male") || vId.includes("david") || vId.includes("guy")) {
    backendNeuralModel = "en-US-GuyNeural";
    neuralModelDescription = "Guy Neural (US English Male Deep & Professional)";
  }

  const calculatedRate = Math.max(0.6, Math.min(2.0, (profile.rate || 1.0) * (settings.rate || 1.0)));
  const calculatedPitch = Math.max(0.5, Math.min(1.8, (profile.pitch || 1.0) * (settings.pitch || 1.0)));

  let persistedVoiceId: string | null = null;
  let isPersistedInStorage = false;
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      persistedVoiceId = parsed.selectedVoiceId || null;
      isPersistedInStorage = persistedVoiceId === voiceId;
    }
  } catch (e) {}

  const browserVoice = getBrowserVoice(profile);

  return {
    voiceId: profile.id,
    voiceName: profile.name,
    gender: profile.gender,
    accent: profile.accent,
    backendNeuralModel,
    neuralModelDescription,
    engineEndpoint: '/api/tts/synthesize',
    audioFormat: 'audio/mpeg (MP3 24kHz Mono 48kbps)',
    calculatedRate: Number(calculatedRate.toFixed(2)),
    calculatedPitch: Number(calculatedPitch.toFixed(2)),
    browserFallbackVoice: browserVoice ? `${browserVoice.name} (${browserVoice.lang})` : 'Hệ thống mặc định (vi-VN)',
    storagePersistenceKey: VOICE_SETTINGS_STORAGE_KEY,
    isPersistedInStorage,
    persistedVoiceId
  };
}

export function getSavedVoiceProfiles(): VoiceProfile[] {
  try {
    const raw = localStorage.getItem(CLONE_VOICES_STORAGE_KEY);
    if (raw) {
      const customProfiles: VoiceProfile[] = JSON.parse(raw);
      return [...DEFAULT_VOICE_PROFILES, ...customProfiles];
    }
  } catch (e) {
    console.error("Error reading custom voice profiles", e);
  }
  return DEFAULT_VOICE_PROFILES;
}

export function saveCustomVoiceProfile(profile: VoiceProfile): VoiceProfile[] {
  const current = getSavedVoiceProfiles().filter(p => p.isCustomClone);
  const updated = [profile, ...current.filter(p => p.id !== profile.id)];
  try {
    localStorage.setItem(CLONE_VOICES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving custom voice profile", e);
  }
  return [...DEFAULT_VOICE_PROFILES, ...updated];
}

export function deleteCustomVoiceProfile(id: string): VoiceProfile[] {
  const current = getSavedVoiceProfiles().filter(p => p.isCustomClone);
  const updated = current.filter(p => p.id !== id);
  try {
    localStorage.setItem(CLONE_VOICES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return [...DEFAULT_VOICE_PROFILES, ...updated];
}

export function getVoiceStudioSettings(): VoiceStudioSettings {
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_STUDIO_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_STUDIO_SETTINGS;
}

export function saveVoiceStudioSettings(settings: VoiceStudioSettings): void {
  try {
    const json = JSON.stringify(settings);
    localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, json);
    voiceLogger.log('success', 'PERSISTENCE', `Đã lưu cấu hình Voice vào localStorage (Key: ${VOICE_SETTINGS_STORAGE_KEY})`, {
      selectedVoiceId: settings.selectedVoiceId,
      rate: settings.rate,
      pitch: settings.pitch,
      pauseBetweenShotsMs: settings.pauseBetweenShotsMs
    });
  } catch (err: any) {
    voiceLogger.log('error', 'PERSISTENCE', `Lỗi khi lưu cấu hình Voice vào localStorage: ${err.message}`, err);
  }
}

export async function testTTSBackendConnection(testText: string = 'Kiểm tra kết nối hệ thống giọng đọc AI.', voiceId: string = 'vn_male_north_pro'): Promise<{
  success: boolean;
  status: number;
  durationMs: number;
  bufferSize: number;
  contentType: string;
  mappedModel: string;
  error?: string;
}> {
  const startTime = performance.now();
  const mapping = getAudioEngineMapping(voiceId);
  voiceLogger.log('info', 'AUDIO_ENGINE', `Bắt đầu test kết nối TTS Engine cho voice: ${voiceId} -> Model: ${mapping.backendNeuralModel}`);

  try {
    const response = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testText,
        voiceId: voiceId,
        rate: 1.0,
        pitch: 1.0,
      })
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      const blob = await response.blob();
      voiceLogger.log('success', 'SYNTHESIS', `TTS Engine phản hồi thành công (${response.status} OK) trong ${durationMs}ms`, {
        status: response.status,
        bufferSize: blob.size,
        contentType: blob.type || 'audio/mpeg',
        model: mapping.backendNeuralModel
      });
      return {
        success: true,
        status: response.status,
        durationMs,
        bufferSize: blob.size,
        contentType: blob.type || 'audio/mpeg',
        mappedModel: mapping.backendNeuralModel
      };
    } else {
      const errText = await response.text();
      voiceLogger.log('error', 'SYNTHESIS', `TTS Engine trả về lỗi HTTP ${response.status}: ${errText}`);
      return {
        success: false,
        status: response.status,
        durationMs,
        bufferSize: 0,
        contentType: '',
        mappedModel: mapping.backendNeuralModel,
        error: `HTTP ${response.status}: ${errText}`
      };
    }
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    voiceLogger.log('error', 'SYNTHESIS', `Không thể kết nối đến /api/tts/synthesize (${durationMs}ms): ${err.message}`, err);
    return {
      success: false,
      status: 0,
      durationMs,
      bufferSize: 0,
      contentType: '',
      mappedModel: mapping.backendNeuralModel,
      error: err.message
    };
  }
}

/**
 * Super clean text for Speech:
 * Strips [BGM: ...], [SFX: ...], "Voiceover:", "MC:", parentheticals and markdown
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove all bracketed items like [BGM: ...], [SFX: ...], [Nhạc nền: ...]
    .replace(/\[(?:BGM|SFX|Nhạc nền|Âm thanh|Sound|Music|Hiệu ứng).*?\]/gi, '')
    .replace(/\[.*?\]/g, '')
    // Remove prefixes like "Voiceover:", "Voice over:", "MC:", "Người dẫn:", "Lời thoại:"
    .replace(/^(?:Voiceover|Voice over|MC|Người dẫn chuyện|Người dẫn|Diễn viên|Lời thoại|Audio|Thoại)\s*[:：\-]\s*/gi, '')
    // Remove parenthetical acting directives (thì thầm), (cười lớn)
    .replace(/\(.*?\)/g, '')
    .replace(/（.*?）/g, '')
    // Remove markdown symbols
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get available speech synthesis voices with fallback
 */
export function getAvailableSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Find best matching browser SpeechSynthesisVoice for Vietnamese / English fallback
 */
export function getBrowserVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (profile.accent === 'us_en' || profile.accent === 'uk_en') {
    const enVoices = voices.filter(v => v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB'));
    if (enVoices.length > 0) {
      if (profile.gender === 'female') {
        const female = enVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('jenny'));
        if (female) return female;
      } else {
        const male = enVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('guy'));
        if (male) return male;
      }
      return enVoices[0];
    }
  }

  // Vietnamese voices
  const vnVoices = voices.filter(v => 
    v.lang.toLowerCase().includes('vi') || 
    v.name.toLowerCase().includes('vietnam') || 
    v.name.toLowerCase().includes('tiếng việt') ||
    v.name.toLowerCase().includes('vietnamese')
  );

  if (vnVoices.length > 0) {
    if (profile.gender === 'female') {
      const femaleVn = vnVoices.find(v => 
        v.name.toLowerCase().includes('nu') || 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('mai') || 
        v.name.toLowerCase().includes('linh') ||
        v.name.toLowerCase().includes('hoa') ||
        v.name.toLowerCase().includes('an') ||
        v.name.toLowerCase().includes('hoaimy')
      );
      if (femaleVn) return femaleVn;
    } else if (profile.gender === 'male') {
      const maleVn = vnVoices.find(v => 
        v.name.toLowerCase().includes('nam') || 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('minh') ||
        v.name.toLowerCase().includes('dung')
      );
      if (maleVn) return maleVn;
    }
    return vnVoices[0];
  }

  return null;
}

/**
 * ScriptVoicePlayer with Neural Multi-Voice Synthesizer (True Vietnamese voices)
 * and automatic fallback to Web Speech API
 */
export class ScriptVoicePlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioUrl: string | null = null;
  private isStopped = false;
  private isPaused = false;
  private abortController: AbortController | null = null;

  public async speak(
    text: string, 
    profile: VoiceProfile, 
    settings: VoiceStudioSettings,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    this.stop();
    this.isStopped = false;
    this.isPaused = false;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      onEnd?.();
      return;
    }

    const calculatedRate = Math.max(0.6, Math.min(2.0, (profile.rate || 1.0) * (settings.rate || 1.0)));
    const calculatedPitch = Math.max(0.5, Math.min(1.8, (profile.pitch || 1.0) * (settings.pitch || 1.0)));
    const calculatedVolume = settings.volume ?? 1.0;

    const mapping = getAudioEngineMapping(profile.id, settings);
    voiceLogger.log('info', 'MAPPING', `Bắt đầu phát âm thanh cho giọng [${profile.name}] (ID: ${profile.id}) -> Mapped Model: ${mapping.backendNeuralModel}`, {
      voiceId: profile.id,
      model: mapping.backendNeuralModel,
      rate: calculatedRate,
      pitch: calculatedPitch,
      textPreview: cleaned.slice(0, 60) + (cleaned.length > 60 ? '...' : '')
    });

    // 1. Try High-Quality Neural TTS API First
    try {
      this.abortController = new AbortController();
      voiceLogger.log('info', 'SYNTHESIS', `Gửi yêu cầu POST /api/tts/synthesize (Voice: ${profile.id}, Text: ${cleaned.length} ký tự)`);

      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleaned,
          voiceId: profile.id,
          rate: calculatedRate,
          pitch: calculatedPitch,
        }),
        signal: this.abortController.signal
      });

      if (this.isStopped) return;

      if (response.ok) {
        const audioBlob = await response.blob();
        if (this.isStopped) return;

        voiceLogger.log('success', 'AUDIO_ENGINE', `Nhận được Audio stream từ Server TTS (${(audioBlob.size / 1024).toFixed(1)} KB) -> Bắt đầu phát Audio Element`, {
          voiceId: profile.id,
          model: mapping.backendNeuralModel,
          bufferBytes: audioBlob.size,
          type: audioBlob.type
        });

        if (this.currentAudioUrl) {
          URL.revokeObjectURL(this.currentAudioUrl);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        this.currentAudioUrl = audioUrl;

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        audio.playbackRate = calculatedRate;
        audio.volume = Math.max(0, Math.min(1.0, calculatedVolume));

        audio.onplay = () => {
          onStart?.();
        };

        audio.onended = () => {
          this.currentAudio = null;
          if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
            this.currentAudioUrl = null;
          }
          onEnd?.();
        };

        audio.onerror = (e) => {
          if (!this.isStopped) {
            voiceLogger.log('warn', 'FALLBACK', `Lỗi giải mã audio element, chuyển sang Web Speech fallback: ${profile.id}`);
            this.fallbackWebSpeech(cleaned, profile, calculatedRate, calculatedPitch, calculatedVolume, onStart, onEnd, onError);
          }
        };

        await audio.play();
        return;
      } else {
        voiceLogger.log('warn', 'SYNTHESIS', `Server TTS trả về status ${response.status}, kích hoạt Web Speech fallback`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || this.isStopped) {
        return;
      }
      voiceLogger.log('warn', 'SYNTHESIS', `Không thể gọi Server TTS (${err.message}), kích hoạt Web Speech fallback`);
      console.warn("Neural TTS request failed, falling back to Web Speech:", err);
    }

    // 2. Fallback to Web Speech API
    this.fallbackWebSpeech(cleaned, profile, calculatedRate, calculatedPitch, calculatedVolume, onStart, onEnd, onError);
  }

  private fallbackWebSpeech(
    text: string,
    profile: VoiceProfile,
    rate: number,
    pitch: number,
    volume: number,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      voiceLogger.log('error', 'FALLBACK', `Trình duyệt không hỗ trợ Web Speech API`);
      onError?.(new Error("Không thể phát âm thanh"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const matchedVoice = getBrowserVoice(profile);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      voiceLogger.log('info', 'FALLBACK', `Sử dụng Web Speech Fallback với Voice: [${matchedVoice.name}] (${matchedVoice.lang})`);
    } else {
      utterance.lang = profile.accent.includes('en') ? 'en-US' : 'vi-VN';
      voiceLogger.log('info', 'FALLBACK', `Sử dụng Web Speech Fallback với lang: ${utterance.lang}`);
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      voiceLogger.log('error', 'FALLBACK', `Lỗi Web Speech API: ${e.error || 'unknown'}`);
      if (!this.isStopped) {
        onError?.(e);
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    this.isStopped = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPaused = true;
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.currentAudio) {
      this.currentAudio.play();
      this.isPaused = false;
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }
}

export const globalVoicePlayer = new ScriptVoicePlayer();

/**
 * Play an entire list of shots sequentially with callbacks for currently active shot
 */
export async function playFullScriptSequential(
  shots: TwoColumnShot[],
  profile: VoiceProfile,
  settings: VoiceStudioSettings,
  onShotStart: (shotIndex: number) => void,
  onFinish: () => void,
  isCancelledRef: { current: boolean }
) {
  for (let i = 0; i < shots.length; i++) {
    if (isCancelledRef.current) break;

    const shot = shots[i];
    const cleaned = cleanTextForSpeech(shot.audio);
    if (!cleaned) continue;

    onShotStart(i);

    await new Promise<void>((resolve) => {
      globalVoicePlayer.speak(
        cleaned,
        profile,
        settings,
        () => {},
        () => resolve(),
        () => resolve()
      );
    });

    if (isCancelledRef.current) break;

    // Pause between shots
    if (i < shots.length - 1 && settings.pauseBetweenShotsMs > 0) {
      await new Promise((res) => setTimeout(res, settings.pauseBetweenShotsMs));
    }
  }

  onFinish();
}
