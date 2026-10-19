// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/StudioEditorLayout.tsx
// Bố cục giao diện chính của Bàn Dựng Video & Phụ Đề (100% Tiếng Việt)
// Tái thiết kế linh hoạt tự động điều chỉnh theo mọi kích thước màn hình
// và triệt tiêu hoàn toàn hiện tượng tràn viền (Zero Edge-Overflow).
// =============================================================================

import React from "react";
import {
  Film,
  FileText,
  Layers,
  Play,
  RotateCcw,
  RotateCw,
  HelpCircle,
  Keyboard,
  ChevronRight,
} from "lucide-react";
import {
  SubtitleCue,
  SubtitleStyle,
  AudioEditConfig,
  VoiceoverConfig,
} from "../src/types";
import { VideoPlayer, VideoPlayerHandle } from "../src/components/VideoPlayer";
import { AudioWaveformTimeline } from "../src/components/AudioWaveformTimeline";
import { SubtitleList } from "../src/components/SubtitleList";
import { formatSecondsToDisplay } from "../src/utils/subtitleFormatters";
import { StudioQuickActionBar } from "./StudioQuickActionBar";
import { StudioModalStateMap, STUDIO_SHORTCUT_HINTS_VI } from "./StudioConfig";

export interface StudioEditorLayoutProps {
  videoPlayerRef: React.RefObject<VideoPlayerHandle>;
  videoUrl: string;
  videoTitle: string;
  currentFile: File | null;
  cues: SubtitleCue[];
  currentTime: number;
  videoDuration: number;
  isVideoPlaying: boolean;
  subtitleStyle: SubtitleStyle;
  audioConfig: AudioEditConfig;
  voiceoverConfig: VoiceoverConfig;
  isCompactLayout: boolean;
  layoutMode: "auto" | "pc" | "mobile";
  onChangeLayoutMode: (mode: "auto" | "pc" | "mobile") => void;
  mobileActiveTab: "video" | "subtitles" | "both";
  onChangeMobileActiveTab: (tab: "video" | "subtitles" | "both") => void;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onUpdateCue: (cue: SubtitleCue) => void;
  onUpdateCues: (cues: SubtitleCue[]) => void;
  onDeleteCue: (id: number) => void;
  onAddCue: (atTime?: number) => void;
  onShiftAllCues: (offset: number) => void;
  onMergeCues: (firstCueId: number, secondCueId: number) => void;
  onSaveEdits: () => void;
  onOpenModal: (modalKey: keyof StudioModalStateMap) => void;
  onTriggerVideoUpload: () => void;
  onTriggerSrtImport: () => void;
  onOpenDrawer: () => void;
  onNotify: (text: string, type?: "success" | "error" | "info") => void;
}

export const StudioEditorLayout: React.FC<StudioEditorLayoutProps> = ({
  videoPlayerRef,
  videoUrl,
  videoTitle,
  currentFile,
  cues,
  currentTime,
  videoDuration,
  isVideoPlaying,
  subtitleStyle,
  audioConfig,
  voiceoverConfig,
  isCompactLayout,
  layoutMode,
  onChangeLayoutMode,
  mobileActiveTab,
  onChangeMobileActiveTab,
  onTimeUpdate,
  onSeek,
  onPlayStateChange,
  onUpdateCue,
  onUpdateCues,
  onDeleteCue,
  onAddCue,
  onShiftAllCues,
  onMergeCues,
  onSaveEdits,
  onOpenModal,
  onTriggerVideoUpload,
  onTriggerSrtImport,
  onOpenDrawer,
  onNotify,
}) => {
  const currentActiveCue = cues.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  return (
    <main className="flex-1 w-full max-w-[1600px] min-w-0 mx-auto px-2.5 sm:px-4 lg:px-6 py-3 flex flex-col overflow-x-hidden">
      {/* 1. Thanh Điều Khiển Tác Vụ Nhanh (Tự động co giãn & Không tràn viền) */}
      <StudioQuickActionBar
        videoTitle={videoTitle}
        cuesCount={cues.length}
        isPlaying={isVideoPlaying}
        layoutMode={layoutMode}
        onChangeLayoutMode={onChangeLayoutMode}
        onOpenModal={onOpenModal}
        onTriggerVideoUpload={onTriggerVideoUpload}
        onTriggerSrtImport={onTriggerSrtImport}
        onOpenDrawer={onOpenDrawer}
      />

      {/* 2. Thanh Chuyển Đổi Thẻ Hiển Thị (Chỉ hiện khi ở chế độ Thu Gọn / Di Động) */}
      {isCompactLayout && (
        <div className="w-full max-w-full min-w-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 mb-3 shrink-0 shadow-lg">
          <div className="grid grid-cols-3 gap-1.5 min-w-0">
            <button
              type="button"
              id="btn-mobile-tab-video"
              onClick={() => onChangeMobileActiveTab("video")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
                mobileActiveTab === "video"
                  ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Film className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Video & Sóng âm</span>
            </button>

            <button
              type="button"
              id="btn-mobile-tab-subtitles"
              onClick={() => onChangeMobileActiveTab("subtitles")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
                mobileActiveTab === "subtitles"
                  ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Phụ đề ({cues.length})</span>
            </button>

            <button
              type="button"
              id="btn-mobile-tab-both"
              onClick={() => onChangeMobileActiveTab("both")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
                mobileActiveTab === "both"
                  ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Song song</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Thanh Trình Phát Thu Nhỏ (Hiện khi đang ở thẻ Phụ Đề trên màn hình nhỏ) */}
      {isCompactLayout && mobileActiveTab === "subtitles" && (
        <div className="w-full max-w-full min-w-0 bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl mb-3 shrink-0 flex flex-col gap-2 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                id="btn-mini-toggle-play"
                onClick={() => videoPlayerRef.current?.togglePlay()}
                className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md cursor-pointer"
                title="Phát / Tạm dừng video"
              >
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </button>
              <button
                type="button"
                id="btn-mini-rewind-5s"
                onClick={() => videoPlayerRef.current?.seekRelative(-5)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                title="Lùi 5 giây"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn-mini-forward-5s"
                onClick={() => videoPlayerRef.current?.seekRelative(5)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                title="Tua tới 5 giây"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <div className="font-mono text-xs text-slate-300 tabular-nums truncate">
                <span className="font-bold text-white">
                  {formatSecondsToDisplay(currentTime)}
                </span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">
                  {formatSecondsToDisplay(videoDuration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChangeMobileActiveTab("video")}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/30 transition cursor-pointer whitespace-nowrap"
                title="Mở xem khung hình video và biểu đồ sóng âm"
              >
                <Film className="w-3 h-3 shrink-0" />
                <span>Mở Khung Video ↗</span>
              </button>
            </div>
          </div>

          {currentActiveCue ? (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs flex items-center gap-2 min-w-0">
              <span className="font-mono text-[10px] text-rose-300 font-bold shrink-0 tabular-nums">
                #{currentActiveCue.id}
              </span>
              <span className="text-amber-300 font-semibold truncate">
                {currentActiveCue.textVi || currentActiveCue.textOriginal}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-500 italic truncate">
              (Đang ở khoảng lặng âm thanh — Chưa có lời thoại tại thời điểm này)
            </div>
          )}
        </div>
      )}

      {/* 4. Khu Vực Bàn Dựng Linh Hoạt: Tự động điều chỉnh kích thước theo màn hình */}
      <div
        className={`flex-1 w-full max-w-full min-w-0 ${
          isCompactLayout
            ? "flex flex-col gap-3"
            : "grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
        }`}
      >
        {/* CỘT TRÁI (7/12): KHUNG HÌNH VIDEO & TIMELINE SÓNG ÂM THỜI GIAN THỰC */}
        {(!isCompactLayout ||
          mobileActiveTab === "video" ||
          mobileActiveTab === "both") && (
          <div
            className={`w-full min-w-0 flex flex-col gap-3 ${
              isCompactLayout ? "" : "lg:col-span-7"
            }`}
          >
            {/* Trình Phát Video Điện Ảnh */}
            <div className="w-full min-w-0 overflow-hidden rounded-2xl">
              <VideoPlayer
                ref={videoPlayerRef}
                videoUrl={videoUrl}
                cues={cues}
                currentTime={currentTime}
                onTimeUpdate={onTimeUpdate}
                subtitleStyle={subtitleStyle}
                onOpenStyleModal={() => onOpenModal("style")}
                onSeek={onSeek}
                audioConfig={audioConfig}
                onOpenCapCutModal={() => onOpenModal("capcut")}
                voiceoverConfig={voiceoverConfig}
                onOpenVoiceoverModal={() => onOpenModal("autoVoiceover")}
                onOpenCinemaMode={() => onOpenModal("cinemaMode")}
                onPlayStateChange={onPlayStateChange}
              />
            </div>

            {/* Dòng Thời Gian Sóng Âm (Có hiệu ứng hoạt họa phát thời gian thực) */}
            <div className="w-full min-w-0 overflow-hidden rounded-2xl">
              <AudioWaveformTimeline
                videoUrl={videoUrl}
                cues={cues}
                currentTime={currentTime}
                duration={videoDuration}
                onSeek={onSeek}
                onUpdateCue={onUpdateCue}
                onUpdateCues={onUpdateCues}
                onAddCue={onAddCue}
                isPlaying={isVideoPlaying}
                onTogglePlay={() => videoPlayerRef.current?.togglePlay()}
                audioFile={currentFile}
                onNotify={onNotify}
              />
            </div>

            {/* Thanh Mẹo Thao Tác & Phím Tắt Nhanh Gọn Gàng */}
            <div className="w-full min-w-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="break-words">
                  <strong className="text-slate-200">Mẹo nhanh:</strong> Nhấp vào
                  câu phụ đề hoặc sóng âm để nhảy tới mốc thời gian tương ứng.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {STUDIO_SHORTCUT_HINTS_VI.slice(0, 3).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onOpenModal("shortcuts")}
                    className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 hover:border-indigo-500/50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <kbd className="font-mono text-[10px] text-amber-400 font-semibold">
                      {item.key}
                    </kbd>
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  id="btn-open-shortcuts-from-tips"
                  onClick={() => onOpenModal("shortcuts")}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Keyboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Phím tắt (?)</span>
                </button>
              </div>
            </div>

            {/* Nút chuyển nhanh sang danh sách phụ đề khi ở màn hình nhỏ */}
            {isCompactLayout && mobileActiveTab === "video" && (
              <button
                type="button"
                id="btn-mobile-jump-to-subtitles"
                onClick={() => onChangeMobileActiveTab("subtitles")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  Chuyển Sang Biên Tập Danh Sách Phụ Đề ({cues.length} câu)
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        )}

        {/* CỘT PHẢI (5/12): BẢNG BIÊN TẬP & ĐỒNG BỘ PHỤ ĐỀ THÔNG MINH */}
        {(!isCompactLayout ||
          mobileActiveTab === "subtitles" ||
          mobileActiveTab === "both") && (
          <div
            className={`w-full min-w-0 flex flex-col overflow-hidden ${
              isCompactLayout
                ? "min-h-[520px] max-h-[75dvh]"
                : "lg:col-span-5 min-h-[580px] lg:max-h-[calc(100dvh-165px)]"
            }`}
          >
            <SubtitleList
              cues={cues}
              currentTime={currentTime}
              onSelectCue={onSeek}
              onUpdateCue={onUpdateCue}
              onDeleteCue={onDeleteCue}
              onAddCue={onAddCue}
              onShiftAllCues={onShiftAllCues}
              onOpenRefineModal={() => onOpenModal("refine")}
              onOpenSmartMerge={() => onOpenModal("smartMerge")}
              onMergeCues={onMergeCues}
              onOpenVoiceoverModal={() => onOpenModal("autoVoiceover")}
              onUpdateCues={onUpdateCues}
              videoUrl={videoUrl}
              audioFile={currentFile}
              onNotify={onNotify}
              onSaveEdits={onSaveEdits}
            />
          </div>
        )}
      </div>
    </main>
  );
};
