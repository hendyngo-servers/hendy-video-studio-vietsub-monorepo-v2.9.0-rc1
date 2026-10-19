import React, { useState } from "react";
import {
  Scissors,
  Volume2,
  Globe,
  Sliders,
  Download,
  LayoutDashboard,
  Monitor,
  CheckCircle2,
  FolderOpen,
  Cpu,
  Clock,
  Film,
} from "lucide-react";
import { SubtitleCue } from "../../../../src/types";
import { VoiceoverWorkspace } from "../../../../src/workspaces/voiceover/VoiceoverWorkspace";
import { TranslatorWorkspace } from "../../../../src/workspaces/translator/TranslatorWorkspace";
import { studioReduxStore } from "../../state/studioReduxStore";

export interface StudioWorkspaceProps {
  children: React.ReactNode;
  cues: SubtitleCue[];
  onUpdateCues: (cues: SubtitleCue[]) => void;
  isVoiceoverEnabled: boolean;
  onToggleVoiceover: (enabled: boolean) => void;
  onOpenStyleModal: () => void;
  onOpenVoiceoverModal: () => void;
  onOpenUniversalTranslatorModal: () => void;
  onOpenImageTranslatorModal: () => void;
  onOpenBookmarkletModal: () => void;
  onOpenExportModal: () => void;
}

export type StudioSubMode =
  | "nle_editor"
  | "voiceover_booth"
  | "translator_suite"
  | "user_dashboard"
  | "installer_guide";

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  children,
  cues,
  onUpdateCues,
  isVoiceoverEnabled,
  onToggleVoiceover,
  onOpenStyleModal,
  onOpenVoiceoverModal,
  onOpenUniversalTranslatorModal,
  onOpenImageTranslatorModal,
  onOpenBookmarkletModal,
  onOpenExportModal,
}) => {
  const [subMode, setSubMode] = useState<StudioSubMode>("nle_editor");
  const engineState = studioReduxStore.getState();

  return (
    <div className="flex-1 w-full max-w-full min-w-0 flex flex-col overflow-x-hidden">
      {/* Studio Sub-Mode Toolbar */}
      <div className="w-full max-w-full bg-[#0E131D] border-b border-neutral-800/80 px-2.5 sm:px-6 lg:px-8 py-2">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090B10] border border-neutral-800 min-w-0">
            <button
              type="button"
              onClick={() => setSubMode("nle_editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subMode === "nle_editor"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scissors className="w-3.5 h-3.5 shrink-0" />
              <span>Bàn dựng 3 Khối</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode("voiceover_booth")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subMode === "voiceover_booth"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>Phòng thu Lồng tiếng AI</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode("translator_suite")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subMode === "translator_suite"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Dịch Liên kết & Song ngữ</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode("user_dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subMode === "user_dashboard"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dự Án & Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode("installer_guide")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subMode === "installer_guide"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Windows 10/11 (32/64-bit)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenStyleModal}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Kiểu chữ Karaoke</span>
            </button>

            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Xuất mẫu 5s / Toàn bộ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Studio Sub-View */}
      {subMode === "nle_editor" && children}

      {subMode === "voiceover_booth" && (
        <VoiceoverWorkspace
          cues={cues}
          onUpdateCues={onUpdateCues}
          isVoiceoverEnabled={isVoiceoverEnabled}
          onToggleVoiceover={onToggleVoiceover}
          onOpenAdvancedModal={onOpenVoiceoverModal}
          onNavigateToEditor={() => setSubMode("nle_editor")}
        />
      )}

      {subMode === "translator_suite" && (
        <TranslatorWorkspace
          cues={cues}
          onUpdateCues={onUpdateCues}
          onOpenUniversalModal={onOpenUniversalTranslatorModal}
          onOpenImageTranslator={onOpenImageTranslatorModal}
          onOpenBookmarklet={onOpenBookmarkletModal}
          onNavigateToEditor={() => setSubMode("nle_editor")}
        />
      )}

      {subMode === "user_dashboard" && (
        <div className="max-w-7xl w-full mx-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-cyan-300">
                apps/studio-web · USER PROJECT DASHBOARD
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Quản Lý Dự Án Vietsub & Trạng Thái Kết Xuất Đám Mây
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSubMode("nle_editor")}
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Quay Lại Bàn Dựng 3 Khối
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#10141D] border border-slate-800">
              <div className="text-xs text-slate-400">Mã dự án đang mở</div>
              <div className="text-base font-bold text-white font-mono tabular-nums mt-1">
                {engineState.activeProjectCode}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#10141D] border border-slate-800">
              <div className="text-xs text-slate-400">Số câu phụ đề hiện tại</div>
              <div className="text-base font-bold text-cyan-300 font-mono tabular-nums mt-1">
                {cues.length} câu thoại
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#10141D] border border-slate-800">
              <div className="text-xs text-slate-400">Tốc độ FFmpeg.wasm</div>
              <div className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {engineState.lastClientRenderMs} ms / batch
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#10141D] border border-slate-800">
              <div className="text-xs text-slate-400">Trạng thái lồng tiếng AI</div>
              <div className="text-base font-bold text-amber-300 font-mono tabular-nums mt-1">
                {isVoiceoverEnabled ? "Đang Bật (4 Phân Vai)" : "Chế độ Phụ đề"}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#10141D] border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Danh Sách Dự Án Gần Đây (Đồng Bộ MongoDB & Cloudflare R2)</span>
            </h3>
            <div className="divide-y divide-slate-800/80 text-xs">
              {[
                {
                  id: "PRJ-VIETSUB-4K-01",
                  title: "Dự án hiện tại trên Bàn dựng Studio Web",
                  cuesCount: cues.length,
                  resolution: "4K 60FPS",
                  status: "Đang biên tập",
                },
                {
                  id: "PRJ-DRAMA-EP12",
                  title: "Tập 12 - Phim Ngắn Ngôn Tình Cổ Trang (Thuyết minh 4 giọng)",
                  cuesCount: 184,
                  resolution: "1080p Full HD",
                  status: "Đã xuất MP4",
                },
                {
                  id: "PRJ-DOC-SCI-08",
                  title: "Tài liệu Khoa học Vũ trụ - Phụ đề Song ngữ Anh-Việt",
                  cuesCount: 312,
                  resolution: "4K Ultra HD",
                  status: "Đã đồng bộ Cloud",
                },
              ].map((proj) => (
                <div
                  key={proj.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">{proj.title}</div>
                      <div className="text-slate-400 font-mono tabular-nums">
                        {proj.id} · {proj.cuesCount} câu sub · {proj.resolution}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono">{proj.status}</span>
                    <button
                      type="button"
                      onClick={() => setSubMode("nle_editor")}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
                    >
                      Mở trên Bàn dựng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subMode === "installer_guide" && (
        <div className="max-w-7xl w-full mx-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-amber-300">
                WINDOWS 10 & WINDOWS 11 NATIVE INSTALLER GUIDE (32-BIT & 64-BIT)
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Hướng Dẫn Cài Đặt Hendy Studio Pro Trên Windows 10 & 11 (x86 / x64)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSubMode("nle_editor")}
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Quay Lại Bàn Dựng 3 Khối
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[#10141D] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300">
                  KIẾN TRÚC 64-BIT (x64)
                </span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                01. Bản Cài Đặt Windows 10 / 11 (64-bit x64 NVENC GPU)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tối ưu cho máy tính Windows 10 và Windows 11 64-bit có RAM từ 8GB trở lên. Hỗ trợ tăng tốc phần cứng FFmpeg NVENC/QSV và đồng bộ trực tiếp với Web Studio.
              </p>
              <div className="p-3 rounded-lg bg-[#090B10] border border-slate-800 font-mono text-xs text-slate-300">
                Tệp cài đặt: HendyStudioPro-Setup-2.8.0-win-x64.exe (148 MB)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#10141D] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300">
                  KIẾN TRÚC 32-BIT (x86)
                </span>
                <Monitor className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                02. Bản Cài Đặt Windows 10 / 11 (32-bit x86 Tương Thích Rộng)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tối ưu nhẹ cho hệ thống Windows 10 và Windows 11 32-bit (x86) hoặc máy cấu hình văn phòng RAM 4GB. Tích hợp sẵn bộ giải mã âm thanh nhẹ và xuất phụ đề tốc độ cao.
              </p>
              <div className="p-3 rounded-lg bg-[#090B10] border border-slate-800 font-mono text-xs text-slate-300">
                Tệp cài đặt: HendyStudioPro-Setup-2.8.0-win-x86-32bit.exe (112 MB)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#10141D] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Quy Trình 3 Bước Cài Đặt & Kích Hoạt Bản Quyền</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-lg bg-[#090B10] border border-slate-800">
                <div className="font-bold text-white mb-1">Bước 1: Chọn đúng phiên bản</div>
                Kiểm tra System Type trong Windows Settings để tải bản 64-bit (x64) hoặc 32-bit (x86).
              </div>
              <div className="p-3.5 rounded-lg bg-[#090B10] border border-slate-800">
                <div className="font-bold text-white mb-1">Bước 2: Chạy trình cài đặt</div>
                Mở tệp .EXE hoặc .MSI, trình cài đặt sẽ tự động cấu hình FFmpeg và Audio Driver.
              </div>
              <div className="p-3.5 rounded-lg bg-[#090B10] border border-slate-800">
                <div className="font-bold text-white mb-1">Bước 3: Đồng bộ tài khoản</div>
                Đăng nhập tài khoản Hendy Studio Pro để đồng bộ dự án giữa bản Web và Desktop.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
