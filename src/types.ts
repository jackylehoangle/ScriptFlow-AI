export type ScriptFormat = 'short' | 'long' | 'screenplay' | 'podcast' | 'commercial';

export type PlatformType = 
  | 'tiktok' 
  | 'youtube_shorts' 
  | 'reels' 
  | 'youtube_long' 
  | 'facebook_video' 
  | 'podcast' 
  | 'film' 
  | 'commercial_tvc';

export type TopicCategory = 
  | 'tech' 
  | 'business' 
  | 'storytelling' 
  | 'finance' 
  | 'education' 
  | 'lifestyle' 
  | 'entertainment' 
  | 'health' 
  | 'horror_mystery' 
  | 'marketing_sales';

export type ToneOfVoice = 
  | 'energetic_viral' 
  | 'storyteller_emotional' 
  | 'expert_analytical' 
  | 'humorous_witty' 
  | 'persuasive_sales' 
  | 'cinematic_dramatic' 
  | 'friendly_conversational';

// For Dual-Column Video Scripts (TikTok, YouTube, TVC)
export interface TwoColumnShot {
  id: string;
  shotNumber: number;
  timeRange?: string; // e.g. "0:00 - 0:03"
  visual: string; // Camera angle, action, B-roll description, graphic overlay
  audio: string; // Voiceover, spoken dialogue, sound effects (SFX), music cue
  onScreenText?: string; // Captions, lower thirds, titles
  notes?: string; // Actor note or pacing tip
  imageUrl?: string; // Storyboard / B-roll AI generated or uploaded image preview
  imagePrompt?: string; // Stored prompt used to generate image
  voiceAudioUrl?: string; // Generated voiceover audio URL
  voiceDuration?: number; // Duration in seconds
}

export type OpenSourceImageEngine = 'pollinations_flux' | 'pollinations_turbo' | 'huggingface' | 'local_sd' | 'local_comfyui';

export interface OpenSourceAISettings {
  engine: OpenSourceImageEngine;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  hfToken?: string;
  hfModel?: string;
  localEndpoint?: string; // e.g. "http://localhost:7860" or "http://127.0.0.1:8188"
  autoGeneratePrompt: boolean;
}

// Voice Cloning & TTS Types
export type VoiceAccent = 'north_vn' | 'south_vn' | 'central_vn' | 'us_en' | 'uk_en';
export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceProvider = 'browser_tts' | 'elevenlabs' | 'fpt_ai' | 'vbee' | 'custom_clone';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: VoiceGender;
  accent: VoiceAccent;
  description: string;
  provider: VoiceProvider;
  rate: number; // 0.8 to 1.5
  pitch: number; // 0.8 to 1.3
  isCustomClone?: boolean;
  sampleAudioUrl?: string; // Cloned voice reference sample
  sampleAudioName?: string;
  elevenLabsVoiceId?: string;
  avatarColor?: string;
  tags?: string[];
}

export interface VoiceStudioSettings {
  selectedVoiceId: string;
  rate: number;
  pitch: number;
  volume: number;
  pauseBetweenShotsMs: number;
  elevenLabsApiKey?: string;
  fptApiKey?: string;
  vbeeAppId?: string;
}

// For Hollywood Screenplay elements
export type ScreenplayElementType = 
  | 'SCENE_HEADING' 
  | 'ACTION' 
  | 'CHARACTER' 
  | 'DIALOGUE' 
  | 'PARENTHETICAL' 
  | 'TRANSITION';

export interface ScreenplayElement {
  id: string;
  type: ScreenplayElementType;
  text: string;
}

export interface ChannelPillar {
  title: string;
  description: string;
}

export interface ChannelDNA {
  id: string;
  name: string; // Tên kênh (vd: "Tài Chính Thực Chiến - Din Finance")
  handle?: string; // vd: "@taichinhthucchien"
  tagline: string; // Định vị / Tuyên ngôn cốt lõi của kênh
  icon?: string; // Emoji biểu tượng
  avatarColor?: string;
  category: TopicCategory; // Lĩnh vực cốt lõi ('finance', 'tech', 'business', ...)
  primaryPlatform: PlatformType; // Nền tảng phân phối chính ('tiktok', 'youtube_long', ...)
  defaultFormat: ScriptFormat; // Format mặc định ('short', 'long', ...)
  defaultTone: ToneOfVoice; // Tone giọng chủ đạo
  targetDuration: string; // e.g. "60s", "8m - 12m", "15m"

  // Chân dung khán giả mục tiêu (Target Audience DNA)
  targetAudience: string; // vd: "Người đi làm 22-35 tuổi muốn quản lý dòng tiền, tự do tài chính..."
  audiencePainPoints: string[]; // Nỗi đau, lo sợ lớn nhất (vd: "Sợ lừa đảo tài chính", "Lương không đủ sống")
  audienceDesires: string[]; // Khao khát muốn đạt được (vd: "Tự do tài chính", "Tích lũy tài sản an toàn")
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';

  // Bản sắc & Giọng kể độc bản (Creator Persona & Style)
  creatorPersona: string; // vd: "Alex Hormozi & Ray Dalio vibe - Đanh thép, số liệu thực chiến, không lý thuyết suông"
  catchphrases: string[]; // Khẩu hiệu / Cụm từ cửa miệng đặc trưng (vd: "Con số không biết nói dối", "Đừng để tiền nằm chết")
  openingHookRule: string; // Quy tắc mở đầu 3s (vd: "Phản trực giác + Bóc mẽ ngộ nhận tai hại")
  endingCtaRule: string; // Quy tắc kêu gọi hành động cuối video (vd: "Follow kênh để giữ chặt túi tiền của bạn")

  // Bộ lọc cấm kỵ (Strict Anti-Cliché & Banned Words)
  bannedWords: string[]; // Từ ngữ / Văn mẫu AI cấm tuyệt đối (vd: "làm giàu không khó", "hãy cùng khám phá", ...)

  // Trụ cột nội dung (Content Pillars)
  contentPillars: ChannelPillar[];

  // Chỉ dẫn thị giác & Dựng hình (Visual & Pacing Guidelines)
  visualPacingGuideline: string; // vd: "Biểu đồ rõ nét, số liệu to tương phản, cắt cảnh dứt khoát 2-3s/shot"

  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScriptData {
  id: string;
  title: string;
  format: ScriptFormat;
  platform: PlatformType;
  topic: TopicCategory;
  tone: ToneOfVoice;
  targetDuration: string; // e.g. "60s", "3m", "10m"
  channelId?: string; // ID của kênh DNA đang gắn kết
  channelName?: string; // Tên kênh DNA đang áp dụng
  channelTagline?: string; // Định vị của kênh
  summary?: string;
  hook?: string;
  callToAction?: string;
  fullTextScript?: string; // Step 1: Complete master script narrative / story text
  workflowStep?: 'full_text' | 'breakdown'; // Step 1 = Master Full Script, Step 2 = Shot Breakdown Table
  shots?: TwoColumnShot[]; // For Short-form, YouTube Long, TVC
  screenplayElements?: ScreenplayElement[]; // For Film / Screenplay
  chapters?: LongFormChapter[]; // Multi-chapter structure for 10-30+ min long form
  rawContent?: string; // Fallback or markdown
  updated_at?: string;
}

export interface Script {
  id: string;
  title: string;
  content: string; // JSON stringified ScriptData
  updated_at?: string;
}

export interface ScriptTemplate {
  id: string;
  title: string;
  description: string;
  format: ScriptFormat;
  platform: PlatformType;
  topic: TopicCategory;
  tone: ToneOfVoice;
  targetDuration: string;
  previewHook: string;
  shots?: TwoColumnShot[];
  screenplayElements?: ScreenplayElement[];
}

export interface AIHookOption {
  id: string;
  type: string; // 'Shock Value' | 'Question' | 'Story Loop' | 'Contrarian' | 'Direct Value'
  hookText: string;
  whyItWorks: string;
}

export interface HookABVariation {
  id: string;
  angleName: string; // e.g. "Gây tò mò cực hạn", "Nỗi sợ mất mát (FOMO)", "Phản trực giác", "Hứa hẹn giá trị cao"
  hookA: {
    text: string;
    psychologicalTrigger: string;
    expectedRetentionScore: number; // e.g. 92%
    visualFirst3Seconds: string;
  };
  hookB: {
    text: string;
    psychologicalTrigger: string;
    expectedRetentionScore: number; // e.g. 95%
    visualFirst3Seconds: string;
  };
  testingHypothesis: string;
}

export interface ThumbnailCTRConcept {
  id: string;
  conceptTitle: string;
  headlineTitle: string; // Catchy YouTube/TikTok headline title
  badgeTitle?: string; // Short badge/overlay like "TOP 1", "ĐỪNG XEM NẾU..."
  ctrScore: number; // e.g. 96/100
  visualComposition: string; // Detail description of visual layout, character emotion, background
  colorPsychology: string; // e.g. "Vàng Neon + Đen tương phản cao thu hút ánh nhìn đầu tiên"
  overlayText: string; // Big text on thumbnail (max 3-5 words)
  aiImagePrompt: string; // English prompt ready for Gemini Imagen / Midjourney
  generatedImageUrl?: string;
}

export interface HookAndThumbnailBundle {
  targetAudienceInsight: string;
  coreAngle: string;
  hookVariations: HookABVariation[];
  thumbnailConcepts: ThumbnailCTRConcept[];
}

export interface CTRAnalysisReport {
  overallScore: number; // 0 - 100
  ratingTier: 'Xuất Sắc' | 'Khá Tốt' | 'Trung Bình' | 'Cần Cải Thiện';
  predictedCTRPercentage: string; // e.g. "8.4% - 12.2%"
  summaryVerdict: string;
  metrics: {
    curiosityGap: { score: number; feedback: string }; // Tò mò & Khoảng trống thông tin
    emotionalPower: { score: number; feedback: string }; // Cường độ cảm xúc / Power Words
    clarityAndLength: { score: number; feedback: string }; // Độ rõ ràng & Độ dài tối ưu
    urgencyFOMO: { score: number; feedback: string }; // Tính cấp bách & FOMO
    relevanceMatch: { score: number; feedback: string }; // Độ khớp giữa Tiêu đề & Nội dung kịch bản (Tránh Clickbait rác)
  };
  powerWordAudits: {
    foundPowerWords: string[];
    weakWordsToReplace: {
      originalWord: string;
      suggestedReplacements: string[];
      reason: string;
    }[];
  };
  titleOptimizations: {
    type: 'High Curiosity' | 'Urgency/FOMO' | 'Direct Benefit' | 'Story/Contrarian' | 'Short Punchy';
    optimizedTitle: string;
    predictedBoostPercent: number; // e.g. +35% CTR
    whyBetter: string;
  }[];
  scriptHookOptimizations: {
    originalOpening: string;
    improvedOpening: string;
    psychologicalImpact: string;
  };
  recommendedTags: string[];
}

export interface AIOutlineBeat {
  id: string;
  timeCode: string;
  title: string;
  keyPoints: string[];
  visualIdea: string;
}

export interface NarrativeArcBeat {
  id: string;
  shotNumber?: number;
  beatName: string;
  timestampRange: string;
  currentPacing: 'Too Slow' | 'Good' | 'Rushed' | 'Flat';
  retentionRiskScore: number; // 0 - 100 (higher means bigger drop-off risk)
  emotionalIntensity: number; // 0 - 100 (emotional tension/stakes level)
  whatHappensNow: string;
  critiqueAndDiagnosis: string;
  suggestedBeatImprovement: {
    actionableFix: string;
    revisedVisual: string;
    revisedAudio: string;
    psychologicalLever: 'Pattern Interrupt' | 'Open Loop' | 'Micro-Cliffhanger' | 'Stakes Escalation' | 'Dopamine Payoff' | 'Sensory Shock';
    expectedRetentionGain: string; // e.g. "+18% giữ chân"
  };
}

export interface NarrativeArcAnalysis {
  overallPacingScore: number; // 0 - 100
  emotionalStakesScore: number; // 0 - 100
  predictedRetentionScore: number; // 0 - 100
  arcShapeDiagnosis: 'Rollercoaster (Cuốn hút đỉnh cao)' | 'Flatline (Nguy cơ tụt view)' | 'Slow Burn (Khởi đầu chậm)' | 'Frontloaded (Đuối dần về sau)' | 'Rising Escalation (Tăng tiến nghẹt thở)';
  storyArcSummary: string;
  keyRetentionRisks: string[];
  threeSecondRuleAudit: {
    passed: boolean;
    assessment: string;
    fixSuggestion: string;
  };
  pacingRhythmGraph: {
    beatOrder: number;
    timePercent: number;
    tensionScore: number;
    pacingScore: number;
    beatTitle: string;
    timestamp: string;
  }[];
  beats: NarrativeArcBeat[];
  recommendedRestructurePlan: string;
}

export interface LongFormChapter {
  id: string;
  chapterNumber: number;
  title: string;
  timestampRange: string; // e.g. "0:00 - 3:15"
  estimatedDuration: string; // e.g. "3-4 phút"
  targetWordCount: number; // e.g. 500-800 từ
  actRole: 'Act 1: Mở đầu & Hook chấn động' | 'Act 2: Bối cảnh & Thử thách leo thang' | 'Act 3: Điểm ngoặt trung tâm (Midpoint Twist)' | 'Act 4: Đáy vực thẳm & Khủng hoảng' | 'Act 5: Cao trào bùng nổ (Climax)' | 'Act 6: Giải mã, Đóng vòng lặp & CTA';
  coreObjective: string; // Nhiệm vụ cốt lõi của chương này
  keyBeatPoints: string[]; // Các ý chính / luận điểm cần làm rõ
  emotionalTension: number; // 0 - 100
  continuityNotes?: string; // Ghi chú liên kết các chương trước/sau
  contentScript?: string; // Nội dung bài viết chi tiết của chương (văn phong người thật)
  shots?: TwoColumnShot[]; // Phân cảnh tương ứng cho chương này nếu chuyển thành 2-cột
  isExpanded?: boolean;
}

export interface LongFormScriptOutline {
  projectTitle: string;
  totalDurationEstimate: string; // e.g. "15 - 20 phút"
  totalTargetWords: number; // e.g. 3,200 từ
  narrativeThesis: string; // Luận điểm / thông điệp trung tâm
  targetAudienceProfile: string;
  styleToneGuide: string; // Chỉ dẫn văn phong tự nhiên không AI
  chapters: LongFormChapter[];
}

export type PersonaCategory = 
  | 'all'
  | 'essay_philosophy' // Triết lý & Phân tích chuyên sâu
  | 'finance_business' // Tài chính, Kinh tế & Khởi nghiệp
  | 'truecrime_mystery' // Tội phạm, Điều tra & Bí ẩn
  | 'science_tech' // Khoa học, Vũ trụ & AI tương lai
  | 'history_epic' // Lịch sử hùng tráng & Chiến lược
  | 'cinema_art' // Điện ảnh, Nghệ thuật & Phân tích phim
  | 'psychology_stoic' // Tâm lý học hành vi & Stoicism
  | 'street_comedy' // Kể chuyện đường phố & Châm biếm
  | 'wellness_biohack' // Y học, Sức khỏe & Biohacking
  | 'dark_horror'; // Kinh dị, Siêu nhiên & Rùng rợn

export interface StylePersona {
  id: string;
  name: string;
  category: PersonaCategory;
  icon: string;
  avatarColor: string;
  tagline: string;
  archetypeReference: string; // e.g. "Vox / Johnny Harris style", "Dan Carlin Hardcore History", "Veritasium", "Alex Hormozi"
  coreDescription: string;
  voiceCharacteristics: string[];
  cadenceAndPacing: string;
  catchphrasesOrTransitions: string[];
  bannedClichés: string[];
  sampleExcerpts: {
    topic: string;
    beforeAI: string;
    afterPersona: string;
  }[];
  idealForFormats: string[];
  burstinessLevel: number; // 0 - 100
  isCustom?: boolean;
  createdAt?: string;
}

export type HumanizePersonaPreset = 
  | 'deep_essayist' // Triết lý & Phân tích sắc bén, câu từ đanh thép
  | 'street_storyteller' // Đời thường, gần gũi, khẩu ngữ tự nhiên
  | 'film_director' // Show Don't Tell, điện ảnh & chi tiết giác quan
  | 'business_insider' // Chuyên gia thực chiến, bóc tách số liệu
  | 'podcast_intimate' // Tâm sự lắng đọng, thì thầm đêm khuya
  | 'witty_satire' // Hóm hỉnh, châm biếm, nhịp thoại nhanh
  | string; // Support dynamic persona IDs

export interface HumanizeScriptResult {
  humanizedContent: string;
  aiProbabilityBefore: number; // e.g. 92%
  aiProbabilityAfter: number; // e.g. 4%
  burstinessBefore: number; // 0 - 100
  burstinessAfter: number; // 0 - 100
  clichesRemoved: string[];
  toneImprovements: string[];
  sensoryDetailsAdded: string[];
  readabilityGrade: string;
  sentenceTransformations: {
    original: string;
    rewritten: string;
    humanTouchApplied: string;
  }[];
}

export interface BrainstormIdeaItem {
  id: string;
  title: string;
  hook: string;
  angle: string;
  framework: string;
  targetPainPoint: string;
  viralScore: number; // e.g. 92 (80 - 99%)
  suggestedDuration: string;
  keyTakeaways: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  whyItWillWin: string;
  channelId?: string;
  isSaved?: boolean;
  status?: 'backlog' | 'in_progress' | 'filmed' | 'published';
  createdAt?: string;
}

export type BrainstormFrameworkType = 
  | 'all'
  | 'counter_intuitive' // Phản trực giác & Bóc mẽ ngộ nhận
  | 'urgent_warning' // Cảnh báo cấp bách & Bẫy sai lầm
  | 'case_study' // Case Study & Bóc tách thực tế
  | 'step_by_step' // Lộ trình 0-100 & Bí kíp tối ưu
  | 'versus_battle' // So sánh đối đầu & Lựa chọn
  | 'future_trend' // Dự đoán tương lai & Đón đầu xu hướng
  | 'challenge_experiment'; // Thử nghiệm thực tế & Thách thức

export type BrainstormContentGoal = 'evergreen' | 'viral_fast' | 'deep_dive';

// ================= TREND TRACKER GOOGLE SEARCH TYPES ================= //

export interface TrendSearchSource {
  title: string;
  url: string;
}

export interface HotTrendKeyword {
  id: string;
  keyword: string;
  searchVolumeLevel: 'Bùng nổ (Breakout)' | 'Rất cao' | 'Đang tăng mạnh' | 'Ổn định cao';
  category: string;
  summary: string;
  whyTrending: string;
  targetAudienceInterest: string;
}

export interface TrendTitleSuggestion {
  id: string;
  title: string;
  hook: string;
  angle: string;
  framework: string;
  viralScore: number; // e.g. 96 (85 - 99%)
  matchedKeyword: string;
  targetPainPoint: string;
  suggestedDuration: string;
  whyItWillWin: string;
  contentPillarMatch?: string;
  keyPoints: string[];
}

export interface TrendTrackerReport {
  niche: string;
  channelName: string;
  searchQueriesUsed: string[];
  sources: TrendSearchSource[];
  marketOverview: string;
  hotKeywords: HotTrendKeyword[];
  titleSuggestions: TrendTitleSuggestion[];
  fetchedAt: string;
}

// ================= MULTI-AI ENGINE & TASK ROUTING TYPES ================= //

export type AITaskType = 
  | 'brainstorm_ideas'      // 1. Ý Tưởng & Phản Biện Sáng Tạo
  | 'script_writing'        // 2. Viết Kịch Bản & Cốt Truyện Dài
  | 'trend_research'        // 3. Phân Tích Đối Thủ & Nghiên Cứu Xu Hướng Realtime
  | 'image_generation'      // 4. Tạo Ảnh Storyboard & Thumbnail
  | 'voice_synthesis'       // 5. Lồng Tiếng & Tổng Hợp Giọng Đọc Neural
  | 'anti_ai_humanizer';    // 6. Khử Dấu Vết Văn Mẫu AI (Humanizer)

export type AIEngineProvider = 
  | 'chatgpt_gpt4o'         // OpenAI ChatGPT (GPT-4o)
  | 'claude_sonnet'         // Anthropic Claude 3.7 / 3.5 Sonnet
  | 'gemini_flash'          // Google Gemini 2.5 Flash / Pro
  | 'gemini_search'         // Google Gemini + Search Grounding (Realtime 2026)
  | 'deepseek_r1'           // DeepSeek R1 Reasoning
  | 'openrouter_claude'     // OpenRouter: Claude 3.7 Sonnet
  | 'openrouter_gpt4o'      // OpenRouter: GPT-4o
  | 'openrouter_deepseek'   // OpenRouter: DeepSeek R1
  | 'openrouter_llama3'     // OpenRouter: Meta Llama 3.3 70B
  | 'flux_pro'              // FLUX.1 Pro Ultra HD
  | 'midjourney_v6'         // Midjourney v6 Photorealistic Engine
  | 'imagen_3'              // Google Imagen 3
  | 'dalle_3'               // OpenAI DALL-E 3
  | 'msedge_neural'         // Microsoft Edge Neural Vietnamese
  | 'elevenlabs_ai';        // ElevenLabs Voice Clone

export interface AIEngineOption {
  id: AIEngineProvider;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'OpenRouter' | 'Black Forest Labs' | 'Midjourney' | 'Microsoft' | 'ElevenLabs';
  icon: string;
  tag: string;
  description: string;
  badgeColor: string;
  strengths: string[];
  bestFor: string;
  speed: 'Ultra Fast (< 1s)' | 'Fast (1-2s)' | 'High Precision (3-5s)';
  supportedTasks: AITaskType[];
  modelSlug?: string;
}

export interface AIEngineRoutingConfig {
  presetName: 'top_creator_pro' | 'viral_speedster' | 'cinematic_deep' | 'openrouter_powerhouse' | 'custom';
  brainstormEngine: AIEngineProvider;
  scriptEngine: AIEngineProvider;
  trendEngine: AIEngineProvider;
  imageEngine: AIEngineProvider;
  voiceEngine: AIEngineProvider;
  humanizerEngine: AIEngineProvider;
}



