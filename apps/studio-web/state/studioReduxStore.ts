// =============================================================================
// [TẦNG 2] HENDY STUDIO PRO - REDUX STATE STORE (apps/studio-web/state/studioReduxStore.ts)
// Manages Subtitle Virtualization State, FFmpeg.wasm Client Render, & Audio Wave Worker
// =============================================================================

export interface StudioEngineState {
  activeProjectCode: string;
  virtualizedCueCount: number;
  visibleDomNodes: number;
  frameRateFps: number;
  ffmpegWasmReady: boolean;
  ffmpegWasmSimdThreads: number;
  lastClientRenderMs: number;
  audioWorkerPeaksComputed: number;
  audioWorkerDurationMs: number;
}

type Listener = (state: StudioEngineState) => void;

class StudioReduxStore {
  private state: StudioEngineState = {
    activeProjectCode: "PRJ-VIETSUB-4K-01",
    virtualizedCueCount: 10000,
    visibleDomNodes: 18,
    frameRateFps: 60,
    ffmpegWasmReady: true,
    ffmpegWasmSimdThreads: 4,
    lastClientRenderMs: 410,
    audioWorkerPeaksComputed: 16480,
    audioWorkerDurationMs: 28,
  };

  private listeners: Set<Listener> = new Set();

  public getState(): StudioEngineState {
    return this.state;
  }

  public dispatch(partial: Partial<StudioEngineState>): StudioEngineState {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.listeners.forEach((fn) => fn(this.state));
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const studioReduxStore = new StudioReduxStore();
