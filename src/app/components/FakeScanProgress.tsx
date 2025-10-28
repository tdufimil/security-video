"use client";

import { useState } from "react";
import { useInterval } from "react-use";

// 物理ピクセル → CSSピクセル変換
const px = (val: number) => `${val / window.devicePixelRatio}px`;

// スタイル生成ヘルパー
const usePositionStyle = (x: number, y: number, w: number, h: number) => ({
  position: "absolute" as const,
  left: px(x),
  top: px(y),
  width: px(w),
  height: px(h),
});

export default function FakeScanProgress({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const TOTAL_FILES = 16483;
  const [scanned, setScanned] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  useInterval(
    () => {
      setScanned((prev) => {
        const next = prev + Math.floor(Math.random() * 1000 + 100);
        if (next >= TOTAL_FILES) {
          setCompleted(true);
          setTimeout(() => onComplete(), 1200);
          return TOTAL_FILES;
        }
        return next;
      });
    },
    completed ? null : 300
  );

  const percent = Math.min(100, (scanned / TOTAL_FILES) * 100);
  const seconds = Math.round((Date.now() - startTime) / 1000)
    .toString()
    .padStart(2, "0");

  // 各位置指定（物理ピクセル）
  const progressStyle = usePositionStyle(500, 315, 740, 6);
  const stat1Style = usePositionStyle(500, 330, 700, 60);
  const stat2Style = usePositionStyle(500, 430, 700, 60);

  return (
    <div className="fixed inset-y-0 right-0 z-0 flex items-start p-6 text-white font-sans select-none rounded-lg">
      <div className="relative w-[970px] h-[775px]">
        {/* 背景画像 */}
        <img
          src="/images/winsecurityscan.png"
          className="absolute rounded-lg"
          style={{
            width: px(970),
            height: px(775),
            top: "0px",
            left: "300px",
          }}
          alt="Fake Scan Background"
        />

        {/* プログレスバー */}
        <div
          id="progress1"
          className="bg-gray-300 rounded"
          style={progressStyle}
        >
          <div
            id="level"
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        {/* ステータス1 */}
        <div id="stat1" style={stat1Style} className="text-xs text-black">
          {!completed ? (
            <>
              <div>クイック スキャンを実行しています...</div>
              <div>推定残り時間: 00:00:{seconds}</div>
              <div>{scanned}ファイルがスキャンされました</div>
            </>
          ) : (
            <div>脅威が見つかりました。推奨される操作を開始します。</div>
          )}
        </div>

        {/* ステータス2 */}
        <div id="stat2" style={stat2Style} className="text-xs text-black">
          {!completed ? (
            <div>緊急時につき、スキャンを中断できません。</div>
          ) : (
            <div className="flex justify-between bg-red-100 p-2 rounded">
              <div>
                <div className="font-bold text-red-600">
                  PUABundler:Win32/FusionCore
                </div>
                <div className="text-gray-600 text-[10px]">
                  2024/02/03 20:59（アクティブ）
                </div>
              </div>
              <div className="text-red-700 font-bold">低</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
