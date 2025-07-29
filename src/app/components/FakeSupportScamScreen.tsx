"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onResult: (correct: boolean) => void;
  videoWrongUrl: string; // ← string型に確定
  setVideoSrc: (src: string) => void;
  setShowQuiz: (show: boolean) => void;
  setCurrentId: (id: string) => void;
  setRetryAfterWrongQuiz2: (val: boolean) => void;
};

export default function FakeSupportScamScreen({
  onResult,
  videoWrongUrl,
  setVideoSrc,
  setShowQuiz,
  setCurrentId,
  setRetryAfterWrongQuiz2,
}: Props) {
  const [mainWindows, setMainWindows] = useState([{ id: 1, top: 120, left: 240 }]);
  const [pressingEsc, setPressingEsc] = useState(false);
  const escTimer = useRef<NodeJS.Timeout | null>(null);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }
    return Promise.resolve();
  };

  const exitFullscreenAndFail = async () => {
  try {
    if (document.fullscreenElement) {
      await exitFullscreen();
    }
  } catch (err) {
    console.warn("フルスクリーン解除失敗:", err);
  }

  setShowQuiz(false);
  setVideoSrc(videoWrongUrl); // ✅ 正確に渡された URL を使用
  setCurrentId("wrong2");
  setRetryAfterWrongQuiz2(true);
};

  useEffect(() => {
    enterFullscreen();
    return () => {
      if (document.fullscreenElement) exitFullscreen();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pressingEsc) {
        setPressingEsc(true);
        escTimer.current = setTimeout(() => {
          if (document.fullscreenElement) exitFullscreen();
          onResult(true); // 正解
        }, 1200);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPressingEsc(false);
        if (escTimer.current) clearTimeout(escTimer.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onResult, pressingEsc]);

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
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <audio src="/sound/sound1.mp3" autoPlay loop />
        <audio src="/sound/armored.mp3" autoPlay loop />

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
                    await exitFullscreenAndFail();
                  }}
                >
                  Windows サポートに電話してください : (0101)
                </a>
              </div>
              <img
                src="/images/re.gif"
                alt="再起動中"
                className="mt-2 w-[300px]"
              />
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

        <div
          className="absolute bg-black/90 text-white rounded-xl shadow-xl p-3 text-xs font-bold"
          style={{ top: 20, left: 50, width: 310, zIndex: 2000 }}
        >
          すぐに当社に電話してください。当社のエンジニアが対応を開始しています...
        </div>

        <div
          className="fixed left-0 bottom-0 w-full h-12 bg-blue-900 text-white flex items-center px-8 text-sm z-[2100]"
          onClick={async () => {
            await exitFullscreenAndFail();
          }}
        >
          Windows のセキュリティ　Windows サポートに電話する: (0101)
        </div>

        <div className="fixed bottom-10 left-10 text-xl text-white bg-black/70 px-5 py-2 rounded-lg pointer-events-none">
          ESCキーを1秒以上長押しでウィンドウを閉じる
        </div>
      </div>
    </div>
  );
}
