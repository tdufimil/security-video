"use client";

import { useState } from "react";

export default function QuizModal({
  isOpen,
  question,
  image,
  choices,
  correctAnswers,
  onAnswer,
}: {
  isOpen: boolean;
  question: string;
  image?: string;
  choices: string[];
  correctAnswers: string[];
  onAnswer: (selected: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleClick = (choice: string) => {
    setSelected(choice);
    setAnswered(true);

    setTimeout(() => {
      onAnswer(choice);
      setSelected(null);
      setAnswered(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-7 w-220 h-auto text-center">
        <h2 className="text-5xl font-bold mb-4">{question}</h2>
        {image && <img src={image} alt="quiz" className="mx-auto mb-4 max-h-96" />}
        <div className="space-y-2">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleClick(choice)}
              disabled={answered}
              className={`w-full px-4 py-2 rounded-md text-white font-bold text-5xl my-3 cursor-pointer ${
                answered
                  ? correctAnswers.includes(choice)
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
          <p className="mt-4 font-semibold text-2xl">
            {selected && correctAnswers.includes(selected)
              ? "正解！"
              : `不正解。正しくは「${correctAnswers.join(" / ")}」です。`}
          </p>
        )}
      </div>
    </div>
  );
}