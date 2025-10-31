// スコア算出関数群（堅牢化版・互換維持）
// src/app/lib/scoreCalculator.ts

/** 値が有限でなければ fallback を返す */
const num = (v: number, fallback = 0) => (Number.isFinite(v) ? v : fallback);

/** 0〜上限へクランプ。上限未指定なら下限のみ */
const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.min(max, Math.max(min, v));

export function calcKnowledgeScore(correctCount: number): number {
  // 0〜5 以外が来ても安全に
  const n = clamp(Math.floor(num(correctCount)), 0, 5);
  switch (n) {
    case 4: return 100;
    case 3: return 80;
    case 2: return 60;
    case 1: return 40;
    case 0: return 20;
    default: return 0;
  }
}

export function calcJudgementScore(isFirstTryCorrect: number): number {
  // null/undefined対策：!!でboolean化
 if (isFirstTryCorrect<=25) {
    return 25;
  } else {
    return isFirstTryCorrect;
  }
}

export function calcCalmnessScore(baseHR: number, peakHR: number): number {
  // HRが未取得/欠損でも落ちないように
  const base = num(baseHR);
  const peak = num(peakHR);

  // 下振れ（peak < base）時は「上昇0」とみなす
  const diff = clamp(peak - base, 0);

  // 要件レンジ（25〜30は50点で吸収、51+は10点）
  if (diff <= 5)  return 100;
  if (diff <= 10) return 90;
  if (diff <= 15) return 80;
  if (diff <= 20) return 70;
  if (diff <= 25) return 60;
  if (diff <= 35) return 50; // 25〜30の穴 & 30〜35 をまとめて50点
  if (diff <= 40) return 40;
  if (diff <= 45) return 30;
  if (diff <= 50) return 20;
  return 10; // 51+
}

export function calcSpeedScore(seconds: number): number {
  // マイナス/NaNを0s扱いに
  const s = clamp(num(seconds), 0);
  if (s <= 5)  return 100;
  if (s <= 10) return 90;
  if (s <= 15) return 80;
  if (s <= 20) return 70;
  if (s <= 25) return 60;
  return 50; // 25s+
}

export function calcStabilityScore(stddev: number): number {
  // マイナス/NaN対策（標準偏差は0以上）
  const sd = clamp(num(stddev), 0);
  if (sd <= 4)  return 100;
  if (sd <= 7)  return 90;
  if (sd <= 10) return 80;
  if (sd <= 13) return 70;
  return 60; // 13.1+
}
