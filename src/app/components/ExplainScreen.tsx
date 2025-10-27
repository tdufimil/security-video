"use client";

import { useMemo } from "react";

type Props = {
  answer: string;
  body: string;
  onNext: () => void;
};

const ShieldIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" />
    <path
      d="M12 7a4 4 0 00-4 4 1 1 0 102 0 2 2 0 114 0c0 2.5-2.5 3.6-3.6 5.6a1 1 0 001.7 1c1.2-2.2 3.9-3.5 3.9-6.6A4 4 0 0012 7z"
      opacity=".25"
    />
  </svg>
);

export default function ExplainSection({ answer, body, onNext }: Props) {
  const blocks = useMemo(() => {
    const paragraphs = body
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);

    return paragraphs.map((p) => {
      const lines = p.split(/\n/).map((l) => l.trim());
      const bulletLike =
        lines.filter((l) => /^([・\-*]|・\s|-\s|\*\s)/.test(l)).length /
        Math.max(1, lines.length);
      return { lines, isList: bulletLike >= 0.6 };
    });
  }, [body]);

  return (
    <section className="relative w-full">
      <div className="relative min-h-screen w-full bg-[#1b1e22] text-gray-100 flex flex-col">
        {/* grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, #94a3b833 0px, #94a3b833 1px, transparent 1px, transparent 18px)",
          }}
        />
        {/* glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 400px at 30% -10%, rgba(59,130,246,0.07), transparent 60%), radial-gradient(700px 400px at 80% 110%, rgba(248,113,113,0.08), transparent 60%)",
          }}
        />

        {/* 中央寄せ */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-6xl px-6 md:px-8">

            {/* 見出しカード */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-700/50 bg-[#23272b]/70 shadow-[0_0_0_1px_rgba(148,163,184,0.08)_inset]">
              <div className="flex items-start gap-5 p-8 md:p-10">
                <div className="mt-1 text-rose-400">
                  <ShieldIcon className="w-12 h-12 md:w-14 md:h-14" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-4xl font-bold text-gray-50 leading-snug">
                    解答と解説
                  </h2>
                  <p className="mt-2 text-sm text-gray-400">
                    次のステップへ進む前に、要点を確認しましょう
                  </p>
                </div>
              </div>
            </div>

            {/* 解答 */}
            <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-xs font-medium text-emerald-300/80">解答</p>
              <p className="mt-1 text-base font-semibold text-emerald-200">
                {answer}
              </p>
            </div>

            {/* 本文 */}
            <div className="space-y-4">
              {blocks.map(({ lines, isList }, i) =>
                isList ? (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-700/60 bg-[#202428] p-5"
                  >
                    <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-gray-100/90">
                      {lines.map((l, idx) => (
                        <li key={idx}>{l.replace(/^([・\-*]\s?)/, "")}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p
                    key={i}
                    className="rounded-xl border border-gray-700/60 bg-[#202428] p-5 text-[15px] leading-relaxed text-gray-100/90 whitespace-pre-wrap"
                  >
                    {lines.join("\n")}
                  </p>
                )
              )}
            </div>

            {/* 次へ */}
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-[1px] hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 active:translate-y-0"
              >
                次へ進む
                <svg
                  viewBox="0 0 24 24"
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
