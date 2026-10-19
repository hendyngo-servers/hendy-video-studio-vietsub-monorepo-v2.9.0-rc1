// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /admin-web/index.ts (TỰ ĐỘNG ĐỒNG BỘ)
// Điểm xuất trung tâm cho toàn bộ giao diện Quản Trị Hệ Thống (Admin Web).
// =============================================================================

export * from "./AdminConfig";
export * from "./AdminPortalGateway";
export { AdminControlPlaneSuite } from "../apps/admin-web/AdminControlPlaneSuite";
export { DedicatedAdminRouter, type DedicatedAdminRouterProps } from "../src/admin-router";
export { DockerKtorWorkspace } from "../src/workspaces/DockerKtor";
