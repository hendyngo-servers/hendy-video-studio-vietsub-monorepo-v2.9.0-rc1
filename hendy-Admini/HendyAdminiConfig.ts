// =============================================================================
// 📁 THƯ MỤC TRUNG TÂM QUẢN TRỊ 7 TẦNG: /hendy-Admini/HendyAdminiConfig.ts
// Quản lý toàn bộ 7 tầng kiến trúc (Tầng 0 -> Tầng 6), cấu hình bố cục linh hoạt
// (Auto-Responsive Layout) và danh mục tệp mã nguồn có thể chỉnh sửa trực tiếp
// trong kho lưu trữ (Repository) cũng như ngay trên Giao diện Quản trị (Admin UI).
// =============================================================================

export type SystemLayerId =
  | "ALL"
  | "TIER_0"
  | "TIER_1"
  | "TIER_2"
  | "TIER_3"
  | "TIER_4"
  | "TIER_5"
  | "TIER_6";

export interface SystemLayerDescriptor {
  id: SystemLayerId;
  tierCode: string;
  shortTitle: string;
  fullName: string;
  description: string;
  directories: string[];
  keyFiles: string[];
  accentColor: string;
}

export const HENDY_ADMINI_LAYERS: SystemLayerDescriptor[] = [
  {
    id: "TIER_0",
    tierCode: "TẦNG 0",
    shortTitle: "Tầng 0 · Admin Control Plane",
    fullName: "Mặt Phẳng Quản Trị & Vận Hành (hendy-Admini & admin-web)",
    description:
      "Quản lý toàn diện 7 tầng hệ thống, chỉnh sửa mã nguồn trực tiếp qua Admin UI, tường lửa CIDR, IP tĩnh và phân quyền RBAC.",
    directories: ["hendy-Admini", "admin-web", "apps/admin-web"],
    keyFiles: [
      "hendy-Admini/HendyAdminiConfig.ts",
      "hendy-Admini/HendyAdminiLiveIde.tsx",
      "hendy-Admini/ResponsiveViewportShell.tsx",
      "hendy-Admini/layers/allLayersManager.ts",
      "src/admin-router.tsx",
      "apps/admin-web/AdminControlPlaneSuite.tsx",
      "admin-web/AdminConfig.ts",
    ],
    accentColor: "amber",
  },
  {
    id: "TIER_1",
    tierCode: "TẦNG 1",
    shortTitle: "Tầng 1 · Client & Studio UI",
    fullName: "Giao Diện Người Dùng & Bàn Dựng Linh Hoạt (studio-web & src)",
    description:
      "Giao diện Trang chủ thương mại và Phòng dựng Studio Web tự động co giãn đa màn hình, chống tràn viền 100%.",
    directories: ["studio-web", "apps/studio-web", "src/components"],
    keyFiles: [
      "src/App.tsx",
      "src/workspace-router.tsx",
      "src/components/StudioHomePage.tsx",
      "studio-web/StudioEditorLayout.tsx",
      "studio-web/StudioQuickActionBar.tsx",
      "studio-web/StudioToolsDrawer.tsx",
      "studio-web/StudioConfig.ts",
    ],
    accentColor: "cyan",
  },
  {
    id: "TIER_2",
    tierCode: "TẦNG 2",
    shortTitle: "Tầng 2 · Frontend Engine",
    fullName: "Động Cơ Frontend (Redux, FFmpeg.wasm, Audio Wave Worker)",
    description:
      "Xử lý sóng âm thời gian thực, ảo hóa danh sách phụ đề 60fps, kết xuất video tại trình duyệt và quản lý trạng thái.",
    directories: ["packages/ui-components", "apps/studio-web/engine", "apps/studio-web/workers"],
    keyFiles: [
      "src/components/AudioWaveformTimeline.tsx",
      "src/components/VideoPlayer.tsx",
      "src/components/SubtitleList.tsx",
      "packages/ui-components/FrontendEngineInteractiveBench.tsx",
      "apps/studio-web/engine/ffmpegWasmEngine.ts",
      "apps/studio-web/state/studioReduxStore.ts",
    ],
    accentColor: "sky",
  },
  {
    id: "TIER_3",
    tierCode: "TẦNG 3",
    shortTitle: "Tầng 3 · Cloud Edge & WAF",
    fullName: "Mạng Biên Đám Mây, Tường Lửa WAF & Web Crypto API",
    description:
      "Định tuyến tách biệt mặt phẳng Admin/User, xác thực chữ ký HMAC-SHA256 và bảo vệ chống DDoS tại biên.",
    directories: ["workers/cloudflare-edge", "src/config"],
    keyFiles: [
      "src/config/adminNetworkConfig.ts",
      "workers/cloudflare-edge/index.ts",
    ],
    accentColor: "indigo",
  },
  {
    id: "TIER_4",
    tierCode: "TẦNG 4",
    shortTitle: "Tầng 4 · Backend Orchestration",
    fullName: "Điều Phối Backend (Express API Gateway, Ktor, BullMQ)",
    description:
      "Cổng API trung tâm, máy chủ đồng bộ tệp trực tiếp từ Admin UI và điều phối hàng đợi tác vụ.",
    directories: ["services/api-gateway", "scripts"],
    keyFiles: [
      "server.ts",
      "services/api-gateway/hendyAdminiRouter.ts",
      "services/api-gateway/controlPlaneRouter.ts",
      "scripts/auto-sync-workspaces.js",
    ],
    accentColor: "emerald",
  },
  {
    id: "TIER_5",
    tierCode: "TẦNG 5",
    shortTitle: "Tầng 5 · AI & Media Workers",
    fullName: "Cụm Xử Lý AI (Whisper ASR, Gemini Vietsub, 4-Role TTS)",
    description:
      "Bóc băng giọng nói, dịch thuật ngữ cảnh văn hóa Việt Nam, thuyết minh 4 phân vai và kết xuất FFmpeg.",
    directories: ["services/ai-worker", "src/services"],
    keyFiles: [
      "services/ai-worker/aiPipelineQueue.ts",
      "src/services/geminiService.ts",
    ],
    accentColor: "rose",
  },
  {
    id: "TIER_6",
    tierCode: "TẦNG 6",
    shortTitle: "Tầng 6 · Data & Storage S.O.T",
    fullName: "Tầng Lưu Trữ Dữ Liệu (PostgreSQL RBAC, MongoDB, S3/R2)",
    description:
      "Lưu trữ định danh, phân quyền RBAC, nhật ký kiểm toán (Audit Logs), trạng thái dự án phụ đề và tài nguyên đám mây.",
    directories: ["database/postgres-rbac", "database/mongo-projects"],
    keyFiles: [
      "database/postgres-rbac/repository.ts",
      "database/mongo-projects/repository.ts",
    ],
    accentColor: "purple",
  },
];

export type ResponsiveViewportPreset =
  | "fluid_auto"
  | "mobile_375"
  | "tablet_768"
  | "laptop_1280"
  | "desktop_1600";

export interface ViewportPresetOption {
  id: ResponsiveViewportPreset;
  label: string;
  widthHint: string;
  maxWidthClass: string;
}

export const VIEWPORT_PRESET_OPTIONS: ViewportPresetOption[] = [
  {
    id: "fluid_auto",
    label: "Tự động co giãn (Full Fluid)",
    widthHint: "100% Viewport",
    maxWidthClass: "max-w-full",
  },
  {
    id: "mobile_375",
    label: "Di động (Mobile)",
    widthHint: "420px",
    maxWidthClass: "max-w-[420px] mx-auto border-x border-slate-800 shadow-2xl",
  },
  {
    id: "tablet_768",
    label: "Máy tính bảng (Tablet)",
    widthHint: "768px",
    maxWidthClass: "max-w-[768px] mx-auto border-x border-slate-800 shadow-2xl",
  },
  {
    id: "laptop_1280",
    label: "Laptop tiêu chuẩn",
    widthHint: "1280px",
    maxWidthClass: "max-w-[1280px] mx-auto",
  },
  {
    id: "desktop_1600",
    label: "Màn hình rộng (Widescreen)",
    widthHint: "1600px",
    maxWidthClass: "max-w-[1600px] mx-auto",
  },
];
