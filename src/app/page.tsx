"use client";

import { useRouter } from "next/navigation";

export default function TopPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/securityvideo");
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <button
          onClick={handleStart}
          className="px-10 py-6 bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition hover:cursor-pointer"
        >
          動画を再生する
        </button>
      </div>
    </div>
  );
}
