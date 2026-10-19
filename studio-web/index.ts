// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/index.ts (TỰ ĐỘNG ĐỒNG BỘ)
// Điểm xuất trung tâm cho toàn bộ giao diện Studio Web.
// =============================================================================

export * from "./StudioConfig";
export * from "./StudioEditorLayout";
export * from "./StudioModalsContainer";
export * from "./StudioQuickActionBar";
export * from "./StudioToolsDrawer";
export { AudioWaveformTimeline, type AudioWaveformTimelineProps } from "../src/components/AudioWaveformTimeline";
export { VideoPlayer, type VideoPlayerHandle, type VideoPlayerProps } from "../src/components/VideoPlayer";
export { SubtitleList, type SubtitleListProps } from "../src/components/SubtitleList";
export { StudioHomePage, type StudioHomePageProps, type WorkspaceRouteId } from "../src/components/StudioHomePage";
