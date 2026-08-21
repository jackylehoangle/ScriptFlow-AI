import { 
  ScriptFormat, 
  PlatformType, 
  TopicCategory, 
  ToneOfVoice, 
  TwoColumnShot, 
  ScreenplayElement, 
  AIHookOption, 
  AIOutlineBeat,
  HookAndThumbnailBundle,
  CTRAnalysisReport,
  NarrativeArcAnalysis,
  LongFormScriptOutline,
  LongFormChapter,
  HumanizeScriptResult,
  HumanizePersonaPreset,
  ChannelDNA,
  BrainstormIdeaItem,
  BrainstormFrameworkType,
  BrainstormContentGoal,
  TrendTrackerReport,
  HotTrendKeyword,
  TrendTitleSuggestion
} from "../types";
import { v4 as uuidv4 } from "uuid";

export const PERSONA_LABELS: Record<HumanizePersonaPreset, { label: string; desc: string; icon: string }> = {
  deep_essayist: {
    label: "Triết Lý & Phân Tích Sắc Bén",
    desc: "Đanh thép, đa chiều, giàu tư duy logic của một học giả / essayist hàng đầu",
    icon: "🧠"
  },
  street_storyteller: {
    label: "Kể Chuyện Đời Thường & Gần Gũi",
    desc: "Khẩu ngữ tự nhiên, thân tình như hai người bạn trò chuyện ngoài đời thực",
    icon: "☕"
  },
  film_director: {
    label: "Đạo Diễn Điện Ảnh (Show, Don't Tell)",
    desc: "Đậm chất hình ảnh, âm thanh môi trường và cảm xúc sinh lý trực quan",
    icon: "🎬"
  },
  business_insider: {
    label: "Chuyên Gia Thực Chiến & Bóc Tách",
    desc: "Số liệu thực tế, sắc sảo, không giáo điều lý thuyết suông",
    icon: "💼"
  },
  podcast_intimate: {
    label: "Tâm Sự Đêm Khuya Lắng Đọng",
    desc: "Thì thầm, đồng cảm sâu sắc, dễ tổn thương và chân thành",
    icon: "🎙️"
  },
  witty_satire: {
    label: "Châm Biếm & Hóm Hỉnh Sắc Sảo",
    desc: "Nhịp thoại nhanh, punchline bất ngờ, phản đòn định kiến duyên dáng",
    icon: "⚡"
  }
};


// Label dictionaries for prompts
export const PLATFORM_LABELS: Record<PlatformType, string> = {
  tiktok: "TikTok (Video ngắn dọc 15s - 60s)",
  youtube_shorts: "YouTube Shorts (Video ngắn 30s - 60s)",
  reels: "Facebook/Instagram Reels (Ngắn, hình ảnh bắt mắt)",
  youtube_long: "YouTube Long-form (Video dài 8 - 15 phút, chiều sâu)",
  facebook_video: "Facebook Video (Kể chuyện, giữ chân người xem)",
  podcast: "Podcast / Talkshow Audio (Hội thoại tự nhiên, sâu sắc)",
  film: "Phim ngắn / Điện ảnh (Chuẩn format Hollywood)",
  commercial_tvc: "TVC / Video Quảng cáo bán hàng (Chốt sale, kích thích mua)"
};

export const TOPIC_LABELS: Record<TopicCategory, string> = {
  tech: "Công nghệ & AI",
  business: "Kinh doanh & Khởi nghiệp",
  storytelling: "Kể chuyện & Truyền cảm hứng",
  finance: "Tài chính & Đầu tư",
  education: "Kiến thức & Giáo dục",
  lifestyle: "Đời sống & Vlog",
  entertainment: "Giải trí & Hài hước",
  health: "Sức khỏe & Thể thao",
  horror_mystery: "Bí ẩn, Tâm linh & Trinh thám",
  marketing_sales: "Marketing & Bán hàng"
};

export const TONE_LABELS: Record<ToneOfVoice, string> = {
  energetic_viral: "Năng lượng cao, Bắt trend, Giật gân",
  storyteller_emotional: "Kể chuyện sâu lắng, Chạm cảm xúc",
  expert_analytical: "Chuyên gia, Đáng tin cậy, Logic chặt chẽ",
  humorous_witty: "Hài hước, Châm biếm, Dí dỏm",
  persuasive_sales: "Thuyết phục mạnh mẽ, Kêu gọi hành động",
  cinematic_dramatic: "Điện ảnh, Gay cấn, Kịch tính",
  friendly_conversational: "Thân thiện, Gần gũi như bạn bè"
};

/**
 * AI Channel DNA Architect: Tạo ra trọn bộ DNA Kênh từ 1 ý tưởng
 */
export async function generateAIChannelDNA(params: {
  userPrompt: string;
  category?: TopicCategory;
  platform?: PlatformType;
  targetAudienceInput?: string;
  creatorVibe?: string;
}): Promise<ChannelDNA> {
  const res = await fetch("/api/gemini/generate-channel-dna", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.channelDNA) {
    return {
      ...data.channelDNA,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
  }
  throw new Error("Không nhận được dữ liệu DNA Kênh từ AI.");
}

/**
 * AI Idea Brainstorm Lab: Gợi ý các ý tưởng video triệu view khi creator bí ý tưởng
 */
export async function brainstormChannelIdeas(params: {
  topic?: string;
  channelDNA?: ChannelDNA;
  framework?: BrainstormFrameworkType;
  contentGoal?: BrainstormContentGoal;
  count?: number;
  expandFromIdea?: BrainstormIdeaItem;
}): Promise<BrainstormIdeaItem[]> {
  const res = await fetch("/api/gemini/brainstorm-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data.ideas)) {
    return data.ideas.map((item: any) => ({
      ...item,
      id: item.id || uuidv4(),
      channelId: params.channelDNA?.id,
      createdAt: new Date().toISOString(),
      status: 'backlog',
      isSaved: false
    }));
  }
  throw new Error("Không nhận được danh sách ý tưởng từ AI.");
}

/**
 * Idea Bank API Handlers
 */
export async function fetchIdeaBank(channelId?: string): Promise<BrainstormIdeaItem[]> {
  try {
    const url = channelId ? `/api/ideas?channelId=${channelId}` : '/api/ideas';
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Error fetching idea bank:", e);
    return [];
  }
}

export async function saveIdeaToBank(idea: BrainstormIdeaItem): Promise<boolean> {
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idea),
    });
    return res.ok;
  } catch (e) {
    console.error("Error saving idea to bank:", e);
    return false;
  }
}

export async function deleteIdeaFromBank(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ideas/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.error("Error deleting idea from bank:", e);
    return false;
  }
}

export async function updateIdeaStatus(id: string, status: 'backlog' | 'in_progress' | 'filmed' | 'published'): Promise<boolean> {
  try {
    const res = await fetch(`/api/ideas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (e) {
    console.error("Error updating idea status:", e);
    return false;
  }
}

/**
 * AI Hook Generator: Sinh 5 góc tiếp cận và câu Hook mở đầu siêu giữ chân
 */
export async function generateHooksAndAngles(params: {
  topic: string;
  category: TopicCategory;
  platform: PlatformType;
  tone: ToneOfVoice;
  targetAudience?: string;
  channelDNA?: ChannelDNA;
}): Promise<AIHookOption[]> {
  try {
    const res = await fetch("/api/gemini/generate-hooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: params.topic,
        categoryLabel: TOPIC_LABELS[params.category],
        platformLabel: PLATFORM_LABELS[params.platform],
        toneLabel: TONE_LABELS[params.tone],
        targetAudience: params.targetAudience,
        channelDNA: params.channelDNA,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.hooks && Array.isArray(data.hooks)) {
      return data.hooks.map((item: any) => ({
        id: uuidv4(),
        type: item.type,
        hookText: item.hookText,
        whyItWorks: item.whyItWorks,
      }));
    }
    throw new Error("No hooks returned");
  } catch (error) {
    console.error("Error generating hooks:", error);
    return [
      {
        id: uuidv4(),
        type: "Gây sốc & Tò mò",
        hookText: `99% mọi người đang hiểu sai hoàn toàn về ${params.topic}!`,
        whyItWorks: "Đánh vào tâm lý sợ bị bỏ lỡ và muốn kiểm tra lại kiến thức của bản thân."
      },
      {
        id: uuidv4(),
        type: "Đặt câu hỏi trúng tim đen",
        hookText: `Nếu bạn đang muốn làm chủ ${params.topic} trong năm nay, đây là thứ duy nhất bạn cần!`,
        whyItWorks: "Tập trung giải quyết nhanh nỗi đau của người xem ngay trong 3 giây đầu."
      },
      {
        id: uuidv4(),
        type: "Đi ngược số đông",
        hookText: `Đừng bao giờ làm ${params.topic} theo cách cũ nếu bạn không muốn thất bại!`,
        whyItWorks: "Kích thích sự tò mò mạnh mẽ bằng việc cảnh báo rủi ro."
      }
    ];
  }
}

/**
 * Advanced Hook A/B Lab & High-CTR Thumbnail Studio
 */
export async function generateHookABAndThumbnails(params: {
  topic: string;
  title?: string;
  category: TopicCategory;
  platform: PlatformType;
  tone: ToneOfVoice;
  targetAudience?: string;
  currentScriptText?: string;
  channelDNA?: ChannelDNA;
}): Promise<HookAndThumbnailBundle> {
  const res = await fetch("/api/gemini/generate-hook-ab-thumbnails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: params.topic,
      title: params.title || params.topic,
      categoryLabel: TOPIC_LABELS[params.category] || params.category,
      platformLabel: PLATFORM_LABELS[params.platform] || params.platform,
      toneLabel: TONE_LABELS[params.tone] || params.tone,
      targetAudience: params.targetAudience,
      currentScriptText: params.currentScriptText || "",
      channelDNA: params.channelDNA
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    // Ensure ids exist
    const bundle = data.data as HookAndThumbnailBundle;
    bundle.hookVariations = bundle.hookVariations.map(h => ({
      ...h,
      id: h.id || uuidv4()
    }));
    bundle.thumbnailConcepts = bundle.thumbnailConcepts.map(t => ({
      ...t,
      id: t.id || uuidv4()
    }));
    return bundle;
  }
  throw new Error("Không nhận được dữ liệu Hook A/B và Thumbnail.");
}

/**
 * Deep CTR Prediction & Word Optimization Analysis
 */
export async function analyzeCTRAndOptimizeTitle(params: {
  title: string;
  currentHook?: string;
  scriptText?: string;
  platform: PlatformType;
  category: TopicCategory;
  targetAudience?: string;
}): Promise<CTRAnalysisReport> {
  const res = await fetch("/api/gemini/analyze-ctr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: params.title,
      currentHook: params.currentHook || "",
      scriptText: params.scriptText || "",
      platformLabel: PLATFORM_LABELS[params.platform] || params.platform,
      topicCategory: TOPIC_LABELS[params.category] || params.category,
      targetAudience: params.targetAudience || "Khán giả đại chúng"
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    return data.data as CTRAnalysisReport;
  }
  throw new Error("Không nhận được dữ liệu phân tích CTR.");
}

/**
 * Screenplay Narrative Arc, Pacing & Emotional Stakes Beat Optimizer
 */
export async function analyzeNarrativeArcAndPacing(params: {
  title: string;
  hook?: string;
  shots?: TwoColumnShot[];
  fullTextScript?: string;
  platform: PlatformType;
  category: TopicCategory;
  targetAudience?: string;
  duration?: string;
}): Promise<NarrativeArcAnalysis> {
  const res = await fetch("/api/gemini/analyze-narrative-arc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: params.title,
      hook: params.hook || "",
      shots: params.shots || [],
      fullTextScript: params.fullTextScript || "",
      platformLabel: PLATFORM_LABELS[params.platform] || params.platform,
      topicCategory: TOPIC_LABELS[params.category] || params.category,
      targetAudience: params.targetAudience || "Khán giả đại chúng",
      duration: params.duration || "60s"
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    return data.data as NarrativeArcAnalysis;
  }
  throw new Error("Không nhận được dữ liệu phân tích Narrative Arc.");
}

/**
 * AI Beat Sheet / Outline Generator
 */
export async function generateScriptOutline(params: {
  title: string;
  topic: string;
  category: TopicCategory;
  platform: PlatformType;
  tone: ToneOfVoice;
  duration: string;
  selectedHook?: string;
  channelDNA?: ChannelDNA;
}): Promise<AIOutlineBeat[]> {
  try {
    const res = await fetch("/api/gemini/generate-outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: params.title,
        topic: params.topic,
        platformLabel: PLATFORM_LABELS[params.platform],
        duration: params.duration,
        selectedHook: params.selectedHook,
        toneLabel: TONE_LABELS[params.tone],
        channelDNA: params.channelDNA,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.outline && Array.isArray(data.outline)) {
      return data.outline.map((item: any) => ({
        id: uuidv4(),
        timeCode: item.timeCode,
        title: item.title,
        keyPoints: item.keyPoints || [],
        visualIdea: item.visualIdea || "",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error generating outline:", error);
    return [
      {
        id: uuidv4(),
        timeCode: "0:00 - 0:05",
        title: "Mở đầu (Hook)",
        keyPoints: [params.selectedHook || "Thu hút sự chú ý ngay giây đầu tiên"],
        visualIdea: "Cận cảnh người nói hoặc hiệu ứng chuyển động nhanh gây chú ý",
      },
      {
        id: uuidv4(),
        timeCode: "0:05 - 0:20",
        title: "Đặt vấn đề & Nỗi đau",
        keyPoints: ["Chỉ ra vấn đề mà 90% người gặp phải", "Tại sao cách cũ không hiệu quả"],
        visualIdea: "B-roll minh họa sự bế tắc hoặc số liệu thực tế",
      },
      {
        id: uuidv4(),
        timeCode: "0:20 - 0:50",
        title: "Giải pháp đột phá",
        keyPoints: ["3 bước thực hiện cụ thể", "Ví dụ thực tế dễ hiểu"],
        visualIdea: "Quay màn hình hướng dẫn từng bước kèm text nổi bật",
      },
      {
        id: uuidv4(),
        timeCode: "0:50 - 1:00",
        title: "Kêu gọi hành động (CTA)",
        keyPoints: ["Lưu video để áp dụng ngay", "Để lại bình luận thắc mắc"],
        visualIdea: "Chỉ tay vào nút Follow hoặc hiệu ứng icon tương tác",
      },
    ];
  }
}

/**
 * AI Full Auto (A-Z) Script Generator:
 * Tạo ra kịch bản 2 cột hoàn chỉnh (Visual + Audio) hoặc Screenplay
 */
export async function generateFullScriptAtoZ(params: {
  title: string;
  topic: string;
  category: TopicCategory;
  platform: PlatformType;
  format: ScriptFormat;
  tone: ToneOfVoice;
  duration: string;
  hook?: string;
  outlineBeats?: AIOutlineBeat[];
  extraInstructions?: string;
  channelDNA?: ChannelDNA;
}): Promise<{
  summary: string;
  hook: string;
  callToAction: string;
  fullTextScript?: string;
  shots?: TwoColumnShot[];
  screenplayElements?: ScreenplayElement[];
}> {
  try {
    const res = await fetch("/api/gemini/generate-full-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: params.title,
        topic: params.topic,
        categoryLabel: TOPIC_LABELS[params.category],
        platformLabel: PLATFORM_LABELS[params.platform],
        format: params.format,
        toneLabel: TONE_LABELS[params.tone],
        duration: params.duration,
        hook: params.hook,
        outlineBeats: params.outlineBeats,
        extraInstructions: params.extraInstructions,
        channelDNA: params.channelDNA,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const { data } = await res.json();

    if (params.format === "screenplay") {
      return {
        summary: data?.summary || "",
        hook: data?.hook || "",
        callToAction: data?.callToAction || "",
        screenplayElements: (data?.elements || []).map((el: any) => ({
          id: uuidv4(),
          type: el.type,
          text: el.text,
        })),
      };
    } else {
      const shotsCleaned = (data?.shots || []).map((shot: any, index: number) => {
        let rawAudio = shot.audio || "";
        // Clean audio on client-side as safety guarantee
        const cleanedAudio = rawAudio
          .replace(/\[(?:BGM|SFX|Nhạc nền|Âm thanh|Music|Sound).*?\]/gi, "")
          .replace(/^(?:Voiceover|Voice over|MC|Người dẫn chuyện|Diễn viên|Lời thoại)\s*[:：\-]\s*/gi, "")
          .replace(/\[.*?\]/g, "")
          .trim();

        return {
          id: uuidv4(),
          shotNumber: index + 1,
          timeRange: shot.timeRange || `Cảnh ${index + 1}`,
          visual: shot.visual || "",
          audio: cleanedAudio || rawAudio,
          onScreenText: shot.onScreenText || "",
          notes: shot.notes || "",
        };
      });

      // Generate master narrative script if not returned
      const narrative = data?.fullNarrativeScript || shotsCleaned.map((s: any) => s.audio).filter(Boolean).join("\n\n");

      return {
        summary: data?.summary || "",
        hook: data?.hook || "",
        callToAction: data?.callToAction || "",
        fullTextScript: narrative,
        shots: shotsCleaned,
      };
    }
  } catch (e) {
    console.error("Script generation error:", e);
    if (params.format === "screenplay") {
      return {
        summary: "Kịch bản tự động",
        hook: params.hook || "",
        callToAction: "",
        screenplayElements: [
          { id: uuidv4(), type: "SCENE_HEADING", text: "NỘI CẢNH. PHÒNG LÀM VIỆC - NGÀY" },
          { id: uuidv4(), type: "ACTION", text: "Ánh sáng chiếu vào bàn làm việc. Nhân vật chính nhìn vào bản kế hoạch với ánh mắt kiên định." },
          { id: uuidv4(), type: "CHARACTER", text: "NHÂN VẬT CHÍNH" },
          { id: uuidv4(), type: "DIALOGUE", text: params.hook || "Đây là thời điểm chúng ta phải thay đổi mọi thứ." },
        ],
      };
    } else {
      return {
        summary: "Kịch bản tự động",
        hook: params.hook || "",
        callToAction: "Follow để xem thêm nhiều nội dung thú vị!",
        shots: [
          {
            id: uuidv4(),
            shotNumber: 1,
            timeRange: "0:00 - 0:05",
            visual: "Cận cảnh gương mặt dứt khoát, zoom nhanh vào màn hình",
            audio: params.hook || "Dừng lại 3 giây nếu bạn muốn biết bí mật này!",
            onScreenText: "BÍ MẬT QUAN TRỌNG ⚡",
            notes: "Nói nhanh, dứt khoát, nhạc nền tăng nhịp"
          },
          {
            id: uuidv4(),
            shotNumber: 2,
            timeRange: "0:05 - 0:25",
            visual: "B-roll mô tả vấn đề và giải pháp thực tế",
            audio: `Vấn đề lớn nhất khi thực hiện ${params.topic} là đa số mọi người đi sai hướng ngay từ đầu...`,
            onScreenText: "VẤN ĐỀ CỐT LÕI",
            notes: "Hiển thị chữ minh họa rõ ràng"
          },
          {
            id: uuidv4(),
            shotNumber: 3,
            timeRange: "0:25 - 0:50",
            visual: "Quay trực diện hướng dẫn từng bước cụ thể",
            audio: "Cách khắc phục cực kỳ đơn giản theo 3 bước này...",
            onScreenText: "3 BƯỚC THÀNH CÔNG",
            notes: "Nhịp điệu sôi nổi, hào hứng"
          },
          {
            id: uuidv4(),
            shotNumber: 4,
            timeRange: "0:50 - 1:00",
            visual: "Góc quay chào tạm biệt kèm hiệu ứng đồ họa Follow",
            audio: "Lưu video lại và follow mình để cập nhật thêm nhiều bí quyết khác!",
            onScreenText: "NHẤN FOLLOW NGAY ❤️",
            notes: "SFX Pop nhẹ nhàng, kết thúc video"
          }
        ]
      };
    }
  }
}

/**
 * AI Tool: Viết tiếp một phân cảnh / shot tiếp theo
 */
export async function generateNextShot(previousShots: TwoColumnShot[], context: string): Promise<TwoColumnShot> {
  try {
    const res = await fetch("/api/gemini/generate-next-shot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previousShots, context }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const shot = data.shot || {};
    return {
      id: uuidv4(),
      shotNumber: previousShots.length + 1,
      timeRange: shot.timeRange || `Cảnh ${previousShots.length + 1}`,
      visual: shot.visual || "Góc quay diễn biến tiếp theo",
      audio: shot.audio || "Lời thoại tiếp theo...",
      onScreenText: shot.onScreenText || "",
      notes: shot.notes || "",
    };
  } catch (error) {
    console.error("Error generating next shot:", error);
    return {
      id: uuidv4(),
      shotNumber: previousShots.length + 1,
      timeRange: `Cảnh ${previousShots.length + 1}`,
      visual: "Góc quay diễn biến tiếp theo",
      audio: "Nội dung lời đọc tiếp theo...",
      onScreenText: "",
      notes: "",
    };
  }
}

/**
 * AI Tool: Tinh chỉnh lại một cảnh hoặc phân đoạn (Làm hài hước hơn, ngắn hơn, giật gân hơn...)
 */
export async function rewriteContentWithInstruction(content: string, instruction: string): Promise<string> {
  try {
    const res = await fetch("/api/gemini/rewrite-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, instruction }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.text || content;
  } catch (error) {
    console.error("Error rewriting content:", error);
    return content;
  }
}

/**
 * AI Tool: Sinh Prompt tạo ảnh / video AI (Midjourney, Stable Diffusion, Veo) cho B-roll
 */
export async function generateBrollVisualPrompt(visualDescription: string): Promise<{
  vietnameseExplanation: string;
  englishAIPrompt: string;
}> {
  try {
    const res = await fetch("/api/gemini/broll-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visualDescription }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.data || {
      vietnameseExplanation: "Khung hình minh họa",
      englishAIPrompt: `Cinematic shot of ${visualDescription}, 8k, photorealistic, cinematic lighting, 35mm lens`,
    };
  } catch (error) {
    console.error("Error generating broll prompt:", error);
    return {
      vietnameseExplanation: "Khung hình minh họa",
      englishAIPrompt: `Cinematic shot of ${visualDescription}, 8k, photorealistic, cinematic lighting, 35mm lens`,
    };
  }
}

/**
 * AI Tool: Đánh giá chất lượng & Độ Viral của kịch bản
 */
export async function analyzeScriptVirality(scriptText: string, platform: PlatformType): Promise<{
  score: number;
  hookRating: string;
  retentionAdvice: string[];
  estimatedWpm: number;
  strengths: string[];
  improvements: string[];
}> {
  try {
    const res = await fetch("/api/gemini/analyze-virality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scriptText,
        platformLabel: PLATFORM_LABELS[platform],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.data || {
      score: 85,
      hookRating: "Khá tốt và trực diện",
      retentionAdvice: [
        "Thêm chuyển cảnh nhanh mỗi 3-5 giây",
        "Nhấn mạnh từ khóa bằng hiệu ứng chữ trên màn hình",
        "Kêu gọi hành động rõ ràng ở 5 giây cuối"
      ],
      estimatedWpm: 150,
      strengths: ["Cấu trúc rõ ràng", "Ngôn từ gần gũi"],
      improvements: ["Có thể tăng thêm sự tò mò ở đoạn giữa"]
    };
  } catch (e) {
    console.error("Error analyzing virality:", e);
    return {
      score: 85,
      hookRating: "Khá tốt và trực diện",
      retentionAdvice: [
        "Thêm chuyển cảnh nhanh mỗi 3-5 giây",
        "Nhấn mạnh từ khóa bằng hiệu ứng chữ trên màn hình",
        "Kêu gọi hành động rõ ràng ở 5 giây cuối"
      ],
      estimatedWpm: 150,
      strengths: ["Cấu trúc rõ ràng", "Ngôn từ gần gũi"],
      improvements: ["Có thể tăng thêm sự tò mò ở đoạn giữa"]
    };
  }
}

/**
 * Generates a deep 5-8 chapter long-form outline (10-30+ min) with anti-AI rules
 */
export async function generateLongFormOutline(params: {
  title: string;
  topic: string;
  platform: PlatformType;
  targetDuration: string;
  tone: ToneOfVoice;
  targetAudience?: string;
  extraContext?: string;
  channelDNA?: ChannelDNA;
}): Promise<LongFormScriptOutline> {
  const res = await fetch("/api/gemini/generate-longform-outline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: params.title,
      topic: params.topic,
      platformLabel: PLATFORM_LABELS[params.platform] || params.platform,
      targetDuration: params.targetDuration,
      toneLabel: TONE_LABELS[params.tone] || params.tone,
      targetAudience: params.targetAudience,
      extraContext: params.extraContext,
      channelDNA: params.channelDNA
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    return data.data as LongFormScriptOutline;
  }
  throw new Error("Không nhận được dữ liệu dàn bài nhiều chương từ AI.");
}

/**
 * Expands a single chapter with deep, human-like dialogue, 500-1200 words + shots
 */
export async function expandChapterDeep(params: {
  projectTitle: string;
  narrativeThesis: string;
  styleToneGuide: string;
  chapter: LongFormChapter;
  previousChapterSummary?: string;
  nextChapterSummary?: string;
  channelDNA?: ChannelDNA;
}): Promise<{ contentScript: string; wordCount: number; shots: TwoColumnShot[] }> {
  const res = await fetch("/api/gemini/expand-chapter-deep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    // Add unique IDs to shots if missing
    const shotsWithId = (data.data.shots || []).map((s: any, idx: number) => ({
      ...s,
      id: s.id || uuidv4(),
      shotNumber: s.shotNumber || idx + 1
    }));
    return {
      contentScript: data.data.contentScript || "",
      wordCount: data.data.wordCount || 0,
      shots: shotsWithId
    };
  }
  throw new Error("Không nhận được nội dung chi tiết cho chương.");
}

/**
 * Humanizes script text, removing robotic AI cliches & adding natural cadence & sensory details
 */
export async function humanizeScriptText(params: {
  text: string;
  toneStyle?: string;
  persona?: HumanizePersonaPreset;
  intensity?: 'natural' | 'aggressive' | 'cinematic';
  targetAudience?: string;
}): Promise<HumanizeScriptResult> {
  const res = await fetch("/api/gemini/humanize-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.data) {
    return data.data as HumanizeScriptResult;
  }
  throw new Error("Không nhận được kết quả nhân bản hóa văn bản.");
}

/**
 * Trend Tracker: Uses Google Search Grounding to extract trending keywords & viral title angles according to the active Channel DNA
 */
export async function trackNicheTrends(params: {
  channelDNA?: ChannelDNA;
  customKeyword?: string;
  timeframe?: string;
}): Promise<TrendTrackerReport> {
  const res = await fetch("/api/gemini/track-trends", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Lỗi khi quét xu hướng Google Search (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data as TrendTrackerReport;
}


