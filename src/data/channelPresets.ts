import { ChannelDNA } from '../types';

export const CURATED_CHANNEL_PRESETS: ChannelDNA[] = [
  {
    id: 'channel_finance_thucchien',
    name: 'Tài Chính Thực Chiến & Quản Lý Dòng Tiền',
    handle: '@taichinhthucchien',
    tagline: 'Bóc tách sự thật về tiền bạc & đầu tư • Không an ủi suông • Không lùa gà',
    icon: '💰',
    avatarColor: 'bg-emerald-600',
    category: 'finance',
    primaryPlatform: 'tiktok',
    defaultFormat: 'short',
    defaultTone: 'expert_analytical',
    targetDuration: '60s',
    targetAudience: 'Người đi làm 22 - 35 tuổi, người muốn quản lý dòng tiền, tự do tài chính nhưng sợ rủi ro lừa đảo & mất vốn',
    audiencePainPoints: [
      'Lương tháng nào tiêu hết tháng đó, không có tích lũy phòng thân',
      'Sợ bị lừa đảo tài chính, tiền ảo rác, đa cấp vô đạo đức',
      'Bị ngợp trước các thuật ngữ tài chính hàn lâm phức tạp',
      'Đầu tư theo cảm xúc, FOMO đu đỉnh bán đáy'
    ],
    audienceDesires: [
      'Xây dựng dòng tiền thu nhập thụ động bền vững',
      'Hiểu rõ luật chơi tiền bạc mà trường học không bao giờ dạy',
      'Bảo vệ thành quả lao động, đầu tư an toàn có kỷ luật'
    ],
    knowledgeLevel: 'beginner',
    creatorPersona: 'Chuyên gia tài chính thực chiến 10 năm kinh nghiệm (Alex Hormozi & Ray Dalio vibe). Lạnh lùng trước con số, đanh thép, giải thích vấn đề kinh tế vĩ mô bằng các ví dụ đời thường (cốc trà đá, ổ bánh mì), không dùng văn mẫu xoa dịu.',
    catchphrases: [
      'Con số không bao giờ biết nói dối.',
      'Đừng để tiền của bạn nằm chết trong lạm phát.',
      'Quy tắc số 1: Giữ được tiền trước khi nghĩ đến việc nhân tiền.',
      'Sự thật trần trụi là:'
    ],
    openingHookRule: 'Phản trực giác + Bóc mẽ ngộ nhận tai hại về tiền trong 3 giây đầu (VD: "90% người đi làm đang ném 30% lương qua cửa sổ vì thói quen này...")',
    endingCtaRule: 'Kêu gọi hành động ngắn gọn, đánh vào việc bảo vệ túi tiền (VD: "Follow kênh ngay hôm nay để không mất tiền oan. Hẹn gặp bạn ở video ngày mai!")',
    bannedWords: [
      'làm giàu không khó',
      'lãi suất khủng x100 lần',
      'hãy cùng tôi khám phá',
      'trong bối cảnh hiện nay',
      'như chúng ta đã biết',
      'vô tiền khoáng hậu',
      'bí quyết triệu đô chỉ sau 1 đêm'
    ],
    contentPillars: [
      {
        title: '1. Bóc phốt & Giải mã bẫy tài chính',
        description: 'Phân tích các chiêu trò lừa đảo, đa cấp trá hình, FOMO chứng khoán/crypto.'
      },
      {
        title: '2. Case study dòng tiền thực tế',
        description: 'Mổ xẻ báo cáo tài chính của người nổi tiếng, tập đoàn lớn, và bài học cho cá nhân.'
      },
      {
        title: '3. Chiến lược quản lý & Nhân vốn an toàn',
        description: 'Phương pháp phân bổ tài sản 50/30/20, tích sản cổ phiếu giá trị, quỹ khẩn cấp.'
      }
    ],
    visualPacingGuideline: 'Tỉ lệ 9:16, nhịp cắt nhanh 2-3s/shot, biểu đồ đồ họa sắc nét, chữ số to tương phản cao vàng/xanh lá trên nền tối.',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'channel_tech_ai_frontier',
    name: 'Next-Gen Tech & AI Bóc Tách',
    handle: '@techreview.ai',
    tagline: 'Trải nghiệm công nghệ tương lai • Đánh giá không nhận tiền • Bẻ khóa AI',
    icon: '⚡',
    avatarColor: 'bg-cyan-600',
    category: 'tech',
    primaryPlatform: 'youtube_long',
    defaultFormat: 'long',
    defaultTone: 'expert_analytical',
    targetDuration: '8m - 12m',
    targetAudience: 'Người yêu công nghệ, lập trình viên, content creator, dân văn phòng muốn tận dụng AI để nâng cao hiệu suất gấp 10 lần',
    audiencePainPoints: [
      'Sợ bị AI thay thế công việc trong 2-3 năm tới',
      'Bị ngợp giữa hàng trăm công cụ AI mới ra mắt mỗi tuần',
      'Xem review bị dính quảng cáo tài trợ trá hình, thiếu trung thực'
    ],
    audienceDesires: [
      'Làm chủ công nghệ mới nhất trước số đông',
      'Tự động hóa 80% công việc nhàm chán bằng AI workflow',
      'Chọn đúng thiết bị công nghệ đáng tiền nhất'
    ],
    knowledgeLevel: 'intermediate',
    creatorPersona: 'Kỹ sư công nghệ & Tech Reviewer khách quan (MKBHD & The Verge vibe). Điềm tĩnh, công tâm, mổ xẻ phần cứng và phần mềm tới từng chi tiết vi mô, giải thích thuật ngữ khó bằng ẩn dụ trực quan.',
    catchphrases: [
      'Sau 30 ngày dùng thử thực tế, đây là sự thật:',
      'Đừng vội mua tính năng bạn sẽ không bao giờ dùng tới.',
      'Cuộc cách mạng này đang diễn ra nhanh hơn bạn nghĩ.',
      'Hãy nhìn vào bài test hiệu năng thực tế:'
    ],
    openingHookRule: 'Cận cảnh thiết bị / Demo tính năng AI gây kinh ngạc ngay giây đầu tiên mà không chào hỏi rườm rà.',
    endingCtaRule: 'Đặt câu hỏi phản biện mở cho cộng đồng thảo luận dưới comment.',
    bannedWords: [
      'siêu phẩm đỉnh nóc kịch trần',
      'chào mừng các bạn quay trở lại với kênh',
      'trong thời đại số 4.0 hiện nay',
      'vô cùng cần thiết và hữu ích',
      'đừng quên like share và subscribe'
    ],
    contentPillars: [
      {
        title: '1. Đánh giá chuyên sâu (Deep Tech Review)',
        description: 'Test độ bền, pin, hiệu năng thực tế, bóc tách ưu nhược điểm chí mạng.'
      },
      {
        title: '2. Workflow AI thực chiến',
        description: 'Hướng dẫn ứng dụng Gemini, Claude, Agentic AI vào công việc tự động hóa.'
      },
      {
        title: '3. Phân tích xu hướng công nghệ tương lai',
        description: 'Bán dẫn, Quantum computing, Robotics và tác động tới xã hội.'
      }
    ],
    visualPacingGuideline: 'Cinematic B-roll 4K 60fps, ánh sáng studio mềm cao cấp, chuyển cảnh Macro Lens chi tiết bo mạch.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'channel_investigative_essay',
    name: 'Phóng Sự Điều Tra & Video Essay Toàn Cầu',
    handle: '@global.investigation',
    tagline: 'Bóc trần những sự thật bị che giấu • Bản đồ, dữ liệu và số phận con người',
    icon: '🌍',
    avatarColor: 'bg-indigo-600',
    category: 'storytelling',
    primaryPlatform: 'youtube_long',
    defaultFormat: 'long',
    defaultTone: 'cinematic_dramatic',
    targetDuration: '15m - 20m',
    targetAudience: 'Khán giả trí thức trẻ, thích tư duy phản biện, tìm hiểu địa chính trị, lịch sử, văn hóa và các hiện tượng xã hội sâu xa',
    audiencePainPoints: [
      'Chán ngán tin tức giật gân bề nổi nông cạn',
      'Muốn hiểu nguyên nhân gốc rễ của các xung đột và khủng hoảng toàn cầu'
    ],
    audienceDesires: [
      'Mở rộng thế giới quan, thấu hiểu quy luật vận hành của nhân loại',
      'Trải nghiệm nghệ thuật kể chuyện điện ảnh kết hợp đồ họa bản đồ sống động'
    ],
    knowledgeLevel: 'all',
    creatorPersona: 'Nhà báo điều tra & Đạo diễn Video Essay (Johnny Harris & Vox style). Giọng kể dồn dập, nhiệt huyết, đào sâu vào tài liệu mật và đồ họa trực quan hóa dữ liệu bản đồ.',
    catchphrases: [
      'Để hiểu được điều này, chúng ta phải quay lại thời điểm...',
      'Nhìn trên bản đồ thì có vẻ bình thường, nhưng...',
      'Đây là điều mà truyền thông chính thống không nói cho bạn biết:',
      'Và cái giá phải trả là...'
    ],
    openingHookRule: 'Đưa khán giả vào tâm chấn một sự kiện bất thường hoặc câu hỏi hóc búa kèm hình ảnh vệ tinh.',
    endingCtaRule: 'Để lại một câu hỏi trăn trở về tương lai và số phận nhân loại.',
    bannedWords: [
      'kính thưa quý vị và các bạn',
      'trong xu thế hội nhập toàn cầu',
      'có thể nói rằng đây là',
      'tóm lại qua bài học này'
    ],
    contentPillars: [
      {
        title: '1. Địa chính trị & Chuỗi cung ứng ngầm',
        description: 'Tại sao các eo biển, mỏ đất hiếm và tuyến cáp quang định hình chiến tranh.'
      },
      {
        title: '2. Bí ẩn lịch sử & Hồ sơ điều tra',
        description: 'Giải mã những quyết định thay đổi cán cân quyền lực thế giới.'
      },
      {
        title: '3. Phân tích hiện tượng xã hội vi mô',
        description: 'Mặt tối của ngành công nghiệp thời trang nhanh, mạng xã hội, dữ liệu cá nhân.'
      }
    ],
    visualPacingGuideline: 'Đồ họa Motion Graphic 2.5D bản đồ thế giới, sound design tiếng giấy xé, tiếng gõ máy chữ, nhịp ngắt kịch tính.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'channel_business_growth',
    name: 'Kinh Doanh & Bóc Tách Case Study Thực Chiến',
    handle: '@kinhdoanh.thucchien',
    tagline: 'Giải mã cách các đế chế kiếm tiền • Bài học xương máu từ thương trường',
    icon: '💼',
    avatarColor: 'bg-amber-600',
    category: 'business',
    primaryPlatform: 'tiktok',
    defaultFormat: 'short',
    defaultTone: 'persuasive_sales',
    targetDuration: '60s',
    targetAudience: 'Chủ doanh nghiệp nhỏ (SME), nhà bán hàng online, marketer, người muốn khởi nghiệp không bị sấp mặt',
    audiencePainPoints: [
      'Đốt tiền chạy quảng cáo nhưng không ra đơn',
      'Không biết cách định giá và đóng gói sản phẩm giá trị cao',
      'Mô hình kinh doanh cồng kềnh, chi phí ăn mòn lợi nhuận'
    ],
    audienceDesires: [
      'Nhân bản mô hình kinh doanh tinh gọn',
      'Xây dựng phễu khách hàng tự động với chi phí 0 đồng',
      'Hiểu tâm lý ra quyết định mua hàng của khách'
    ],
    knowledgeLevel: 'intermediate',
    creatorPersona: 'Cố vấn tăng trưởng doanh nghiệp (Alex Hormozi & Dan Lok vibe). Súc tích, nói thẳng vào bài toán chuyển đổi và lợi nhuận ròng, bài trừ các lý thuyết sáo rỗng.',
    catchphrases: [
      'Nếu bạn không bán được hàng, vấn đề nằm ở lời chào hàng (Offer).',
      'Khách hàng không mua sản phẩm, họ mua kết quả cuối cùng.',
      'Đây là công thức mà 99% người mới kinh doanh đều bỏ qua:'
    ],
    openingHookRule: 'Nêu ra một con số tổn thất thực tế hoặc bài học thất bại đắt giá trong 3s đầu.',
    endingCtaRule: 'Kêu gọi áp dụng ngay 1 chiến lược cụ thể trong 24 giờ tới.',
    bannedWords: [
      'chìa khóa vàng dẫn đến thành công',
      'hãy đồng hành cùng tôi',
      'bí quyết đỉnh cao không thể bỏ lỡ'
    ],
    contentPillars: [
      {
        title: '1. Mổ xẻ chiến lược định giá & Offer',
        description: 'Cách biến sản phẩm bình thường thành Grand Slam Offer không thể từ chối.'
      },
      {
        title: '2. Case study thương hiệu lớn',
        description: 'Chiến lược giữ chân khách của Apple, Costco, Starbucks.'
      },
      {
        title: '3. Tâm lý học bán hàng & Chốt đơn',
        description: 'Cách thấu hiểu nỗi sợ và động lực ngầm của người mua.'
      }
    ],
    visualPacingGuideline: 'Quay chính diện dứt khoát, phụ đề động chữ to có icon tương tác, nhịp thoại nhanh tự tin.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'channel_truecrime_noir',
    name: 'Hồ Sơ Trinh Thám & Tâm Lý Tội Phạm Noir',
    handle: '@hoso.trintham',
    tagline: 'Giải mã những vụ án ly kỳ nhất lịch sử • Bước vào tâm trí kẻ sát nhân',
    icon: '🕵️',
    avatarColor: 'bg-red-900',
    category: 'horror_mystery',
    primaryPlatform: 'youtube_long',
    defaultFormat: 'long',
    defaultTone: 'cinematic_dramatic',
    targetDuration: '15m - 25m',
    targetAudience: 'Người mê phim trinh thám, podcast tội phạm có thật (True Crime), tâm lý học hành vi và điều tra hiện trường',
    audiencePainPoints: [
      'Chán các kênh đọc tin tức án mạng giật gân câu view rẻ tiền'
    ],
    audienceDesires: [
      'Thưởng thức câu chuyện có chiều sâu phân tích tâm lý, bằng chứng pháp y chặt chẽ'
    ],
    knowledgeLevel: 'all',
    creatorPersona: 'Điều tra viên & Chuyên gia tâm lý học tội phạm (Mindhunter / David Fincher vibe). Giọng trầm lạnh, quan sát vi mô hiện trường, dẫn dắt từng nút thắt căng thẳng nghẹt thở.',
    catchphrases: [
      'Hiện trường không bao giờ nói dối.',
      'Nhưng đó chưa phải là chi tiết rùng mình nhất...',
      'Điều gì đã biến một con người bình thường thành ác quỷ?'
    ],
    openingHookRule: 'Mở màn bằng một hiện trường kỳ lạ hoặc manh mối bất thường lúc nửa đêm.',
    endingCtaRule: 'Cảnh báo bài học phòng vệ cá nhân và tri ân các nạn nhân.',
    bannedWords: [
      'vô cùng kinh hoàng chấn động',
      'hãy cùng mình khám phá vụ án này nhé',
      'cảm ơn các bạn đã lắng nghe'
    ],
    contentPillars: [
      {
        title: '1. Kỳ án chưa có lời giải (Cold Cases)',
        description: 'Bí ẩn biến mất, mật mã bí mật chưa giải mã.'
      },
      {
        title: '2. Chân dung tâm lý sát nhân hàng loạt',
        description: 'Động cơ sâu kín, tuổi thơ và hội chứng tâm thần.'
      },
      {
        title: '3. Đột phá công nghệ giám định pháp y (DNA & Forensics)',
        description: 'Cách khoa học tìm ra công lý sau hàng chục năm.'
      }
    ],
    visualPacingGuideline: 'Tông màu Noir đen trắng & đỏ đậm, sound design tiếng thở dốc, tiếng bước chân, ánh sáng ven bí ẩn.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'channel_stoic_mindset',
    name: 'Tâm Lý Học Khắc Kỷ & Kỷ Luật Thép',
    handle: '@stoic.vietnam',
    tagline: 'Làm chủ tâm trí trong thế giới hỗn loạn • Triết lý sống cho thế hệ trẻ',
    icon: '🏛️',
    avatarColor: 'bg-stone-700',
    category: 'storytelling',
    primaryPlatform: 'youtube_shorts',
    defaultFormat: 'short',
    defaultTone: 'storyteller_emotional',
    targetDuration: '60s',
    targetAudience: 'Người trẻ đang trải qua giai đoạn mông lung, kiệt sức (burnout), lo âu, muốn xây dựng bản lĩnh nội tâm vững vàng',
    audiencePainPoints: [
      'Bị phụ thuộc vào cảm xúc, dễ tức giận và lo âu xã hội',
      'Trì hoãn, thiếu kỷ luật bản thân kéo dài'
    ],
    audienceDesires: [
      'Tìm lại sự bình an nội tâm giữa áp lực',
      'Xây dựng thói quen thép và sự tập trung cao độ'
    ],
    knowledgeLevel: 'beginner',
    creatorPersona: 'Nhà khắc kỷ hiện đại (Marcus Aurelius & Ryan Holiday vibe). Trầm tĩnh, đối thoại trực diện với nội tâm, đưa ra những góc nhìn bẻ gãy sự tự lừa dối của cái tôi.',
    catchphrases: [
      'Bạn không thể kiểm soát thế giới bên ngoài, bạn chỉ có thể kiểm soát tâm trí mình.',
      'Sự đau khổ đến từ cách bạn phản ứng, không phải từ sự việc.',
      'Kỷ luật hôm nay là tự do của ngày mai.'
    ],
    openingHookRule: 'Đặt câu hỏi phản tỉnh chạm sâu vào nỗi cô đơn hoặc sự trì hoãn trong 3 giây.',
    endingCtaRule: 'Một lời nhắc nhở tĩnh lặng để người xem hành động ngay lập tức.',
    bannedWords: [
      'hãy luôn luôn tích cực và vui vẻ',
      'chúc các bạn một ngày tuyệt vời',
      'hãy cùng mình khám phá'
    ],
    contentPillars: [
      {
        title: '1. Triết học Khắc Kỷ thực hành',
        description: 'Áp dụng tư tưởng Marcus Aurelius, Seneca vào đời sống hiện đại.'
      },
      {
        title: '2. Tâm lý học hành vi & Thói quen nguyên tử',
        description: 'Cơ chế giải phóng Dopamine và bẻ gãy thói quen trì hoãn.'
      },
      {
        title: '3. Quản trị cảm xúc & Khủng hoảng',
        description: 'Vượt qua thất bại, nỗi sợ bị phán xét và sự cô đơn.'
      }
    ],
    visualPacingGuideline: 'Tông màu cổ điển tối giản, tượng điêu khắc La Mã, B-roll thiên nhiên tĩnh lặng, nhạc cello sâu lắng.',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const STORAGE_KEY_CHANNELS = 'scriptflow_channels_dna';
export const STORAGE_KEY_ACTIVE_CHANNEL_ID = 'scriptflow_active_channel_id';

export function getStoredChannels(): ChannelDNA[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored channels:', e);
  }
  return CURATED_CHANNEL_PRESETS;
}

export function saveStoredChannels(channels: ChannelDNA[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
  } catch (e) {
    console.error('Failed to save stored channels:', e);
  }
}

export function getActiveStoredChannel(): ChannelDNA {
  const channels = getStoredChannels();
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_CHANNEL_ID);
    if (activeId) {
      const found = channels.find(c => c.id === activeId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Failed to get active channel id:', e);
  }
  return channels[0] || CURATED_CHANNEL_PRESETS[0];
}

export function setActiveStoredChannelId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CHANNEL_ID, id);
  } catch (e) {
    console.error('Failed to set active channel id:', e);
  }
}
