import React, { useState, useEffect } from "react";
import {
  Cpu,
  Layers,
  Activity,
  Play,
  Sliders,
  CheckCircle2,
  Volume2,
  Film,
} from "lucide-react";
import {
  studioReduxStore,
  StudioEngineState,
} from "../../apps/studio-web/state/studioReduxStore";
import {
  runFfmpegWasmClientBenchmark,
  FfmpegWasmRenderResult,
} from "../../apps/studio-web/engine/ffmpegWasmEngine";
import {
  computeAudioWaveformInWorker,
  AudioWaveformComputation,
} from "../../apps/studio-web/workers/audioWaveWorker";

export interface FrontendEngineInteractiveBenchProps {
  onOpenStudioEditor?: () => void;
}

export const FrontendEngineInteractiveBench: React.FC<
  FrontendEngineInteractiveBenchProps
> = ({ onOpenStudioEditor }) => {
  const [engineState, setEngineState] = useState<StudioEngineState>(() =>
    studioReduxStore.getState()
  );
  const [renderResult, setRenderResult] =
    useState<FfmpegWasmRenderResult | null>(null);
  const [waveform, setWaveform] = useState<AudioWaveformComputation>(() =>
    computeAudioWaveformInWorker(48)
  );
  const [virtualScrollOffset, setVirtualScrollOffset] = useState<number>(0);
  const [isRunningWasm, setIsRunningWasm] = useState<boolean>(false);

  useEffect(() => {
    return studioReduxStore.subscribe(setEngineState);
  }, []);

  const handleRunWasmRender = async () => {
    setIsRunningWasm(true);
    try {
      const res = await runFfmpegWasmClientBenchmark(240, "4K");
      setRenderResult(res);
    } finally {
      setIsRunningWasm(false);
    }
  };

  const handleRecomputeWaveform = () => {
    const next = computeAudioWaveformInWorker(48);
    setWaveform(next);
  };

  const handleSimulateDomVirtualScroll = (targetStartCue: number) => {
    setVirtualScrollOffset(targetStartCue);
    studioReduxStore.dispatch({
      virtualizedCueCount: 10000,
      visibleDomNodes: 18,
      frameRateFps: 60,
    });
  };

  const virtualWindowRows = Array.from({ length: 5 }, (_, idx) => {
    const cueNumber = virtualScrollOffset + idx + 1;
    const startSec = cueNumber * 2.5;
    const endSec = startSec + 2.2;
    const speakerRoles = ["Nam Chính", "Nữ Chính", "Người Già", "Trẻ Em"];
    return {
      cueNumber,
      timecode: `${Math.floor(startSec / 60)
        .toString()
        .padStart(2, "0")}:${(startSec % 60).toFixed(1).padStart(4, "0")} → ${Math.floor(
        endSec / 60
      )
        .toString()
        .padStart(2, "0")}:${(endSec % 60).toFixed(1).padStart(4, "0")}`,
      speaker: speakerRoles[cueNumber % speakerRoles.length],
      viText: `Dòng phụ đề song ngữ #${cueNumber} được ảo hóa DOM mượt mà ở tốc độ 60fps.`,
    };
  });

  return (
    <div className="rounded-xl bg-[#0D111A] border border-slate-800 p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>TẦNG 2 · FRONTEND ENGINE</span>
            <span aria-hidden="true">·</span>
            <span>packages/ui-components & apps/studio-web</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            02. Kiến Trúc Frontend Engine: Redux State, FFmpeg.wasm, DOM Virtualization & Web Workers
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRunWasmRender}
            disabled={isRunningWasm}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRunningWasm
              ? "Đang kết xuất FFmpeg.wasm..."
              : "Chạy Thử FFmpeg.wasm (4K Render)"}
          </button>
          <button
            type="button"
            onClick={handleRecomputeWaveform}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Giải Mã Sóng Âm (Web Worker)
          </button>
          {onOpenStudioEditor && (
            <button
              type="button"
              onClick={onOpenStudioEditor}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-medium text-xs border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mở Bàn Dựng VideoPlayer & SubtitleList
            </button>
          )}
        </div>
      </div>

      {/* 4 Telemetry Metrics Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#090C12] border border-slate-800/90">
          <div className="text-xs text-slate-400">Redux Store & Virtual DOM</div>
          <div className="text-lg font-bold text-white font-mono tabular-nums mt-1">
            {engineState.visibleDomNodes} /{" "}
            {engineState.virtualizedCueCount.toLocaleString()} nodes
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Tốc độ khung hình: {engineState.frameRateFps} FPS ổn định
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#090C12] border border-slate-800/90">
          <div className="text-xs text-slate-400">
            FFmpeg.wasm (Client Render)
          </div>
          <div className="text-lg font-bold text-cyan-300 font-mono tabular-nums mt-1">
            {engineState.lastClientRenderMs} ms / frame-batch
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            SIMD Threads: {engineState.ffmpegWasmSimdThreads} luồng song song
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#090C12] border border-slate-800/90">
          <div className="text-xs text-slate-400">
            Web Worker (Audio Waveform)
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {engineState.audioWorkerPeaksComputed.toLocaleString()} peaks
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Thời gian tách luồng: {engineState.audioWorkerDurationMs} ms
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#090C12] border border-slate-800/90">
          <div className="text-xs text-slate-400">
            VideoPlayer & SubtitleList Sync
          </div>
          <div className="text-lg font-bold text-amber-300 font-mono tabular-nums mt-1">
            ±0.4 ms drift
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            SubtitlesOctopus ASS + Audio Ducking
          </div>
        </div>
      </div>

      {/* Split View: DOM Virtualization Window + Web Worker Audio Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: DOM Virtualization Live Scroller */}
        <div className="lg:col-span-7 rounded-lg bg-[#090C12] border border-slate-800 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-white">
              DOM Virtualization (10,000 Dòng Phụ Đề · Chỉ Render Cửa Sổ Nhìn Thấy)
            </div>
            <div className="flex items-center gap-1">
              {[0, 2500, 5000, 9990].map((offset) => (
                <button
                  key={offset}
                  type="button"
                  onClick={() => handleSimulateDomVirtualScroll(offset)}
                  className={`px-2.5 py-1 rounded text-xs font-mono tabular-nums transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    virtualScrollOffset === offset
                      ? "bg-cyan-400 text-slate-950 font-semibold"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  #{offset + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {virtualWindowRows.map((row) => (
              <div
                key={row.cueNumber}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono tabular-nums text-cyan-300 w-14 shrink-0">
                    #{row.cueNumber}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400 shrink-0 hidden sm:inline">
                    {row.timecode}
                  </span>
                  <span className="text-slate-200 truncate">{row.viText}</span>
                </div>
                <span className="text-slate-400 font-mono shrink-0">
                  {row.speaker}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Web Worker Audio Waveform & FFmpeg.wasm Output */}
        <div className="lg:col-span-5 rounded-lg bg-[#090C12] border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">
                Web Worker Acoustic Waveform (Off-Main-Thread)
              </span>
              <span className="font-mono tabular-nums text-emerald-400">
                {waveform.detectedSpeechSegments} đoạn thoại
              </span>
            </div>

            <div className="h-20 flex items-end gap-1 pt-2 px-1">
              {waveform.peaks.slice(0, 36).map((peak, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-cyan-400/75 hover:bg-cyan-300 transition-opacity rounded-t"
                  style={{ height: `${ Math.max(15, peak) }%` }}
                  title={`Peak #${idx + 1}: ${peak}%`}
                />
              ))}
            </div>
          </div>

          {renderResult ? (
            <div className="p-3 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-emerald-400">
                FFmpeg.wasm Hoàn Tất ({renderResult.elapsedMs} ms ·{" "}
                {renderResult.outputSizeMb} MB)
              </div>
              <div className="text-slate-300 truncate">
                {renderResult.command}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
              Nhấn &ldquo;Chạy Thử FFmpeg.wasm&rdquo; để kiểm chứng pipeline đóng gói phụ đề ASS ngay trên trình duyệt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
