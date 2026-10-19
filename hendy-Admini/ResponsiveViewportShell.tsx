// =============================================================================
// 📁 THƯ MỤC TRUNG TÂM QUẢN TRỊ 7 TẦNG: /hendy-Admini/ResponsiveViewportShell.tsx
// Khung Bố Cục Linh Hoạt Tự Động Co Giãn Đa Màn Hình & Chống Tràn Viền Tuyệt Đối
// (Zero Edge-Overflow & Auto-Adaptive Responsive Shell)
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ResponsiveViewportPreset,
  VIEWPORT_PRESET_OPTIONS,
} from "./HendyAdminiConfig";

export interface ResponsiveViewportContextValue {
  viewportWidth: number;
  viewportHeight: number;
  deviceCategory: "mobile" | "tablet" | "laptop" | "desktop";
  activePreset: ResponsiveViewportPreset;
  setActivePreset: (preset: ResponsiveViewportPreset) => void;
  isCompactViewport: boolean;
}

const ResponsiveViewportContext = createContext<ResponsiveViewportContextValue>({
  viewportWidth: 1440,
  viewportHeight: 900,
  deviceCategory: "desktop",
  activePreset: "fluid_auto",
  setActivePreset: () => {},
  isCompactViewport: false,
});

export const useResponsiveViewport = (): ResponsiveViewportContextValue =>
  useContext(ResponsiveViewportContext);

export interface ResponsiveViewportShellProps {
  children: React.ReactNode;
}

export const ResponsiveViewportShell: React.FC<ResponsiveViewportShellProps> = ({
  children,
}) => {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const [activePreset, setActivePreset] =
    useState<ResponsiveViewportPreset>("fluid_auto");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveWidth =
    activePreset === "mobile_375"
      ? Math.min(viewportWidth, 420)
      : activePreset === "tablet_768"
      ? Math.min(viewportWidth, 768)
      : activePreset === "laptop_1280"
      ? Math.min(viewportWidth, 1280)
      : viewportWidth;

  const deviceCategory: "mobile" | "tablet" | "laptop" | "desktop" =
    effectiveWidth < 640
      ? "mobile"
      : effectiveWidth < 1024
      ? "tablet"
      : effectiveWidth < 1440
      ? "laptop"
      : "desktop";

  const isCompactViewport = effectiveWidth < 1024;

  const currentPresetOption =
    VIEWPORT_PRESET_OPTIONS.find((opt) => opt.id === activePreset) ||
    VIEWPORT_PRESET_OPTIONS[0];

  return (
    <ResponsiveViewportContext.Provider
      value={{
        viewportWidth: effectiveWidth,
        viewportHeight,
        deviceCategory,
        activePreset,
        setActivePreset,
        isCompactViewport,
      }}
    >
      <div className="w-full max-w-full min-h-dvh overflow-x-hidden bg-[#07090E] text-slate-100 flex flex-col box-border">
        <div
          className={`w-full min-w-0 flex-1 flex flex-col overflow-x-hidden transition-all duration-200 ${currentPresetOption.maxWidthClass}`}
        >
          {children}
        </div>
      </div>
    </ResponsiveViewportContext.Provider>
  );
};

export default ResponsiveViewportShell;
