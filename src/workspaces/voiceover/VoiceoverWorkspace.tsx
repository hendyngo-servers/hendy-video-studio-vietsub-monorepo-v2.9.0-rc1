import React, { useState } from "react";
import {
  Volume2,
  Play,
  Square,
  Sliders,
  Check,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { SubtitleCue } from "../../types";

export interface CharacterVoiceProfile {
  id: string;
  label: string;
  roleDesc: string;
  pitch: number;
  rate: number;
  lang: string;
}

export const VOICE_PROFILES: CharacterVoiceProfile[] = [
  {
    id: "male_young",
    label: "Nam Trẻ (Minh Quang)",
    roleDesc: "Giọng nam chính trầm ấm, rõ chữ, phù hợp thuyết minh & nam chính",
    pitch: 0.95,
    rate: 1.05,
    lang: "vi-VN",
  },
  {
    id: "female_young",
    label: "Nữ Trẻ (Thanh Hà)",
    roleDesc: "Giọng nữ chính truyền cảm, tự nhiên, phù hợp phim ngôn tình & review",
    pitch: 1.15,
    rate: 1.05,
    lang: "vi-VN",
  },
  {
    id: "male_elder",
    label: "Ông Cụ (Bác Sơn)",
    roleDesc: "Giọng nam trầm sâu, nhịp đọc chậm rãi, uy nghiêm",
    pitch: 0.75,
    rate: 0.9,
    lang: "vi-VN",
  },
  {
    id: "female_elder",
    label: "Bà Cụ (Bà Hiền)",
    roleDesc: "Giọng nữ hiền hậu, điềm đạm, phù hợp vai trưởng bối",
    pitch: 0.88,
    rate: 0.92,
    lang: "vi-VN",
  },
  {
    id: "child",
    label: "Trẻ Em (Bé Bi)",
    roleDesc: "Giọng cao trong trẻo, nhịp điệu linh hoạt, tươi sáng",
    pitch: 1.4,
    rate: 1.12,
    lang: "vi-VN",
  },
];

interface VoiceoverWorkspaceProps {
  cues: SubtitleCue[];
  onUpdateCues: (cues: SubtitleCue[]) => void;
  isVoiceoverEnabled: boolean;
  onToggleVoiceover: (enabled: boolean) => void;
  onOpenAdvancedModal?: () => void;
  onNavigateToEditor: () => void;
}

export const VoiceoverWorkspace: React.FC<VoiceoverWorkspaceProps> = ({
  cues,
  isVoiceoverEnabled,
  onToggleVoiceover,
  onOpenAdvancedModal,
  onNavigateToEditor,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("female_young");
  const [cueVoices, setCueVoices] = useState<Record<number, string>>({});
  const [duckingLevel, setDuckingLevel] = useState<number>(25);
  const [speechRateMultiplier, setSpeechRateMultiplier] = useState<number>(1.0);
  const [playingCueId, setPlayingCueId] = useState<number | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const handleAutoAssignRoles = () => {
    const nextMap: Record<number, string> = {};
    cues.forEach((cue, index) => {
      const text = (cue.textVi || cue.textOriginal).toLowerCase();
      if (text.includes("ông") || text.includes("lão") || text.includes("trưởng bối")) {
        nextMap[cue.id] = "male_elder";
      } else if (text.includes("bà") || text.includes("mẹ già")) {
        nextMap[cue.id] = "female_elder";
      } else if (text.includes("bé") || text.includes("con ơi") || text.includes("em nhỏ")) {
        nextMap[cue.id] = "child";
      } else {
        nextMap[cue.id] = index % 2 === 0 ? "female_young" : "male_young";
      }
    });
    setCueVoices(nextMap);
    onToggleVoiceover(true);
    setStatusBanner(
      `Đã tự động phân vai giọng đọc cho ${cues.length} câu thoại và kích hoạt lồng tiếng.`
    );
  };

  const handleApplyProfileToAll = (profileId: string) => {
    setSelectedProfileId(profileId);
    const nextMap: Record<number, string> = {};
    cues.forEach((c) => {
      nextMap[c.id] = profileId;
    });
    setCueVoices(nextMap);
    onToggleVoiceover(true);
    const profile = VOICE_PROFILES.find((p) => p.id === profileId);
    setStatusBanner(`Đã áp dụng giọng "${profile?.label}" cho toàn bộ ${cues.length} câu thoại.`);
  };

  const handlePreviewCue = (cue: SubtitleCue) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (playingCueId === cue.id) {
      setPlayingCueId(null);
      return;
    }

    const profileId = cueVoices[cue.id] || selectedProfileId;
    const profile =
      VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];
    const utterance = new SpeechSynthesisUtterance(
      cue.textVi || cue.textOriginal
    );
    utterance.lang = profile.lang;
    utterance.pitch = profile.pitch;
    utterance.rate = Number((profile.rate * speechRateMultiplier).toFixed(2));
    utterance.onend = () => setPlayingCueId(null);
    utterance.onerror = () => setPlayingCueId(null);

    setPlayingCueId(cue.id);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m}:${Number(s) < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#10141D] border border-neutral-800 rounded-2xl p-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-cyan-400">
            Phòng thu Lồng tiếng Đa giọng
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Thuyết Minh Phân Vai Nhân Vật & Hòa Âm Giảm Nhạc Nền
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gán giọng đọc cho từng câu phụ đề, nghe thử trực tiếp và đồng bộ hóa với trình phát video
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleAutoAssignRoles}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tự động phân vai</span>
          </button>

          {onOpenAdvancedModal && (
            <button
              onClick={onOpenAdvancedModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bộ trộn nâng cao</span>
            </button>
          )}

          <button
            onClick={onNavigateToEditor}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Mở trong Phòng dựng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>{statusBanner}</span>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#10141D] border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                Danh sách Giọng đọc Nhân vật
              </h2>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                5 giọng
              </span>
            </div>

            <div className="space-y-2.5">
              {VOICE_PROFILES.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleApplyProfileToAll(profile.id)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/40"
                        : "bg-[#0B0E14] border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {profile.label}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {profile.roleDesc}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 font-mono tabular-nums">
                      <span>Cao độ: {profile.pitch}x</span>
                      <span>·</span>
                      <span>Tốc độ: {profile.rate}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#10141D] border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                Hòa âm & Giảm nhạc nền
              </h2>
              <button
                onClick={() => onToggleVoiceover(!isVoiceoverEnabled)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  isVoiceoverEnabled
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-neutral-800 text-slate-400"
                }`}
              >
                {isVoiceoverEnabled ? "Đang bật lồng tiếng" : "Đang tắt"}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Mức giảm âm gốc khi có thoại</span>
                  <span className="font-mono text-cyan-400 tabular-nums">
                    -{duckingLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={duckingLevel}
                  onChange={(e) => setDuckingLevel(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Hệ số tốc độ đọc toàn cục</span>
                  <span className="font-mono text-cyan-400 tabular-nums">
                    {speechRateMultiplier.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.4}
                  step={0.05}
                  value={speechRateMultiplier}
                  onChange={(e) => setSpeechRateMultiplier(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#10141D] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Kịch bản Phân vai theo Câu thoại
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn giọng đọc riêng cho từng dòng phụ đề và bấm nút Phát để nghe thử
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {cues.length} câu thoại
            </span>
          </div>

          {cues.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Volume2 className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-white">
                Chưa có câu phụ đề nào trong phiên làm việc
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hãy chuyển sang bàn dựng Video hoặc bộ Dịch đa năng để tải phụ đề trước khi phân vai lồng tiếng.
              </p>
              <button
                onClick={onNavigateToEditor}
                className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Đến bàn dựng Video
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80 max-h-[600px] overflow-y-auto">
              {cues.map((cue, idx) => {
                const assignedProfileId = cueVoices[cue.id] || selectedProfileId;
                const isPlaying = playingCueId === cue.id;
                return (
                  <div
                    key={cue.id}
                    className="px-6 py-3.5 hover:bg-neutral-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
                        <span className="text-cyan-400">#{idx + 1}</span>
                        <span>·</span>
                        <span>
                          {formatTime(cue.start)} → {formatTime(cue.end)}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        {cue.textVi || cue.textOriginal}
                      </div>
                      {cue.textVi && cue.textOriginal !== cue.textVi && (
                        <div className="text-xs text-slate-500 truncate">
                          Gốc: {cue.textOriginal}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#0B0E14] border border-neutral-800 rounded-lg px-2.5 py-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <select
                          value={assignedProfileId}
                          onChange={(e) =>
                            setCueVoices((prev) => ({
                              ...prev,
                              [cue.id]: e.target.value,
                            }))
                          }
                          className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          {VOICE_PROFILES.map((p) => (
                            <option
                              key={p.id}
                              value={p.id}
                              className="bg-[#10141D] text-white"
                            >
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handlePreviewCue(cue)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isPlaying
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Dừng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Nghe thử</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
