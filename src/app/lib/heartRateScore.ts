// app/lib/heartRateScore.ts
import type { HeartRateSample } from "./heartRateClient";

export type ScoreDetail = {
  avg: number;
  peak: number;
  std: number;
  reactivity: number; // 直近 - 初期
  score: number;      // 0..100
};

export function computeHeartRateScore(
  samples: HeartRateSample[],
  opts?: { baseline?: number; windowRecentSec?: number; windowEarlySec?: number }
): ScoreDetail {
  if (!samples.length) {
    return { avg: 0, peak: 0, std: 0, reactivity: 0, score: 0 };
  }
  const baseline = opts?.baseline ?? 70; // 安静時の仮定
  const now = samples[samples.length - 1].t;
  const recentWindow = (opts?.windowRecentSec ?? 15) * 1000;
  const earlyWindow  = (opts?.windowEarlySec  ?? 15) * 1000;

  const vals = samples.map(s => s.hr).filter((x) => Number.isFinite(x));
  const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
  const peak = Math.max(...vals);

  const mean = avg;
  // 標準偏差（母分散）
  const variance = vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / vals.length;
  const std = Math.sqrt(variance);

  const recentVals = samples.filter(s => now - s.t <= recentWindow).map(s => s.hr);
  const earlyVals  = samples.filter(s => now - s.t >= (recentWindow) && now - s.t <= (recentWindow + earlyWindow)).map(s => s.hr);
  const recentAvg = recentVals.length ? recentVals.reduce((a,b)=>a+b,0) / recentVals.length : mean;
  const earlyAvg  = earlyVals.length  ? earlyVals.reduce((a,b)=>a+b,0) / earlyVals.length  : mean;

  const reactivity = recentAvg - earlyAvg; // 正：上がってる

  // スコア化（0..100）
  // 例：基準超過分、反応、変動を重み付けし、クリップ
  const overBaseline = Math.max(0, avg - baseline); // 緊張の高さ
  const peakOver     = Math.max(0, peak - baseline);

  // 正規化（経験則で割る）
  const nAvg   = Math.min(1, overBaseline / 30); // +30bpm で1.0
  const nPeak  = Math.min(1, peakOver     / 40); // +40bpm で1.0
  const nStd   = Math.min(1, std          / 20); // 20bpm で1.0
  const nReact = Math.min(1, Math.max(0, reactivity) / 20);

  const score = Math.round(
    (nAvg * 0.35 + nPeak * 0.25 + nStd * 0.20 + nReact * 0.20) * 100
  );

  return { avg, peak, std, reactivity, score };
}
