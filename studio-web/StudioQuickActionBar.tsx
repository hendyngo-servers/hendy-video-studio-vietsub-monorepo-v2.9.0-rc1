// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/StudioQuickActionBar.tsx
// Thanh điều khiển tác vụ nhanh (Tiếng Việt) dành cho giao diện Studio Biên Tập
// Thiết kế linh hoạt tự động co giãn theo màn hình & chống tràn viền 100%.
// =============================================================================

import React from "react";
import {
  Sparkles,
  Upload,
  Video,
  FileText,
  Share2,
  GitMerge,
  Users,
  Zap,
  Sliders,
  Maximize2,
  Download,
  Menu,
  Monitor,
  Smartphone,
  Film,
  Bot,
} from "lucide-react";
import { StudioModalStateMap } from "./StudioConfig";

export interface StudioQuickActionBarProps {
  videoTitle: string;
  cuesCount: number;
  isPlaying: boolean;
  layoutMode: "auto" | "pc" | "mobile";
  onChangeLayoutMode: (mode: "auto" | "pc" | "mobile") => void;
  onOpenModal: (modalKey: keyof StudioModalStateMap) => void;
  onTriggerVideoUpload: () => void;
  onTriggerSrtImport: () => void;
  onOpenDrawer: () => void;
}

export const StudioQuickActionBar: React.FC<StudioQuickActionBarProps> = ({
  videoTitle,
  cuesCount,
  isPlaying,
  layoutMode,
  onChangeLayoutMode,
  onOpenModal,
  onTriggerVideoUpload,
  onTriggerSrtImport,
  onOpenDrawer,
}) => {
  return (
    <section
      aria-label="Thanh tác vụ nhanh Studio"
      className="w-full max-w-full min-w-0 bg-[#0D111A]/95 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3.5 mb-3 shrink-0 shadow-lg overflow-hidden"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 min-w-0">
        {/* Cụm trái: Thông tin Dự án đang mở & Nguồn tệp nhanh */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isPlaying
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/35 text-rose-400"
            }`}
          >
            <Film className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px] sm:max-w-[260px]">
                {videoTitle}
              </span>
              <span className="text-[11px] font-mono text-cyan-300 tabular-nums shrink-0">
                · {cuesCount} câu phụ đề
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={onTriggerVideoUpload}
                className="hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Tải video từ máy tính (MP4, MOV, WebM)"
              >
                <Upload className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Tải video</span>
              </button>
              <span className="text-slate-700" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={() => onOpenModal("sample")}
                className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Chọn video mẫu có sẵn để thử nghiệm"
              >
                <Video className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Video mẫu</span>
              </button>
              <span className="text-slate-700" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={onTriggerSrtImport}
                className="hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Nhập tệp phụ đề .SRT hoặc .VTT"
              >
                <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Nhập .SRT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cụm giữa & phải: Các công cụ AI, Chuyển đổi bố cục & Xuất Video */}
        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* 1. Tạo Phụ Đề AI */}
            <button
              type="button"
              onClick={() => onOpenModal("generate")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer whitespace-nowrap shrink-0"
              title="Phân tích âm thanh và dịch phụ đề tự động bằng Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Tạo Vietsub AI</span>
            </button>

            {/* 2. Nhập Link Mạng Xã Hội / Đa Nền Tảng */}
            <button
              type="button"
              onClick={() => onOpenModal("socialImport")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-pink-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Nhập video từ TikTok, Facebook Reels, YouTube Shorts"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="hidden sm:inline">TikTok / Reels</span>
            </button>

            {/* 3. Thuyết Minh AI Đa Giọng */}
            <button
              type="button"
              onClick={() => onOpenModal("autoVoiceover")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Phòng thu thuyết minh AI 4 phân vai (Nam, Nữ, Già, Trẻ)"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Thuyết Minh AI</span>
            </button>

            {/* 4. Gộp Câu Thông Minh SmartMerge */}
            <button
              type="button"
              onClick={() => onOpenModal("smartMerge")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Thuật toán nối và gộp câu phụ đề ngắn tự động"
            >
              <GitMerge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Gộp Sub</span>
            </button>

            {/* 5. Mẫu Chữ CapCut & Âm Thanh */}
            <button
              type="button"
              id="btn-toolbar-capcut"
              onClick={() => onOpenModal("capcut")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Mẫu chữ hiệu ứng CapCut, Karaoke & Lọc âm"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden lg:inline">Hiệu Ứng CapCut</span>
            </button>

            {/* 6. Tùy Chỉnh Kiểu Phụ Đề */}
            <button
              type="button"
              id="btn-toolbar-style"
              onClick={() => onOpenModal("style")}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-400 transition cursor-pointer shrink-0"
              title="Tùy chỉnh kiểu chữ, màu sắc, viền và vị trí phụ đề"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* 7. Rạp Chiếu Toàn Màn Hình */}
            <button
              type="button"
              id="btn-toolbar-cinema"
              onClick={() => onOpenModal("cinemaMode")}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-rose-400 transition cursor-pointer shrink-0"
              title="Mở chế độ Rạp chiếu phim toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* 8. Trợ lý AI Gemini */}
            <button
              type="button"
              onClick={() => onOpenModal("geminiChatbot")}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-indigo-400 transition cursor-pointer shrink-0"
              title="Trợ lý biên tập kịch bản & dịch thuật Gemini AI"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>

          {/* Cụm phải: Chuyển đổi bố cục linh hoạt, Xuất video & Ngăn công cụ đầy đủ */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <div
              className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-0.5"
              title="Chuyển đổi chế độ hiển thị bố cục bàn dựng"
            >
              <button
                type="button"
                onClick={() => onChangeLayoutMode("auto")}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                  layoutMode === "auto"
                    ? "bg-slate-800 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tự động tối ưu theo kích thước màn hình"
              >
                Tự động
              </button>
              <button
                type="button"
                onClick={() => onChangeLayoutMode("pc")}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  layoutMode === "pc"
                    ? "bg-slate-800 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Bố cục Máy tính (2 cột song song)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeLayoutMode("mobile")}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  layoutMode === "mobile"
                    ? "bg-slate-800 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Bố cục Thu gọn (Chia thẻ dành cho màn hình nhỏ)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenModal("export")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Xuất video kèm phụ đề (Hardsub MP4) hoặc tải tệp .SRT / .ASS"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Xuất Video</span>
            </button>

            <button
              type="button"
              id="btn-toolbar-drawer-trigger"
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0"
              title="Mở toàn bộ danh mục công cụ Vietsub & Sáng tạo AI"
            >
              <Menu className="w-3.5 h-3.5 shrink-0" />
              <span>Công cụ</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
