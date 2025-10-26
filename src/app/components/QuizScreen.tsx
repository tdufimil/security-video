"use client";

import { Dispatch, SetStateAction } from "react";
import { Quiz } from "../../../hooks/useStepController";

type QuizScreenProps = {
  quizData: Quiz;
  setCurrentId: Dispatch<SetStateAction<string>>;
  onAnswered?: (isCorrect: boolean) => void;
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

const QuizScreen = ({ quizData, setCurrentId, onAnswered }: QuizScreenProps) => {
  const handleAnswer = (opt: any) => {
    const isCorrect = opt.id === quizData.correct;
    if (onAnswered) onAnswered(isCorrect);
    setCurrentId(quizData.next);
  };
  return (
    <div className="relative min-h-screen w-full bg-[#1b1e22] text-gray-100">
      {/* 背景：柔らかいグリッド＋薄い赤青グラデ */}
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
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <div className="flex items-center gap-3 text-rose-400">
            <ShieldIcon className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-lg md:text-xl font-semibold tracking-widest">
              SECURITY CHECKPOINT
            </span>
          </div>
          <span className="ml-auto rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm font-mono text-amber-300">
            ALERT: VERIFY THREAT TYPE
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
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

        {/* 画像オプション */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {quizData.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleAnswer(opt)}
              className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-[#24282d]/80 text-left shadow-md transition hover:shadow-[0_0_12px_rgba(248,113,113,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
              aria-label={`選択肢 ${opt.id}`}
            >
              <div className="relative w-full bg-gray-800">
                <div className="aspect-video">
                  <img
                    src={opt.option}
                    alt={`選択肢 ${opt.id}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* 柔らかいホバーオーバーレイ */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-t from-rose-400/10 to-transparent" />
              </div>

              {/* 下部テキスト */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="rounded border border-gray-600/60 bg-gray-700/30 px-3 py-1 font-mono text-base text-gray-200">
                  OPTION #{opt.id}
                </span>
                <span className="text-base text-rose-300/80 group-hover:text-rose-300 transition">
                  Click to Evaluate →
                </span>
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default QuizScreen;
