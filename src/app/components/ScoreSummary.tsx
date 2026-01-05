// src/app/.../components/ScoreSummary.tsx
"use client";

import { useEffect, useState } from "react";
import {
  calcKnowledgeScore,
  calcJudgementScore,
  calcCalmnessScore,
  calcSpeedScore,
} from "../lib/scoreCalculator";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type SectionHR = {
  sectionId: string;
  startHR: number | null;
  endHR: number | null;
};

type Props = {
  quizCorrectCount: number;
  isFirstTryCorrect: number;
  baseHR: number;
  peakHR: number;
  actionSeconds: number;
  hrStddev: number;
  sectionHRRecords: SectionHR[];
  sectionHistory: string[];
};

export default function ScoreSummary(props: Props) {
  //  初回スナップショット（以降固定）
  const [frozen] = useState(() => ({
    quizCorrectCount: props.quizCorrectCount,
    isFirstTryCorrect: props.isFirstTryCorrect,
    baseHR: props.baseHR,
    peakHR: props.peakHR,
    actionSeconds: props.actionSeconds,
    hrStddev: props.hrStddev,
    sectionHRRecords: props.sectionHRRecords,
    sectionHistory: props.sectionHistory,
  }));

  // 結果画面表示時にセクション心拍数記録をコンソール出力
  useEffect(() => {
    console.log("=== セクション心拍数記録 ===");
    frozen.sectionHRRecords.forEach((record) => {
      console.log(
        `セクション: ${record.sectionId} | 開始: ${record.startHR ?? "-"} bpm | 終了: ${record.endHR ?? "-"} bpm`
      );
    });
    console.log("=========================");
  }, []);

  // スコア計算（固定値から）
  const knowledge = calcKnowledgeScore(frozen.quizCorrectCount);
  const judgment = calcJudgementScore(frozen.isFirstTryCorrect);
  const calmness = calcCalmnessScore(frozen.baseHR, frozen.peakHR);
  const speed = calcSpeedScore(frozen.actionSeconds);
  const overall = Math.round(
    (knowledge + judgment + calmness + speed) / 4
  );

  const data = [
    { axis: "知識力", value: knowledge },
    { axis: "判断力", value: judgment },
    { axis: "冷静さ", value: calmness },
    { axis: "行動速度", value: speed },
  ];

  // 心拍数推移グラフ用データ（体験したセクションのみフィルタリング）
  const heartRateData = frozen.sectionHRRecords
    .filter((record) => frozen.sectionHistory.includes(record.sectionId))
    .map((record) => ({
      section: record.sectionId,
      開始: record.startHR,
      終了: record.endHR,
    }));

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6">
      {/* 背景：放射グラデ＋グリッド＋スキャンライン */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,255,200,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,200,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,200,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 opacity-[0.06] animate-scanline bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.3)_3%,transparent_6%)] bg-[length:100%_12px]" />
      </div>

      {/* コンテナ（ガラス＋ネオン輪郭） */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-md shadow-[0_0_40px_rgba(34,211,238,0.2)]">
        <div className="absolute inset-0 rounded-3xl ring-1 ring-cyan-400/10" />
        <header className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold tracking-wide text-cyan-100">
            診断結果
          </h2>
          <span className="text-xs md:text-sm text-cyan-300/80 border border-cyan-500/30 rounded-lg px-2 py-1 backdrop-blur-sm">
            RESULT FROZEN
          </span>
        </header>

        {/* 上段：カード4枚 */}
        <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <NeonCard label="知識力" value={knowledge} accent="cyan" />
          <NeonCard label="判断力" value={judgment} accent="emerald" />
          <NeonCard label="冷静さ" value={calmness} accent="violet" />
          <NeonCard label="行動速度" value={speed} accent="fuchsia" />
        </div>

        {/* 中段：レーダーチャート */}
        <div className="px-6 pb-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-4 md:p-6 shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="75%">
                  <PolarGrid
                    gridType="polygon"
                    stroke="rgba(34,211,238,0.25)"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "rgba(190,242,255,0.95)", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: "rgba(165,243,252,0.7)", fontSize: 10 }}
                    stroke="rgba(34,211,238,0.25)"
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}`, "Score"]}
                    contentStyle={{
                      background: "rgba(2,6,23,0.9)",
                      border: "1px solid rgba(34,211,238,0.3)",
                      borderRadius: 12,
                      color: "#CFFAFE",
                    }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="rgba(16,185,129,0.9)"
                    fill="rgba(16,185,129,0.35)"
                    dot
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 下段：総合スコア＋原データ */}
        <div className="w-full flex items-center justify-center py-3">
          <div className="bg-emerald-500/10 border border-emerald-400/40 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.35)] px-8 py-6 flex flex-col items-center text-center min-w-[320px] md:min-w-[420px]">
            <span className="text-4xl text-emerald-200/80 tracking-wide mb-1">
              総合スコア
            </span>

            <span className="text-5xl md:text-6xl font-extrabold text-emerald-200 drop-shadow-lg">
              {overall}
            </span>
          </div>
        </div>

        {/* 心拍数推移グラフ */}
        <div className="px-6 pb-6 pt-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-4 md:p-6 shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]">
            <h3 className="text-lg md:text-xl font-semibold text-cyan-100 mb-4">
              セクション別心拍数推移
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(34,211,238,0.15)"
                  />
                  <XAxis
                    dataKey="section"
                    tick={{ fill: "rgba(190,242,255,0.95)", fontSize: 11 }}
                    stroke="rgba(34,211,238,0.3)"
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fill: "rgba(165,243,252,0.7)", fontSize: 10 }}
                    stroke="rgba(34,211,238,0.3)"
                    label={{
                      value: "心拍数 (bpm)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "rgba(190,242,255,0.8)", fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(2,6,23,0.9)",
                      border: "1px solid rgba(34,211,238,0.3)",
                      borderRadius: 12,
                      color: "#CFFAFE",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "10px",
                      color: "#CFFAFE",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="開始"
                    stroke="rgba(34,211,238,0.9)"
                    strokeWidth={2}
                    dot={{ fill: "rgba(34,211,238,1)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="終了"
                    stroke="rgba(251,146,60,0.9)"
                    strokeWidth={2}
                    dot={{ fill: "rgba(251,146,60,1)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ローカルスタイル（細かなエフェクト） */}
      <style jsx>{`
        @keyframes scanline {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 12px;
          }
        }
        .animate-scanline {
          animation: scanline 6s linear infinite;
        }
      `}</style>
    </div>
  );
}

/** ネオンカード（小型スコア） */
function NeonCard({
  label,
  value,
  accent = "cyan",
}: {
  label: string;
  value: number;
  accent?: "cyan" | "emerald" | "violet" | "fuchsia" | "sky";
}) {
  const accentMap: Record<string, string> = {
    cyan: "from-cyan-400/30 to-cyan-500/10 border-cyan-400/40 text-cyan-100",
    emerald:
      "from-emerald-400/30 to-emerald-500/10 border-emerald-400/40 text-emerald-100",
    violet:
      "from-violet-400/30 to-violet-500/10 border-violet-400/40 text-violet-100",
    fuchsia:
      "from-fuchsia-400/30 to-fuchsia-500/10 border-fuchsia-400/40 text-fuchsia-100",
    sky: "from-sky-400/30 to-sky-500/10 border-sky-400/40 text-sky-100",
  };

  return (
    <div
      className={[
        "rounded-2xl p-4 border shadow-[0_0_24px_rgba(34,211,238,0.15)]",
        "bg-gradient-to-br backdrop-blur",
        accentMap[accent],
      ].join(" ")}
    >
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-wide tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="select-none text-[10px] md:text-xs tracking-wide px-2.5 py-1 rounded-full border border-cyan-400/40 text-cyan-200/90 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
      {text}
    </span>
  );
}
