import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Download,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Wand2,
  Eye,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { TwoColumnShot } from '../types';
import { 
  IMAGE_STYLE_PRESETS, 
  ImageStylePreset, 
  generateGeminiImagenShotImage, 
  enhanceImagePrompt,
  GeminiImagenResult
} from '../services/imageService';

interface ShotImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  shot: TwoColumnShot | null;
  scriptTitle?: string;
  allShots?: TwoColumnShot[];
  onApplyImageToShot: (shotId: string, imageUrl: string, imagePrompt: string) => void;
  onApplyBatchImages?: (updatedShots: TwoColumnShot[]) => void;
}

export default function ShotImageStudioModal({
  isOpen,
  onClose,
  shot,
  scriptTitle = '',
  allShots = [],
  onApplyImageToShot,
  onApplyBatchImages
}: ShotImageStudioModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<ImageStylePreset>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeminiImagenResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variations & Prompt Polish
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [promptVariations, setPromptVariations] = useState<{
    cinematicPrompt: string;
    commercialPrompt: string;
    animationPrompt: string;
    vietnameseOverview: string;
  } | null>(null);

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Batch Generation State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; percent: number } | null>(null);

  useEffect(() => {
    if (isOpen && shot) {
      setCustomPrompt(shot.imagePrompt || '');
      setErrorMessage(null);
      setPromptVariations(null);
      setIsBatchMode(false);
      setBatchProgress(null);

      if (shot.imageUrl) {
        setCurrentResult({
          imageUrl: shot.imageUrl,
          promptUsed: shot.imagePrompt || '',
          aspectRatio: '16:9',
          modelUsed: 'gemini-imagen'
        });
      } else {
        setCurrentResult(null);
      }
    }
  }, [isOpen, shot]);

  if (!isOpen || !shot) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await generateGeminiImagenShotImage({
        visualDescription: shot.visual,
        customPrompt: customPrompt.trim() || undefined,
        style: selectedStyle,
        aspectRatio,
        shotNumber: shot.shotNumber,
        scriptTitle
      });

      setCurrentResult(result);
      if (!customPrompt) {
        setCustomPrompt(result.promptUsed);
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setErrorMessage(err.message || 'Không thể tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = async () => {
    setIsEnhancingPrompt(true);
    try {
      const variations = await enhanceImagePrompt(shot.visual || customPrompt, scriptTitle);
      setPromptVariations(variations);
    } catch (err: any) {
      console.error('Error enhancing prompt:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleApplyCurrent = () => {
    if (currentResult && shot) {
      onApplyImageToShot(shot.id, currentResult.imageUrl, currentResult.promptUsed || customPrompt);
      onClose();
    }
  };

  const handleCopyPrompt = () => {
    const textToCopy = currentResult?.promptUsed || customPrompt;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (!currentResult) return;
    const link = document.createElement('a');
    link.href = currentResult.imageUrl;
    link.download = `Shot_${String(shot.shotNumber).padStart(2, '0')}_${selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch Generation across all shots without images
  const handleStartBatchGeneration = async () => {
    if (!allShots || allShots.length === 0) return;
    setIsBatchMode(true);
    setBatchProgress({ current: 0, total: allShots.length, percent: 0 });

    const updatedShots = [...allShots];

    for (let i = 0; i < updatedShots.length; i++) {
      const currentShot = updatedShots[i];
      setBatchProgress({
        current: i + 1,
        total: updatedShots.length,
        percent: Math.round(((i + 1) / updatedShots.length) * 100)
      });

      try {
        const res = await generateGeminiImagenShotImage({
          visualDescription: currentShot.visual,
          style: selectedStyle,
          aspectRatio,
          shotNumber: currentShot.shotNumber,
          scriptTitle
        });

        updatedShots[i] = {
          ...currentShot,
          imageUrl: res.imageUrl,
          imagePrompt: res.promptUsed
        };
      } catch (err) {
        console.warn(`Error generating shot #${currentShot.shotNumber}:`, err);
      }
    }

    onApplyBatchImages?.(updatedShots);
    setIsBatchMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-xs border border-white/20">
              <ImageIcon size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Gemini Imagen 3 Studio</span>
                <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] font-mono rounded-full">
                  Shot #{shot.shotNumber}
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Tạo hình ảnh storyboard & minh họa B-roll điện ảnh sắc nét bằng trí tuệ nhân tạo Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Current Shot Context Banner */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider">
                Mô tả phân cảnh (Visual & Camera):
              </span>
              <p className="text-zinc-800 font-medium bg-white p-2.5 rounded-xl border border-zinc-200">
                {shot.visual || 'Chưa có mô tả hình ảnh cụ thể'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider">
                Lời thoại / Voiceover (Audio):
              </span>
              <p className="text-zinc-700 italic bg-white p-2.5 rounded-xl border border-zinc-200">
                "{shot.audio || 'Không có lời thoại'}"
              </p>
            </div>
          </div>

          {/* Main Grid: Controls vs Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Style & Prompt Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* 1. Style Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    Chọn Phong Cách Hình Ảnh (Visual Style):
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {IMAGE_STYLE_PRESETS.map((st) => {
                    const isSelected = selectedStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyle(st.id)}
                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base">{st.icon}</span>
                            {isSelected && <Check size={14} className="text-emerald-600 font-bold" />}
                          </div>
                          <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-950' : 'text-zinc-900'}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-tight">
                          {st.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2 flex items-center gap-1.5">
                  <Sliders size={14} className="text-teal-600" />
                  Tỉ Lệ Khung Hình (Aspect Ratio):
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { ratio: '16:9', label: '16:9 Ngang', sub: 'YouTube / TVC' },
                    { ratio: '9:16', label: '9:16 Dọc', sub: 'TikTok / Shorts' },
                    { ratio: '1:1', label: '1:1 Vuông', sub: 'Instagram / Feed' },
                    { ratio: '4:3', label: '4:3 Cổ Điển', sub: 'Phim tài liệu' },
                  ].map((item) => (
                    <button
                      key={item.ratio}
                      type="button"
                      onClick={() => setAspectRatio(item.ratio as any)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        aspectRatio === item.ratio
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-2 ring-teal-500/20'
                          : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 font-medium'
                      }`}
                    >
                      <div className="text-xs font-mono">{item.label}</div>
                      <div className="text-[10px] text-zinc-400">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Custom Prompt & AI Enhancement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Wand2 size={14} className="text-purple-600" />
                    AI Prompt Tiếng Anh (Tự Động Tạo hoặc Tùy Chỉnh):
                  </label>

                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/60 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles size={12} className={isEnhancingPrompt ? "animate-spin" : ""} />
                    <span>{isEnhancingPrompt ? "Đang phân tích..." : "Gợi ý 3 phong cách Prompt"}</span>
                  </button>
                </div>

                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Để trống để AI tự động chuyển thể mô tả phân cảnh thành Prompt điện ảnh hoàn hảo, hoặc dán prompt tùy chỉnh của bạn..."
                  rows={3}
                  className="w-full text-xs text-zinc-900 placeholder-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y font-mono"
                />

                {/* Prompt Variations Pill Selection */}
                {promptVariations && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                      <Sparkles size={13} /> Gợi ý biến thể Prompt từ Gemini:
                    </span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setCustomPrompt(promptVariations.cinematicPrompt); setSelectedStyle('cinematic'); }}
                        className="w-full text-left p-2 bg-white hover:bg-purple-100/50 border border-purple-100 rounded-xl text-[11px] text-zinc-800 transition-colors"
                      >
                        <strong className="text-purple-800">🎬 Điện Ảnh Hollywood:</strong> {promptVariations.cinematicPrompt.slice(0, 100)}...
                      </button>
                      <button
                        onClick={() => { setCustomPrompt(promptVariations.commercialPrompt); setSelectedStyle('commercial'); }}
                        className="w-full text-left p-2 bg-white hover:bg-purple-100/50 border border-purple-100 rounded-xl text-[11px] text-zinc-800 transition-colors"
                      >
                        <strong className="text-emerald-700">💎 TVC Quảng Cáo:</strong> {promptVariations.commercialPrompt.slice(0, 100)}...
                      </button>
                      <button
                        onClick={() => { setCustomPrompt(promptVariations.animationPrompt); setSelectedStyle('3d_animation'); }}
                        className="w-full text-left p-2 bg-white hover:bg-purple-100/50 border border-purple-100 rounded-xl text-[11px] text-zinc-800 transition-colors"
                      >
                        <strong className="text-amber-700">🧸 Hoạt Hình 3D:</strong> {promptVariations.animationPrompt.slice(0, 100)}...
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Gemini Imagen đang vẽ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{currentResult ? "Tạo Lại Ảnh Khác" : "Vẽ Ảnh Bằng Gemini Imagen"}</span>
                    </>
                  )}
                </button>

                {allShots && allShots.length > 1 && (
                  <button
                    type="button"
                    onClick={handleStartBatchGeneration}
                    disabled={isGenerating || isBatchMode}
                    className="py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                    title="Tạo ảnh cho tất cả phân cảnh theo phong cách này"
                  >
                    <Layers size={15} />
                    <span>Tạo Toàn Bộ ({allShots.length} cảnh)</span>
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Right Column: Preview & Image Canvas (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 text-white shadow-xl flex flex-col justify-between min-h-[360px]">
                
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-400" />
                    Khung Hình Storyboard AI
                  </span>

                  {currentResult && (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Model: {currentResult.modelUsed}
                    </span>
                  )}
                </div>

                {/* Main Image Canvas */}
                <div className="relative flex-1 flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-zinc-800/80 min-h-[220px]">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                        <Sparkles size={18} className="text-emerald-400 absolute inset-0 m-auto" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-200">Đang khởi tạo khung hình...</p>
                        <p className="text-[10px] text-zinc-400 font-mono">Ánh sáng: {selectedStyle} • Tỉ lệ: {aspectRatio}</p>
                      </div>
                    </div>
                  ) : currentResult ? (
                    <div className="w-full h-full flex items-center justify-center group relative">
                      <img
                        src={currentResult.imageUrl}
                        alt={`Shot #${shot.shotNumber}`}
                        className="w-full h-full max-h-[320px] object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />

                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                        <button
                          onClick={handleDownloadImage}
                          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-colors"
                          title="Tải ảnh về máy"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={handleCopyPrompt}
                          className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-colors"
                          title="Sao chép prompt"
                        >
                          {copiedPrompt ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-zinc-500">
                      <ImageIcon size={36} className="text-zinc-600" />
                      <p className="text-xs">Chưa có ảnh cho phân cảnh này.</p>
                      <p className="text-[10px] text-zinc-600">Bấm nút "Vẽ Ảnh Bằng Gemini Imagen" để khởi tạo.</p>
                    </div>
                  )}
                </div>

                {/* Bottom Canvas Info */}
                {currentResult && (
                  <div className="pt-3 space-y-2">
                    {currentResult.vietnameseExplanation && (
                      <p className="text-[11px] text-emerald-300 italic line-clamp-2">
                        "{currentResult.vietnameseExplanation}"
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApplyCurrent}
                        className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Check size={14} />
                        <span>Áp Dụng Vào Phân Cảnh Này</span>
                      </button>

                      <button
                        onClick={handleDownloadImage}
                        className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors"
                        title="Tải ảnh về máy"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Batch Progress Bar if active */}
          {isBatchMode && batchProgress && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-emerald-600" />
                  Đang tạo ảnh hàng loạt ({batchProgress.current}/{batchProgress.total} phân cảnh)...
                </span>
                <span>{batchProgress.percent}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percent}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span>Powered by <strong>Gemini Imagen 3</strong> & <strong>Flash Vision</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
