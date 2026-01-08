"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onResult: (
    correct: boolean,
    actionSeconds: number
  ) => void;
  setShowQuiz: (show: boolean) => void;
  isFirstTryCorrect: number;
  setFirstTryCorrect: (val: number) => void;
};

export default function FakeSupportScamScreen({
  onResult,
  setShowQuiz,
  isFirstTryCorrect,
  setFirstTryCorrect,
}: Props) {
  // ==== 設定値 ====
  const LONG_PRESS_MS = 1000; // ESC 長押し 1秒で正解
  const FAIL_AFTER_MS = 30000; // 30秒以内に長押しできなければ不正解
  const WARN_REMAIN_MS = 11000; // 残り約11秒でカウントダウン表示

  // ==== 状態 ====
  const [mainWindows, setMainWindows] = useState([
    { id: 1, top: 120, left: 240 },
  ]);
  const [remainingMs, setRemainingMs] = useState(FAIL_AFTER_MS);
  const [showStartMenu, setShowStartMenu] = useState(false); // ← 追加: スタートメニュー表示

  // ==== ref ====
  const startAtRef = useRef<number>(Date.now());
  const holdTimerRef = useRef<number | null>(null);
  const holdingRef = useRef(false);
  const finishedRef = useRef(false); // 正解/不正解が確定したら二重発火防止

  const sound1Ref = useRef<HTMLAudioElement | null>(null);
  const sound2Ref = useRef<HTMLAudioElement | null>(null);
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

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

  // ==== 正解処理（共通） ====
  const finishAsCorrect = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const actionSeconds = (Date.now() - startAtRef.current) / 1000;
    try {
      if (document.fullscreenElement) await exitFullscreen();
    } finally {
      setShowQuiz(false);
      onResultRef.current(true, actionSeconds);
    }
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
      setFirstTryCorrect(25);
      onResultRef.current(false, actionSeconds);
    }
  };

  // モーダルウィンドウのボタンクリック時の処理（正解率ペナルティ？のまま残す）
  const handleButtonClick = () => {
    if (isFirstTryCorrect <= 25) return 25;
    setFirstTryCorrect(isFirstTryCorrect - 15);
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

  // ==== ESC 長押し検出 ====
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      if (e.key !== "Escape") return;
      if (holdingRef.current) return; // リピート防止
      holdingRef.current = true;
      holdTimerRef.current = window.setTimeout(() => {
        // 長押し成立 → 正解
        finishAsCorrect();
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
        prev.length < 4
          ? [
              ...prev,
              {
                id: Date.now(),
                top: Math.random() * 650 + 50,
                left: Math.random() * 700 + 50,
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
      if (audio.volume < maxVolume)
        audio.volume = Math.min(maxVolume, audio.volume + volumeStep);
      if (audio.playbackRate < maxPlaybackRate)
        audio.playbackRate = Math.min(
          maxPlaybackRate,
          audio.playbackRate + playbackRateStep
        );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const remainSec = Math.ceil(remainingMs / 1000);
  const showCountdown = remainingMs <= WARN_REMAIN_MS;

  // ==== タスクバーの再起動（正解）ハンドラ ====
  const handleRestartClick = async () => {
    await finishAsCorrect();
  };

  return (
    <div className="fixed inset-0 z-50 container">
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <audio ref={sound1Ref} src="/sound/sound1.mp3" autoPlay loop />
        <audio ref={sound2Ref} src="/sound/armored.mp3" autoPlay loop />

        {/* 複製される警告ウィンドウ群（元のUIはそのまま） */}
        {mainWindows.map((w, idx) => (
          <div
            key={w.id}
            className="absolute min-w-[550px] h-[380px] max-w-[95vw] shadow-2xl rounded border border-gray-400 pointer-events-auto"
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
              <button
                className="text-white w-6 h-6 flex items-center justify-center hover:bg-blue-800 rounded font-bold"
                onClick={handleButtonClick}
              >
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
              <div className="mb-15">
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

              {/* 中央寄せ */}
              <img
                src="/images/re.gif"
                alt="再起動中"
                className="mt-4 w-[300px] mx-auto"
              />
            </div>

            {/* ボタンの位置を少し下に */}
            <div className="flex justify-end gap-2 px-6 pb-8">
              <button
                className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-gray-100 shadow text-base font-semibold hover:bg-gray-200"
                onClick={handleButtonClick}
              >
                キャンセル
              </button>
              <button
                className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-blue-500 text-white shadow font-semibold hover:bg-blue-600"
                onClick={handleButtonClick}
              >
                OK
              </button>
            </div>
          </div>
        ))}

        {/* 電話誘導バナー（クリックで不正解） - タスクバーと重ならないよう bottom-12 */}
        <div
          className="fixed left-0 bottom-12 w-full h-12 bg-blue-900 text-white flex items-center px-8 text-sm z-[2100]"
          onClick={failAndFinish}
        >
          Windows のセキュリティ　Windows サポートに電話する: (0101)
        </div>

        {/* ESC ヒント */}
        <div className="fixed bottom-24 left-10 text-xl text-white bg-black/70 px-5 py-2 rounded-lg pointer-events-none">
          ESCキーを1秒以上長押しでウィンドウを閉じる
        </div>

        {/* 🔴 残り時間のカウントダウン */}
        {showCountdown && !finishedRef.current && (
          <div className="fixed top-6 right-6 z-[2200]">
            <div className="rounded-xl bg-black/70 px-4 py-2 border border-red-500/60 shadow-lg">
              <div className="text-xl md:text-5xl font-bold text-red-400 tabular-nums">
                残り{remainSec}秒で請求が発生します
              </div>
            </div>
          </div>
        )}

        {/* ======== ここから Windows 11 風タスクバー ======== */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-2  w-full h-14 rounded-2xl bg-[#e8f2fb]/80 border border-white/60 shadow-lg shadow-black/10 backdrop-blur-md z-[2205]">
          {/* バー内 */}
          <div className="h-full px-3 flex items-center gap-3">
            {/* スタート（四分割のWindowsロゴ） */}
            <button
              onClick={() => setShowStartMenu((v) => !v)}
              aria-label="Start"
              className="relative grid grid-cols-2 grid-rows-2 gap-[2px] w-10 h-10 rounded-lg bg-[#e8f2fb]/0 hover:bg-white/40 active:scale-[0.98] transition ml-75"
            >
              <span className="bg-[#1296ff] rounded-sm" />
              <span className="bg-[#1296ff] rounded-sm" />
              <span className="bg-[#1296ff] rounded-sm" />
              <span className="bg-[#1296ff] rounded-sm" />
            </button>

            {/* 検索ピル */}
            <button className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-white/70 border border-white/70 shadow-inner min-w-[220px] hover:bg-white/90 text-gray-600 ml-6">
              {/* ルーペ */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-80"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16.65"
                  y1="16.65"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[15px]">検索</span>
            </button>

            {/* 中央寄せアイコン列（画像の雰囲気に寄せた角丸アイコン） */}
            <div className="flex items-center gap-3 mx-auto">
              {/* バッジ付きアイコン例（OneDrive風） */}
              <div className="relative w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="relative w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95">
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center px-[5px]">
                  4
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/70 shadow-inner hover:brightness-95" />
            </div>

            {/* 右側：トレイ＆時刻 */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/70 border border-white/70 shadow-inner" />
                <div className="w-8 h-8 rounded-lg bg-white/70 border border-white/70 shadow-inner" />
                <div className="w-8 h-8 rounded-lg bg-white/70 border border-white/70 shadow-inner" />
                <div className="w-8 h-8 rounded-lg bg-white/70 border border-white/70 shadow-inner" />
              </div>
              <div className="text-right leading-tight select-none pr-1">
                <div className="text-[13px] tabular-nums">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-[11px] text-gray-600">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* スタートメニュー（電源→再起動で正解） */}
          {showStartMenu && (
            <div
              className="absolute bottom-16 left-3 w-80 bg-white/95 text-gray-900 rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <div className="p-3 border-b border-gray-200">
                <div className="text-lg font-semibold">メニュー</div>
                <div className="text-sm text-gray-500">
                  アプリや設定にアクセスします
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-xs uppercase tracking-wider text-gray-500">
                  電源
                </div>
                <button
                  onClick={handleRestartClick}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  再起動
                </button>
              </div>
              <div className="p-2 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowStartMenu(false)}
                  className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
