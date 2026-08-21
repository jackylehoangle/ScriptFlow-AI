import React, { useState, useEffect } from 'react';
import { OpenSourceAISettings, OpenSourceImageEngine } from '../types';
import { 
  getSavedOpenSourceSettings, 
  saveOpenSourceSettings, 
  DEFAULT_OPENSOURCE_SETTINGS,
  generateOpenSourceImage
} from '../services/imageService';
import { 
  Cpu, 
  Sparkles, 
  Server, 
  ExternalLink, 
  Key, 
  Check, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  X,
  Layers,
  Image as ImageIcon,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface OpenSourceModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenSourceModelsModal({ isOpen, onClose }: OpenSourceModelsModalProps) {
  const [settings, setSettings] = useState<OpenSourceAISettings>(DEFAULT_OPENSOURCE_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Cinematic shot of futuristic cyberpunk coffee shop, warm lighting, 8k');
  const [isTesting, setIsTesting] = useState(false);
  const [testResultImage, setTestResultImage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSavedOpenSourceSettings());
      setTestResultImage(null);
      setTestError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveOpenSourceSettings(settings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleTestGeneration = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResultImage(null);
    try {
      const url = await generateOpenSourceImage(testPrompt, settings);
      setTestResultImage(url);
    } catch (err: any) {
      setTestError(err.message || 'Lỗi khi kết nối hoặc tạo ảnh');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl shadow-sm">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                Cấu Hình Mô Hình AI Mã Nguồn Mở & 0đ
              </h2>
              <p className="text-xs text-zinc-500">
                Tạo hình ảnh Storyboard chất lượng cao với chi phí 0đ hoặc kết nối GPU riêng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Choose Engine */}
          <div className="space-y-3">
            <label className="font-bold text-zinc-800 text-sm flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" />
              1. Chọn Mô Hình Tạo Ảnh / Storyboard
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option 1: FLUX.1 Pollinations (Default & Free 0đ) */}
              <div
                onClick={() => setSettings({ ...settings, engine: 'pollinations_flux' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.engine === 'pollinations_flux'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-500" />
                    FLUX.1 Schnell / Dev
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                    Miễn phí 0đ
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Mô hình mã nguồn mở thế hệ mới của Black Forest Labs. Tạo ảnh siêu thực, chi tiết khuôn mặt & ánh sáng đỉnh cao. Không cần thẻ hay API key.
                </p>
              </div>

              {/* Option 2: Turbo (Fast 0đ) */}
              <div
                onClick={() => setSettings({ ...settings, engine: 'pollinations_turbo' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.engine === 'pollinations_turbo'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    SDXL Turbo (Tốc độ cao)
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                    Miễn phí 0đ
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Tạo ảnh siêu tốc (1-2 giây), lý tưởng để phác thảo nhanh ý tưởng góc máy và kịch bản phân cảnh mà không cần chờ đợi.
                </p>
              </div>

              {/* Option 3: Hugging Face API */}
              <div
                onClick={() => setSettings({ ...settings, engine: 'huggingface' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.engine === 'huggingface'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    🤗 Hugging Face API
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full">
                    Token riêng
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Kết nối trực tiếp với kho mô hình trên Hugging Face (hỗ trợ bất kỳ checkpoint hoặc LoRA nào bạn thích).
                </p>
              </div>

              {/* Option 4: Local GPU Server (Automatic1111 / ComfyUI) */}
              <div
                onClick={() => setSettings({ ...settings, engine: 'local_sd' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.engine === 'local_sd' || settings.engine === 'local_comfyui'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Server size={14} className="text-purple-600" />
                    Local GPU (ComfyUI / SD)
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full">
                    Máy tính riêng
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Chạy mô hình ngay trên card đồ họa RTX máy tính của bạn qua WebUI API. Bảo mật 100% không giới hạn.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Engine Specific Configuration */}
          {settings.engine === 'huggingface' && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-zinc-800 flex items-center gap-1.5">
                <Key size={14} className="text-zinc-600" /> Cấu hình Hugging Face
              </h4>
              <div className="space-y-2">
                <label className="text-zinc-500 text-[11px] block">Hugging Face User Access Token (Tùy chọn):</label>
                <input
                  type="password"
                  value={settings.hfToken || ''}
                  onChange={(e) => setSettings({ ...settings, hfToken: e.target.value })}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-zinc-500 text-[11px] block">Model ID trên Hugging Face:</label>
                <input
                  type="text"
                  value={settings.hfModel || 'black-forest-labs/FLUX.1-schnell'}
                  onChange={(e) => setSettings({ ...settings, hfModel: e.target.value })}
                  placeholder="black-forest-labs/FLUX.1-schnell"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {(settings.engine === 'local_sd' || settings.engine === 'local_comfyui') && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-zinc-800 flex items-center gap-1.5">
                <Server size={14} className="text-zinc-600" /> Cấu hình Local GPU WebUI
              </h4>
              <div className="space-y-2">
                <label className="text-zinc-500 text-[11px] block">Địa chỉ Local Server (Endpoint):</label>
                <input
                  type="text"
                  value={settings.localEndpoint || 'http://localhost:7860'}
                  onChange={(e) => setSettings({ ...settings, localEndpoint: e.target.value })}
                  placeholder="http://localhost:7860"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <p className="text-[10px] text-zinc-400">
                  * Khi khởi động Stable Diffusion WebUI, hãy thêm cờ: <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">--api --cors-allow-origins=*</code>
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Aspect Ratio Settings */}
          <div className="space-y-2">
            <label className="font-bold text-zinc-800 block">2. Tỉ lệ khung hình Storyboard mặc định:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '16:9', label: '16:9 (Ngang)', sub: 'YouTube / Phim' },
                { id: '9:16', label: '9:16 (Dọc)', sub: 'TikTok / Shorts' },
                { id: '1:1', label: '1:1 (Vuông)', sub: 'Instagram / Feed' },
                { id: '4:3', label: '4:3 (Cổ điển)', sub: 'Truyền hình' },
              ].map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setSettings({ ...settings, aspectRatio: ratio.id as any })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    settings.aspectRatio === ratio.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <div className="font-bold text-xs">{ratio.label}</div>
                  <div className="text-[10px] text-zinc-400">{ratio.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Live Test Connection */}
          <div className="p-4 bg-zinc-50/80 border border-zinc-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-zinc-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" /> Thử nghiệm tạo ảnh trực tiếp
              </h4>
              <button
                onClick={handleTestGeneration}
                disabled={isTesting}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs"
              >
                {isTesting ? (
                  <>
                    <Sparkles size={12} className="animate-spin" /> Đang tạo ảnh...
                  </>
                ) : (
                  <>
                    <Zap size={12} /> Tạo Thử Ngay
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Nhập prompt thử nghiệm..."
              className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-800"
            />

            {testError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{testError}</span>
              </div>
            )}

            {testResultImage && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <CheckCircle2 size={14} /> Tạo ảnh thành công với mô hình đã chọn!
                </div>
                <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm max-h-60 flex items-center justify-center bg-black/5">
                  <img src={testResultImage} alt="Test Result" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Notice for ChatGPT Plus & Gemini Advanced Users */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-amber-700" />
              Bạn đang có sẵn gói ChatGPT Plus ($20) hoặc Gemini Advanced?
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Vì chính sách của OpenAI và Google không cấp API trực tiếp từ gói người dùng cá nhân $20/tháng, ScriptFlow AI đã trang bị tính năng <strong>"AI Prompt 1-Click"</strong> tại mỗi phân cảnh. Bạn chỉ cần bấm 1 click để tự động copy toàn bộ prompt điện ảnh chi tiết và mở nhanh ChatGPT/Gemini để dán nhận ảnh miễn phí không giới hạn!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <button
            onClick={() => setSettings(DEFAULT_OPENSOURCE_SETTINGS)}
            className="text-zinc-500 hover:text-zinc-800 font-semibold text-xs px-3 py-1.5"
          >
            Đặt lại mặc định
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isSaved ? <Check size={14} /> : null}
              {isSaved ? 'Đã lưu cấu hình!' : 'Lưu Cấu Hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
