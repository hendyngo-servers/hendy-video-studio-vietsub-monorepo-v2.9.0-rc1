// =============================================================================
// 📁 API QUẢN LÝ & CHỈNH SỬA MÃ NGUỒN 7 TẦNG TRỰC TIẾP (/api/hendy-admini/*)
// Đường dẫn: services/api-gateway/hendyAdminiRouter.ts
// Cho phép đọc, chỉnh sửa, tạo mới và đồng bộ tệp mã nguồn trực tiếp từ
// Giao diện Quản trị (Admin UI) cũng như trong kho lưu trữ (/hendy-Admini).
// =============================================================================

import express from "express";
import fs from "fs";
import path from "path";
import { runWorkspaceAutoSync } from "../../scripts/auto-sync-workspaces.js";
import { postgresRbacRepo } from "../../database/postgres-rbac/repository";

export const hendyAdminiRouter = express.Router();

function authenticatedActor(res: express.Response): string {
  const identity = res.locals.adminAccessClaims as { email?: string | null; sub?: string | null } | undefined;
  return String(identity?.email || identity?.sub || "local-development-admin");
}

const ROOT_DIR = process.cwd();

const MANAGED_SCAN_DIRS = [
  "hendy-Admini",
  "studio-web",
  "admin-web",
  "src",
  "apps",
  "packages",
  "services",
  "workers",
  "database",
  "scripts",
];

const ROOT_EDITABLE_FILES = [
  "server.ts",
  "vite.config.ts",
  "tsconfig.json",
  "package.json",
  "index.html",
];

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".html",
  ".md",
  ".yaml",
  ".yml",
]);

function resolveSafeRepoPath(relativePath: string): string | null {
  const cleaned = String(relativePath || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");
  if (!cleaned || cleaned.includes("..")) return null;
  const resolved = path.resolve(ROOT_DIR, cleaned);
  if (!resolved.startsWith(ROOT_DIR)) return null;
  return resolved;
}

function collectFilesRecursively(
  dirFullPath: string,
  relPrefix: string,
  acc: Array<{
    path: string;
    name: string;
    directory: string;
    sizeBytes: number;
    updatedAt: string;
  }>
) {
  if (!fs.existsSync(dirFullPath)) return;
  const entries = fs.readdirSync(dirFullPath, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "node_modules" ||
      entry.name === "dist"
    ) {
      continue;
    }
    const fullChild = path.join(dirFullPath, entry.name);
    const relChild = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      collectFilesRecursively(fullChild, relChild, acc);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        const stat = fs.statSync(fullChild);
        acc.push({
          path: relChild,
          name: entry.name,
          directory: relPrefix.split("/")[0] || "root",
          sizeBytes: stat.size,
          updatedAt: stat.mtime.toISOString(),
        });
      }
    }
  }
}

// 1. GET /api/hendy-admini/tree — Quét toàn bộ cây thư mục 7 tầng & /hendy-Admini
hendyAdminiRouter.get("/tree", (_req, res) => {
  try {
    const files: Array<{
      path: string;
      name: string;
      directory: string;
      sizeBytes: number;
      updatedAt: string;
    }> = [];

    for (const dirName of MANAGED_SCAN_DIRS) {
      collectFilesRecursively(path.join(ROOT_DIR, dirName), dirName, files);
    }

    for (const rootFile of ROOT_EDITABLE_FILES) {
      const fullRootFile = path.join(ROOT_DIR, rootFile);
      if (fs.existsSync(fullRootFile)) {
        const stat = fs.statSync(fullRootFile);
        files.push({
          path: rootFile,
          name: rootFile,
          directory: "root",
          sizeBytes: stat.size,
          updatedAt: stat.mtime.toISOString(),
        });
      }
    }

    // Ưu tiên hiển thị các tệp trong /hendy-Admini, /studio-web, /admin-web lên đầu
    files.sort((a, b) => {
      const priority = (p: string) =>
        p.startsWith("hendy-Admini/")
          ? 0
          : p.startsWith("studio-web/")
          ? 1
          : p.startsWith("admin-web/")
          ? 2
          : p.startsWith("src/")
          ? 3
          : 4;
      const diff = priority(a.path) - priority(b.path);
      return diff !== 0 ? diff : a.path.localeCompare(b.path);
    });

    res.json({
      ok: true,
      hubDirectory: "/hendy-Admini",
      totalFiles: files.length,
      files,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: "Lỗi khi quét cây thư mục: " + (err?.message || ""),
    });
  }
});

// 2. GET /api/hendy-admini/file?path=... — Đọc nội dung tệp bất kỳ
hendyAdminiRouter.get("/file", (req, res) => {
  const relPath = String(req.query.path || "");
  const fullPath = resolveSafeRepoPath(relPath);
  if (!fullPath || !fs.existsSync(fullPath)) {
    return res.status(404).json({
      ok: false,
      message: `Không tìm thấy tệp: ${relPath}`,
    });
  }

  try {
    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const cleanRel = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");
    res.json({
      ok: true,
      path: cleanRel,
      content,
      sizeBytes: stat.size,
      lineCount: content.split("\n").length,
      updatedAt: stat.mtime.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: "Lỗi khi đọc tệp: " + (err?.message || ""),
    });
  }
});

// 3. POST /api/hendy-admini/save — Lưu chỉnh sửa trực tiếp từ Admin UI & tự động đồng bộ
hendyAdminiRouter.post("/save", (req, res) => {
  const { path: relPath, content } = req.body || {};
  const fullPath = resolveSafeRepoPath(String(relPath || ""));
  if (!fullPath || typeof content !== "string") {
    return res.status(400).json({
      ok: false,
      message: "Đường dẫn tệp hoặc nội dung không hợp lệ.",
    });
  }

  try {
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, "utf8");
    const syncInfo = runWorkspaceAutoSync();
    const stat = fs.statSync(fullPath);
    const cleanRel = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");

    postgresRbacRepo.recordAuditLog(
      authenticatedActor(res),
      "HENDY_ADMINI_LIVE_FILE_EDIT",
      cleanRel,
      `Edited and auto-synced ${cleanRel} (${stat.size} bytes)`
    );

    res.json({
      ok: true,
      path: cleanRel,
      sizeBytes: stat.size,
      lineCount: content.split("\n").length,
      updatedAt: stat.mtime.toISOString(),
      syncInfo,
      message: `Đã lưu tệp /${cleanRel} và tự động đồng bộ mã nguồn 7 tầng thành công!`,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: "Không thể lưu tệp: " + (err?.message || ""),
    });
  }
});

// 4. POST /api/hendy-admini/create — Tạo tệp hoặc mô-đun mới trong /hendy-Admini hoặc tầng bất kỳ
hendyAdminiRouter.post("/create", (req, res) => {
  const {
    path: relPath,
    content = "",
  } = req.body || {};
  const fullPath = resolveSafeRepoPath(String(relPath || ""));
  if (!fullPath) {
    return res.status(400).json({
      ok: false,
      message: "Đường dẫn tệp mới không hợp lệ.",
    });
  }

  try {
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fullPath, String(content), "utf8");
    const syncInfo = runWorkspaceAutoSync();
    const cleanRel = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");

    postgresRbacRepo.recordAuditLog(
      authenticatedActor(res),
      "HENDY_ADMINI_FILE_CREATE",
      cleanRel,
      `Created new file ${cleanRel} via Admin UI`
    );

    res.json({
      ok: true,
      path: cleanRel,
      syncInfo,
      message: `Đã khởi tạo tệp /${cleanRel} và tự động cập nhật liên kết hệ thống!`,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: "Lỗi khi tạo tệp mới: " + (err?.message || ""),
    });
  }
});

// 5. POST /api/hendy-admini/sync — Đồng bộ toàn bộ không gian làm việc theo yêu cầu
hendyAdminiRouter.post("/sync", (_req, res) => {
  try {
    const syncInfo = runWorkspaceAutoSync();
    res.json({
      ok: true,
      syncInfo,
      message:
        "Đã đồng bộ tự động /hendy-Admini, /studio-web, /admin-web và toàn bộ 7 tầng hệ thống!",
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: "Lỗi khi đồng bộ: " + (err?.message || ""),
    });
  }
});
