"use client";

import { useRouter } from "next/navigation";

export default function TopPage() {
  const router = useRouter();

  const handleStart = (url:string) => {
    router.push(url);
  };

  const handleRandom = () => {
    const random = Math.random() < 0.5 ? "/a" : "/b";
    router.push(random);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 背景画像 */}
      <img
        src="/images/scam_top_image.png"
        alt="サポート詐欺紹介"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 中央のボタン */}
      <div className="absolute inset-0 flex items-center justify-center z-10 gap-30">
        <button
          onClick={()=>handleStart("/a")}
          className="px-10 py-6 bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition hover:cursor-pointer"
        >
          パターンA(事前予告あり)
        </button>
        <button
          onClick={()=>handleStart("/b")}
          className="px-10 py-6 bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition hover:cursor-pointer"
        >
          パターンB(事前予告なし)
        </button>
        <button
          onClick={handleRandom}
          className="px-10 py-6 bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition hover:cursor-pointer"
        >
          ランダム
        </button>
      </div>
    </div>
  );
}
