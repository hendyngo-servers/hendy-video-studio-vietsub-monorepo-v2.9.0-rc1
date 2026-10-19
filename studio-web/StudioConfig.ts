// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/StudioConfig.ts
// Cấu hình trung tâm & Từ điển giao diện Tiếng Việt cho Studio Biên Tập Video
// Chỉ cần chỉnh sửa tại thư mục /studio-web/, hệ thống sẽ tự động cập nhật
// toàn bộ mã nguồn liên kết trong src/App.tsx và apps/studio-web/.
// =============================================================================

import { SubtitleStyle, AudioEditConfig, VoiceoverConfig } from "../src/types";

export const DEFAULT_SUBTITLE_STYLE_VI: SubtitleStyle = {
  fontSize: "lg",
  textColor: "#FACC15", // Vàng điện ảnh
  backgroundColor: "translucent-black",
  fontFamily: "sans",
  position: "bottom",
  displayMode: "vi",
  textShadow: true,
  capcutPreset: "default",
  aspectRatio: "16:9",
  showTikTokSafeZone: false,
};

export const DEFAULT_AUDIO_CONFIG_VI: AudioEditConfig = {
  volumeMultiplier: 1.0,
  vocalEnhance: false,
  bassBoost: false,
  noiseReduction: false,
  audioDucking: false,
  playbackSpeed: 1.0,
  reverb: "none",
};

export const DEFAULT_VOICEOVER_CONFIG_VI: VoiceoverConfig = {
  enabled: true,
  voiceId: "vi-female",
  speechRate: 1.0,
  voiceVolume: 1.0,
  originalVolumeDucking: 0.25,
  readMode: "vi",
  autoMultiVoice: true,
};

export interface StudioModalStateMap {
  generate: boolean;
  refine: boolean;
  style: boolean;
  export: boolean;
  sample: boolean;
  cover: boolean;
  capcut: boolean;
  webDrama: boolean;
  universalTranslator: boolean;
  bookmarklet: boolean;
  cloudflare: boolean;
  shortcuts: boolean;
  shortcutsDockPinned: boolean;
  autoVoiceover: boolean;
  appsHub: boolean;
  cinemaMode: boolean;
  smartMerge: boolean;
  telegramBot: boolean;
  telegramPipeline: boolean;
  appDownload: boolean;
  geminiChatbot: boolean;
  veoVideo: boolean;
  aiImage: boolean;
  adminSystem: boolean;
  crossPlatform: boolean;
  imageTextTranslator: boolean;
  auth: boolean;
  science: boolean;
  socialImport: boolean;
}

export const INITIAL_STUDIO_MODAL_STATE: StudioModalStateMap = {
  generate: false,
  refine: false,
  style: false,
  export: false,
  sample: false,
  cover: false,
  capcut: false,
  webDrama: false,
  universalTranslator: false,
  bookmarklet: false,
  cloudflare: false,
  shortcuts: false,
  shortcutsDockPinned: false,
  autoVoiceover: false,
  appsHub: false,
  cinemaMode: false,
  smartMerge: false,
  telegramBot: false,
  telegramPipeline: false,
  appDownload: false,
  geminiChatbot: false,
  veoVideo: false,
  aiImage: false,
  adminSystem: false,
  crossPlatform: false,
  imageTextTranslator: false,
  auth: false,
  science: false,
  socialImport: false,
};

export const STUDIO_SHORTCUT_HINTS_VI = [
  { key: "Space / K", label: "Phát / Tạm dừng" },
  { key: "← / →", label: "Tua 5 giây" },
  { key: "J / L", label: "Tua 10 giây" },
  { key: "Ctrl + Enter", label: "Lưu phụ đề" },
  { key: "?", label: "Bảng phím tắt" },
];
