import { AIEngineOption, AIEngineRoutingConfig, AITaskType, AIEngineProvider } from '../types';

export const AVAILABLE_AI_ENGINES: AIEngineOption[] = [
  // 1. OpenRouter Claude 3.7 Sonnet
  {
    id: 'openrouter_claude',
    name: 'OpenRouter: Claude 3.7 Sonnet (Anthropic)',
    provider: 'OpenRouter',
    icon: '🎭',
    tag: 'Đệ Nhất Văn Phong Nhân Bản & Cốt Truyện Tự Nhiên',
    description: 'Kết nối trực tiếp qua cổng OpenRouter. Khả năng viết lời thoại và kịch bản số 1 thế giới, xóa sạch 100% văn mẫu máy móc, văn phong giàu nhịp điệu và cảm xúc chân thật.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    strengths: [
      'Văn phong tự nhiên không có dấu vết AI',
      'Cấu trúc nhiều chương (Multi-Act) chiều sâu',
      'Độ biến thiên câu thoại (Burstiness) tuyệt đỉnh'
    ],
    bestFor: 'Viết kịch bản dài 10-30+ phút, Video Essay, Khử văn mẫu AI',
    speed: 'High Precision (3-5s)',
    supportedTasks: ['script_writing', 'anti_ai_humanizer', 'brainstorm_ideas'],
    modelSlug: 'anthropic/claude-3.7-sonnet'
  },

  // 2. OpenRouter OpenAI GPT-4o
  {
    id: 'openrouter_gpt4o',
    name: 'OpenRouter: OpenAI GPT-4o (Omnimodel)',
    provider: 'OpenRouter',
    icon: '⚡',
    tag: 'Đỉnh Cao Sáng Tạo Phản Trực Giác & Đặt Hook 3s',
    description: 'Kết nối GPT-4o qua OpenRouter. Siêu việt trong việc bẻ gãy lối mòn tư duy, phát hiện góc nhìn bất ngờ và cấu trúc Hook giữ chân người xem cực đỉnh.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    strengths: [
      'Góc nhìn phản trực giác bẻ gãy định kiến',
      'Cấu trúc Hook 3 giây giữ chân người xem cao',
      'Định dạng đa phân cảnh chuẩn Hollywood'
    ],
    bestFor: 'Brainstorm ý tưởng bùng nổ view, cấu trúc kịch bản kịch tính',
    speed: 'Fast (1-2s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing', 'trend_research'],
    modelSlug: 'openai/gpt-4o'
  },

  // 3. OpenRouter DeepSeek R1
  {
    id: 'openrouter_deepseek',
    name: 'OpenRouter: DeepSeek R1 (Deep-Think Reasoning)',
    provider: 'OpenRouter',
    icon: '🧠',
    tag: 'Suy Luận Chuỗi Logic & Bóc Tách Bản Chất',
    description: 'Mô hình suy luận chuỗi (Chain-of-Thought) mạnh mẽ qua OpenRouter. Chuyên mổ xẻ vấn đề phức tạp, giải quyết nghịch lý và xây dựng luận điểm đanh thép.',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    strengths: [
      'Phân tích nguyên nhân gốc rễ và nghịch lý',
      'Lập luận phản biện chặt chẽ không lỗ hổng',
      'Bóc tách case study kinh doanh và tài chính chuyên sâu'
    ],
    bestFor: 'Video phân tích chuyên sâu, kinh tế tài chính, triết lý khoa học',
    speed: 'High Precision (3-5s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing', 'trend_research'],
    modelSlug: 'deepseek/deepseek-r1'
  },

  // 4. OpenRouter Meta Llama 3.3 70B
  {
    id: 'openrouter_llama3',
    name: 'OpenRouter: Meta Llama 3.3 70B Instruct',
    provider: 'OpenRouter',
    icon: '🦙',
    tag: 'Mã Nguồn Mở Tốc Độ Cao & Độc Lập',
    description: 'Mô hình mã nguồn mở thế hệ mới nhất của Meta qua OpenRouter. Tốc độ sinh văn bản cực nhanh, tự do và mạnh mẽ trong mọi thể loại sáng tạo.',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    strengths: [
      'Tốc độ sinh phản hồi siêu tốc',
      'Khả năng tóm tắt và trích xuất ý chính tuyệt vời',
      'Không bị kiểm duyệt gò bó phong cách tự do'
    ],
    bestFor: 'Tạo dàn ý nhanh, tóm tắt tài liệu, kịch bản ngắn',
    speed: 'Ultra Fast (< 1s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing'],
    modelSlug: 'meta-llama/llama-3.3-70b-instruct'
  },

  // 5. Google Gemini 2.5 Flash
  {
    id: 'gemini_flash',
    name: 'Google Gemini 2.5 Flash (Tốc Độ Siêu Tốc)',
    provider: 'Google',
    icon: '✨',
    tag: 'Tốc Độ Ánh Sáng & Ổn Định 99.9%',
    description: 'Mô hình thế hệ mới nhất của Google với tốc độ xử lý dưới 1 giây và bộ nhớ ngữ cảnh cực lớn, tối ưu hóa cho các thao tác nhanh và xử lý thời gian thực.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    strengths: [
      'Độ trễ cực thấp (Sub-second response)',
      'Khả năng đọc hiểu tài liệu lớn',
      'Độ ổn định và thông lượng chịu tải cao nhất'
    ],
    bestFor: 'Tạo dàn ý nhanh, sửa đổi kịch bản tức thì, xử lý hàng loạt',
    speed: 'Ultra Fast (< 1s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing', 'trend_research', 'anti_ai_humanizer']
  },

  // 6. Google Gemini Real-time Search Grounding
  {
    id: 'gemini_search',
    name: 'Google Gemini + Real-Time Search Grounding',
    provider: 'Google',
    icon: '🌐',
    tag: 'Dữ Liệu Xu Hướng & Đối Thủ Thời Gian Thực 2026',
    description: 'Kết hợp trí tuệ nhân tạo Gemini với kho dữ liệu tìm kiếm Google Search trực tiếp, giúp phát hiện xu hướng mới nhất trong 24h và phân tích chiến lược đối thủ.',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    strengths: [
      'Truy cập dữ liệu web & tin tức mới nhất 2026',
      'Bóc tách chiến lược video triệu view của đối thủ',
      'Đề xuất từ khóa và hashtag chuẩn SEO đón đầu thuật toán'
    ],
    bestFor: 'Nghiên cứu đối thủ, bắt trend nóng, kiểm tra tính xác thực dữ liệu',
    speed: 'Fast (1-2s)',
    supportedTasks: ['trend_research', 'brainstorm_ideas']
  },

  // 7. OpenAI Direct GPT-4o
  {
    id: 'chatgpt_gpt4o',
    name: 'OpenAI ChatGPT (GPT-4o Omnimodel)',
    provider: 'OpenAI',
    icon: '⚡',
    tag: 'Đỉnh Cao Sáng Tạo & Đột Phá Góc Nhìn',
    description: 'Mô hình đa phương thức của OpenAI chuyên trách việc phá vỡ lối mòn tư duy và cấu trúc nội dung giật CTR cao.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    strengths: [
      'Góc nhìn phản trực giác bẻ gãy định kiến',
      'Cấu trúc Hook 3 giây giữ chân người xem cao'
    ],
    bestFor: 'Brainstorm ý tưởng bùng nổ view',
    speed: 'Fast (1-2s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing', 'trend_research']
  },

  // 8. Anthropic Direct Claude 3.7
  {
    id: 'claude_sonnet',
    name: 'Anthropic Claude 3.7 / 3.5 Sonnet',
    provider: 'Anthropic',
    icon: '🎭',
    tag: 'Bậc Thầy Văn Phong Tự Nhiên & Cảm Xúc',
    description: 'Mô hình chuyên viết kịch bản giàu chất người, không văn mẫu sáo rỗng.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    strengths: [
      'Văn phong 100% tự nhiên không có dấu vết AI',
      'Cấu trúc nhiều chương chiều sâu'
    ],
    bestFor: 'Viết kịch bản dài 10-30+ phút, Khử văn mẫu AI',
    speed: 'High Precision (3-5s)',
    supportedTasks: ['script_writing', 'anti_ai_humanizer', 'brainstorm_ideas']
  },

  // 9. DeepSeek Direct R1
  {
    id: 'deepseek_r1',
    name: 'DeepSeek R1 (Deep-Think Reasoning)',
    provider: 'DeepSeek',
    icon: '🧠',
    tag: 'Suy Luận Chuỗi Logic & Bóc Tách Bản Chất',
    description: 'Động cơ suy luận chuỗi chuyên mổ xẻ những chủ đề phức tạp và case study tài chính.',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    strengths: [
      'Phân tích nguyên nhân gốc rễ',
      'Lập luận phản biện chặt chẽ'
    ],
    bestFor: 'Video phân tích chuyên sâu',
    speed: 'High Precision (3-5s)',
    supportedTasks: ['brainstorm_ideas', 'script_writing', 'trend_research']
  },

  // 10. FLUX.1 Pro Ultra HD
  {
    id: 'flux_pro',
    name: 'Black Forest Labs FLUX.1 Pro (Ultra HD 8K)',
    provider: 'Black Forest Labs',
    icon: '🎨',
    tag: 'Đồ Họa & Điện Ảnh 8K Chân Thực Đỉnh Cao',
    description: 'Động cơ sinh ảnh mã nguồn mở đỉnh cao nhất thế giới hiện nay. Tạo ra khung hình Storyboard và Thumbnail có chiều sâu ánh sáng, bố cục 35mm và độ nét chân thực vượt trội.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    strengths: [
      'Chất lượng ảnh Cinematic 35mm chuẩn điện ảnh',
      'Xử lý chữ và chi tiết bàn tay hoàn hảo',
      'Tương thích mọi tỉ lệ khung hình (16:9, 9:16, 1:1)'
    ],
    bestFor: 'Tạo ảnh phân cảnh Storyboard 2 cột, Thiết kế Thumbnail YouTube/TikTok',
    speed: 'Fast (1-2s)',
    supportedTasks: ['image_generation']
  },

  // 11. Midjourney v6 Photorealistic
  {
    id: 'midjourney_v6',
    name: 'Midjourney v6 Photorealistic Studio',
    provider: 'Midjourney',
    icon: '🖼️',
    tag: 'Phong Cách Nghệ Thuật & Mỹ Thuật Đỉnh Cao',
    description: 'Động cơ mỹ thuật cao cấp mang lại cảm xúc thị giác mãnh liệt, ánh sáng tương phản điện ảnh và thẩm mỹ thời trang cao cấp.',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    strengths: [
      'Màu sắc và ánh sáng tương phản cực mạnh',
      'Độ thẩm mỹ và phong cách nghệ thuật độc bản'
    ],
    bestFor: 'Concept Art quảng cáo, Ảnh bìa High-CTR giật gân',
    speed: 'Fast (1-2s)',
    supportedTasks: ['image_generation']
  },

  // 12. Google Imagen 3
  {
    id: 'imagen_3',
    name: 'Google Imagen 3 (High-Fidelity Prompt Follower)',
    provider: 'Google',
    icon: '📸',
    tag: 'Tuân Thủ Chi Tiết Khung Hình Tuyệt Đối',
    description: 'Công nghệ sinh ảnh thế hệ mới nhất của Google, bám sát từng chi tiết trong kịch bản phân cảnh mà không bỏ sót bất kỳ đạo cụ nào.',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    strengths: [
      'Hiểu sâu ngữ cảnh lời thoại kịch bản',
      'Bố cục góc máy chuẩn xác'
    ],
    bestFor: 'Minh họa phân cảnh theo thời gian thực',
    speed: 'Fast (1-2s)',
    supportedTasks: ['image_generation']
  },

  // 13. Microsoft Edge Neural Vietnamese Voices
  {
    id: 'msedge_neural',
    name: 'Microsoft Neural HD Studio (Nam Minh & Hoài My)',
    provider: 'Microsoft',
    icon: '🎙️',
    tag: 'Giọng Đọc Chuẩn Tiếng Việt Tự Nhiên 100%',
    description: 'Hệ thống giọng đọc nhân tạo Neural chuẩn xác nhất cho tiếng Việt (Nam Minh truyền cảm đĩnh đạc & Hoài My ngọt ngào lôi cuốn), hoàn toàn miễn phí không giới hạn.',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    strengths: [
      'Phát âm chuẩn ngữ điệu Bắc - Nam tự nhiên',
      'Tự động ngắt nghỉ câu theo ngữ nghĩa',
      'Thời gian render tức thì (< 500ms)'
    ],
    bestFor: 'Lồng tiếng video TikTok, YouTube Shorts, Podcast, Thuyết minh',
    speed: 'Ultra Fast (< 1s)',
    supportedTasks: ['voice_synthesis']
  },

  // 14. ElevenLabs Voice Clone Master
  {
    id: 'elevenlabs_ai',
    name: 'ElevenLabs Voice Clone Studio',
    provider: 'ElevenLabs',
    icon: '🎧',
    tag: 'Nhân Bản Giọng Đọc & Cảm Xúc Kịch Tính',
    description: 'Công nghệ nhân bản giọng đọc hàng đầu thế giới với khả năng tùy chỉnh cảm xúc (thì thầm, hào hứng, kịch tính, bi thương) theo từng phân cảnh kịch bản.',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    strengths: [
      'Cảm xúc thay đổi linh hoạt theo ngữ cảnh kịch bản',
      'Nhân bản chất giọng riêng biệt của Creator'
    ],
    bestFor: 'Kịch bản phim tài liệu, Kể chuyện trinh thám, Giọng đọc thương hiệu',
    speed: 'Fast (1-2s)',
    supportedTasks: ['voice_synthesis']
  }
];

export const TASK_DEFINITIONS: {
  id: AITaskType;
  title: string;
  subtitle: string;
  icon: string;
  defaultEngine: AIEngineProvider;
  recommendedEngines: AIEngineProvider[];
  whyImportant: string;
}[] = [
  {
    id: 'brainstorm_ideas',
    title: '1. Ý Tưởng & Phản Biện Sáng Tạo',
    subtitle: 'Tìm chủ đề phản trực giác, bóc mẽ ngộ nhận, định hình Hook 3s',
    icon: '💡',
    defaultEngine: 'openrouter_gpt4o',
    recommendedEngines: ['openrouter_gpt4o', 'openrouter_claude', 'openrouter_deepseek', 'gemini_flash', 'gemini_search'],
    whyImportant: 'Ý tưởng quyết định 80% thành công của video. Sử dụng OpenAI GPT-4o qua OpenRouter giúp đột phá lối mòn tư duy.'
  },
  {
    id: 'script_writing',
    title: '2. Viết Kịch Bản & Cốt Truyện Dài',
    subtitle: 'Kịch bản phân cảnh 2 cột, kịch bản dài 10-30m, lời thoại sạch',
    icon: '✍️',
    defaultEngine: 'openrouter_claude',
    recommendedEngines: ['openrouter_claude', 'openrouter_gpt4o', 'openrouter_deepseek', 'openrouter_llama3', 'gemini_flash'],
    whyImportant: 'Claude 3.7 Sonnet qua OpenRouter nổi tiếng là mô hình viết kịch bản tự nhiên nhất, tránh mọi văn mẫu AI sáo rỗng.'
  },
  {
    id: 'trend_research',
    title: '3. Phân Tích Đối Thủ & Xu Hướng Realtime',
    subtitle: 'Quét dữ liệu tìm kiếm 2026, tối ưu hóa điểm CTR, bóc tách viral formula',
    icon: '📈',
    defaultEngine: 'gemini_search',
    recommendedEngines: ['gemini_search', 'openrouter_gpt4o', 'openrouter_deepseek', 'gemini_flash'],
    whyImportant: 'Google Gemini kết nối Google Search Grounding giúp bạn đón đầu các từ khóa và xu hướng nóng nhất.'
  },
  {
    id: 'image_generation',
    title: '4. Tạo Ảnh Storyboard & Thumbnail Bùng Nổ CTR',
    subtitle: 'Vẽ minh họa phân cảnh 35mm, concept thumbnail tương phản cao',
    icon: '🎨',
    defaultEngine: 'flux_pro',
    recommendedEngines: ['flux_pro', 'midjourney_v6', 'imagen_3'],
    whyImportant: 'FLUX.1 Pro và Midjourney v6 mang lại độ nét 8K và tính thẩm mỹ điện ảnh cuốn hút người xem.'
  },
  {
    id: 'anti_ai_humanizer',
    title: '5. Khử Dấu Vết Văn Mẫu AI (Humanizer)',
    subtitle: 'Tăng tính biến thiên độ dài câu (Burstiness), xóa bỏ từ nối máy móc',
    icon: '🛡️',
    defaultEngine: 'openrouter_claude',
    recommendedEngines: ['openrouter_claude', 'claude_sonnet', 'gemini_flash'],
    whyImportant: 'Biến văn bản máy móc thành tác phẩm sống động của con người với nhịp thở tự nhiên.'
  },
  {
    id: 'voice_synthesis',
    title: '6. Lồng Tiếng & Tổng Hợp Giọng Đọc Neural',
    subtitle: 'Thuyết minh tự động tiếng Việt, ngắt nghỉ ngữ nghĩa, xuất file MP3',
    icon: '🎙️',
    defaultEngine: 'msedge_neural',
    recommendedEngines: ['msedge_neural', 'elevenlabs_ai'],
    whyImportant: 'Giọng đọc Microsoft Edge Neural Nam Minh & Hoài My đem lại sự chân thực và hoàn toàn miễn phí.'
  }
];

export const ROUTING_PRESETS: {
  id: AIEngineRoutingConfig['presetName'];
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  description: string;
  config: Omit<AIEngineRoutingConfig, 'presetName'>;
}[] = [
  {
    id: 'openrouter_powerhouse',
    name: 'OpenRouter Siêu Cường (Claude 3.7 + GPT-4o + DeepSeek R1)',
    tagline: 'Cổng thống nhất OpenRouter: Claude 3.7 viết kịch bản + GPT-4o ý tưởng + DeepSeek R1 lý luận',
    badge: 'Khuyên Dùng OpenRouter',
    icon: '🚀',
    description: 'Kết nối toàn diện hệ sinh thái OpenRouter với 1 API duy nhất: Claude 3.7 Sonnet cho kịch bản, GPT-4o cho góc nhìn phản trực giác và FLUX.1 Pro cho ảnh.',
    config: {
      brainstormEngine: 'openrouter_gpt4o',
      scriptEngine: 'openrouter_claude',
      trendEngine: 'gemini_search',
      imageEngine: 'flux_pro',
      voiceEngine: 'msedge_neural',
      humanizerEngine: 'openrouter_claude'
    }
  },
  {
    id: 'top_creator_pro',
    name: 'Top 1% Creator Pro (Tối Ưu Chuyên Biệt Từng Tác Vụ)',
    tagline: 'Phối hợp tinh hoa: GPT-4o Ý tưởng + Claude Kịch bản + Gemini Trend + FLUX Ảnh',
    badge: 'Chuẩn Creator',
    icon: '👑',
    description: 'Chiến lược tối ưu tuyệt đối: Mỗi công đoạn do AI mạnh nhất đảm nhiệm nhằm tạo ra sản phẩm chất lượng số 1 thị trường.',
    config: {
      brainstormEngine: 'chatgpt_gpt4o',
      scriptEngine: 'claude_sonnet',
      trendEngine: 'gemini_search',
      imageEngine: 'flux_pro',
      voiceEngine: 'msedge_neural',
      humanizerEngine: 'claude_sonnet'
    }
  },
  {
    id: 'viral_speedster',
    name: 'Viral Speedster (Tốc Độ Bắt Trend Ánh Sáng)',
    tagline: 'Toàn bộ quy trình chạy trên Google Gemini 2.5 Flash tốc độ < 1s',
    badge: 'Siêu Nhanh (< 1s)',
    icon: '⚡',
    description: 'Phù hợp khi bạn cần sản xuất số lượng lớn video ngắn TikTok / Shorts theo trend nóng hổi mà không muốn chờ đợi.',
    config: {
      brainstormEngine: 'gemini_flash',
      scriptEngine: 'gemini_flash',
      trendEngine: 'gemini_search',
      imageEngine: 'flux_pro',
      voiceEngine: 'msedge_neural',
      humanizerEngine: 'gemini_flash'
    }
  },
  {
    id: 'cinematic_deep',
    name: 'Điện Ảnh & Chiều Sâu Triết Lý (Deep Essay & Documentary)',
    tagline: 'DeepSeek R1 Suy luận + Claude 3.7 Cốt truyện + Midjourney Visuals',
    badge: 'Chuyên Sâu 10-30m',
    icon: '🎬',
    description: 'Dành cho các nhà sáng tạo video dài chuyên sâu, phim tài liệu điều tra, podcast và bài luận triết học.',
    config: {
      brainstormEngine: 'openrouter_deepseek',
      scriptEngine: 'openrouter_claude',
      trendEngine: 'openrouter_deepseek',
      imageEngine: 'midjourney_v6',
      voiceEngine: 'elevenlabs_ai',
      humanizerEngine: 'openrouter_claude'
    }
  }
];

export const DEFAULT_AI_ROUTING: AIEngineRoutingConfig = {
  presetName: 'openrouter_powerhouse',
  brainstormEngine: 'openrouter_gpt4o',
  scriptEngine: 'openrouter_claude',
  trendEngine: 'gemini_search',
  imageEngine: 'flux_pro',
  voiceEngine: 'msedge_neural',
  humanizerEngine: 'openrouter_claude'
};

const STORAGE_KEY = 'scriptflow_ai_engine_routing_v1';

export function getStoredEngineRouting(): AIEngineRoutingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.brainstormEngine) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_AI_ROUTING;
}

export function saveStoredEngineRouting(config: AIEngineRoutingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // fallback
  }
}
