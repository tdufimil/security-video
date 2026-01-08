"use client";

import { useEffect, useState } from "react";

type Props = {
  currentHR: number | null;
  samplesCollected: number;
  totalSamplesNeeded: number;
  onComplete: () => void;
};

export default function CalibrationScreen({
  currentHR,
  samplesCollected,
  totalSamplesNeeded,
  onComplete,
}: Props) {
  const progress = Math.min(
    100,
    (samplesCollected / totalSamplesNeeded) * 100
  );
  const remainingSeconds = Math.max(
    0,
    Math.ceil((totalSamplesNeeded - samplesCollected))
  );

  useEffect(() => {
    if (samplesCollected >= totalSamplesNeeded) {
      // キャリブレーション完了
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [samplesCollected, totalSamplesNeeded, onComplete]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-2xl w-full mx-4">
        {/* メインカード */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-cyan-200">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              平常時心拍数の測定中
            </h1>
            <p className="text-gray-600 text-lg">
              リラックスして、そのままお待ちください
            </p>
          </div>

          {/* 現在の心拍数表示 */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 mb-6 text-center border border-cyan-200">
            <div className="text-sm text-gray-600 mb-2">現在の心拍数</div>
            <div className="text-6xl font-bold text-cyan-600">
              {currentHR ?? "--"}
              <span className="text-2xl ml-2 text-gray-500">bpm</span>
            </div>
            {currentHR && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">計測中...</span>
              </div>
            )}
          </div>

          {/* プログレスバー */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                測定の進行状況
              </span>
              <span className="text-sm font-bold text-cyan-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-600">
                残り約 {remainingSeconds} 秒
              </span>
            </div>
          </div>

          {/* 説明文 */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">この測定について</p>
                <p>
                  あなたの平常時の心拍数を測定しています。この値を基準として、体験中のストレス反応を評価します。正確な測定のため、落ち着いた状態を保ってください。
                </p>
              </div>
            </div>
          </div>

          {/* ヒント */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">🧘</div>
              <div className="text-xs text-gray-600">深呼吸をする</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">💺</div>
              <div className="text-xs text-gray-600">楽な姿勢で座る</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">😌</div>
              <div className="text-xs text-gray-600">リラックスする</div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>心拍計が正しく装着されていることを確認してください</p>
        </div>
      </div>
    </div>
  );
}
