"use client";

import { Dispatch, SetStateAction } from "react";
import { Quiz } from "../../../hooks/useStepController";

type QuizScreenProps = {
  quizData: Quiz;
  setCurrentId: Dispatch<SetStateAction<string>>;
  onAnswered?: (isCorrect: boolean) => void;
  setLastResult: (v: boolean) => void;
};

const ShieldIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" />
    <path
      d="M12 7a4 4 0 00-4 4 1 1 0 102 0 2 2 0 114 0c0 2.5-2.5 3.6-3.6 5.6a1 1 0 001.7 1c1.2-2.2 3.9-3.5 3.9-6.6A4 4 0 0012 7z"
      opacity=".25"
    />
  </svg>
);

const QuizScreen = ({
  quizData,
  setCurrentId,
  onAnswered,
  setLastResult,
}: QuizScreenProps) => {
  const handleAnswer = (selectedId: string) => {
    const isCorrect = selectedId === quizData.correct;
    onAnswered?.(isCorrect);
    setLastResult(isCorrect);
    setCurrentId(quizData.next);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1b1e22] text-gray-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 18px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 400px at 30% -10%, rgba(59,130,246,0.07), transparent 60%), radial-gradient(700px 400px at 80% 110%, rgba(248,113,113,0.08), transparent 60%)",
        }}
      />

      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-gray-700/40 bg-[#1c1f23]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="flex items-center gap-3 text-rose-400">
            <ShieldIcon className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-lg md:text-xl font-semibold tracking-widest">
              SECURITY診断テスト
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-10 md:py-14">
        {/* 問題カード */}
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-gray-700/50 bg-[#23272b]/70 shadow-[0_0_0_1px_rgba(148,163,184,0.08)_inset]">
          <div className="flex items-start gap-5 p-8 md:p-10">
            <div className="mt-1 text-rose-400">
              <ShieldIcon className="w-12 h-12 md:w-14 md:h-14" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-50 leading-snug">
                {quizData.question}
              </h2>
            </div>
          </div>
        </section>

        {/* 画像*/}
        {Array.isArray(quizData.image) && quizData.image.length > 0 && (
          <section className="flex flex-col gap-10 mb-10">
            {quizData.image.map((src, idx) => (
              <div
                key={src + idx}
                className="relative w-full overflow-hidden rounded-2xl border border-gray-700/60 bg-[#202428] p-4"
              >
                {/* ラベル（A/B） */}
                <div className="absolute left-5 top-5 z-10 rounded-full bg-black/60 px-4 py-1 text-sm font-semibold text-white">
                  {idx === 0 ? "A" : idx === 1 ? "B" : `#${idx + 1}`}
                </div>

                {/* 画像（全体表示・比率維持） */}
                <div className="w-full flex justify-center">
                  <img
                    src={src}
                    alt={`選択画像 ${idx + 1}`}
                    className="max-h-[80vh] w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* テキスト選択肢（画像の下に表示） */}
        {Array.isArray(quizData.options) && quizData.options.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {quizData.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswer(opt.id)}
                className="group w-full rounded-xl border border-gray-700/60 bg-[#23272b] p-4 text-left transition
                 hover:border-rose-400/60 hover:bg-[#262b30] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-800 text-gray-200 group-hover:bg-rose-500 group-hover:text-white">
                    {opt.id}
                  </div>
                  <span className="text-base md:text-lg text-gray-100">
                    {opt.option}
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default QuizScreen;
