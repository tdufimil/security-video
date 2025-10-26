"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onResult: (correct: boolean, actionSeconds: number, isFirstTry: boolean) => void;
  setShowQuiz: (show: boolean) => void;
  setCurrentId: (id: string) => void;
  setRetryAfterWrongQuiz2: (val: boolean) => void;
  wrongCount: number;
  setWrongCount: (count: number) => void;
};

export default function FakeSupportScamScreen({
  onResult,
  setShowQuiz,
  setCurrentId,
  setRetryAfterWrongQuiz2,
  wrongCount,
  setWrongCount,
}: Props) {
  // ==== 設定値 ====
  const LONG_PRESS_MS = 1000;     // ← ESC 長押し 1秒で正解
  const FAIL_AFTER_MS = 30000;    // ← 30秒以内に長押しできなければ不正解
  const WARN_REMAIN_MS = 11000;   // ← 残り約11秒でカウントダウン表示

  // ==== 状態 ====
  const [mainWindows, setMainWindows] = useState([{ id: 1, top: 120, left: 240 }]);
  const [remainingMs, setRemainingMs] = useState(FAIL_AFTER_MS);

  // ==== ref ====
  const startAtRef = useRef<number>(Date.now());
  const firstTryRef = useRef(true);
  const holdTimerRef = useRef<number | null>(null);
  const holdingRef = useRef(false);
  const finishedRef = useRef(false); // 正解/不正解が確定したら二重発火防止

  const sound1Ref = useRef<HTMLAudioElement | null>(null);
  const sound2Ref = useRef<HTMLAudioElement | null>(null);
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  // ==== フルスクリーン ====
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  };
  const exitFullscreen = () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    return Promise.resolve();
  };

  // ==== 不正解処理（共通） ====
  const failAndFinish = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const actionSeconds = (Date.now() - startAtRef.current) / 1000;
    try {
      if (document.fullscreenElement) await exitFullscreen();
    } finally {
      setShowQuiz(false);
      onResultRef.current(false, actionSeconds, firstTryRef.current);
    }
  };

  // ==== マウント時のセットアップ ====
  useEffect(() => {
    enterFullscreen();
    startAtRef.current = Date.now();

    // 30秒タイムアウトで不正解
    const timeoutId = window.setTimeout(() => {
      console.log("[quiz2] 30秒経過により不正解扱い");
      failAndFinish();
    }, FAIL_AFTER_MS);

    return () => {
      clearTimeout(timeoutId);
      if (document.fullscreenElement) exitFullscreen();
    };
  }, []);

  // ==== 残り時間の更新（200ms刻み） ====
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startAtRef.current;
      const remain = Math.max(0, FAIL_AFTER_MS - elapsed);
      setRemainingMs(remain);
      if (remain <= 0) {
        // 念のため
        failAndFinish();
      }
    };
    const id = window.setInterval(tick, 200);
    tick();
    return () => clearInterval(id);
  }, []);

  // ==== ESC 長押し検出（keydown/keyup 一度登録、refで安定化） ====
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      if (e.key !== "Escape") return;
      if (holdingRef.current) return; // リピート防止
      holdingRef.current = true;
      holdTimerRef.current = window.setTimeout(async () => {
        // 長押し成立 → 正解
        if (finishedRef.current) return;
        finishedRef.current = true;
        const actionSeconds = (Date.now() - startAtRef.current) / 1000;
        try {
          if (document.fullscreenElement) await exitFullscreen();
        } finally {
          setShowQuiz(false);
          onResultRef.current(true, actionSeconds, firstTryRef.current);
        }
      }, LONG_PRESS_MS);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      holdingRef.current = false;
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: true });
    window.addEventListener("keyup", onKeyUp, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // ==== ウィンドウ増殖 ====
  useEffect(() => {
    const interval = setInterval(() => {
      setMainWindows((prev) =>
        prev.length < 3
          ? [
              ...prev,
              {
                id: Date.now(),
                top: Math.random() * 350 + 50,
                left: Math.random() * 400 + 50,
              },
            ]
          : prev
      );
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // ==== サウンド（音量/速度を段階上げ） ====
  useEffect(() => {
    const volumeStep = 0.2;
    const playbackRateStep = 0.2;
    const maxVolume = 1.0;
    const maxPlaybackRate = 3.0;

    const interval = setInterval(() => {
      const audio = sound1Ref.current;
      if (!audio) return;
      if (audio.volume < maxVolume) audio.volume = Math.min(maxVolume, audio.volume + volumeStep);
      if (audio.playbackRate < maxPlaybackRate) audio.playbackRate = Math.min(maxPlaybackRate, audio.playbackRate + playbackRateStep);
      // console.log(`[sound1] volume=${audio.volume}, rate=${audio.playbackRate}`);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const remainSec = Math.ceil(remainingMs / 1000);
  const showCountdown = remainingMs <= WARN_REMAIN_MS;

  return (
    <div className="fixed inset-0 z-50 container">
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <audio ref={sound1Ref} src="/sound/sound1.mp3" autoPlay loop />
        <audio ref={sound2Ref} src="/sound/armored.mp3" autoPlay loop />

        {/* 複製される警告ウィンドウ群（元のUIはそのまま） */}
        {mainWindows.map((w, idx) => (
          <div
            key={w.id}
            className="absolute min-w-[410px] max-w-[90vw] shadow-2xl rounded border border-gray-400 pointer-events-auto"
            style={{
              zIndex: 1000 + idx,
              top: w.top,
              left: w.left,
              background: "white",
              textAlign: "center",
            }}
          >
            <div className="flex items-center justify-between px-3 h-8 bg-[#2074d4] rounded-t border-b border-blue-900">
              <div className="text-white text-xs font-bold tracking-widest">
                Windows セキュリティの警告
              </div>
              <button className="text-white w-6 h-6 flex items-center justify-center hover:bg-blue-800 rounded font-bold">
                ×
              </button>
            </div>

            <div className="px-6 pt-4 pb-3 text-sm text-left">
              <div className="text-lg font-bold text-red-600 mb-1">
                Microsoft Windows ファイアウォールの警告！
              </div>
              <div className="font-semibold mb-1">
                トロイの木馬型スパイウェアに感染したPC
                <span className="ml-2 text-xs text-gray-600 font-mono">
                  (エラーコード: 2V7HGTVB)
                </span>
              </div>
              <div className="mb-1">
                このPCへのアクセスはセキュリティ上の理由からブロックされています。
                <br />
                <a
                  href="#"
                  className="text-blue-700 underline font-bold"
                  onClick={async (e) => {
                    e.preventDefault();
                    await failAndFinish(); // 電話リンクは不正解扱い
                  }}
                >
                  Windows サポートに電話してください : (0101)
                </a>
              </div>
              <img src="/images/re.gif" alt="再起動中" className="mt-2 w-[300px]" />
            </div>

            <div className="flex justify-end gap-2 px-6 pb-3">
              <button className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-gray-100 shadow text-base font-semibold hover:bg-gray-200">
                キャンセル
              </button>
              <button className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-blue-500 text-white shadow font-semibold hover:bg-blue-600">
                OK
              </button>
            </div>
          </div>
        ))}

        {/* 電話誘導バナー（クリックで不正解） */}
        <div
          className="fixed left-0 bottom-0 w-full h-12 bg-blue-900 text-white flex items-center px-8 text-sm z-[2100]"
          onClick={failAndFinish}
        >
          Windows のセキュリティ　Windows サポートに電話する: (0101)
        </div>

        {/* ESC ヒント */}
        <div className="fixed bottom-10 left-10 text-xl text-white bg-black/70 px-5 py-2 rounded-lg pointer-events-none">
          ESCキーを1秒以上長押しでウィンドウを閉じる
        </div>

        {/* 🔴 残り時間のカウントダウン） */}
        {showCountdown && !finishedRef.current && (
          <div className="fixed top-6 right-6 z-[2200]">
            <div className="rounded-xl bg-black/70 px-4 py-2 border border-red-500/60 shadow-lg">
              <div className="text-xl md:text-5xl font-bold text-red-400 tabular-nums">
                残り{remainSec}秒で請求が発生します
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
