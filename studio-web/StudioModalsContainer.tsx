// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/StudioModalsContainer.tsx
// Trung tâm quản lý toàn bộ hộp thoại chức năng (Modals) của Studio & AI.
// Giúp src/App.tsx tinh gọn tuyệt đối trong khi giữ nguyên 100% tính năng.
// =============================================================================

import React from "react";
import {
  SubtitleCue,
  SubtitleStyle,
  GenerationConfig,
  SampleVideo,
  AudioEditConfig,
  VoiceoverConfig,
} from "../src/types";
import { SavedProject } from "../src/services/firebase";
import { WorkspaceRouteId } from "../src/components/StudioHomePage";
import { CompactShortcutsDock } from "../src/components/CompactShortcutsDock";
import { StudioModalStateMap } from "./StudioConfig";

// Nạp động (Lazy Load) toàn bộ hộp thoại chuyên sâu để tối ưu tốc độ tải
const SocialVideoImportModal = React.lazy(() =>
  import("../src/components/SocialVideoImportModal").then((m) => ({
    default: m.SocialVideoImportModal,
  }))
);
const AIGenerateModal = React.lazy(() =>
  import("../src/components/AIGenerateModal").then((m) => ({
    default: m.AIGenerateModal,
  }))
);
const AIRefineModal = React.lazy(() =>
  import("../src/components/AIRefineModal").then((m) => ({
    default: m.AIRefineModal,
  }))
);
const SubtitleStylingModal = React.lazy(() =>
  import("../src/components/SubtitleStylingModal").then((m) => ({
    default: m.SubtitleStylingModal,
  }))
);
const ExportModal = React.lazy(() =>
  import("../src/components/ExportModal").then((m) => ({
    default: m.ExportModal,
  }))
);
const SampleVideosModal = React.lazy(() =>
  import("../src/components/SampleVideosModal").then((m) => ({
    default: m.SampleVideosModal,
  }))
);
const AICoverModal = React.lazy(() =>
  import("../src/components/AICoverModal").then((m) => ({
    default: m.AICoverModal,
  }))
);
const CapCutEditorModal = React.lazy(() =>
  import("../src/components/CapCutEditorModal").then((m) => ({
    default: m.CapCutEditorModal,
  }))
);
const WebDramaImportModal = React.lazy(() =>
  import("../src/components/WebDramaImportModal").then((m) => ({
    default: m.WebDramaImportModal,
  }))
);
const UniversalLinkTranslatorModal = React.lazy(() =>
  import("../src/components/UniversalLinkTranslatorModal").then((m) => ({
    default: m.UniversalLinkTranslatorModal,
  }))
);
const BookmarkletStudioModal = React.lazy(() =>
  import("../src/components/BookmarkletStudioModal").then((m) => ({
    default: m.BookmarkletStudioModal,
  }))
);
const CloudflareDeploymentModal = React.lazy(() =>
  import("../src/components/CloudflareDeploymentModal").then((m) => ({
    default: m.CloudflareDeploymentModal,
  }))
);
const KeyboardShortcutsModal = React.lazy(() =>
  import("../src/components/KeyboardShortcutsModal").then((m) => ({
    default: m.KeyboardShortcutsModal,
  }))
);
const AutoVoiceoverModal = React.lazy(() =>
  import("../src/components/AutoVoiceoverModal").then((m) => ({
    default: m.AutoVoiceoverModal,
  }))
);
const ExtensionsAndAppsHubModal = React.lazy(() =>
  import("../src/components/ExtensionsAndAppsHubModal").then((m) => ({
    default: m.ExtensionsAndAppsHubModal,
  }))
);
const FullScreenCinemaMode = React.lazy(() =>
  import("../src/components/FullScreenCinemaMode").then((m) => ({
    default: m.FullScreenCinemaMode,
  }))
);
const SmartMergeModal = React.lazy(() =>
  import("../src/components/SmartMergeModal").then((m) => ({
    default: m.SmartMergeModal,
  }))
);
const TelegramBotModal = React.lazy(() =>
  import("../src/components/TelegramBotModal").then((m) => ({
    default: m.TelegramBotModal,
  }))
);
const AppDownloadModal = React.lazy(() =>
  import("../src/components/AppDownloadModal").then((m) => ({
    default: m.AppDownloadModal,
  }))
);
const GeminiChatbotModal = React.lazy(() =>
  import("../src/components/GeminiChatbotModal").then((m) => ({
    default: m.GeminiChatbotModal,
  }))
);
const VeoVideoModal = React.lazy(() =>
  import("../src/components/VeoVideoModal").then((m) => ({
    default: m.VeoVideoModal,
  }))
);
const AIGenerateImageModal = React.lazy(() =>
  import("../src/components/AIGenerateImageModal").then((m) => ({
    default: m.AIGenerateImageModal,
  }))
);
const AdminSystemDashboardModal = React.lazy(() =>
  import("../src/components/AdminSystemDashboardModal").then((m) => ({
    default: m.AdminSystemDashboardModal,
  }))
);
const CrossPlatformToolkitModal = React.lazy(() =>
  import("../src/components/CrossPlatformToolkitModal").then((m) => ({
    default: m.CrossPlatformToolkitModal,
  }))
);
const ImageTextTranslatorModal = React.lazy(() =>
  import("../src/components/ImageTextTranslatorModal").then((m) => ({
    default: m.ImageTextTranslatorModal,
  }))
);
const AuthModal = React.lazy(() =>
  import("../src/components/AuthModal").then((m) => ({
    default: m.AuthModal,
  }))
);
const ScienceStudioModal = React.lazy(() =>
  import("../src/components/ScienceStudioModal").then((m) => ({
    default: m.ScienceStudioModal,
  }))
);
const TelegramPipelineConsoleModal = React.lazy(() =>
  import("../src/components/TelegramPipelineConsoleModal").then((m) => ({
    default: m.TelegramPipelineConsoleModal,
  }))
);

export interface StudioModalsContainerProps {
  modals: StudioModalStateMap;
  onSetModal: (modalKey: keyof StudioModalStateMap, isOpen: boolean) => void;
  cues: SubtitleCue[];
  onSetCues: React.Dispatch<React.SetStateAction<SubtitleCue[]>>;
  videoUrl: string;
  onSetVideoUrl: (url: string) => void;
  videoTitle: string;
  onSetVideoTitle: (title: string) => void;
  onSetVideoDuration: (duration: number) => void;
  currentTime: number;
  onSetCurrentTime: (time: number) => void;
  subtitleStyle: SubtitleStyle;
  onSetSubtitleStyle: (style: SubtitleStyle) => void;
  audioConfig: AudioEditConfig;
  onSetAudioConfig: (config: AudioEditConfig) => void;
  voiceoverConfig: VoiceoverConfig;
  onSetVoiceoverConfig: (config: VoiceoverConfig) => void;
  isProcessing: boolean;
  progressStep: string;
  progressPercent: number;
  generationError: string | null;
  onClearGenerationError: () => void;
  isRefining: boolean;
  onGenerateVietsub: (config: GenerationConfig) => Promise<void>;
  onRefineSubtitles: (instruction: string) => Promise<void>;
  onSelectSample: (sample: SampleVideo) => void;
  isHomeRoute: boolean;
  isTelegramRoute: boolean;
  isAdminWorkspaceRoute: boolean;
  onSetRequestedWorkspaceRoute: (route: WorkspaceRouteId) => void;
  onSetIsMaintenanceView: (active: boolean) => void;
  onOpenAdminPortal: () => void;
  detectedOS: string;
  currentUser: any;
  onSetCurrentUser: (user: any) => void;
  onNotify: (text: string, type?: "success" | "error" | "info") => void;
}

export const StudioModalsContainer: React.FC<StudioModalsContainerProps> = ({
  modals,
  onSetModal,
  cues,
  onSetCues,
  videoUrl,
  onSetVideoUrl,
  videoTitle,
  onSetVideoTitle,
  onSetVideoDuration,
  currentTime,
  onSetCurrentTime,
  subtitleStyle,
  onSetSubtitleStyle,
  audioConfig,
  onSetAudioConfig,
  voiceoverConfig,
  onSetVoiceoverConfig,
  isProcessing,
  progressStep,
  progressPercent,
  generationError,
  onClearGenerationError,
  isRefining,
  onGenerateVietsub,
  onRefineSubtitles,
  onSelectSample,
  isHomeRoute,
  isTelegramRoute,
  isAdminWorkspaceRoute,
  onSetRequestedWorkspaceRoute,
  onSetIsMaintenanceView,
  onOpenAdminPortal,
  detectedOS,
  currentUser,
  onSetCurrentUser,
  onNotify,
}) => {
  const handleImportedMedia = (
    result: {
      videoUrl: string;
      title: string;
      duration?: number;
      initialCues?: SubtitleCue[];
      autoStartTranslate?: boolean;
    },
    toastPrefix = "Đã nạp thành công"
  ) => {
    onSetVideoUrl(result.videoUrl);
    onSetVideoTitle(result.title);
    if (result.duration) {
      onSetVideoDuration(result.duration);
    }
    if (result.initialCues && result.initialCues.length > 0) {
      onSetCues(result.initialCues);
    }
    onNotify(`${toastPrefix}: "${result.title}". Sẵn sàng biên tập!`, "success");
    if (result.autoStartTranslate) {
      onSetModal("generate", true);
    }
  };

  return (
    <React.Suspense fallback={null}>
      {/* 1. Hộp thoại Tạo Phụ Đề AI */}
      <AIGenerateModal
        isOpen={modals.generate}
        onClose={() => {
          onSetModal("generate", false);
          onClearGenerationError();
        }}
        onGenerate={onGenerateVietsub}
        isProcessing={isProcessing}
        progressStep={progressStep}
        progressPercent={progressPercent}
        errorMessage={generationError}
        onClearError={onClearGenerationError}
      />

      {/* 2. Hộp thoại Hiệu Đính & Tối Ưu Phụ Đề AI */}
      <AIRefineModal
        isOpen={modals.refine}
        onClose={() => onSetModal("refine", false)}
        onRefine={onRefineSubtitles}
        isRefining={isRefining}
      />

      {/* 3. Hộp thoại Tùy Chỉnh Kiểu Chữ Phụ Đề */}
      <SubtitleStylingModal
        isOpen={modals.style}
        onClose={() => onSetModal("style", false)}
        style={subtitleStyle}
        onChangeStyle={onSetSubtitleStyle}
      />

      {/* 4. Hộp thoại Xuất Video & Tải Tệp Phụ Đề */}
      <ExportModal
        isOpen={modals.export}
        onClose={() => onSetModal("export", false)}
        cues={cues}
        videoTitle={videoTitle}
        videoUrl={videoUrl}
        subtitleStyle={subtitleStyle}
        onNotify={onNotify}
      />

      {/* 5. Hộp thoại Chọn Video Mẫu */}
      <SampleVideosModal
        isOpen={modals.sample}
        onClose={() => onSetModal("sample", false)}
        onSelectSample={onSelectSample}
      />

      {/* 6. Hộp thoại Cover Bài Hát AI */}
      <AICoverModal
        isOpen={modals.cover}
        onClose={() => onSetModal("cover", false)}
        cues={cues}
        videoTitle={videoTitle}
        onNotify={onNotify}
      />

      {/* 7. Hộp thoại Mẫu Chữ CapCut & Xử Lý Âm Thanh */}
      <CapCutEditorModal
        isOpen={modals.capcut}
        onClose={() => onSetModal("capcut", false)}
        style={subtitleStyle}
        onChangeStyle={onSetSubtitleStyle}
        audioConfig={audioConfig}
        onChangeAudioConfig={onSetAudioConfig}
      />

      {/* 8. Hộp thoại Dịch Liên Kết Đa Nền Tảng */}
      <UniversalLinkTranslatorModal
        isOpen={modals.universalTranslator}
        onClose={() => onSetModal("universalTranslator", false)}
        onImportSuccess={(res) => handleImportedMedia(res, "Đã nạp liên kết")}
        onAddLiveCues={(newCues) => onSetCues((prev) => [...prev, ...newCues])}
        onNotify={onNotify}
      />

      {/* 9. Hộp thoại Tiện Ích Bookmarklet 1-Chạm */}
      <BookmarkletStudioModal
        isOpen={modals.bookmarklet}
        onClose={() => onSetModal("bookmarklet", false)}
        onOpenAppsHub={() => onSetModal("appsHub", true)}
        onOpenCinemaMode={() => onSetModal("cinemaMode", true)}
        onNotify={onNotify}
      />

      {/* 10. Hộp thoại Trung Tâm Tiện Ích Mở Rộng & Ứng Dụng */}
      <ExtensionsAndAppsHubModal
        isOpen={modals.appsHub}
        onClose={() => onSetModal("appsHub", false)}
        onOpenBookmarkletModal={() => onSetModal("bookmarklet", true)}
        onOpenCinemaMode={() => onSetModal("cinemaMode", true)}
        onNotify={onNotify}
      />

      {/* 11. Chế độ Rạp Chiếu Phim Toàn Màn Hình */}
      <FullScreenCinemaMode
        isOpen={modals.cinemaMode}
        onClose={() => onSetModal("cinemaMode", false)}
        videoUrl={videoUrl}
        videoTitle={videoTitle}
        cues={cues}
        currentTime={currentTime}
        onSeek={onSetCurrentTime}
        subtitleStyle={subtitleStyle}
        voiceoverConfig={voiceoverConfig}
        onNotify={onNotify}
      />

      {/* 12. Hộp thoại Triển Khai Cloudflare Edge (Chỉ hiển thị trong vùng Admin) */}
      {isAdminWorkspaceRoute && (
        <CloudflareDeploymentModal
          isOpen={modals.cloudflare}
          onClose={() => onSetModal("cloudflare", false)}
          onNotify={onNotify}
        />
      )}

      {/* 13. Hộp thoại Nhập Video TikTok, Facebook Reels & Shorts */}
      <SocialVideoImportModal
        isOpen={modals.socialImport}
        onClose={() => onSetModal("socialImport", false)}
        onImportSuccess={(result) => {
          onSetVideoUrl(result.videoUrl);
          onSetVideoTitle(result.title);
          if (result.initialCues && result.initialCues.length > 0) {
            onSetCues(result.initialCues);
          }
          onNotify(
            `Đã nhập thành công video từ ${
              result.platform?.toUpperCase() || "mạng xã hội"
            }!`,
            "success"
          );
          if (result.autoStartTranslate) {
            setTimeout(() => onSetModal("generate", true), 350);
          }
        }}
        onNotify={onNotify}
      />

      {/* 14. Hộp thoại Nhập Phim Ngắn & Web Drama */}
      <WebDramaImportModal
        isOpen={modals.webDrama}
        onClose={() => onSetModal("webDrama", false)}
        onImportSuccess={(res) => handleImportedMedia(res, "Đã nhập phim")}
        onImportVideo={(res) => handleImportedMedia(res, "Đã nhập phim")}
        onNotify={onNotify}
      />

      {/* 15. Hộp thoại Phòng Thu Thuyết Minh AI Đa Giọng */}
      <AutoVoiceoverModal
        isOpen={modals.autoVoiceover}
        onClose={() => onSetModal("autoVoiceover", false)}
        cues={cues}
        onUpdateCues={(updatedCues) => onSetCues(updatedCues)}
        voiceoverConfig={voiceoverConfig}
        onUpdateVoiceoverConfig={onSetVoiceoverConfig}
        videoTitle={videoTitle}
        onNotify={onNotify}
      />

      {/* 16. Hộp thoại Bảng Tra Cứu Phím Tắt Nhanh */}
      <KeyboardShortcutsModal
        isOpen={modals.shortcuts}
        onClose={() => onSetModal("shortcuts", false)}
        isPinned={modals.shortcutsDockPinned}
        onTogglePin={() =>
          onSetModal("shortcutsDockPinned", !modals.shortcutsDockPinned)
        }
      />

      {/* 17. Thanh Phím Tắt Ghim Gọn Gàng */}
      <CompactShortcutsDock
        isVisible={modals.shortcutsDockPinned}
        onClose={() => onSetModal("shortcutsDockPinned", false)}
        onOpenFullModal={() => onSetModal("shortcuts", true)}
      />

      {/* 18. Hộp thoại Gộp Phụ Đề Thông Minh SmartMerge */}
      <SmartMergeModal
        isOpen={modals.smartMerge}
        onClose={() => onSetModal("smartMerge", false)}
        cues={cues}
        onApplyMergedCues={(mergedCues) => {
          onSetCues(mergedCues);
          onNotify(
            `Đã áp dụng gộp câu thông minh! Tối ưu còn ${mergedCues.length} câu.`,
            "success"
          );
        }}
      />

      {/* 19. Hộp thoại Mô Phỏng Telegram Bot & TMA */}
      {isTelegramRoute && (
        <TelegramBotModal
          isOpen={modals.telegramBot}
          isWorkspaceActive={isTelegramRoute}
          onNavigateAdminWorkspace={() =>
            onSetRequestedWorkspaceRoute("DockerKtor")
          }
          onClose={() => onSetModal("telegramBot", false)}
          onOpenDownloadModal={() => onSetModal("appDownload", true)}
          onOpenPipelineConsole={() => onSetModal("telegramPipeline", true)}
        />
      )}

      {/* 20. Hộp thoại Bảng Điều Phối Luồng Video Pipeline */}
      {!isHomeRoute && (
        <TelegramPipelineConsoleModal
          isOpen={modals.telegramPipeline}
          onClose={() => onSetModal("telegramPipeline", false)}
          initialUrl={videoUrl}
          onApplyVideoUrl={(url) => {
            onSetVideoUrl(url);
            onSetVideoTitle("Video từ Hệ thống Pipeline");
            onNotify("Đã nạp video từ luồng Pipeline vào Studio!", "success");
          }}
          onNotify={onNotify}
        />
      )}

      {/* 21. Hộp thoại Tải Bộ Cài Đặt Đa Nền Tảng (Windows 10/11 32-bit & 64-bit) */}
      <AppDownloadModal
        isOpen={modals.appDownload}
        onClose={() => onSetModal("appDownload", false)}
        isAdminGatewayContext={isAdminWorkspaceRoute}
        onOpenTelegramBot={() => {
          onSetModal("appDownload", false);
          onSetRequestedWorkspaceRoute("TelegramBot");
        }}
        onOpenCrossPlatformToolkit={() => onSetModal("crossPlatform", true)}
      />

      {/* 22. Hộp thoại Build Studio Đa Nền Tảng (Chỉ mở trong Admin Gateway) */}
      {isAdminWorkspaceRoute && (
        <CrossPlatformToolkitModal
          isOpen={modals.crossPlatform}
          onClose={() => onSetModal("crossPlatform", false)}
          detectedOS={detectedOS as any}
          onNotify={onNotify}
        />
      )}

      {/* 23. Hộp thoại Trợ Lý Đạo Diễn & Dịch Thuật Gemini */}
      <GeminiChatbotModal
        isOpen={modals.geminiChatbot}
        onClose={() => onSetModal("geminiChatbot", false)}
        currentCuesSummary={`${cues.length} câu phụ đề đang biên tập`}
      />

      {/* 24. Hộp thoại Tạo Video Điện Ảnh Veo AI */}
      <VeoVideoModal
        isOpen={modals.veoVideo}
        onClose={() => onSetModal("veoVideo", false)}
        onLoadVideoIntoStudio={(url, title) => {
          onSetVideoUrl(url);
          onSetVideoTitle(title);
          onNotify("Đã nạp video tạo từ Veo AI vào bàn dựng Studio!", "success");
        }}
      />

      {/* 25. Hộp thoại Thiết Kế Ảnh Bìa & Poster AI */}
      <AIGenerateImageModal
        isOpen={modals.aiImage}
        onClose={() => onSetModal("aiImage", false)}
      />

      {/* 26. Hộp thoại Quét & Dịch Chữ Trên Ảnh OCR */}
      <ImageTextTranslatorModal
        isOpen={modals.imageTextTranslator}
        onClose={() => onSetModal("imageTextTranslator", false)}
        onAppendSubtitles={(newCues) => {
          onSetCues((prev) => [...prev, ...newCues]);
          onNotify(
            `Đã thêm ${newCues.length} câu phụ đề quét từ ảnh vào dự án!`,
            "success"
          );
        }}
      />

      {/* 27. Hộp thoại Giám Sát Hệ Thống Quản Trị */}
      {isAdminWorkspaceRoute && (
        <AdminSystemDashboardModal
          isOpen={modals.adminSystem}
          onClose={() => onSetModal("adminSystem", false)}
          onTriggerMaintenanceView={(active) => {
            if (active) {
              onSetIsMaintenanceView(true);
            }
          }}
        />
      )}

      {/* 28. Hộp thoại Tài Khoản & Lưu Trữ Dự Án Đám Mây */}
      <AuthModal
        isOpen={modals.auth}
        onClose={() => onSetModal("auth", false)}
        currentUser={currentUser}
        onUserChanged={(user) => {
          onSetCurrentUser(user);
          onNotify(
            user
              ? `Xin chào ${user.displayName || "bạn"}!`
              : "Đã đăng xuất khỏi tài khoản.",
            "info"
          );
        }}
        currentProject={{
          title: videoTitle,
          videoUrl,
          cues,
          style: subtitleStyle,
        }}
        onLoadProject={(proj: SavedProject) => {
          onSetVideoTitle(proj.title);
          onSetVideoUrl(proj.videoUrl);
          if (proj.cues) onSetCues(proj.cues);
          if (proj.style) onSetSubtitleStyle(proj.style);
          onNotify(`Đã tải dự án "${proj.title}" từ đám mây!`, "success");
        }}
        onOpenAdminPortal={isAdminWorkspaceRoute ? onOpenAdminPortal : undefined}
      />

      {/* 29. Hộp thoại Chuẩn Hóa Thuật Ngữ Khoa Học & Y Sinh */}
      <ScienceStudioModal
        isOpen={modals.science}
        onClose={() => onSetModal("science", false)}
        cues={cues}
        onApplyEnrichedCues={(updatedCues) => {
          onSetCues(updatedCues);
          onNotify(
            `Đã chuẩn hóa thuật ngữ khoa học cho ${updatedCues.length} câu phụ đề!`,
            "success"
          );
        }}
      />
    </React.Suspense>
  );
};
