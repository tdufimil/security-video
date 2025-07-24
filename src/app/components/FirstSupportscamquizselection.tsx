"use client";

import { useState } from "react";

export default function FirstSupportscamquizselection({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const choices = [
    "フィッシング詐欺",
    "ワンクリック詐欺",
    "サポート詐欺", // 正解
  ];

  const handleAnswer = (choice: string) => {
    setSelected(choice);
    setAnswered(true);
    setTimeout(() => {
      onClose(); // 閉じる
      setSelected(null);
      setAnswered(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-xl p-7 w-220 h-100 text-center">
      <h2 className="text-5xl font-bold mb-4">Qこの画面の詐欺はどんな詐欺？</h2>
        <div className="space-y-2">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
              className={`w-full px-4 py-2 rounded-md text-white font-bold text-5xl my-3 cursor-pointer ${
                answered
                  ? choice === "サポート詐欺"
                    ? "bg-green-500"
                    : choice === selected
                    ? "bg-red-500"
                    : "bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        {answered && (
          <p className="mt-4 font-semibold">
            {selected === "サポート詐欺"
              ? "正解！これはサポート詐欺です。"
              : "不正解。正しくは「サポート詐欺」です。"}
          </p>
        )}
      </div>
    </div>
  );
}