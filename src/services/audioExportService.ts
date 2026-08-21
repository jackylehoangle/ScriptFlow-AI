import JSZip from 'jszip';
import { TwoColumnShot, VoiceProfile, VoiceStudioSettings } from '../types';
import { cleanTextForSpeech, getAudioEngineMapping, voiceLogger } from './voiceService';

export interface ShotAudioSubtitleItem {
  shotIndex: number;
  shotNumber: number;
  timeRange: string;
  originalText: string;
  cleanedText: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  srtTimeFormatted: string;
  vttTimeFormatted: string;
  audioBlob: Blob;
  audioBuffer?: AudioBuffer;
}

export interface ExportFullAudioResult {
  projectName: string;
  totalDurationSec: number;
  totalShots: number;
  items: ShotAudioSubtitleItem[];
  srtContent: string;
  vttContent: string;
  audioBlob: Blob;
  audioUrl: string;
  voiceProfile: VoiceProfile;
  settings: VoiceStudioSettings;
}

/**
 * Format seconds to SRT timestamp: 00:00:00,000
 */
export function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');

  return `${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Format seconds to VTT timestamp: 00:00:00.000
 */
export function formatVttTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/**
 * Encode an AudioBuffer to standard 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

/**
 * Generate full audio track with exact timing and generate synchronized SRT & VTT subtitles
 */
export async function generateFullAudioAndSubtitles(
  shots: TwoColumnShot[],
  voiceProfile: VoiceProfile,
  voiceSettings: VoiceStudioSettings,
  projectName: string = 'Kich_Ban_Video',
  onProgress?: (current: number, total: number, message: string, percent: number) => void
): Promise<ExportFullAudioResult> {
  const validShots = shots.filter(s => !!cleanTextForSpeech(s.audio));
  if (validShots.length === 0) {
    throw new Error('Kịch bản không có phân cảnh nào chứa lời thoại để xuất âm thanh.');
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  const pauseSec = Math.max(0.1, (voiceSettings.pauseBetweenShotsMs || 400) / 1000);
  const calculatedRate = Math.max(0.6, Math.min(2.0, (voiceProfile.rate || 1.0) * (voiceSettings.rate || 1.0)));
  const calculatedPitch = Math.max(0.5, Math.min(1.8, (voiceProfile.pitch || 1.0) * (voiceSettings.pitch || 1.0)));

  const items: ShotAudioSubtitleItem[] = [];
  const decodedBuffers: AudioBuffer[] = [];
  let currentTimelineSec = 0;

  voiceLogger.log('info', 'AUDIO_ENGINE', `Bắt đầu tiến trình tạo Full Audio & SRT cho ${validShots.length} phân cảnh (Voice: ${voiceProfile.name})`);

  for (let i = 0; i < validShots.length; i++) {
    const shot = validShots[i];
    const cleanedText = cleanTextForSpeech(shot.audio);
    const progressPercent = Math.round(((i) / validShots.length) * 85);
    onProgress?.(i + 1, validShots.length, `Đang tổng hợp âm thanh phân cảnh #${shot.shotNumber} (${i + 1}/${validShots.length})...`, progressPercent);

    let audioBlob: Blob | null = null;

    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanedText,
          voiceId: voiceProfile.id,
          rate: calculatedRate,
          pitch: calculatedPitch,
        })
      });

      if (response.ok) {
        audioBlob = await response.blob();
      }
    } catch (err: any) {
      console.warn(`Lỗi tổng hợp âm thanh shot #${shot.shotNumber}:`, err);
    }

    // Fallback if network or server error
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error(`Không thể tạo âm thanh cho phân cảnh #${shot.shotNumber}. Vui lòng thử lại.`);
    }

    const arrayBuf = await audioBlob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
    decodedBuffers.push(audioBuffer);

    const durationSec = audioBuffer.duration;
    const startSec = currentTimelineSec;
    const endSec = startSec + durationSec;

    const srtStart = formatSrtTime(startSec);
    const srtEnd = formatSrtTime(endSec);
    const vttStart = formatVttTime(startSec);
    const vttEnd = formatVttTime(endSec);

    items.push({
      shotIndex: i,
      shotNumber: shot.shotNumber,
      timeRange: shot.timeRange,
      originalText: shot.audio,
      cleanedText,
      startSec,
      endSec,
      durationSec,
      srtTimeFormatted: `${srtStart} --> ${srtEnd}`,
      vttTimeFormatted: `${vttStart} --> ${vttEnd}`,
      audioBlob,
      audioBuffer
    });

    // Advance timeline with pause gap
    currentTimelineSec = endSec + (i < validShots.length - 1 ? pauseSec : 0);
  }

  onProgress?.(validShots.length, validShots.length, 'Đang ghép nối toàn bộ âm thanh và tính toán mẫu sóng...', 90);

  // Concatenate all audio buffers with pause gap into a single master AudioBuffer
  const targetSampleRate = decodedBuffers[0]?.sampleRate || 44100;
  const totalLengthSamples = Math.ceil(currentTimelineSec * targetSampleRate);
  const masterBuffer = audioCtx.createBuffer(2, totalLengthSamples, targetSampleRate);

  const leftChannel = masterBuffer.getChannelData(0);
  const rightChannel = masterBuffer.getChannelData(1);

  let currentSampleOffset = 0;
  const pauseSamples = Math.round(pauseSec * targetSampleRate);

  for (let i = 0; i < decodedBuffers.length; i++) {
    const buf = decodedBuffers[i];
    const bufLen = buf.length;

    // Resample / copy left channel
    const bufLeft = buf.getChannelData(0);
    const bufRight = buf.numberOfChannels > 1 ? buf.getChannelData(1) : bufLeft;

    for (let s = 0; s < bufLen && (currentSampleOffset + s) < totalLengthSamples; s++) {
      leftChannel[currentSampleOffset + s] = bufLeft[s] * (voiceSettings.volume ?? 1.0);
      rightChannel[currentSampleOffset + s] = bufRight[s] * (voiceSettings.volume ?? 1.0);
    }

    currentSampleOffset += bufLen;

    // Silence gap
    if (i < decodedBuffers.length - 1) {
      currentSampleOffset += pauseSamples;
    }
  }

  onProgress?.(validShots.length, validShots.length, 'Đang xuất file Audio WAV & định dạng chuẩn SRT...', 96);

  // Encode to 16-bit lossless WAV
  const fullAudioBlob = audioBufferToWavBlob(masterBuffer);
  const fullAudioUrl = URL.createObjectURL(fullAudioBlob);

  // Build SRT subtitle string
  const srtLines: string[] = [];
  items.forEach((item, index) => {
    srtLines.push(`${index + 1}`);
    srtLines.push(item.srtTimeFormatted);
    srtLines.push(item.cleanedText);
    srtLines.push('');
  });
  const srtContent = srtLines.join('\r\n');

  // Build VTT subtitle string
  const vttLines: string[] = ['WEBVTT', ''];
  items.forEach((item, index) => {
    vttLines.push(`${index + 1}`);
    vttLines.push(item.vttTimeFormatted);
    vttLines.push(item.cleanedText);
    vttLines.push('');
  });
  const vttContent = vttLines.join('\n');

  onProgress?.(validShots.length, validShots.length, 'Hoàn tất trọn bộ Audio & Subtitle!', 100);

  voiceLogger.log('success', 'AUDIO_ENGINE', `Đã tạo thành công Full Audio (${currentTimelineSec.toFixed(1)}s, ${(fullAudioBlob.size / 1024 / 1024).toFixed(2)}MB) & File Phụ Đề SRT đồng bộ.`);

  return {
    projectName: projectName.trim() || 'Kich_Ban_Video',
    totalDurationSec: currentTimelineSec,
    totalShots: validShots.length,
    items,
    srtContent,
    vttContent,
    audioBlob: fullAudioBlob,
    audioUrl: fullAudioUrl,
    voiceProfile,
    settings: voiceSettings
  };
}

/**
 * Trigger browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Trigger browser download for text content
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Create and download a full ZIP bundle (Audio + SRT + VTT + Instructions)
 */
export async function downloadZipBundle(result: ExportFullAudioResult) {
  const zip = new JSZip();
  const safeName = result.projectName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9-]/g, '_');

  // 1. Add Master Audio File
  zip.file(`${safeName}_Voiceover_Full.wav`, result.audioBlob);

  // 2. Add Subtitle SRT file
  zip.file(`${safeName}_PhuDe.srt`, result.srtContent);

  // 3. Add Subtitle VTT file
  zip.file(`${safeName}_PhuDe.vtt`, result.vttContent);

  // 4. Add Individual Shot Audios folder
  const shotsFolder = zip.folder('Tung_Phan_Canh_Audio');
  if (shotsFolder) {
    result.items.forEach((item) => {
      shotsFolder.file(`Shot_${String(item.shotNumber).padStart(2, '0')}.mp3`, item.audioBlob);
    });
  }

  // 5. Add Instructions Readme
  const infoText = `=== THÔNG TIN GÓI DỰ ÁN LỒNG TIẾNG & PHỤ ĐỀ (SCRIPTFLOW AI) ===
Tên kịch bản: ${result.projectName}
Giọng đọc AI: ${result.voiceProfile.name} (ID: ${result.voiceProfile.id})
Tổng thời lượng: ${result.totalDurationSec.toFixed(1)} giây
Tổng số phân cảnh: ${result.totalShots} shots
Tốc độ đọc: ${result.settings.rate}x | Cao độ: ${result.settings.pitch}
Thời gian tạo: ${new Date().toLocaleString('vi-VN')}

--- HƯỚNG DẪN DỰNG VIDEO VÀO CAPCUT / PREMIERE PRO ---
1. KÉO THẢ VÀO CAPCUT (PC):
   - Bước 1: Mở CapCut PC -> Nhập (Import) file "${safeName}_Voiceover_Full.wav".
   - Bước 2: Nhập file phụ đề "${safeName}_PhuDe.srt" và kéo vào track văn bản.
   - Kết quả: Giọng đọc và phụ đề sẽ khớp nhau 100% từng giây, sẵn sàng để chèn B-roll hình ảnh!

2. KÉO THẢ VÀO PREMIERE PRO:
   - File -> Import -> Chọn cả file .wav và file .srt.
   - Kéo file .wav vào Audio Track A1, file .srt vào Captions Track.

--- DANH SÁCH PHÂN CẢNH & TIMESTAMPS ---
${result.items.map(it => `[Shot #${it.shotNumber}] (${it.srtTimeFormatted})\n-> ${it.cleanedText}`).join('\n\n')}
`;

  zip.file(`README_Huong_Dan_CapCut_Premiere.txt`, infoText);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${safeName}_Full_Audio_SRT_Bundle.zip`);
}
