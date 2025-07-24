import { useEffect, useRef, useState } from "react";

export default function FakeSupportScamScreen({ onResult }: { onResult: (correct: boolean) => void }) {
  const [mainWindows, setMainWindows] = useState([
    { id: 1, top: 120, left: 240 }
  ]);
  const escTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressingEsc, setPressingEsc] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMainWindows(prev => [
        ...prev,
        {
          id: Date.now(),
          top: Math.random() * 350 + 50,
          left: Math.random() * 400 + 50
        }
      ]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ESC長押し判定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pressingEsc) {
        setPressingEsc(true);
        escTimer.current = setTimeout(() => {
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

  const handleCall = () => onResult(false);
  const handleRemote = () => {
    if (window.confirm("本当に遠隔操作を許可しますか？")) {
      onResult(false);
    }
  };
  const handleRestart = () => onResult(true);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center font-['Meiryo','Segoe UI',sans-serif] select-none"
      style={{ backdropFilter: "blur(2px)" }}
    >
      {/* メインウィンドウ増殖 */}
      {mainWindows.map((w, idx) => (
        <div
          key={w.id}
          className="absolute min-w-[410px] max-w-[90vw] shadow-2xl rounded border border-gray-400"
          style={{
            zIndex: 1000 + idx,
            top: w.top,
            left: w.left,
            background: "linear-gradient(180deg, #f6f7f9 85%, #e1e5ee 100%)",
          }}
        >
          {/* タイトルバー */}
          <div className="flex items-center justify-between px-3 h-8 bg-[#2074d4] rounded-t border-b border-blue-900">
            <div className="text-white text-xs font-bold tracking-widest">Windows セキュリティの警告</div>
            <button className="text-white w-6 h-6 flex items-center justify-center hover:bg-blue-800 rounded" style={{fontWeight: "bold"}}>
              ×
            </button>
          </div>
          {/* 内容エリア */}
          <div className="px-6 pt-4 pb-3 text-sm text-left">
            <div className="text-lg font-bold text-red-600 mb-1">
              Microsoft Windows ファイアウォールの警告！
            </div>
            <div className="font-semibold mb-1">
              トロイの木馬型スパイウェアに感染したPC
              <span className="ml-2 text-xs text-gray-600 font-mono">(エラーコード: 2V7HGTVB)</span>
            </div>
            <div className="mb-1">
              <span className="inline-block w-7 h-7 align-middle mr-1"><WindowsIcon /></span>
              <span className="inline-block w-7 h-7 align-middle"><ShieldIcon /></span>
            </div>
            <div className="mb-1">
              このPCへのアクセスはセキュリティ上の理由からブロックされています。<br />
              <a
                href="tel:0120-000-000"
                className="text-blue-700 underline font-bold"
                onClick={e => {e.preventDefault(); handleCall();}}
              >
                Windows サポートに電話してください : (0101)
              </a>
            </div>
          </div>
          {/* ボタン */}
          <div className="flex justify-end gap-2 px-6 pb-3">
            <button
              className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-gray-100 shadow text-base font-semibold hover:bg-gray-200"
              onClick={() => {}}
            >
              キャンセル
            </button>
            <button
              className="min-w-[90px] px-4 py-1 rounded border border-gray-400 bg-blue-500 text-white shadow font-semibold hover:bg-blue-600"
              onClick={() => {}}
            >
              OK
            </button>
          </div>
          <div className="flex justify-end gap-2 px-6 pb-5">
            <button
              className="text-base px-5 py-1 rounded border border-green-600 bg-green-700 text-white font-bold shadow hover:bg-green-800"
              onClick={handleRestart}
            >
              再起動する
            </button>
            <button
              className="text-base px-5 py-1 rounded border border-orange-600 bg-orange-600 text-white font-bold shadow hover:bg-orange-700"
              onClick={handleRemote}
            >
              遠隔操作を許可
            </button>
          </div>
        </div>
      ))}

      {/* 黒アラート1回だけ */}
      <div
        className="absolute bg-black/90 text-white rounded-xl shadow-xl p-3 text-xs font-bold"
        style={{
          top: 20,
          left: 50,
          width: 310,
          zIndex: 2000,
        }}
      >
        すぐに当社に電話してください。当社のエンジニアが対応を開始しています...
      </div>

      {/* フッター青帯 */}
      <div
        className="fixed left-0 bottom-0 w-full h-12 bg-blue-900 text-white flex items-center px-8 text-sm"
        style={{ zIndex: 2100 }}
      >
        Windows のセキュリティ　Windows サポートに電話する: (0101)
      </div>

      {/* ESC長押しヒント */}
      <div className="fixed bottom-10 left-10 text-xl text-white bg-black/70 px-5 py-2 rounded-lg pointer-events-none">
        ESCキーを1秒以上長押しでウィンドウを閉じる
      </div>
    </div>
  );
}

// Windowsっぽいアイコン例（SVGでも画像でもOK）
function WindowsIcon() {
  return (
    <svg viewBox="0 0 32 32" width={28} height={28}>
      <rect x="1" y="6" width="13" height="9" fill="#2983ee"/>
      <rect x="1" y="17" width="13" height="9" fill="#1e65c7"/>
      <rect x="16" y="5" width="15" height="11" fill="#2983ee"/>
      <rect x="16" y="17" width="15" height="10" fill="#1e65c7"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 32 32" width={28} height={28}>
      <path d="M16 3C9 6 3 8 3 8s0 12.7 6.9 17.4C13.7 28.1 16 29 16 29s2.3-.9 6.1-3.6C29 20.7 29 8 29 8s-6-2-13-5z" fill="#67d7f5"/>
      <path d="M16 5.6V27c-.5-.3-1.6-.8-2.9-1.9C7.2 20.7 6 11 6 9.2c2.3-.7 6.1-2.3 10-4.1z" fill="#23a4dd"/>
    </svg>
  );
}
