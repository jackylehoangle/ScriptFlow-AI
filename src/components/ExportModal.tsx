/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ScriptData } from '../types';
import { 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Table, 
  Mic, 
  Printer, 
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Film,
  Sparkles,
  Clock,
  Subtitles,
  ExternalLink,
  Eye,
  Sliders,
  CheckCircle2,
  Share2,
  FileCode,
  Layers
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  generateSrtContent,
  generateVttContent,
  generateHollywoodScreenplayHtml,
  generateProductionAVPdfHtml,
  triggerPrintDocument,
  downloadFile,
  extractSubtitleCues,
  SubtitleCue
} from '../services/pdfSrtExportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
}

export default function ExportModal({ isOpen, onClose, scriptData }: ExportModalProps) {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'pdf' | 'subtitles' | 'preview'>('all');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [subtitleWpm, setSubtitleWpm] = useState<number>(155);
  const [previewMode, setPreviewMode] = useState<'srt' | 'screenplay' | 'markdown' | 'voiceover'>('srt');

  // Subtitle Cues & SRT content calculation
  const srtCues: SubtitleCue[] = useMemo(() => {
    return extractSubtitleCues(scriptData, { wpm: subtitleWpm });
  }, [scriptData, subtitleWpm]);

  const srtContent = useMemo(() => {
    return generateSrtContent(scriptData, { wpm: subtitleWpm });
  }, [scriptData, subtitleWpm]);

  const vttContent = useMemo(() => {
    return generateVttContent(scriptData, { wpm: subtitleWpm });
  }, [scriptData, subtitleWpm]);

  if (!isOpen) return null;

  const safeTitle = (scriptData.title || 'Kich_Ban').replace(/[^\w\s\u00C0-\u1EF9-]/gi, '').trim().replace(/\s+/g, '_');

  // 1. Export Voiceover Text
  const getVoiceoverText = () => {
    if (scriptData.shots && scriptData.shots.length > 0) {
      return scriptData.shots
        .map(s => `[Cảnh ${s.shotNumber} - ${s.timeRange || ''}]\n${s.audio}`)
        .join('\n\n');
    }
    if (scriptData.screenplayElements) {
      return scriptData.screenplayElements
        .filter(e => e.type === 'DIALOGUE' || e.type === 'CHARACTER')
        .map(e => (e.type === 'CHARACTER' ? `\n${e.text}:` : `"${e.text}"`))
        .join('\n');
    }
    return scriptData.fullTextScript || '';
  };

  // 2. Export Markdown
  const getMarkdownText = () => {
    let md = `# ${scriptData.title || 'Kịch Bản'}\n\n`;
    md += `**Nền tảng:** ${scriptData.platform || 'Mạng xã hội'} | **Thời lượng:** ${scriptData.targetDuration || '60s'}\n\n`;
    if (scriptData.hook) md += `> **Hook 3s:** ${scriptData.hook}\n\n`;

    if (scriptData.shots && scriptData.shots.length > 0) {
      md += `| Shot | Thời gian | Hình ảnh (Visual) | Lời thoại / Âm thanh (Audio) | Chữ màn hình |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      scriptData.shots.forEach(s => {
        md += `| #${s.shotNumber} | ${s.timeRange || ''} | ${(s.visual || '').replace(/\|/g, '-')} | ${(s.audio || '').replace(/\|/g, '-')} | ${s.onScreenText || ''} |\n`;
      });
    }

    if (scriptData.screenplayElements) {
      scriptData.screenplayElements.forEach(e => {
        if (e.type === 'SCENE_HEADING') md += `\n### ${e.text}\n\n`;
        else if (e.type === 'CHARACTER') md += `**${e.text}**\n`;
        else if (e.type === 'DIALOGUE') md += `> ${e.text}\n\n`;
        else if (e.type === 'PARENTHETICAL') md += `*${e.text}*\n`;
        else md += `${e.text}\n\n`;
      });
    }

    return md;
  };

  // 3. Export CSV
  const handleDownloadCSV = () => {
    if (!scriptData.shots) return;
    const headers = ['Shot Number', 'Time Range', 'Visual (Camera & Action)', 'Audio (Voiceover & SFX)', 'On Screen Text', 'Notes'];
    const rows = scriptData.shots.map(s => [
      s.shotNumber,
      `"${(s.timeRange || '').replace(/"/g, '""')}"`,
      `"${(s.visual || '').replace(/"/g, '""')}"`,
      `"${(s.audio || '').replace(/"/g, '""')}"`,
      `"${(s.onScreenText || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `${safeTitle}_kich_ban.csv`, 'text/csv;charset=utf-8;');
    toastSuccess('Đã tải xuống file CSV kịch bản thành công!', 'Xuất File CSV');
  };

  // 4. Export SRT File
  const handleDownloadSRT = () => {
    downloadFile(srtContent, `${safeTitle}_subtitles.srt`, 'text/plain;charset=utf-8;');
    toastSuccess(`Đã tải xuống file phụ đề ${safeTitle}_subtitles.srt (${srtCues.length} câu phụ đề)!`, 'Xuất SRT');
  };

  // 5. Export VTT File
  const handleDownloadVTT = () => {
    downloadFile(vttContent, `${safeTitle}_subtitles.vtt`, 'text/vtt;charset=utf-8;');
    toastSuccess(`Đã tải xuống file WebVTT ${safeTitle}_subtitles.vtt!`, 'Xuất WebVTT');
  };

  // 6. Export PDF - Hollywood Screenplay
  const handleExportHollywoodPDF = () => {
    const html = generateHollywoodScreenplayHtml(scriptData);
    triggerPrintDocument(html);
    toastSuccess('Đang mở hộp thoại In / Lưu PDF chuẩn Kịch Bản Điện Ảnh Hollywood (Courier 12pt)!', 'Xuất PDF Điện Ảnh');
  };

  // 7. Export PDF - 2-Column Production Shooting Script
  const handleExportProductionAVPDF = () => {
    const html = generateProductionAVPdfHtml(scriptData);
    triggerPrintDocument(html);
    toastSuccess('Đang mở hộp thoại In / Lưu PDF Kịch Bản Sản Xuất 2 Cột AV kèm Storyboard!', 'Xuất PDF Sản Xuất');
  };

  // 8. Export HTML Visual Storyboard
  const handleDownloadHTMLStoryboard = () => {
    if (!scriptData.shots) return;
    const title = scriptData.title || 'Storyboard Kịch Bản';
    const shotsHtml = scriptData.shots.map(s => `
      <div style="border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; margin-bottom: 24px; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
        <div style="padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0f172a; font-size: 14px;">Shot #${s.shotNumber} (${s.timeRange || ''})</strong>
          ${s.onScreenText ? `<span style="font-size: 12px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-weight: bold;">Caption: ${s.onScreenText}</span>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: ${s.imageUrl ? '320px 1fr' : '1fr'}; gap: 20px; padding: 16px;">
          ${s.imageUrl ? `
            <div>
              <img src="${s.imageUrl}" alt="Shot ${s.shotNumber}" style="width: 100%; border-radius: 12px; object-fit: cover; aspect-ratio: 16/9; display: block;" />
              ${s.imagePrompt ? `<p style="font-size: 10px; color: #64748b; margin-top: 6px; font-family: monospace;">Prompt: ${s.imagePrompt}</p>` : ''}
            </div>
          ` : ''}
          <div style="font-size: 13px; line-height: 1.6;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #4338ca; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Hình ảnh & Góc máy (Visual):</strong>
              <div style="color: #1e293b; background: #f5f3ff; padding: 8px 12px; border-radius: 8px; margin-top: 4px;">${s.visual || 'Chưa có mô tả'}</div>
            </div>
            <div>
              <strong style="color: #047857; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Lời thoại / Audio (Voiceover):</strong>
              <div style="color: #0f172a; font-weight: 500; background: #ecfdf5; padding: 8px 12px; border-radius: 8px; margin-top: 4px;">${s.audio || 'Không có lời thoại'}</div>
            </div>
            ${s.notes ? `<div style="margin-top: 8px; font-size: 11px; color: #64748b; font-style: italic;">💡 Chỉ dẫn: ${s.notes}</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title} - Visual Storyboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: #0f172a; margin: 0; padding: 32px 16px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { background: #ffffff; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    h1 { margin: 0 0 8px 0; font-size: 22px; color: #0f172a; }
    .meta { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 ${title}</h1>
      <div class="meta">Nền tảng: <strong>${scriptData.platform}</strong> | Thời lượng: <strong>${scriptData.targetDuration}</strong> | Tạo bằng <strong>ScriptFlow AI & Gemini Imagen 3</strong></div>
    </div>
    ${shotsHtml}
  </div>
</body>
</html>`;

    downloadFile(htmlContent, `${safeTitle}_Storyboard_Visual.html`, 'text/html;charset=utf-8;');
    toastSuccess('Đã xuất Storyboard Visual HTML độc lập!', 'Xuất Storyboard');
  };

  // Copy to Clipboard helper
  const handleCopy = (text: string, type: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toastSuccess(`Đã sao chép ${label} vào bộ nhớ tạm!`, 'Đã Sao Chép');
    setTimeout(() => setCopiedType(null), 2200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-100 space-y-5 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 pb-1 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-2xl shadow-sm">
              <Download size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">
                  Xuất Bản Kịch Bản & Phụ Đề Video
                </h2>
                <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-full">
                  PDF & SRT
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Xuất file PDF kịch bản điện ảnh chuẩn Hollywood, file phụ đề SRT cho CapCut / Premiere, và bàn giao sản xuất
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
            }`}
          >
            <Layers size={14} />
            <span>Tất Cả Định Dạng</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
            }`}
          >
            <Printer size={14} className="text-amber-600" />
            <span>Kịch Bản PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'subtitles'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
            }`}
          >
            <Subtitles size={14} className="text-rose-600" />
            <span>Phụ Đề SRT</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
            }`}
          >
            <Eye size={14} className="text-blue-600" />
            <span>Xem Trước</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {/* ========================================================================= */}
          {/* TAB 1: ALL / TAB 2: PDF SECTION */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'pdf') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Film size={13} className="text-amber-600" />
                  Kịch Bản Chuyên Nghiệp & Xuất PDF
                </span>
                <span className="text-[10px] text-zinc-400">In hoặc Lưu PDF (Ctrl + P)</span>
              </div>

              {/* 1. Hollywood Screenplay PDF */}
              <div className="p-4 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-400 transition-all shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                    <Film size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-zinc-900">Xuất PDF Kịch Bản Điện Ảnh (Hollywood Screenplay)</h4>
                      <span className="px-2 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                        Courier 12pt
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Định dạng chuẩn kịch bản phim quốc tế: Title page, Scene Headings, Action, Canh lề Dialogue 1.5in/2.5in, lề đóng gáy 1.5 inch.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportHollywoodPDF}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Printer size={14} />
                    <span>In / Lưu PDF</span>
                  </button>
                </div>
              </div>

              {/* 2. 2-Column AV Production Script PDF */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl shrink-0 mt-0.5">
                    <Table size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-zinc-900">Xuất PDF Bảng Sản Xuất 2 Cột AV (Shooting Script)</h4>
                      <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                        2-Column Table
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Bảng phân cảnh sản xuất chi tiết: Thời lượng, Góc máy & Storyboard Visual, Lời thoại Audio/SFX, Chữ màn hình và Ghi chú đạo diễn.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportProductionAVPDF}
                    className="px-3.5 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Printer size={14} />
                    <span>In / Lưu PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: ALL / TAB 3: SUBTITLES SECTION */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'subtitles') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Subtitles size={13} className="text-rose-600" />
                  Phụ Đề Video & Dựng Phim (.SRT / .VTT)
                </span>
                
                {/* WPM Speed Selector */}
                <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded-lg">
                  <Sliders size={11} className="text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium">Tốc độ đọc:</span>
                  <select
                    value={subtitleWpm}
                    onChange={(e) => setSubtitleWpm(Number(e.target.value))}
                    className="bg-transparent text-[11px] font-bold text-zinc-800 border-none outline-none cursor-pointer"
                  >
                    <option value={135}>Chậm (135 WPM)</option>
                    <option value={155}>Chuẩn (155 WPM)</option>
                    <option value={180}>Nhanh TikTok (180 WPM)</option>
                  </select>
                </div>
              </div>

              {/* 1. SRT Subtitle Export Card */}
              <div className="p-4 bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-purple-500/5 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-rose-400 transition-all shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                    <Subtitles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-zinc-900">Tải File Phụ Đề SRT (.srt)</h4>
                      <span className="px-2 py-0.2 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                        {srtCues.length} câu phụ đề
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Chuẩn timestamp chính xác để kéo thả trực tiếp vào <strong>CapCut, Adobe Premiere, DaVinci Resolve, Final Cut Pro, YouTube</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(srtContent, 'srt', 'nội dung SRT')}
                    className="px-2.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                    title="Sao chép toàn bộ text SRT"
                  >
                    {copiedType === 'srt' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedType === 'srt' ? 'Đã copy' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSRT}
                    className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Download size={14} />
                    <span>Tải .SRT</span>
                  </button>
                </div>
              </div>

              {/* 2. WebVTT & CSV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WebVTT */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                      <FileCode size={15} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900">File WebVTT (.vtt)</h5>
                      <p className="text-[10px] text-zinc-500">Cho trình phát HTML5 & Web Player</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadVTT}
                    className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Download size={12} /> .VTT
                  </button>
                </div>

                {/* CSV Table */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <FileSpreadsheet size={15} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900">File Excel / CSV</h5>
                      <p className="text-[10px] text-zinc-500">Bảng phân cảnh 2 cột bàn giao dựng</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Download size={12} /> .CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: ALL / EXTRA EXPORTS */}
          {/* ========================================================================= */}
          {activeTab === 'all' && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Share2 size={13} className="text-zinc-600" />
                Văn Bản & Storyboard
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Voiceover Text */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Mic size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900">Voiceover Text</h5>
                      <p className="text-[10px] text-zinc-500">Cho diễn viên / ElevenLabs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(getVoiceoverText(), 'voiceover', 'Voiceover')}
                    className="w-full py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                  >
                    {copiedType === 'voiceover' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedType === 'voiceover' ? 'Đã sao chép' : 'Copy Voice'}</span>
                  </button>
                </div>

                {/* Markdown */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                      <FileText size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900">Markdown Docs</h5>
                      <p className="text-[10px] text-zinc-500">Notion, Obsidian, Google Docs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(getMarkdownText(), 'markdown', 'Markdown')}
                    className="w-full py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                  >
                    {copiedType === 'markdown' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedType === 'markdown' ? 'Đã sao chép' : 'Copy MD'}</span>
                  </button>
                </div>

                {/* Visual Storyboard HTML */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900">Storyboard HTML</h5>
                      <p className="text-[10px] text-zinc-500">Kèm ảnh AI phân cảnh</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadHTMLStoryboard}
                    className="w-full py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Download size={12} />
                    <span>Tải Storyboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE PREVIEW TAB */}
          {/* ========================================================================= */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Preview Subtabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('srt')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewMode === 'srt' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Phụ đề SRT ({srtCues.length})
                  </button>
                  <button
                    onClick={() => setPreviewMode('screenplay')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewMode === 'screenplay' ? 'bg-white text-amber-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Screenplay Text
                  </button>
                  <button
                    onClick={() => setPreviewMode('voiceover')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewMode === 'voiceover' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Voiceover
                  </button>
                  <button
                    onClick={() => setPreviewMode('markdown')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewMode === 'markdown' ? 'bg-white text-indigo-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Markdown
                  </button>
                </div>

                {/* Action button inside preview */}
                {previewMode === 'srt' && (
                  <button
                    onClick={handleDownloadSRT}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Download size={12} /> Tải .SRT
                  </button>
                )}
                {previewMode === 'screenplay' && (
                  <button
                    onClick={handleExportHollywoodPDF}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Printer size={12} /> Xuất PDF
                  </button>
                )}
              </div>

              {/* Preview Content Container */}
              <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 font-mono text-xs max-h-[380px] overflow-y-auto border border-zinc-800 select-text leading-relaxed shadow-inner">
                {previewMode === 'srt' && (
                  <div className="space-y-3">
                    {srtCues.map((cue) => (
                      <div key={cue.index} className="p-2.5 bg-zinc-800/80 rounded-xl border border-zinc-700/60 flex items-start gap-3">
                        <span className="w-6 text-center text-zinc-500 font-bold shrink-0">#{cue.index}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mb-1">
                            <Clock size={11} />
                            <span>{cue.text ? `${(cue.startSec).toFixed(2)}s ➔ ${(cue.endSec).toFixed(2)}s` : ''}</span>
                            {cue.sourceShotNumber && (
                              <span className="ml-2 text-[10px] text-zinc-400 bg-zinc-700 px-1.5 py-0.2 rounded">
                                Cảnh #{cue.sourceShotNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-200 font-sans text-xs whitespace-pre-wrap">
                            {cue.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewMode === 'screenplay' && (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-amber-200/90 leading-relaxed">
                    {scriptData.title ? `TITLE: ${scriptData.title.toUpperCase()}\nAUTHOR: ScriptFlow Studio AI\nPLATFORM: ${scriptData.platform?.toUpperCase()}\n==========================================\n\n` : ''}
                    {getVoiceoverText()}
                  </pre>
                )}

                {previewMode === 'voiceover' && (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-emerald-200/90 leading-relaxed">
                    {getVoiceoverText()}
                  </pre>
                )}

                {previewMode === 'markdown' && (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-indigo-200/90 leading-relaxed">
                    {getMarkdownText()}
                  </pre>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 shrink-0">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Tương thích 100% với CapCut, Adobe Premiere, Final Cut Pro, DaVinci Resolve và Máy in PDF.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
