// =============================================================================
// 📁 THƯ MỤC CHUYÊN DỤNG: /admin-web/AdminConfig.ts
// Cấu hình trung tâm & Từ điển Tiếng Việt cho Mặt Phẳng Quản Trị (Tầng 0)
// Chỉ cần chỉnh sửa trong thư mục /admin-web/, hệ thống sẽ tự động đồng bộ
// toàn bộ mã nguồn sang src/App.tsx, src/admin-router.tsx và apps/admin-web/.
// =============================================================================

import {
  DEFAULT_NETWORK_POLICY,
  DedicatedAdminSubRoute,
  DedicatedNetworkPolicy,
} from "../src/config/adminNetworkConfig";

export const ADMIN_CONTROL_PLANE_CONFIG_VI: DedicatedNetworkPolicy = {
  ...DEFAULT_NETWORK_POLICY,
};

export interface AdminSubRouteInfoVi {
  id: DedicatedAdminSubRoute;
  titleVi: string;
  subtitleVi: string;
  endpointPath: string;
}

export const ADMIN_SUB_ROUTES_VI: AdminSubRouteInfoVi[] = [
  {
    id: "control-plane",
    titleVi: "Tầng 0: Mặt Phẳng Quản Trị & 7 Tầng Hệ Thống",
    subtitleVi: "Quản lý Người dùng, Gói cước, Feature Flags, Grafana & CI/CD",
    endpointPath: "/admin-console/control-plane",
  },
  {
    id: "network-gateway",
    titleVi: "Tên Miền, IP Tĩnh & Tường Lửa CIDR",
    subtitleVi: "Cấu hình dải mạng được phép truy cập & kiểm chứng API xác thực",
    endpointPath: "/admin-console/network-gateway",
  },
  {
    id: "cross-platform-studio",
    titleVi: "Giao Diện Đa Nền Tảng & Build Studio",
    subtitleVi: "Đóng gói Windows 10/11 (32-bit x86 & 64-bit x64), Android & iOS",
    endpointPath: "/admin-console/cross-platform-studio",
  },
  {
    id: "telegram-ops",
    titleVi: "Trung Tâm Dịch Vụ & Kho Lưu Trữ VIP",
    subtitleVi: "Điều phối Telegram Mini App (TMA), Bot & 13 kho liên minh",
    endpointPath: "/admin-console/telegram-ops",
  },
  {
    id: "infrastructure",
    titleVi: "Hạ Tầng Docker · Ktor · PostgreSQL",
    subtitleVi: "Giám sát cụm cơ sở dữ liệu, Redis Pub/Sub & BullMQ Workers",
    endpointPath: "/admin-console/infrastructure",
  },
];
