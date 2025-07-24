"use client";

import React, { useRef, useState } from "react";
import FirstSupportscamquizselection from "./FirstSupportscamquizselection";

export default function VideoComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // １つ目のクイズを表示するための状態
  const [showFirstQuiz, setShowFirstQuiz] = useState(false);

  const [nowVideoNumber, setNowVideoNumber] = useState<number>(1); // 再生されている動画の番号を管理
  
  // 動画終了時にクイズを表示する関数
  const handleVideoEnd = () => {
    setShowFirstQuiz(true); // 動画終了時にモーダル表示
  };

  const handleCloseModal = () => {
    setShowFirstQuiz(false); // クイズ後にモーダルを閉じる
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        src="/video/サポート詐欺_相談窓口メイン.mp4"
        controls
        autoPlay
        muted
        onEnded={handleVideoEnd}
        className="w-screen h-screen object-cover"
      />
      <FirstSupportscamquizselection
        isOpen={showFirstQuiz}
        onClose={handleCloseModal}
      />
    </div>
  );
}
