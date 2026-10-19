/**
 * =============================================================================
 * 🔄 TRÌNH ĐỒNG BỘ MÃ NGUỒN TỰ ĐỘNG 7 TẦNG (AUTO-SYNC WORKSPACE ENGINE)
 * Đường dẫn: scripts/auto-sync-workspaces.js
 *
 * Chức năng:
 * - Tự động quét thư mục trung tâm `/hendy-Admini`, `/studio-web` và `/admin-web`
 * - Tự động khởi tạo các thư mục và tệp liên kết còn thiếu trong `/hendy-Admini`,
 *   `/apps/studio-web`, `/apps/admin-web` và `/src/generated/workspace-registry.ts`.
 * - Đảm bảo khi chỉnh sửa hoặc thêm tệp mới trong `hendy-Admini` (trong kho lưu trữ
 *   hoặc trực tiếp trên giao diện Admin), toàn bộ hệ thống tự động cập nhật mượt mà.
 * =============================================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const REQUIRED_DIRECTORIES = [
  "hendy-Admini",
  "hendy-Admini/layers",
  "studio-web",
  "admin-web",
  "apps/studio-web/src",
  "apps/studio-web/src/components",
  "apps/admin-web/src",
  "src/generated",
];

function ensureDirectoriesExist() {
  for (const relDir of REQUIRED_DIRECTORIES) {
    const fullPath = path.join(ROOT_DIR, relDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}

function listTypeScriptModules(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
        entry.name !== "index.ts" &&
        !entry.name.endsWith(".d.ts")
    )
    .map((entry) => entry.name.replace(/\.(tsx|ts)$/, ""));
}

export function runWorkspaceAutoSync() {
  ensureDirectoriesExist();

  const hendyAdminiModules = listTypeScriptModules(
    path.join(ROOT_DIR, "hendy-Admini")
  );
  const hendyAdminiLayerModules = listTypeScriptModules(
    path.join(ROOT_DIR, "hendy-Admini/layers")
  );
  const studioModules = listTypeScriptModules(
    path.join(ROOT_DIR, "studio-web")
  );
  const adminModules = listTypeScriptModules(path.join(ROOT_DIR, "admin-web"));

  // 1. Tự động cập nhật /hendy-Admini/index.ts
  const hendyAdminiIndexPath = path.join(ROOT_DIR, "hendy-Admini/index.ts");
  const hendyAdminiExportLines = [
    "// =============================================================================",
    "// 📁 THƯ MỤC TRUNG TÂM QUẢN TRỊ 7 TẦNG: /hendy-Admini/index.ts (TỰ ĐỘNG ĐỒNG BỘ)",
    "// Quản lý toàn bộ các tầng (Tầng 0 -> Tầng 6) và trình sửa code trực tiếp.",
    "// =============================================================================",
    "",
    ...hendyAdminiModules.map((mod) => `export * from "./${mod}";`),
    ...hendyAdminiLayerModules.map(
      (mod) => `export * from "./layers/${mod}";`
    ),
    "",
  ].join("\n");

  if (
    !fs.existsSync(hendyAdminiIndexPath) ||
    fs.readFileSync(hendyAdminiIndexPath, "utf8") !== hendyAdminiExportLines
  ) {
    fs.writeFileSync(hendyAdminiIndexPath, hendyAdminiExportLines, "utf8");
  }

  // 2. Tự động cập nhật /studio-web/index.ts nếu có module mới
  const studioIndexPath = path.join(ROOT_DIR, "studio-web/index.ts");
  const studioExportLines = [
    "// =============================================================================",
    "// 📁 THƯ MỤC CHUYÊN DỤNG: /studio-web/index.ts (TỰ ĐỘNG ĐỒNG BỘ)",
    "// Điểm xuất trung tâm cho toàn bộ giao diện Studio Web.",
    "// =============================================================================",
    "",
    ...studioModules.map((mod) => `export * from "./${mod}";`),
    'export { AudioWaveformTimeline, type AudioWaveformTimelineProps } from "../src/components/AudioWaveformTimeline";',
    'export { VideoPlayer, type VideoPlayerHandle, type VideoPlayerProps } from "../src/components/VideoPlayer";',
    'export { SubtitleList, type SubtitleListProps } from "../src/components/SubtitleList";',
    'export { StudioHomePage, type StudioHomePageProps, type WorkspaceRouteId } from "../src/components/StudioHomePage";',
    "",
  ].join("\n");

  if (
    !fs.existsSync(studioIndexPath) ||
    fs.readFileSync(studioIndexPath, "utf8") !== studioExportLines
  ) {
    fs.writeFileSync(studioIndexPath, studioExportLines, "utf8");
  }

  // 3. Tự động cập nhật /admin-web/index.ts nếu có module mới
  const adminIndexPath = path.join(ROOT_DIR, "admin-web/index.ts");
  const adminExportLines = [
    "// =============================================================================",
    "// 📁 THƯ MỤC CHUYÊN DỤNG: /admin-web/index.ts (TỰ ĐỘNG ĐỒNG BỘ)",
    "// Điểm xuất trung tâm cho toàn bộ giao diện Quản Trị Hệ Thống (Admin Web).",
    "// =============================================================================",
    "",
    ...adminModules.map((mod) => `export * from "./${mod}";`),
    'export { AdminControlPlaneSuite } from "../apps/admin-web/AdminControlPlaneSuite";',
    'export { DedicatedAdminRouter, type DedicatedAdminRouterProps } from "../src/admin-router";',
    'export { DockerKtorWorkspace } from "../src/workspaces/DockerKtor";',
    "",
  ].join("\n");

  if (
    !fs.existsSync(adminIndexPath) ||
    fs.readFileSync(adminIndexPath, "utf8") !== adminExportLines
  ) {
    fs.writeFileSync(adminIndexPath, adminExportLines, "utf8");
  }

  // 4. Tự động tạo tệp đăng ký trung tâm /src/generated/workspace-registry.ts
  const registryPath = path.join(
    ROOT_DIR,
    "src/generated/workspace-registry.ts"
  );
  const registryContent = [
    "// =============================================================================",
    "// ⚡ TỆP ĐƯỢC KHỞI TẠO TỰ ĐỘNG BỞI TRÌNH ĐỒNG BỘ (scripts/auto-sync-workspaces.js)",
    "// Liên kết trực tiếp /hendy-Admini, /studio-web và /admin-web vào /src/App.tsx.",
    "// =============================================================================",
    "",
    'export * from "../../hendy-Admini";',
    'export * from "../../studio-web";',
    'export * from "../../admin-web";',
    "",
    "export const WORKSPACE_AUTO_SYNC_MANIFEST = {",
    `  hendyAdminiDirectory: "/hendy-Admini",`,
    `  studioWebDirectory: "/studio-web",`,
    `  adminWebDirectory: "/admin-web",`,
    `  hendyAdminiModules: ${JSON.stringify(hendyAdminiModules)},`,
    `  hendyAdminiLayerModules: ${JSON.stringify(hendyAdminiLayerModules)},`,
    `  studioModules: ${JSON.stringify(studioModules)},`,
    `  adminModules: ${JSON.stringify(adminModules)},`,
    `  status: "SYNCHRONIZED_OK",`,
    "} as const;",
    "",
  ].join("\n");

  if (
    !fs.existsSync(registryPath) ||
    fs.readFileSync(registryPath, "utf8") !== registryContent
  ) {
    fs.writeFileSync(registryPath, registryContent, "utf8");
  }

  return {
    hendyAdminiModules,
    hendyAdminiLayerModules,
    studioModules,
    adminModules,
  };
}

// Chạy trực tiếp khi gọi qua CLI: `node scripts/auto-sync-workspaces.js`
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const res = runWorkspaceAutoSync();
  console.log(
    `[Auto-Sync] Đã đồng bộ thành công /hendy-Admini (${res.hendyAdminiModules.length} mô-đun), /studio-web (${res.studioModules.length} mô-đun) & /admin-web (${res.adminModules.length} mô-đun).`
  );
}
