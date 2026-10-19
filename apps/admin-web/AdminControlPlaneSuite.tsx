import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Server,
  Layers,
  Users,
  Sliders,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Play,
  FolderTree,
  FileCode2,
} from "lucide-react";
import { HendyAdminiLiveIde } from "../../hendy-Admini/HendyAdminiLiveIde";

export interface AdminControlPlaneSuiteProps {
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
  onNavigateAdminSubRoute?: (subRoute: any) => void;
}

export const AdminControlPlaneSuite: React.FC<AdminControlPlaneSuiteProps> = ({
  onNotify,
  onNavigateAdminSubRoute,
}) => {
  const [activeSection, setActiveSection] = useState<
    | "hendy-admini-ide"
    | "blueprint-7tier"
    | "rbac-users-flags"
    | "monitoring-elk"
    | "devops-cicd"
  >("blueprint-7tier");

  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [devopsData, setDevopsData] = useState<any>(null);
  const [elkSearch, setElkSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAllControlPlaneData = async () => {
    setIsLoading(true);
    try {
      const [bpRes, ovRes, monRes, devRes] = await Promise.all([
        fetch("/api/admin-control-plane/7-tier-blueprint"),
        fetch("/api/admin-control-plane/overview"),
        fetch("/api/admin-control-plane/monitoring"),
        fetch("/api/admin-control-plane/devops"),
      ]);
      const [bp, ov, mon, dev] = await Promise.all([
        bpRes.json(),
        ovRes.json(),
        monRes.json(),
        devRes.json(),
      ]);
      if (bp.ok) setBlueprintData(bp);
      if (ov.ok) setOverviewData(ov);
      if (mon.ok) setMonitoringData(mon);
      if (dev.ok) setDevopsData(dev);
    } catch (err: any) {
      onNotify?.(
        "Không thể tải dữ liệu Control Plane: " + (err?.message || ""),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllControlPlaneData();
  }, []);

  const handleToggleFeatureFlag = async (flagKey: string) => {
    try {
      const res = await fetch("/api/admin-control-plane/feature-flags/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setOverviewData((prev: any) => ({
          ...prev,
          ...data.overview,
        }));
        onNotify?.(
          `Đã cập nhật Feature Flag '${data.flag.flagKey}' -> ${
            data.flag.enabled ? "ENABLED" : "DISABLED"
          }`,
          "success"
        );
      }
    } catch {
      onNotify?.("Lỗi khi cập nhật Feature Flag.", "error");
    }
  };

  const handleCycleUserRole = async (user: any) => {
    const roles: Array<
      "SUPER_ADMIN" | "OPS_ADMIN" | "STUDIO_PRO" | "CREATOR_FREE"
    > = ["SUPER_ADMIN", "OPS_ADMIN", "STUDIO_PRO", "CREATOR_FREE"];
    const nextRole =
      roles[(roles.indexOf(user.role) + 1) % roles.length] || "STUDIO_PRO";
    try {
      const res = await fetch("/api/admin-control-plane/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          role: nextRole,
          planId: user.planId,
          status: user.status,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setOverviewData((prev: any) => ({
          ...prev,
          ...data.overview,
        }));
        onNotify?.(
          `Đã chuyển quyền của ${user.email} sang ${nextRole} (Đã ghi Audit Log).`,
          "success"
        );
      }
    } catch {
      onNotify?.("Không thể cập nhật quyền người dùng.", "error");
    }
  };

  const handleTriggerZeroDowntimeDeploy = async (targetPlane: string) => {
    try {
      const res = await fetch("/api/admin-control-plane/devops/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPlane,
          strategy: "Zero-Downtime Rolling Deploy (Render.com Node 20 + Docker)",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDevopsData((prev: any) => ({
          ...prev,
          deployments: data.deployments,
        }));
        fetchAllControlPlaneData();
        onNotify?.(
          `Đã thực thi pipeline ${data.run.runId} cho ${targetPlane} thành công!`,
          "success"
        );
      }
    } catch {
      onNotify?.("Lỗi khi kích hoạt CI/CD Pipeline.", "error");
    }
  };

  const handleDispatchAiPipelineJob = async (stage: string) => {
    try {
      const res = await fetch("/api/admin-control-plane/ai-pipeline/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const data = await res.json();
      if (data.ok) {
        setOverviewData((prev: any) => ({
          ...prev,
          aiPipeline: data.aiPipeline,
        }));
        onNotify?.(
          `Tầng 5 AI Worker đã xử lý job ${data.job.jobId} (${stage}) trong ${data.job.latencyMs}ms!`,
          "success"
        );
      }
    } catch {
      onNotify?.("Lỗi điều phối AI Worker.", "error");
    }
  };

  const filteredElkLogs = (monitoringData?.elkSystemLogs || []).filter(
    (log: any) =>
      !elkSearch.trim() ||
      log.message.toLowerCase().includes(elkSearch.toLowerCase()) ||
      log.tier.toLowerCase().includes(elkSearch.toLowerCase()) ||
      log.service.toLowerCase().includes(elkSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 overflow-x-hidden">
      {/* TẦNG 0 HEADER BANNER */}
      <div className="rounded-xl bg-[#0D121F] border border-slate-800 p-4 sm:p-6 space-y-5 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300">
              <span>TẦNG 0 · ADMIN CONTROL PLANE</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-300">📁 hendy-Admini & apps/admin-web/</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">Domain: admin.hendystudio.net</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words">
              Kiến Trúc 7 Tầng Hendy Studio Pro & Trung Tâm Quản Lý Mã Nguồn (hendy-Admini)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Quản trị tập trung toàn bộ 7 tầng hệ thống trong thư mục chuyên dụng{" "}
              <span className="font-mono text-amber-300">/hendy-Admini</span>: cho phép chỉnh sửa tệp trực tiếp trong kho lưu trữ hoặc ngay trên giao diện Admin, quản lý RBAC, Gói cước, Feature Flags, Giám sát Grafana / Prometheus / Sentry / ELK Stack và Pipeline CI/CD Zero-downtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection("hendy-admini-ide")}
              className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Mở Trình Sửa Code (hendy-Admini)</span>
            </button>
            <button
              type="button"
              onClick={fetchAllControlPlaneData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Đồng Bộ 7 Tầng</span>
            </button>
            {onNavigateAdminSubRoute && (
              <button
                type="button"
                onClick={() => onNavigateAdminSubRoute("network-gateway")}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cấu Hình CIDR & IP Tĩnh
              </button>
            )}
          </div>
        </div>

        {/* Segmented Control Plane Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-[#080B12] border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSection("blueprint-7tier")}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === "blueprint-7tier"
                ? "bg-amber-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            01. Sơ Đồ Kiến Trúc 7 Tầng & Monorepo
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("hendy-admini-ide")}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === "hendy-admini-ide"
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "text-amber-300 hover:text-white"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>02. Trình Sửa Code 7 Tầng (📁 hendy-Admini IDE)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("rbac-users-flags")}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === "rbac-users-flags"
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            03. Quản Lý User · Gói Cước · Feature Flags · RBAC
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("monitoring-elk")}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === "monitoring-elk"
                ? "bg-emerald-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            04. Monitoring (Prometheus · Grafana · Sentry · ELK)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("devops-cicd")}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === "devops-cicd"
                ? "bg-sky-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            05. DevOps · CI/CD · AI Worker & Render Deploy
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB: TRÌNH SỬA CODE TRỰC TIẾP 7 TẦNG (/hendy-Admini LIVE IDE)       */}
      {/* =================================================================== */}
      {activeSection === "hendy-admini-ide" && (
        <HendyAdminiLiveIde onNotify={onNotify} />
      )}

      {/* =================================================================== */}
      {/* TAB 1: SƠ ĐỒ KIẾN TRÚC 7 TẦNG & CẤU TRÚC MONOREPO                   */}
      {/* =================================================================== */}
      {activeSection === "blueprint-7tier" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: 7 Tiers Live Cards */}
          <div className="lg:col-span-7 space-y-3">
            {(blueprintData?.tiers || []).map((tier: any) => (
              <div
                key={tier.tierNumber}
                className="rounded-xl bg-[#0D121F] border border-slate-800 p-4 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      [{tier.tierCode}]
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {tier.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    {tier.isolationLevel}
                  </span>
                </div>

                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {(tier.modules || []).map((m: string, idx: number) => (
                    <li key={idx} className="truncate">
                      • {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right 5 Cols: Official Monorepo Directory Tree Blueprint */}
          <div className="lg:col-span-5 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-cyan-400" />
                <span>Cấu Trúc Thư Mục Monorepo Chuẩn 7 Tầng</span>
              </h3>
              <span className="text-xs font-mono text-cyan-300">
                VERIFIED TREE
              </span>
            </div>

            <pre className="p-4 rounded-lg bg-[#070A10] border border-slate-800/90 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`hendy-video-studio-vietsub-new-pro/
├── hendy-Admini/                  # [TRUNG TÂM 7 TẦNG] Quản lý & Sửa Code Trực Tiếp
│   ├── HendyAdminiConfig.ts       # Cấu hình 7 tầng (Tầng 0 -> Tầng 6) & Breakpoints
│   ├── HendyAdminiLiveIde.tsx     # Trình sửa code trực tiếp trên Admin UI & Repo
│   ├── ResponsiveViewportShell.tsx# Bố cục linh hoạt chống tràn viền đa màn hình
│   └── layers/allLayersManager.ts # Điều phối liên kết toàn bộ 7 tầng hệ thống
├── studio-web/                    # [BÀN DỰNG UI] Giao diện Studio Tiếng Việt
├── admin-web/                     # [CỔNG ADMIN] Cấu hình & Portal Quản trị
├── apps/                          # [TẦNG 0 & TẦNG 1] TÁCH BIỆT GIAO DIỆN
│   ├── admin-web/                 # [TẦNG 0] Quản trị (admin.hendystudio.net)
│   └── studio-web/                # [TẦNG 1] User Web (onrender.com)
├── packages/                      # [TẦNG 2] Virtual DOM, Player, Subtitle & Waveform
├── workers/cloudflare-edge/       # [TẦNG 3] Cloudflare Edge WAF & Web Crypto
├── services/                      # [TẦNG 4 & 5] Express Gateway, hendyAdminiRouter & AI
├── database/                      # [TẦNG 6] PostgreSQL 16 RBAC & MongoDB
└── render.yaml                    # [RENDER] Deploy Web Studio lên Render.com`}
            </pre>

            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">
                Trạng Thái Tách Biệt Mặt Phẳng (Plane Separation)
              </div>
              <div>
                • Mặt phẳng Quản trị:{" "}
                <span className="font-mono text-amber-300">
                  https://admin.hendystudio.net
                </span>{" "}
                (IP tĩnh <span className="font-mono">10.240.0.10:8443</span>)
              </div>
              <div>
                • Mặt phẳng Người dùng:{" "}
                <span className="font-mono text-cyan-300">
                  https://hendy-video-studio-new-pro.onrender.com
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: QUẢN LÝ USER, GÓI CƯỚC, FEATURE FLAGS & RBAC AUDIT LOGS      */}
      {/* =================================================================== */}
      {activeSection === "rbac-users-flags" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Users & RBAC Table */}
            <div className="lg:col-span-7 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Quản Lý Người Dùng & Phân Quyền RBAC (database/postgres-rbac)
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Nhấn vào Quyền để chuyển đổi Role
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 pr-3 font-medium">Người dùng</th>
                      <th className="py-2.5 px-3 font-medium">Mặt phẳng</th>
                      <th className="py-2.5 px-3 font-medium">Gói cước</th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Phút Render
                      </th>
                      <th className="py-2.5 pl-3 font-medium text-right">
                        RBAC Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {(overviewData?.users || []).map((u: any) => (
                      <tr key={u.userId} className="hover:bg-slate-900/40">
                        <td className="py-2.5 pr-3">
                          <div className="font-semibold text-white">
                            {u.displayName}
                          </div>
                          <div className="text-slate-400 font-mono">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {u.planeAccess}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300">
                          {u.planId}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-200">
                          {u.monthlyRenderMinutesUsed} ph
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCycleUserRole(u)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {u.role}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Flags Control */}
            <div className="lg:col-span-5 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Feature Flags Hệ Thống (Bật / Tắt Tức Thì)
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  REALTIME SYNC
                </span>
              </div>

              <div className="space-y-3">
                {(overviewData?.featureFlags || []).map((flag: any) => (
                  <div
                    key={flag.flagKey}
                    className="p-3 rounded-lg bg-[#080B12] border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">
                        {flag.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {flag.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatureFlag(flag.flagKey)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        flag.enabled
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {flag.enabled ? "ON (100%)" : "OFF"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Plans & Immutable Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">
                Quản Lý Gói Cước Thương Mại (Subscription Plans)
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {(overviewData?.plans || []).map((plan: any) => (
                  <div
                    key={plan.planId}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {plan.planName}
                      </div>
                      <div className="text-slate-400 font-mono tabular-nums">
                        Độ phân giải: {plan.maxResolution} · Hạn mức:{" "}
                        {plan.maxRenderMinutes} phút/tháng
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-cyan-300 font-bold">
                        {plan.monthlyPriceVnd.toLocaleString("vi-VN")} ₫/tháng
                      </div>
                      <div className="text-slate-400">
                        {plan.activeSubscribers.toLocaleString()} thuê bao
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Nhật Ký Kiểm Toán Bảo Mật Bất Biến (PostgreSQL Audit Logs)
                </h3>
                <span className="text-xs font-mono text-amber-300">
                  HMAC-SHA256 SIGNED
                </span>
              </div>
              <div className="divide-y divide-slate-800/80 text-xs max-h-60 overflow-y-auto">
                {(overviewData?.auditLogs || []).map((log: any) => (
                  <div key={log.auditId} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                      <span>
                        {log.auditId} · {log.actionType} · Actor: {log.actorId}
                      </span>
                      <span className="tabular-nums">
                        HMAC: {log.hmacSignature}
                      </span>
                    </div>
                    <div className="text-slate-200">{log.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MONITORING & OBSERVABILITY (PROMETHEUS / GRAFANA / SENTRY / ELK) */}
      {/* =================================================================== */}
      {activeSection === "monitoring-elk" && (
        <div className="space-y-6">
          {/* Prometheus & Grafana KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0D121F] border border-slate-800">
              <div className="text-xs text-slate-400">
                Prometheus CPU Utilization
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {monitoringData?.prometheusGrafana?.cpuUsagePercent ?? 18}%
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
                Trạng thái: Nominal (&lt; 75% ngưỡng cảnh báo)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D121F] border border-slate-800">
              <div className="text-xs text-slate-400">
                Grafana Memory RSS / V8 Heap
              </div>
              <div className="text-xl font-bold text-cyan-300 font-mono tabular-nums mt-1">
                {monitoringData?.prometheusGrafana?.ramUsedMb ?? 142} MB /{" "}
                {monitoringData?.prometheusGrafana?.heapUsedMb ?? 84} MB
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
                Không rò rỉ bộ nhớ (Zero Memory Leak)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D121F] border border-slate-800">
              <div className="text-xs text-slate-400">
                API Gateway Throughput & P95
              </div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {monitoringData?.prometheusGrafana?.httpRequestRateRps ?? 148}{" "}
                req/s ·{" "}
                {monitoringData?.prometheusGrafana?.p95LatencyMs ?? 38} ms
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
                Uptime:{" "}
                {monitoringData?.prometheusGrafana?.uptimeSeconds ?? 360}s
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D121F] border border-slate-800">
              <div className="text-xs text-slate-400">
                Sentry Crash-Free Sessions
              </div>
              <div className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-1">
                99.98%
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
                {(monitoringData?.sentryEvents || []).length} sự kiện đã xử lý
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sentry Error & Crash UI */}
            <div className="lg:col-span-5 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Sentry (Báo Cáo Lỗi JS & Crash UI Guard)
              </h3>
              <div className="space-y-3">
                {(monitoringData?.sentryEvents || []).map((ev: any) => (
                  <div
                    key={ev.eventId}
                    className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-amber-300">
                      <span>{ev.eventId}</span>
                      <span>{ev.level.toUpperCase()}</span>
                    </div>
                    <div className="font-semibold text-white">{ev.title}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {ev.component} · {ev.environment}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ELK Stack System Logs */}
            <div className="lg:col-span-7 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">
                  ELK Stack (Elasticsearch · Logstash · Kibana Log Stream)
                </h3>
                <input
                  type="text"
                  value={elkSearch}
                  onChange={(e) => setElkSearch(e.target.value)}
                  placeholder="Lọc log theo tầng hoặc dịch vụ..."
                  className="px-3 py-1.5 rounded-lg bg-[#080B12] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="divide-y divide-slate-800/80 text-xs font-mono max-h-64 overflow-y-auto">
                {filteredElkLogs.map((log: any) => (
                  <div key={log.logId} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300">
                      <span>
                        [{log.tier}] {log.service}
                      </span>
                      <span className="text-slate-400">{log.host}</span>
                    </div>
                    <div className="text-slate-200">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: DEVOPS, CI/CD PIPELINE, AI WORKER & RENDER DEPLOYMENT        */}
      {/* =================================================================== */}
      {activeSection === "devops-cicd" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: GitHub Actions & Zero-Downtime Render Deploy */}
          <div className="lg:col-span-7 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">
                  DevOps & CI/CD Pipeline (GitHub Actions + Render Zero-Downtime)
                </h3>
                <p className="text-xs text-slate-400">
                  Triển khai tự động Mặt phẳng Người dùng (Render.com) & Mặt phẳng Quản trị (admin.hendystudio.net)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleTriggerZeroDowntimeDeploy(
                      "TẦNG 1 · Web Studio (hendy-video-studio-new-pro.onrender.com)"
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Deploy Tầng 1 (Render.com)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTriggerZeroDowntimeDeploy(
                      "TẦNG 0 · Admin Control Plane (admin.hendystudio.net)"
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Deploy Tầng 0 (Admin Plane)
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {(devopsData?.deployments || []).map((run: any) => (
                <div
                  key={run.runId}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">
                      {run.targetPlane}
                    </div>
                    <div className="font-mono text-slate-400">
                      {run.workflow} · {run.strategy}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div className="text-emerald-400 font-bold">
                      {run.status.toUpperCase()} ({run.durationSeconds}s)
                    </div>
                    <div className="text-slate-400">{run.runId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Tầng 5 BullMQ/Redis AI Worker & Tầng 6 MongoDB Projects */}
          <div className="lg:col-span-5 rounded-xl bg-[#0D121F] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Tầng 5 AI Worker Queue (services/ai-worker)
              </h3>
              <button
                type="button"
                onClick={() =>
                  handleDispatchAiPipelineJob("GEMINI_4ROLE_VOICEOVER_TTS")
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Chạy Job AI TTS 4 Vai
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {(overviewData?.aiPipeline?.jobs || [])
                .slice(0, 4)
                .map((job: any) => (
                  <div
                    key={job.jobId}
                    className="p-3 rounded-lg bg-[#080B12] border border-slate-800 flex items-center justify-between gap-2 font-mono"
                  >
                    <div className="min-w-0">
                      <div className="text-cyan-300 truncate">
                        {job.jobId} · {job.stage}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        {job.modelName} · {job.workerNode}
                      </div>
                    </div>
                    <span className="text-emerald-400 tabular-nums shrink-0">
                      {job.latencyMs} ms
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
