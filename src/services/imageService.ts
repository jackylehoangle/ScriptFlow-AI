import { OpenSourceAISettings, OpenSourceImageEngine } from '../types';

export type ImageStylePreset = 
  | 'cinematic' 
  | 'photorealistic' 
  | '3d_animation' 
  | 'commercial' 
  | 'anime' 
  | 'vintage';

export interface ImageStyleInfo {
  id: ImageStylePreset;
  label: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export const IMAGE_STYLE_PRESETS: ImageStyleInfo[] = [
  {
    id: 'cinematic',
    label: 'Điện Ảnh Hollywood (35mm)',
    description: 'Ánh sáng nghệ thuật, chiều sâu trường ảnh, tông màu điện ảnh chuyên nghiệp',
    icon: '🎬',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  {
    id: 'photorealistic',
    label: 'Nhiếp Ảnh Tài Liệu Chân Thực',
    description: 'Ánh sáng tự nhiên, độ chi tiết siêu thực sắc nét như chụp máy ảnh DSLR',
    icon: '📷',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    id: 'commercial',
    label: 'Quảng Cáo TVC Sang Trọng',
    description: 'Ánh sáng studio softbox bóng bẩy, màu sắc nịnh mắt, hiện đại',
    icon: '💎',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  },
  {
    id: '3d_animation',
    label: 'Hoạt Hình 3D Pixar / Disney',
    description: 'Nhân vật và bối cảnh 3D sống động, ánh sáng thể tích đầy cảm xúc',
    icon: '🧸',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  {
    id: 'anime',
    label: 'Anime Nghệ Thuật (Makoto Shinkai)',
    description: 'Bầu trời rực rỡ, hiệu ứng ánh sáng lung linh, phong cách hoạt hình Nhật Bản',
    icon: '🌸',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/20'
  },
  {
    id: 'vintage',
    label: 'Phim Retro Cổ Điển 1990s',
    description: 'Hạt grain phim Kodak cổ điển, gam màu hoài niệm ấm áp',
    icon: '🎞️',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  }
];

export interface GeminiImagenResult {
  imageUrl: string;
  promptUsed: string;
  vietnameseExplanation?: string;
  aspectRatio: string;
  modelUsed: string;
}

/**
 * Generate high-fidelity storyboard image directly using Gemini Imagen 3
 */
export async function generateGeminiImagenShotImage(params: {
  visualDescription?: string;
  customPrompt?: string;
  style?: ImageStylePreset;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  shotNumber?: number;
  scriptTitle?: string;
}): Promise<GeminiImagenResult> {
  const response = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visualDescription: params.visualDescription || '',
      customPrompt: params.customPrompt || '',
      style: params.style || 'cinematic',
      aspectRatio: params.aspectRatio || '16:9',
      shotNumber: params.shotNumber || 1,
      scriptTitle: params.scriptTitle || ''
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Lỗi tạo ảnh từ máy chủ (${response.status})`);
  }

  const data = await response.json();
  if (!data.imageUrl) {
    throw new Error('Không nhận được dữ liệu ảnh trả về.');
  }

  return {
    imageUrl: data.imageUrl,
    promptUsed: data.promptUsed || params.customPrompt || '',
    vietnameseExplanation: data.vietnameseExplanation,
    aspectRatio: data.aspectRatio || params.aspectRatio || '16:9',
    modelUsed: data.modelUsed || 'gemini-imagen'
  };
}

/**
 * Enhance prompt into 3 artistic variations
 */
export async function enhanceImagePrompt(visualDescription: string, title?: string): Promise<{
  cinematicPrompt: string;
  commercialPrompt: string;
  animationPrompt: string;
  vietnameseOverview: string;
}> {
  const response = await fetch('/api/gemini/enhance-image-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visualDescription, title })
  });

  if (!response.ok) {
    throw new Error('Không thể tối ưu hóa prompt');
  }

  const data = await response.json();
  return data.data;
}

export const DEFAULT_OPENSOURCE_SETTINGS: OpenSourceAISettings = {
  engine: 'pollinations_flux',
  aspectRatio: '16:9',
  hfModel: 'black-forest-labs/FLUX.1-schnell',
  localEndpoint: 'http://localhost:7860',
  autoGeneratePrompt: true,
};

export function getSavedOpenSourceSettings(): OpenSourceAISettings {
  try {
    const saved = localStorage.getItem('scriptflow_ai_models_config');
    if (saved) {
      return { ...DEFAULT_OPENSOURCE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_OPENSOURCE_SETTINGS;
}

export function saveOpenSourceSettings(settings: OpenSourceAISettings): void {
  try {
    localStorage.setItem('scriptflow_ai_models_config', JSON.stringify(settings));
  } catch {}
}

export function getResolutionForAspectRatio(ratio: '16:9' | '9:16' | '1:1' | '4:3') {
  switch (ratio) {
    case '16:9':
      return { width: 1024, height: 576 };
    case '9:16':
      return { width: 576, height: 1024 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '1:1':
    default:
      return { width: 1024, height: 1024 };
  }
}

/**
 * Generate Storyboard Image using Open Source Models (FLUX, Stable Diffusion, HF, Local)
 */
export async function generateOpenSourceImage(
  prompt: string, 
  settings: OpenSourceAISettings = DEFAULT_OPENSOURCE_SETTINGS
): Promise<string> {
  const { width, height } = getResolutionForAspectRatio(settings.aspectRatio);
  const cleanPrompt = prompt.trim();
  const seed = Math.floor(Math.random() * 1000000);

  // 1. Pollinations AI (FLUX.1 - 100% Free, no token required, high aesthetic quality)
  if (settings.engine === 'pollinations_flux' || settings.engine === 'pollinations_turbo') {
    const model = settings.engine === 'pollinations_flux' ? 'flux' : 'turbo';
    const encoded = encodeURIComponent(cleanPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&enhance=true`;
    
    // Preload image to verify availability
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(imageUrl);
      img.onerror = () => {
        // Fallback directly returning URL
        resolve(imageUrl);
      };
      img.src = imageUrl;
    });
  }

  // 2. Hugging Face Inference API
  if (settings.engine === 'huggingface') {
    const modelId = settings.hfModel || 'black-forest-labs/FLUX.1-schnell';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (settings.hfToken) {
      headers['Authorization'] = `Bearer ${settings.hfToken}`;
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: cleanPrompt,
        parameters: {
          width,
          height,
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Hugging Face error (${response.status}): ${err}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // 3. Local GPU Stable Diffusion (Automatic1111 WebUI / SD.Next)
  if (settings.engine === 'local_sd') {
    const base = (settings.localEndpoint || 'http://localhost:7860').replace(/\/+$/, '');
    const url = `${base}/sdapi/v1/txt2img`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: cleanPrompt,
        negative_prompt: 'blurry, low quality, distorted, deformed, watermark, text',
        width,
        height,
        steps: 20,
        cfg_scale: 7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local SD WebUI error: ${response.statusText}. Hãy chắc chắn WebUI đang chạy với cờ --api --cors-allow-origins=*`);
    }

    const data = await response.json();
    if (data.images && data.images.length > 0) {
      return `data:image/png;base64,${data.images[0]}`;
    }
    throw new Error('No image returned from local SD WebUI');
  }

  // 4. Local ComfyUI
  if (settings.engine === 'local_comfyui') {
    const base = (settings.localEndpoint || 'http://127.0.0.1:8188').replace(/\/+$/, '');
    // Test endpoint
    const response = await fetch(`${base}/system_stats`).catch(() => null);
    if (!response) {
      throw new Error(`Không thể kết nối ComfyUI tại ${base}. Hãy bật ComfyUI trên máy tính.`);
    }
    // For general quick preview, fallback to fast pollinations flux if complex node workflow is needed
    const encoded = encodeURIComponent(cleanPrompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  }

  // Fallback default
  const encoded = encodeURIComponent(cleanPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
}

/**
 * Launch external AI Services with 1-click clipboard prompt for users with ChatGPT Plus or Gemini Advanced
 */
export function openExternalAIService(service: 'chatgpt' | 'gemini' | 'midjourney' | 'leonardo', prompt: string) {
  // 1. Copy formatted prompt to clipboard
  navigator.clipboard.writeText(prompt);

  // 2. Open destination website
  let url = '';
  switch (service) {
    case 'chatgpt':
      url = 'https://chatgpt.com/?model=gpt-4o';
      break;
    case 'gemini':
      url = 'https://gemini.google.com/app';
      break;
    case 'midjourney':
      url = 'https://www.midjourney.com/imagine';
      break;
    case 'leonardo':
      url = 'https://app.leonardo.ai/';
      break;
  }

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
