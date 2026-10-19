// =============================================================================
// 📁 THƯ MỤC TRUNG TÂM QUẢN TRỊ 7 TẦNG: /hendy-Admini/HendyAdminiLiveIde.tsx
// Trình Quản Lý 7 Tầng & Chỉnh Sửa Mã Nguồn Trực Tiếp (Live Repository & Admin IDE)
// Cho phép chỉnh sửa mọi tệp trong /hendy-Admini, /studio-web, /admin-web, /src,
// /apps, /services, /workers, /database ngay trên Giao diện Quản trị hoặc trong Repo,
// tự động đồng bộ mã nguồn và sinh tệp liên kết mà không phát sinh lỗi.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  FileCode2,
  Save,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Maximize2,
  FolderPlus,
  Copy,
  Check,
  Terminal,
} from "lucide-react";
import {
  HENDY_ADMINI_LAYERS,
  SystemLayerId,
  VIEWPORT_PRESET_OPTIONS,
} from "./HendyAdminiConfig";
import { detectLayerForFilePath } from "./layers/allLayersManager";
import { useResponsiveViewport } from "./ResponsiveViewportShell";

export interface RepoFileEntry {
  path: string;
  name: string;
  directory: string;
  sizeBytes: number;
  updatedAt: string;
  layerId: SystemLayerId;
  tierCode: string;
  layerTitle: string;
}

export interface HendyAdminiLiveIdeProps {
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
  initialFilePath?: string;
}

export const HendyAdminiLiveIde: React.FC<HendyAdminiLiveIdeProps> = ({
  onNotify,
  initialFilePath = "hendy-Admini/HendyAdminiConfig.ts",
}) => {
  const {
    viewportWidth,
    viewportHeight,
    deviceCategory,
    activePreset,
    setActivePreset,
  } = useResponsiveViewport();

  const [files, setFiles] = useState<RepoFileEntry[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<SystemLayerId>("ALL");
  const [selectedDirFilter, setSelectedDirFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeFilePath, setActiveFilePath] = useState<string>(initialFilePath);
  const [fileContent, setFileContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [fileMeta, setFileMeta] = useState<{
    sizeBytes: number;
    lineCount: number;
    updatedAt: string;
  } | null>(null);

  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);

  // Create new file modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newFilePathInput, setNewFilePathInput] = useState<string>(
    "hendy-Admini/layers/customModule.ts"
  );
  const [newFileTemplateContent, setNewFileTemplateContent] = useState<string>(
    `// =============================================================================\n// 📁 Mô-đun tùy chỉnh trong /hendy-Admini\n// Tự động đồng bộ với toàn bộ 7 tầng hệ thống Hendy Studio Pro\n// =============================================================================\n\nexport const CUSTOM_MODULE_READY = true;\n`
  );

  const fetchRepositoryTree = useCallback(async () => {
    setIsLoadingTree(true);
    try {
      const res = await fetch("/api/hendy-admini/tree");
      const data = await res.json();
      if (data.ok && Array.isArray(data.files)) {
        const enriched: RepoFileEntry[] = data.files.map((f: any) => {
          const layerInfo = detectLayerForFilePath(f.path);
          return {
            ...f,
            layerId: layerInfo.layerId,
            tierCode: layerInfo.tierCode,
            layerTitle: layerInfo.shortTitle,
          };
        });
        setFiles(enriched);
      }
    } catch (err: any) {
      onNotify?.(
        "Không thể tải danh sách tệp từ máy chủ: " + (err?.message || ""),
        "error"
      );
    } finally {
      setIsLoadingTree(false);
    }
  }, [onNotify]);

  const loadFileContent = useCallback(
    async (targetPath: string) => {
      if (!targetPath) return;
      setIsLoadingFile(true);
      try {
        const res = await fetch(
          `/api/hendy-admini/file?path=${encodeURIComponent(targetPath)}`
        );
        const data = await res.json();
        if (data.ok) {
          setActiveFilePath(data.path);
          setFileContent(data.content);
          setOriginalContent(data.content);
          setFileMeta({
            sizeBytes: data.sizeBytes || data.content.length,
            lineCount: data.lineCount || data.content.split("\n").length,
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        } else {
          onNotify?.(data.message || "Không thể mở tệp.", "error");
        }
      } catch (err: any) {
        onNotify?.("Lỗi khi đọc tệp: " + (err?.message || ""), "error");
      } finally {
        setIsLoadingFile(false);
      }
    },
    [onNotify]
  );

  useEffect(() => {
    fetchRepositoryTree();
    loadFileContent(initialFilePath);
  }, [fetchRepositoryTree, loadFileContent, initialFilePath]);

  const handleSaveActiveFile = useCallback(async () => {
    if (!activeFilePath) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/hendy-admini/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: activeFilePath,
          content: fileContent,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setOriginalContent(fileContent);
        setFileMeta({
          sizeBytes: data.sizeBytes,
          lineCount: data.lineCount,
          updatedAt: data.updatedAt,
        });
        fetchRepositoryTree();
        onNotify?.(
          data.message ||
            `Đã lưu và tự động đồng bộ tệp ${activeFilePath} thành công!`,
          "success"
        );
      } else {
        onNotify?.(data.message || "Không thể lưu tệp.", "error");
      }
    } catch (err: any) {
      onNotify?.("Lỗi khi lưu tệp: " + (err?.message || ""), "error");
    } finally {
      setIsSaving(false);
    }
  }, [activeFilePath, fileContent, fetchRepositoryTree, onNotify]);

  // Keyboard shortcut Ctrl+S / Cmd+S to save directly in the Admin IDE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveActiveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveActiveFile]);

  const handleTriggerAutoSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/hendy-admini/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        fetchRepositoryTree();
        onNotify?.(
          data.message ||
            "Đã đồng bộ tự động /hendy-Admini, /studio-web, /admin-web và seluruh 7 tầng!",
          "success"
        );
      }
    } catch {
      onNotify?.("Lỗi đồng bộ không gian làm việc.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewFile = async () => {
    const cleanPath = newFilePathInput.trim().replace(/^\/+/, "");
    if (!cleanPath) return;
    try {
      const res = await fetch("/api/hendy-admini/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: cleanPath,
          content: newFileTemplateContent,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsCreateModalOpen(false);
        await fetchRepositoryTree();
        await loadFileContent(cleanPath);
        onNotify?.(
          data.message ||
            `Đã khởi tạo tệp ${cleanPath} và tự động cập nhật liên kết!`,
          "success"
        );
      } else {
        onNotify?.(data.message || "Không thể tạo tệp mới.", "error");
      }
    } catch (err: any) {
      onNotify?.("Lỗi khi tạo tệp: " + (err?.message || ""), "error");
    }
  };

  const hasUnsavedChanges = fileContent !== originalContent;
  const activeLayerMeta = detectLayerForFilePath(activeFilePath);
  const currentLineCount = fileContent ? fileContent.split("\n").length : 1;

  const QUICK_DIRECTORY_PILLS = [
    { id: "ALL", label: "Tất cả thư mục" },
    { id: "hendy-Admini", label: "📁 hendy-Admini (Trung tâm 7 Tầng)" },
    { id: "studio-web", label: "📁 studio-web (Bàn dựng UI)" },
    { id: "admin-web", label: "📁 admin-web (Quản trị)" },
    { id: "src", label: "📁 src (Lõi Ứng Dụng)" },
    { id: "apps", label: "📁 apps (Monorepo Apps)" },
    { id: "services", label: "📁 services (API & AI Worker)" },
    { id: "database", label: "📁 database (PostgreSQL & Mongo)" },
  ];

  const filteredFiles = files.filter((file) => {
    if (selectedLayer !== "ALL" && file.layerId !== selectedLayer) {
      return false;
    }
    if (
      selectedDirFilter !== "ALL" &&
      !file.path.startsWith(selectedDirFilter + "/") &&
      file.directory !== selectedDirFilter
    ) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !file.path.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* =================================================================== */}
      {/* 1. TOP BANNER: HENDY-ADMINI 7-LAYER HUB & RESPONSIVE VIEWPORT BAR   */}
      {/* =================================================================== */}
      <div className="rounded-2xl bg-[#0D121F] border border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300">
              <span>THƯ MỤC CHUYÊN DỤNG: /hendy-Admini</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-300">
                QUẢN LÝ TOÀN BỘ 7 TẦNG (TẦNG 0 → TẦNG 6)
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">
                TRÌNH SỬA CODE TRỰC TIẾP & ĐỒNG BỘ TỰ ĐỘNG
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight break-words">
              Trung Tâm Điều Hành Mã Nguồn 7 Tầng & Bố Cục Đa Màn Hình (hendy-Admini)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Quản lý tập trung tất cả các tầng trong thư mục{" "}
              <code className="font-mono text-amber-300">/hendy-Admini</code>. Bạn có thể chỉnh sửa tệp trực tiếp trong kho lưu trữ (Repository) hoặc sửa ngay trên giao diện Quản trị bên dưới — hệ thống sẽ tự động lưu vào đĩa cứng, tạo thư mục liên quan và đồng bộ tức thì mà không phát sinh lỗi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Tạo Tệp / Mô-đun Mới</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerAutoSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>Đồng Bộ Tất Cả 7 Tầng</span>
            </button>

            <button
              type="button"
              onClick={handleSaveActiveFile}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {isSaving
                  ? "Đang lưu & đồng bộ..."
                  : hasUnsavedChanges
                  ? "Lưu Thay Đổi (Ctrl+S) *"
                  : "Lưu & Đồng Bộ Tệp (Ctrl+S)"}
              </span>
            </button>
          </div>
        </div>

        {/* Live Responsive Viewport Controller (Auto-Adjusting Screen Size Tester) */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white">
              Bộ Điều Khiển Bố Cục Linh Hoạt (Zero Edge-Overflow):
            </span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {viewportWidth}px × {viewportHeight}px ({deviceCategory.toUpperCase()})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#080B12] border border-slate-800">
            {VIEWPORT_PRESET_OPTIONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActivePreset(preset.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activePreset === preset.id
                    ? "bg-cyan-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {preset.id === "mobile_375" ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : preset.id === "tablet_768" ? (
                  <Tablet className="w-3.5 h-3.5" />
                ) : (
                  <Monitor className="w-3.5 h-3.5" />
                )}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 7-LAYER SELECTOR CARDS (CLICK TO FILTER & JUMP TO KEY FILES)     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedLayer("ALL")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-w-0 ${
            selectedLayer === "ALL"
              ? "bg-amber-400/15 border-amber-400 text-white"
              : "bg-[#0D121F] border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          <div className="text-[11px] font-mono text-amber-300 font-bold">
            ALL TIERS (0 → 6)
          </div>
          <div className="text-xs font-bold text-white mt-1 truncate">
            Toàn Bộ 7 Tầng
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
            {files.length} tệp mã nguồn
          </div>
        </button>

        {HENDY_ADMINI_LAYERS.map((layer) => {
          const count = files.filter((f) => f.layerId === layer.id).length;
          const isSelected = selectedLayer === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => {
                setSelectedLayer(layer.id);
                if (layer.keyFiles[0]) {
                  loadFileContent(layer.keyFiles[0]);
                }
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-w-0 ${
                isSelected
                  ? "bg-cyan-400/15 border-cyan-400 text-white"
                  : "bg-[#0D121F] border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="text-[11px] font-mono text-cyan-300 font-bold truncate">
                {layer.tierCode}
              </div>
              <div className="text-xs font-bold text-white mt-1 truncate">
                {layer.shortTitle.replace(/^Tầng \d+ · /, "")}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                {count} tệp · Sửa trực tiếp
              </div>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 3. DIRECTORY FILTER BAR & QUICK JUMP                                */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0D121F] border border-slate-800 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {QUICK_DIRECTORY_PILLS.map((dir) => (
            <button
              key={dir.id}
              type="button"
              onClick={() => setSelectedDirFilter(dir.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedDirFilter === dir.id
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "bg-[#080B12] text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              {dir.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tệp (VD: App.tsx, hendy-Admini)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#080B12] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MAIN IDE WORKSPACE (LEFT 4 COLS: TREE | RIGHT 8 COLS: EDITOR)    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-w-0">
        {/* LEFT COLUMN (4/12): REPOSITORY & LAYER FILE EXPLORER */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0D121F] border border-slate-800 flex flex-col overflow-hidden min-w-0">
          <div className="p-3.5 border-b border-slate-800 bg-[#090C15] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FolderTree className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate">
                Cây Thư Mục & Tệp ({filteredFiles.length})
              </span>
            </div>
            <button
              type="button"
              onClick={fetchRepositoryTree}
              className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 cursor-pointer shrink-0"
            >
              {isLoadingTree ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[540px] p-2 space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = file.path === activeFilePath;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => loadFileContent(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-start justify-between gap-2 cursor-pointer min-w-0 ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-400/50 text-white"
                      : "hover:bg-slate-800/50 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <FileCode2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          file.path.startsWith("hendy-Admini")
                            ? "text-amber-400"
                            : "text-cyan-400"
                        }`}
                      />
                      <span className="text-xs font-mono font-semibold truncate">
                        {file.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>{file.tierCode}</span>
                      <span>·</span>
                      <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredFiles.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <div>Không tìm thấy tệp phù hợp với bộ lọc hiện tại.</div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLayer("ALL");
                    setSelectedDirFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 font-semibold cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (8/12): LIVE CODE EDITOR & AUTO-SYNC CONSOLE */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0D121F] border border-slate-800 flex flex-col overflow-hidden min-w-0">
          {/* Editor Header Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-[#090C15] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white break-all">
                    /{activeFilePath}
                  </span>
                  <span className="text-[11px] font-mono text-amber-300">
                    {activeLayerMeta.tierCode} · {activeLayerMeta.shortTitle}
                  </span>
                  {hasUnsavedChanges && (
                    <span className="text-[11px] font-mono text-rose-400 font-semibold">
                      ● Chưa lưu
                    </span>
                  )}
                </div>
                {fileMeta && (
                  <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {currentLineCount} dòng · {(fileContent.length / 1024).toFixed(1)} KB · Tự động đồng bộ khi lưu
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fileContent);
                  setCopiedPath(true);
                  setTimeout(() => setCopiedPath(false), 2000);
                  onNotify?.(`Đã sao chép nội dung tệp ${activeFilePath}!`, "info");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPath ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedPath ? "Đã chép" : "Chép mã"}</span>
              </button>

              <button
                type="button"
                onClick={() => loadFileContent(activeFilePath)}
                disabled={isLoadingFile}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingFile ? "animate-spin" : ""}`}
                />
                <span>Tải lại tệp</span>
              </button>

              <button
                type="button"
                onClick={handleSaveActiveFile}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Đang lưu..." : "Lưu & Áp Dụng"}</span>
              </button>
            </div>
          </div>

          {/* Code Editor Textarea with Line Numbers */}
          <div className="relative flex-1 min-h-[460px] flex bg-[#07090E] overflow-hidden">
            <div
              aria-hidden="true"
              className="hidden sm:block py-4 px-2.5 bg-[#090C14] border-r border-slate-800/80 text-right font-mono text-[11px] leading-[1.6] text-slate-600 select-none overflow-hidden shrink-0 tabular-nums"
            >
              {Array.from({ length: Math.min(currentLineCount, 600) }).map(
                (_, i) => (
                  <div key={i}>{i + 1}</div>
                )
              )}
            </div>

            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full min-w-0 p-4 bg-[#07090E] text-slate-100 font-mono text-xs leading-[1.6] focus:outline-none resize-y overflow-auto"
              placeholder="Chọn một tệp ở danh sách bên trái để xem và chỉnh sửa trực tiếp..."
            />
          </div>

          {/* Editor Footer Status */}
          <div className="px-4 py-2.5 bg-[#090C15] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Chế độ: Chỉnh sửa trực tiếp trên Repository & Admin UI (Auto-Sync Enabled)
              </span>
            </div>
            <div>Phím tắt: Ctrl+S / Cmd+S để lưu và tự động cập nhật mã nguồn</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL: CREATE NEW FILE IN /hendy-Admini OR ANY LAYER                */}
      {/* =================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-[#0D121F] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Tạo Tệp / Mô-đun Mới Trong Kho Lưu Trữ</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Đường dẫn tệp mới (Tự động tạo thư mục cha nếu chưa có):
                </label>
                <input
                  type="text"
                  value={newFilePathInput}
                  onChange={(e) => setNewFilePathInput(e.target.value)}
                  placeholder="hendy-Admini/layers/newFeature.ts"
                  className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-slate-700 font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Nội dung khởi tạo:
                </label>
                <textarea
                  rows={6}
                  value={newFileTemplateContent}
                  onChange={(e) => setNewFileTemplateContent(e.target.value)}
                  spellCheck={false}
                  className="w-full p-3 rounded-xl bg-[#080B12] border border-slate-700 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateNewFile}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Tạo Tệp & Đồng Bộ Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HendyAdminiLiveIde;
