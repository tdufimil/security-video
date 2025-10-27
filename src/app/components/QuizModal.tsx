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
  // `image` can be a single image path or an array of two image paths
  image?: string | string[];
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm py-8 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl p-7 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto text-center">
        <h2 className="text-5xl font-bold mb-4">{question}</h2>
        {/* If image is an array of two images, display them side-by-side. If it's a single image, center it. */}
        {Array.isArray(image) && image.length === 2 ? (
          <div className="mb-4 flex flex-col md:flex-row items-center justify-center gap-4">
            <img src={image[0]} alt="left" className="max-h-72 w-full md:w-1/2 object-contain rounded" />
            <img src={image[1]} alt="right" className="max-h-72 w-full md:w-1/2 object-contain rounded" />
          </div>
        ) : (
          image && <img src={String(image)} alt="quiz" className="mx-auto mb-4 max-h-96 w-full object-contain" />
        )}
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