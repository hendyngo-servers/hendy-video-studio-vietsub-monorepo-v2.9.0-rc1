// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /admin-web/AdminPortalGateway.tsx
// Cổng Điều Hành Quản Trị & Bảo Trì Độc Lập (100% Tiếng Việt)
// Kết nối trực tiếp vào src/App.tsx mà không cần tìm kiếm qua các tệp rời rạc.
// =============================================================================

import React from "react";
import { WorkspaceRouteId } from "../src/components/StudioHomePage";

const AdminDeveloperPortal = React.lazy(() =>
  import("../src/components/AdminDeveloperPortal").then((m) => ({
    default: m.AdminDeveloperPortal,
  }))
);

const MaintenanceSandboxDashboard = React.lazy(() =>
  import("../src/components/MaintenanceSandboxDashboard").then((m) => ({
    default: m.MaintenanceSandboxDashboard,
  }))
);

export interface AdminPortalGatewayProps {
  mode: "maintenance" | "admin_portal";
  currentUser: any;
  onExitMaintenance: () => void;
  onNavigateToStudio: () => void;
  onNavigateToHome: () => void;
  onSetRequestedWorkspaceRoute: (route: WorkspaceRouteId) => void;
  onNotify: (text: string, type?: "success" | "error" | "info") => void;
}

export const AdminPortalGateway: React.FC<AdminPortalGatewayProps> = ({
  mode,
  currentUser,
  onExitMaintenance,
  onNavigateToStudio,
  onNavigateToHome,
  onNotify,
}) => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 font-mono gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Đang khởi tạo Cổng Quản Trị & Điều Hành Hệ Thống...</span>
        </div>
      }
    >
      {mode === "maintenance" ? (
        <MaintenanceSandboxDashboard
          onBackToStudio={onExitMaintenance}
          onNotify={onNotify}
        />
      ) : (
        <AdminDeveloperPortal
          onBackToStudio={onNavigateToStudio}
          onBackToHome={onNavigateToHome}
          currentUser={currentUser}
          onNotify={onNotify}
        />
      )}
    </React.Suspense>
  );
};
