/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScriptData, TwoColumnShot, ScreenplayElement } from '../types';

/**
 * Formats a duration in seconds into standard SRT format: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(totalSeconds: number): string {
  const safeSec = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = Math.floor(safeSec % 60);
  const milliseconds = Math.floor((safeSec - Math.floor(safeSec)) * 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');

  return `${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Formats a duration in seconds into standard WebVTT format: HH:MM:SS.mmm
 */
export function formatVttTimestamp(totalSeconds: number): string {
  const safeSec = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = Math.floor(safeSec % 60);
  const milliseconds = Math.floor((safeSec - Math.floor(safeSec)) * 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/**
 * Parses time strings like "0:00 - 0:03", "00:03 - 0:15", "0:45", "1m30s", "90s" into seconds.
 */
export function parseTimeRange(timeStr?: string): { startSec?: number; endSec?: number } {
  if (!timeStr) return {};

  const clean = timeStr.trim();
  // Check for range format: "0:00 - 0:03" or "00:00 - 00:05" or "0:00 to 0:03"
  const rangeMatch = clean.match(/(\d+):(\d+)(?:\s*[-–—to]\s*)(\d+):(\d+)/i);
  if (rangeMatch) {
    const startSec = parseInt(rangeMatch[1], 10) * 60 + parseInt(rangeMatch[2], 10);
    const endSec = parseInt(rangeMatch[3], 10) * 60 + parseInt(rangeMatch[4], 10);
    return { startSec, endSec };
  }

  // Check for single mm:ss format
  const singleMatch = clean.match(/(\d+):(\d+)/);
  if (singleMatch) {
    const sec = parseInt(singleMatch[1], 10) * 60 + parseInt(singleMatch[2], 10);
    return { startSec: sec };
  }

  // Check for "60s", "90s", "15s"
  const secMatch = clean.match(/^(\d+)\s*s(?:ec)?$/i);
  if (secMatch) {
    return { endSec: parseInt(secMatch[1], 10) };
  }

  return {};
}

/**
 * Splits text into subtitle-friendly lines (max characters per line, max lines per cue)
 */
export function wrapSubtitleText(text: string, maxLineLength: number = 38): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLineLength) return clean;

  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxLineLength) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === 2) {
        // If it exceeds 2 lines, stop and fold remaining
        break;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

export interface SubtitleCue {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
  sourceShotNumber?: number;
}

/**
 * Extracts subtitle cues from ScriptData with realistic timing
 */
export function extractSubtitleCues(
  scriptData: ScriptData,
  options: { wpm?: number; minDuration?: number; maxLineChars?: number } = {}
): SubtitleCue[] {
  const wpm = options.wpm || 155; // Standard 155 words per minute (~2.58 words per sec)
  const minDuration = options.minDuration || 1.4;
  const maxLineChars = options.maxLineChars || 38;
  const wordsPerSecond = wpm / 60;

  const cues: SubtitleCue[] = [];
  let currentClockSec = 0;
  let cueIndex = 1;

  // Case 1: 2-Column Shots available
  if (scriptData.shots && scriptData.shots.length > 0) {
    for (const shot of scriptData.shots) {
      const audioText = (shot.audio || '').trim();
      if (!audioText) continue;

      // Check if shot has explicit time range
      const parsed = parseTimeRange(shot.timeRange);
      let shotStart = currentClockSec;
      let shotEnd: number;

      if (parsed.startSec !== undefined && parsed.endSec !== undefined && parsed.endSec > parsed.startSec) {
        shotStart = parsed.startSec;
        shotEnd = parsed.endSec;
      } else {
        const wordCount = audioText.split(/\s+/).filter(Boolean).length;
        const estimatedDuration = Math.max(minDuration, wordCount / wordsPerSecond);
        shotEnd = shotStart + estimatedDuration;
      }

      // If text is long, break it into smaller subtitle chunks
      const sentences = audioText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [audioText];
      let subStart = shotStart;
      const totalShotDuration = Math.max(minDuration, shotEnd - shotStart);
      const totalWords = audioText.split(/\s+/).filter(Boolean).length;

      for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
        const sentence = sentences[sIdx].trim();
        if (!sentence) continue;

        const sWords = sentence.split(/\s+/).filter(Boolean).length;
        const sentenceRatio = totalWords > 0 ? (sWords / totalWords) : (1 / sentences.length);
        const subDuration = Math.max(minDuration, totalShotDuration * sentenceRatio);
        const subEnd = subStart + subDuration;

        const wrappedText = wrapSubtitleText(sentence, maxLineChars);

        cues.push({
          index: cueIndex++,
          startSec: subStart,
          endSec: subEnd,
          text: wrappedText,
          sourceShotNumber: shot.shotNumber
        });

        subStart = subEnd + 0.15; // 150ms natural gap between subtitle cues
      }

      currentClockSec = Math.max(shotEnd, subStart);
    }
  } 
  // Case 2: Screenplay Elements (Dialogue)
  else if (scriptData.screenplayElements && scriptData.screenplayElements.length > 0) {
    for (const elem of scriptData.screenplayElements) {
      if (elem.type !== 'DIALOGUE') continue;
      const text = (elem.text || '').trim();
      if (!text) continue;

      const words = text.split(/\s+/).filter(Boolean).length;
      const duration = Math.max(minDuration, words / wordsPerSecond);
      const startSec = currentClockSec;
      const endSec = startSec + duration;

      cues.push({
        index: cueIndex++,
        startSec,
        endSec,
        text: wrapSubtitleText(text, maxLineChars)
      });

      currentClockSec = endSec + 0.2;
    }
  }
  // Case 3: Full master narrative text
  else if (scriptData.fullTextScript) {
    const paragraphs = scriptData.fullTextScript.split(/\n+/).map(p => p.trim()).filter(Boolean);
    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean).length;
      const duration = Math.max(minDuration, words / wordsPerSecond);
      const startSec = currentClockSec;
      const endSec = startSec + duration;

      cues.push({
        index: cueIndex++,
        startSec,
        endSec,
        text: wrapSubtitleText(para, maxLineChars)
      });

      currentClockSec = endSec + 0.2;
    }
  }

  return cues;
}

/**
 * Generates an SRT (SubRip) file string
 */
export function generateSrtContent(
  scriptData: ScriptData,
  options?: { wpm?: number; minDuration?: number; maxLineChars?: number }
): string {
  const cues = extractSubtitleCues(scriptData, options);
  if (cues.length === 0) {
    return '1\n00:00:00,000 --> 00:00:03,000\n[Không có lời thoại để tạo phụ đề]';
  }

  return cues
    .map(cue => {
      const timeLine = `${formatSrtTimestamp(cue.startSec)} --> ${formatSrtTimestamp(cue.endSec)}`;
      return `${cue.index}\n${timeLine}\n${cue.text}\n`;
    })
    .join('\n');
}

/**
 * Generates a WebVTT (.vtt) file string
 */
export function generateVttContent(
  scriptData: ScriptData,
  options?: { wpm?: number; minDuration?: number; maxLineChars?: number }
): string {
  const cues = extractSubtitleCues(scriptData, options);
  let vtt = 'WEBVTT\n\n';

  if (cues.length === 0) {
    vtt += '1\n00:00:00.000 --> 00:00:03.000\n[Không có lời thoại]';
    return vtt;
  }

  vtt += cues
    .map(cue => {
      const timeLine = `${formatVttTimestamp(cue.startSec)} --> ${formatVttTimestamp(cue.endSec)}`;
      return `${cue.index}\n${timeLine}\n${cue.text}\n`;
    })
    .join('\n');

  return vtt;
}

/**
 * Generates a Hollywood Industry Standard Screenplay HTML document (Courier 12pt, strict indentations)
 */
export function generateHollywoodScreenplayHtml(scriptData: ScriptData): string {
  const title = scriptData.title || 'KỊCH BẢN ĐIỆN ẢNH';
  const author = scriptData.author || 'ScriptFlow Studio';
  const platform = scriptData.platform ? scriptData.platform.toUpperCase() : 'PRODUCTION';
  const targetDuration = scriptData.targetDuration || '60s';
  const dateStr = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  let screenplayBodyHtml = '';

  if (scriptData.screenplayElements && scriptData.screenplayElements.length > 0) {
    screenplayBodyHtml = scriptData.screenplayElements.map(elem => {
      switch (elem.type) {
        case 'SCENE_HEADING':
          return `<div class="scene-heading">${escapeHtml(elem.text.toUpperCase())}</div>`;
        case 'ACTION':
          return `<div class="action">${escapeHtml(elem.text)}</div>`;
        case 'CHARACTER':
          return `<div class="character">${escapeHtml(elem.text.toUpperCase())}</div>`;
        case 'PARENTHETICAL':
          return `<div class="parenthetical">(${escapeHtml(elem.text.replace(/^\(|\)$/g, ''))})</div>`;
        case 'DIALOGUE':
          return `<div class="dialogue">${escapeHtml(elem.text)}</div>`;
        case 'TRANSITION':
          return `<div class="transition">${escapeHtml(elem.text.toUpperCase())}</div>`;
        default:
          return `<div class="action">${escapeHtml(elem.text)}</div>`;
      }
    }).join('\n');
  } else if (scriptData.shots && scriptData.shots.length > 0) {
    // Convert 2-column shots into Hollywood screenplay style
    screenplayBodyHtml = scriptData.shots.map((shot, idx) => {
      const heading = `<div class="scene-heading">CẢNH ${shot.shotNumber}. ${escapeHtml((shot.timeRange || `PHÂN ĐOẠN ${shot.shotNumber}`).toUpperCase())}</div>`;
      const visualAction = shot.visual ? `<div class="action">${escapeHtml(shot.visual)}${shot.onScreenText ? ` [CHỮ MÀN HÌNH: ${escapeHtml(shot.onScreenText)}]` : ''}</div>` : '';
      const charName = `<div class="character">NGƯỜI DẪN CHUYỆN / CREATOR</div>`;
      const dialogue = shot.audio ? `<div class="dialogue">${escapeHtml(shot.audio)}</div>` : '';
      const notes = shot.notes ? `<div class="parenthetical">(${escapeHtml(shot.notes)})</div>` : '';

      return `${heading}\n${visualAction}\n${dialogue ? `${charName}\n${notes ? `${notes}\n` : ''}${dialogue}` : ''}`;
    }).join('\n<div class="scene-spacer"></div>\n');
  } else {
    screenplayBodyHtml = `<div class="action">${escapeHtml(scriptData.fullTextScript || 'Chưa có nội dung kịch bản.')}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - Hollywood Screenplay</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

    @page {
      size: letter portrait;
      margin-top: 1in;
      margin-bottom: 1in;
      margin-right: 1in;
      margin-left: 1.5in; /* 1.5in left margin for industry binding */
      @top-right {
        content: counter(page) ".";
        font-family: 'Courier Prime', 'Courier New', Courier, monospace;
        font-size: 10pt;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Courier Prime', 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.0;
      color: #000000;
      background: #ffffff;
      margin: 0 auto;
      max-width: 8.5in;
      padding: 1in 1in 1in 1.5in;
    }

    /* Screenplay Title Page */
    .title-page {
      page-break-after: always;
      height: 9.2in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      position: relative;
    }

    .title-page h1 {
      font-size: 22pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 24pt;
      text-decoration: underline;
    }

    .title-page .byline {
      font-size: 12pt;
      margin-bottom: 8pt;
    }

    .title-page .author {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 36pt;
    }

    .title-page .metadata-box {
      font-size: 11pt;
      color: #444;
      line-height: 1.6;
    }

    .title-page .bottom-info {
      position: absolute;
      bottom: 0.5in;
      left: 0;
      text-align: left;
      font-size: 10pt;
      line-height: 1.4;
    }

    /* Standard Screenplay Element Margins & Indents */
    .scene-heading {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 24pt;
      margin-bottom: 12pt;
      page-break-after: avoid;
    }

    .action {
      margin-top: 0;
      margin-bottom: 12pt;
      line-height: 1.15;
      text-align: justify;
    }

    .character {
      text-transform: uppercase;
      font-weight: bold;
      margin-top: 14pt;
      margin-bottom: 2pt;
      margin-left: 2.0in; /* Indent character name */
      page-break-after: avoid;
    }

    .parenthetical {
      margin-left: 1.5in;
      margin-right: 1.5in;
      margin-bottom: 2pt;
      font-style: italic;
      page-break-after: avoid;
    }

    .dialogue {
      margin-left: 1.0in;
      margin-right: 1.2in;
      margin-bottom: 12pt;
      line-height: 1.15;
    }

    .transition {
      text-transform: uppercase;
      font-weight: bold;
      text-align: right;
      margin-top: 12pt;
      margin-bottom: 18pt;
      page-break-after: avoid;
    }

    .scene-spacer {
      height: 12pt;
    }

    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      .scene-heading, .character {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Title Page -->
  <div class="title-page">
    <h1>${escapeHtml(title)}</h1>
    <div class="byline">Kịch bản sáng tạo bởi</div>
    <div class="author">${escapeHtml(author)}</div>
    <div class="metadata-box">
      <div>Định dạng: <strong>${escapeHtml(platform)}</strong></div>
      <div>Thời lượng dự kiến: <strong>${escapeHtml(targetDuration)}</strong></div>
      ${scriptData.topic ? `<div>Chủ đề: <strong>${escapeHtml(scriptData.topic)}</strong></div>` : ''}
    </div>
    <div class="bottom-info">
      <div>Ngày phát hành: ${escapeHtml(dateStr)}</div>
      <div>Phần mềm: ScriptFlow Studio AI</div>
    </div>
  </div>

  <!-- Screenplay Script Content -->
  <div class="screenplay-content">
    ${screenplayBodyHtml}
    <div class="transition">--- HẾT KỊCH BẢN (FADE OUT) ---</div>
  </div>
</body>
</html>`;
}

/**
 * Generates a 2-Column Audio/Visual Shooting Script PDF HTML Document (Production Table)
 */
export function generateProductionAVPdfHtml(scriptData: ScriptData): string {
  const title = scriptData.title || 'KỊCH BẢN SẢN XUẤT (2 CỘT AV)';
  const shots = scriptData.shots || [];
  const dateStr = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalWords = shots.reduce((acc, shot) => {
    return acc + (shot.audio || '').trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const estimatedSeconds = Math.round(totalWords / 2.58);
  const durationText = `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`;

  const rowsHtml = shots.map((s, idx) => {
    return `
      <tr>
        <td class="col-num">
          <strong>#${s.shotNumber || idx + 1}</strong>
          ${s.timeRange ? `<div class="time-badge">${escapeHtml(s.timeRange)}</div>` : ''}
        </td>
        <td class="col-visual">
          ${s.imageUrl ? `
            <div class="thumb-box">
              <img src="${s.imageUrl}" alt="Cảnh ${s.shotNumber}" />
            </div>
          ` : ''}
          <div class="visual-text">${escapeHtml(s.visual || 'Chưa có mô tả hình ảnh')}</div>
          ${s.notes ? `<div class="director-notes">💡 <em>Chỉ dẫn:</em> ${escapeHtml(s.notes)}</div>` : ''}
        </td>
        <td class="col-audio">
          <div class="audio-text">${escapeHtml(s.audio || '---')}</div>
        </td>
        <td class="col-graphics">
          ${s.onScreenText ? `<div class="graphics-badge">${escapeHtml(s.onScreenText)}</div>` : '<span class="empty-muted">-</span>'}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - 2-Column AV Shooting Script</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 15mm 12mm;
      @bottom-right {
        content: "Trang " counter(page) " / " counter(pages);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #666;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #1e293b;
      background: #ffffff;
      padding: 16px;
    }

    .header-card {
      border: 1.5px solid #0284c7;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 16px;
      background: #f0f9ff;
    }

    .header-card h1 {
      font-size: 16pt;
      color: #0369a1;
      margin-bottom: 6px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      font-size: 8.5pt;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #bae6fd;
    }

    .meta-item strong {
      color: #0f172a;
    }

    .hook-banner {
      margin-top: 8px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 9pt;
      color: #92400e;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      page-break-inside: auto;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #0f172a;
    }

    td {
      padding: 10px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      font-size: 9pt;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .col-num {
      width: 11%;
      text-align: center;
      background-color: #f1f5f9;
    }

    .col-visual {
      width: 41%;
    }

    .col-audio {
      width: 33%;
    }

    .col-graphics {
      width: 15%;
      text-align: center;
    }

    .time-badge {
      font-size: 7.5pt;
      font-weight: bold;
      background: #e2e8f0;
      color: #334155;
      padding: 2px 4px;
      border-radius: 4px;
      margin-top: 4px;
      display: inline-block;
    }

    .thumb-box {
      margin-bottom: 6px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }

    .thumb-box img {
      width: 100%;
      height: auto;
      max-height: 120px;
      object-fit: cover;
      display: block;
    }

    .visual-text {
      color: #1e293b;
      font-weight: 500;
    }

    .director-notes {
      font-size: 8pt;
      color: #64748b;
      margin-top: 5px;
      padding: 4px 6px;
      background: #f8fafc;
      border-radius: 4px;
      border-left: 2px solid #94a3b8;
    }

    .audio-text {
      color: #0f172a;
      line-height: 1.45;
    }

    .graphics-badge {
      font-size: 8pt;
      font-weight: bold;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 6px;
      border-radius: 6px;
      border: 1px solid #fde68a;
      display: inline-block;
    }

    .empty-muted {
      color: #94a3b8;
      font-size: 8pt;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-card">
    <h1>🎬 ${escapeHtml(title)}</h1>
    <div class="meta-grid">
      <div class="meta-item">Nền tảng: <strong>${escapeHtml(scriptData.platform || 'Video Ngắn')}</strong></div>
      <div class="meta-item">Tổng từ thoại: <strong>${totalWords} từ (~${durationText})</strong></div>
      <div class="meta-item">Số phân cảnh: <strong>${shots.length} scenes</strong></div>
      <div class="meta-item">Ngày tạo: <strong>${escapeHtml(dateStr)}</strong></div>
    </div>
    ${scriptData.hook ? `
      <div class="hook-banner">
        <strong>⚡ Hook 3 Giây Giữ Chân:</strong> "${escapeHtml(scriptData.hook)}"
      </div>
    ` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th class="col-num">Phân Cảnh</th>
        <th class="col-visual">Hình Ảnh & Góc Máy (Visual / Storyboard)</th>
        <th class="col-audio">Lời Thoại & Âm Thanh (Audio / SFX)</th>
        <th class="col-graphics">Chữ Màn Hình</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}

/**
 * Triggers native browser print on an isolated iframe without reloading or breaking state
 */
export function triggerPrintDocument(htmlContent: string): void {
  const existingFrame = document.getElementById('scriptflow-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'scriptflow-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback to new tab print
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 350);
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 1500);
  }, 400);
}

/**
 * Download a plain text or blob file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
