"use client";

import { useMemo } from "react";

type Props = {
  answer: string;
  bodyCorrect: string;
  bodyWrong: string;
  onNext: () => void;
  /** 直前のクイズ結果 */
  isCorrect: boolean;
};

const ShieldIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" />
    <path
      d="M12 7a4 4 0 00-4 4 1 1 0 102 0 2 2 0 114 0c0 2.5-2.5 3.6-3.6 5.6a1 1 0 001.7 1c1.2-2.2 3.9-3.5 3.9-6.6A4 4 0 0012 7z"
      opacity=".25"
    />
  </svg>
);

export default function ExplainSection({ answer, bodyCorrect, bodyWrong, onNext, isCorrect }: Props) {
  // 正誤に応じて使用するbodyを選択
  const body = isCorrect ? bodyCorrect : bodyWrong;

  const blocks = useMemo(() => {
    const paragraphs = body.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
    return paragraphs.map((p) => {
      const lines = p.split(/\n/).map((l) => l.trim()).filter(Boolean);
      const bulletLike = lines.filter((l) => /^([・\-*]|・\s|-\s|\*\s)/.test(l)).length / Math.max(1, lines.length);
      return { lines, isList: bulletLike >= 0.6 };
    });
  }, [body]);

  // 色味とラベルを結果で切り替え
  const result = isCorrect ? "正解！" : "不正解";
  const resultSub = isCorrect ? "この調子でいきましょう" : "ポイントを確認して次へ進みましょう";
  const accent = isCorrect
    ? {
        border: "border-emerald-400/30",
        ring: "ring-emerald-400/40",
        bgSoft: "bg-emerald-400/10",
        text: "text-emerald-200",
        chip: "bg-emerald-500 text-white",
        btn: "bg-emerald-500 hover:bg-emerald-400 focus-visible:ring-emerald-400 shadow-emerald-500/20",
      }
    : {
        border: "border-rose-400/30",
        ring: "ring-rose-400/40",
        bgSoft: "bg-rose-400/10",
        text: "text-rose-200",
        chip: "bg-rose-500 text-white",
        btn: "bg-rose-500 hover:bg-rose-400 focus-visible:ring-rose-400 shadow-rose-500/20",
      };

  return (
    <section className="relative w-full">
      <div className="relative min-h-screen w-full bg-[#111417] text-gray-100 flex flex-col">
        {/* 背景グリッド */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 22px)",
          }}
        />
        {/* ラディアル光 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 400px at 30% -10%, rgba(59,130,246,0.07), transparent 60%), radial-gradient(700px 400px at 80% 110%, rgba(248,113,113,0.08), transparent 60%)",
          }}
        />

        {/* コンテンツ */}
        <div className="relative flex-1 flex flex-col justify-center py-16">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">

            {/* 見出しカード（結果バッジ付き） */}
            <div className="relative mb-12 overflow-hidden rounded-3xl border border-gray-700/50 bg-[#23272b]/70 shadow-[0_0_0_1px_rgba(148,163,184,0.08)_inset]">
              <div className="flex items-start gap-6 p-10 md:p-14">
                <div className={`mt-1 ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                  <ShieldIcon className="w-16 h-16 md:w-20 md:h-20" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${accent.chip}`} aria-live="polite">
                      {result}
                    </span>
                    <span className="text-sm text-gray-400">クイズの結果</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-50 leading-snug mt-3">解答と解説</h2>
                  <p className="mt-3 text-lg md:text-xl text-gray-300">{resultSub}</p>
                </div>
              </div>
            </div>

            {/* 解答（結果色で縁取り） */}
            <div className={`mb-12 rounded-2xl border ${accent.border} ${accent.bgSoft} p-8 md:p-10 ring-1 ${accent.ring}`}>
              <p className={`text-base md:text-lg font-medium ${accent.text}/80`}>解答</p>
              <p className={`mt-3 text-2xl md:text-3xl font-semibold ${accent.text} leading-relaxed`}>{answer}</p>
              {!isCorrect && (
                <p className="mt-2 text-sm text-gray-400">※ あなたの選択は正解と異なります。以下の解説で復習しましょう。</p>
              )}
            </div>

            {/* 解説本体 */}
            <div className="space-y-8">
              {blocks.map(({ lines, isList }, i) =>
                isList ? (
                  <div key={i} className="rounded-2xl border border-gray-700/60 bg-[#202428] p-8 md:p-10">
                    <ul className="list-disc space-y-4 pl-7 text-xl md:text-2xl leading-relaxed text-gray-100/90">
                      {lines.map((l, idx) => <li key={idx}>{l.replace(/^([・\-*]\s?)/, "")}</li>)}
                    </ul>
                  </div>
                ) : (
                  <p key={i} className="rounded-2xl border border-gray-700/60 bg-[#202428] p-8 md:p-10 text-xl md:text-2xl leading-loose text-gray-100/95 whitespace-pre-wrap">
                    {lines.join("\n")}
                  </p>
                )
              )}
            </div>

            {/* 次へ */}
            <div className="mt-16 flex justify-center">
              <button
                type="button"
                onClick={onNext}
                className={`inline-flex items-center justify-center rounded-2xl ${accent.btn} px-8 md:px-10 py-4 text-lg md:text-xl font-semibold text-white shadow-xl transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-4 active:translate-y-0`}
              >
                次へ進む
                <svg viewBox="0 0 24 24" className="ml-3 h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
