// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/StudioToolsDrawer.tsx
// Ngăn Công Cụ Chuyên Sâu (Tiếng Việt) dành cho Studio Biên Tập Video
// Tổ chức khoa học thành 4 nhóm chức năng rõ ràng, giữ nguyên 100% tính năng.
// =============================================================================

import React from "react";
import {
  Film,
  X,
  Sparkles,
  ChevronRight,
  Globe,
  Share2,
  GitMerge,
  Languages,
  Users,
  Zap,
  Sliders,
  Maximize2,
  Mic,
  Upload,
  Video,
  FileText,
  Bookmark,
  Terminal,
  Keyboard,
  Cloud,
  ShieldCheck,
  Bot,
  Image as ImageIcon,
  Dna,
  Smartphone,
} from "lucide-react";
import { StudioModalStateMap } from "./StudioConfig";

export interface StudioToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (modalKey: keyof StudioModalStateMap) => void;
  onTriggerVideoUpload: () => void;
  onTriggerSrtImport: () => void;
  currentUser: any;
  isAdminWorkspaceRoute: boolean;
  onOpenAdminPortal: () => void;
}

export const StudioToolsDrawer: React.FC<StudioToolsDrawerProps> = ({
  isOpen,
  onClose,
  onOpenModal,
  onTriggerVideoUpload,
  onTriggerSrtImport,
  currentUser,
  isAdminWorkspaceRoute,
  onOpenAdminPortal,
}) => {
  if (!isOpen) return null;

  const triggerAndClose = (modalKey: keyof StudioModalStateMap) => {
    onClose();
    onOpenModal(modalKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Lớp nền mờ */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
      />

      {/* Khung ngăn kéo công cụ bên phải */}
      <aside
        aria-label="Ngăn công cụ Vietsub Studio"
        className="relative w-80 sm:w-96 max-w-[88vw] h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 text-slate-100"
      >
        {/* Tiêu đề ngăn công cụ */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Danh Mục Công Cụ Studio
              </h3>
              <p className="text-[11px] text-slate-400">
                Trọn bộ công cụ dịch thuật, lồng tiếng & sáng tạo AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Đóng danh mục công cụ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách công cụ phân theo 4 nhóm rõ ràng */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* NHÓM 1: DỊCH & TẠO PHỤ ĐỀ VIETSUB */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2 px-1">
              1. Dịch Thuật & Tạo Phụ Đề AI
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => triggerAndClose("generate")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-600/20 to-amber-600/20 hover:from-rose-600/35 hover:to-amber-600/35 border border-rose-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Tạo Phụ Đề Vietsub AI
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Bóc băng âm thanh & dịch tự động đa ngôn ngữ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("universalTranslator")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-pink-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-pink-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Dịch Mọi Liên Kết Web & Video
                    </div>
                    <div className="text-[10px] text-slate-400">
                      YouTube, TikTok, Shorts, Reels, Phim Web
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("socialImport")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-pink-950/50 to-rose-950/50 hover:from-pink-900/60 hover:to-rose-900/60 border border-pink-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Nhập Video TikTok & Facebook Reels
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tự động tải luồng video & tạo phụ đề 1 chạm
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("webDrama")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Nhập Phim Ngắn & Web Drama
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Chuyên dụng cho phim ngắn tập Trung / Hàn
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("refine")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Hiệu Đính & Trau Chuốt Câu Chữ AI
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rút gọn câu dài, sửa ngữ pháp, chuẩn văn phong
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("smartMerge")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <GitMerge className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Gộp Phụ Đề Thông Minh (SmartMerge)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tự động nối các câu rời rạc theo nhịp thở
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("imageTextTranslator")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Quét & Dịch Chữ Trên Ảnh (OCR)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Nhận diện phụ đề cứng hoặc chữ trên poster
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* NHÓM 2: LỒNG TIẾNG & HIỆU ỨNG CHỮ */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2 px-1">
              2. Thuyết Minh & Phong Cách Điện Ảnh
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => triggerAndClose("autoVoiceover")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Phòng Thu Thuyết Minh AI Đa Giọng
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Phân vai tự động Nam, Nữ, Già, Trẻ & trộn âm
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("capcut")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-purple-400 fill-current" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Mẫu Chữ CapCut & Xử Lý Âm Thanh
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hiệu ứng Karaoke, vùng an toàn TikTok 9:16
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("style")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Tùy Chỉnh Kiểu Chữ Phụ Đề
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Phông chữ, màu sắc, bóng đổ, song ngữ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("cinemaMode")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Rạp Chiếu Toàn Màn Hình (Cinema)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Trải nghiệm xem phim tập trung chất lượng cao
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("cover")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Phòng Thu Cover Bài Hát AI
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Chuyển đổi giọng hát và phối khí tự động
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* NHÓM 3: PHÒNG THÍ NGHIỆM ĐA PHƯƠNG TIỆN AI */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 px-1">
              3. Sáng Tạo Đa Phương Tiện AI Mở Rộng
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => triggerAndClose("veoVideo")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Tạo Video Điện Ảnh Veo AI
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Dựng cảnh video 16:9 / 9:16 từ mô tả văn bản
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("aiImage")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Thiết Kế Ảnh Bìa & Poster AI
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tạo thumbnail YouTube, ảnh bìa phim chất lượng cao
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("geminiChatbot")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Trợ Lý Đạo Diễn & Dịch Thuật Gemini
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hỏi đáp ngữ cảnh văn hóa & giải nghĩa thuật ngữ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("science")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Dna className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Chuẩn Hóa Thuật Ngữ Khoa Học & Y Sinh
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tra cứu danh pháp chuyên ngành cho video tài liệu
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* NHÓM 4: TẬP TIN, ĐÁM MÂY & TIỆN ÍCH HỆ THỐNG */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2 px-1">
              4. Tập Tin, Xuất Bản & Tiện Ích
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => triggerAndClose("export")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Xuất Video & Tải Tệp Phụ Đề
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Kết xuất MP4 lồng sub hoặc tải .SRT / .VTT / .ASS
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerVideoUpload();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Tải Video Từ Thiết Bị
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hỗ trợ định dạng MP4, WebM, MOV
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("sample")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Kho Video Mẫu Thử Nghiệm
                    </div>
                    <div className="text-[10px] text-slate-400">
                      MV âm nhạc, trích đoạn phim ngắn có sẵn
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerSrtImport();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Nhập Tệp Phụ Đề .SRT / .VTT
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Nạp tệp phụ đề có sẵn từ máy tính
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("appDownload")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Bộ Cài Đặt Windows 10/11 (32/64-bit) & Mobile
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tải bản cài đặt .EXE, .MSI, Android APK & iOS
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("bookmarklet")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-amber-400 fill-current" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Tiện Ích Dấu Trang (Bookmarklet 1-Chạm)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Dịch phụ đề trực tiếp trên mọi trang web
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("telegramPipeline")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Bảng Điều Phối Luồng Video (Pipeline)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Đồng bộ tiến trình xử lý video đám mây
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("shortcuts")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Bảng Tra Cứu Phím Tắt Nhanh (?)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tăng tốc thao tác tua video & biên tập phụ đề
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => triggerAndClose("auth")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Đồng Bộ & Lưu Dự Án Đám Mây
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currentUser
                        ? `Tài khoản: ${currentUser.displayName || "Đã đăng nhập"}`
                        : "Đăng nhập để lưu trữ dự án trực tuyến"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              {/* Cổng Quản Trị Hệ Thống (Chỉ hiển thị khi đang ở luồng Admin) */}
              {isAdminWorkspaceRoute && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminPortal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900/80 hover:to-purple-900/80 border border-indigo-500/40 text-left transition group cursor-pointer mt-2"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Cổng Quản Trị & Lập Trình Viên</span>
                        <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                          Admin
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Quản lý kiến trúc, đa nền tảng & triển khai
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
