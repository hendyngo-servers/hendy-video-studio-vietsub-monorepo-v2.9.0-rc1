import { spawnSync } from 'node:child_process';
import { runWorkspaceAutoSync } from './auto-sync-workspaces.js';

runWorkspaceAutoSync();
const icons = spawnSync(process.execPath, ['scripts/generate-icons.js'], { stdio: 'inherit' });
if (icons.status !== 0) process.exit(icons.status ?? 1);
process.env.HENDY_BUILD_TARGET = 'public-pages';
const { build } = await import('vite');
await build();
