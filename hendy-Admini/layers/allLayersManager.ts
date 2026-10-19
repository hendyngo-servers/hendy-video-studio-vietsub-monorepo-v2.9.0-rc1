// =============================================================================
// 📁 THƯ MỤC TRUNG TÂM QUẢN TRỊ 7 TẦNG: /hendy-Admini/layers/allLayersManager.ts
// Liên kết trực tiếp cả 7 tầng hệ thống (Tầng 0 -> Tầng 6) vào một điểm điều phối
// duy nhất trong thư mục `/hendy-Admini`.
// =============================================================================

import { HENDY_ADMINI_LAYERS, SystemLayerId } from "../HendyAdminiConfig";

// Tầng 0: Admin Control Plane & Network Gateway
export * from "../../admin-web";
export * from "../../src/config/adminNetworkConfig";

// Tầng 1 & Tầng 2: Client Tier & Frontend Engine (Studio Web)
export * from "../../studio-web";

export interface LayerHealthSummary {
  layerId: SystemLayerId;
  tierCode: string;
  name: string;
  editableInRepo: boolean;
  editableInAdminUi: boolean;
  zeroOverflowCompliant: boolean;
  directories: string[];
  keyFilesCount: number;
}

export function getAllManagedLayersSummary(): LayerHealthSummary[] {
  return HENDY_ADMINI_LAYERS.map((layer) => ({
    layerId: layer.id,
    tierCode: layer.tierCode,
    name: layer.fullName,
    editableInRepo: true,
    editableInAdminUi: true,
    zeroOverflowCompliant: true,
    directories: layer.directories,
    keyFilesCount: layer.keyFiles.length,
  }));
}

export function detectLayerForFilePath(filePath: string): {
  layerId: SystemLayerId;
  tierCode: string;
  shortTitle: string;
} {
  const normalized = filePath.replace(/^\/+/, "");
  if (
    normalized.startsWith("hendy-Admini/") ||
    normalized.startsWith("admin-web/") ||
    normalized.startsWith("apps/admin-web/") ||
    normalized === "src/admin-router.tsx"
  ) {
    return {
      layerId: "TIER_0",
      tierCode: "TẦNG 0",
      shortTitle: "Admin Control Plane (hendy-Admini)",
    };
  }
  if (
    normalized.startsWith("packages/ui-components/") ||
    normalized.startsWith("apps/studio-web/engine/") ||
    normalized.startsWith("apps/studio-web/workers/") ||
    normalized.startsWith("apps/studio-web/state/") ||
    normalized.includes("AudioWaveformTimeline") ||
    normalized.includes("VideoPlayer") ||
    normalized.includes("SubtitleList")
  ) {
    return {
      layerId: "TIER_2",
      tierCode: "TẦNG 2",
      shortTitle: "Frontend Engine",
    };
  }
  if (
    normalized.startsWith("studio-web/") ||
    normalized.startsWith("apps/studio-web/") ||
    normalized.startsWith("src/")
  ) {
    return {
      layerId: "TIER_1",
      tierCode: "TẦNG 1",
      shortTitle: "Client & Studio UI",
    };
  }
  if (normalized.startsWith("workers/")) {
    return {
      layerId: "TIER_3",
      tierCode: "TẦNG 3",
      shortTitle: "Cloud Edge & WAF",
    };
  }
  if (
    normalized.startsWith("services/ai-worker/") ||
    normalized.includes("geminiService")
  ) {
    return {
      layerId: "TIER_5",
      tierCode: "TẦNG 5",
      shortTitle: "AI & Media Workers",
    };
  }
  if (normalized.startsWith("database/")) {
    return {
      layerId: "TIER_6",
      tierCode: "TẦNG 6",
      shortTitle: "Data & Storage S.O.T",
    };
  }
  return {
    layerId: "TIER_4",
    tierCode: "TẦNG 4",
    shortTitle: "Backend Orchestration",
  };
}
