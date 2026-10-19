// =============================================================================
// [TẦNG 1 & 2] HENDY STUDIO PRO - USER STUDIO WEB (apps/studio-web/src/index.ts)
// Tự động đồng bộ hóa với thư mục chuyên dụng /studio-web/
// =============================================================================

export * from "../../../studio-web";
export { StudioWebApp } from "./App";
export {
  StudioWorkspace,
  type StudioWorkspaceProps,
  type StudioSubMode,
} from "./components/StudioWorkspace";
export {
  studioReduxStore,
  useStudioReduxSelector,
  useStudioReduxDispatch,
  type StudioReduxState,
} from "../state/studioReduxStore";
export {
  generateAcousticWaveformPeaks,
  computeDeterministicWaveformPeaks,
} from "../workers/audioWaveWorker";
export {
  ffmpegWasmClientEngine,
  runFfmpegWasmClientBenchmark,
  type FfmpegRenderBenchmark,
} from "../engine/ffmpegWasmEngine";
