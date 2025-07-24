"use client";

import { useEffect, useRef, useState } from "react";
import { FlowStep } from "../../../types/FlowStep";
import QuizModal from "../components/QuizModal";
import FakeSupportScamScreen from "../components/FakeSupportScamScreen";

export default function InteractiveVideoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [flow, setFlow] = useState<FlowStep[]>([]);
  const [currentId, setCurrentId] = useState("intro");
  const [videoSrc, setVideoSrc] = useState<string | null>("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<FlowStep | null>(null);
  const [shouldPlayAfterLoad, setShouldPlayAfterLoad] = useState(false);
  const [pendingNextId, setPendingNextId] = useState<string | null>(null);
  const [retryQuizId, setRetryQuizId] = useState<string | null>(null);
  const [retryAfterWrongQuiz2, setRetryAfterWrongQuiz2] = useState(false);

  useEffect(() => {
    fetch("/data/flow.json")
      .then((res) => res.json())
      .then((data: FlowStep[]) => setFlow(data));
  }, []);

  useEffect(() => {
    const step = flow.find((s) => s.id === currentId);
    if (!step) return;

    if (step.type === "video") {
      setVideoSrc(step.src);
      setShowQuiz(false);
      console.log("再生する動画:", step.src);
    } else if (step.type === "quiz") {
      setCurrentQuiz(step);
      setShowQuiz(true);
    }
  }, [currentId, flow]);

  const handleVideoEnd = () => {
    if (retryAfterWrongQuiz2 && currentId === "wrong2") {
      setCurrentId("quiz2");
      setRetryAfterWrongQuiz2(false);
      return;
    }
    if (pendingNextId) {
      setCurrentId(pendingNextId);
      setPendingNextId(null);
      return;
    }
    if (retryQuizId) {
      setCurrentId(retryQuizId);
      setRetryQuizId(null);
      return;
    }
    const step = flow.find((s) => s.id === currentId);
    if (step?.type === "video") {
      setCurrentId(step.next);
    }
  };

  // quiz2用の専用判定ロジック
  const handleQuiz2Result = (isCorrect: boolean) => {
    if (
      !currentQuiz ||
      currentQuiz.type !== "quiz" ||
      currentQuiz.id !== "quiz2"
    )
      return;
    const nextVideo = isCorrect
      ? currentQuiz.videoCorrect
      : currentQuiz.videoWrong;

    setShowQuiz(false);
    setShouldPlayAfterLoad(true);

    // quiz2だけ不正解で動画→再度クイズ2ループ
    if (!isCorrect) {
      setCurrentId("wrong2");
      setRetryAfterWrongQuiz2(true);
      setVideoSrc(nextVideo);
      return;
    }

    setVideoSrc(nextVideo);
    setPendingNextId(currentQuiz.next);
    console.log("クイズ2の回答に基づく動画:", nextVideo);
  };

  // quiz1その他クイズ用
  const handleQuizAnswered = (selected: string) => {
    if (currentQuiz?.type !== "quiz") return;

    const isCorrect = currentQuiz.correct.includes(selected);
    const nextVideo = isCorrect
      ? currentQuiz.videoCorrect
      : currentQuiz.videoWrong;

    setShowQuiz(false);
    setShouldPlayAfterLoad(true);

    if (!isCorrect && currentQuiz.id === "quiz2") {
      // 通常ここは通らない、FakeSupportScamScreenで判定するので保険
      setCurrentId("wrong2");
      setRetryAfterWrongQuiz2(true);
      setVideoSrc(nextVideo);
      return;
    }

    setVideoSrc(nextVideo);

    if (!isCorrect && currentQuiz.retryOnFail) {
      setRetryQuizId(currentQuiz.id);
    } else {
      setPendingNextId(currentQuiz.next);
    }

    console.log("クイズの回答に基づく動画:", nextVideo);
  };

  return (
    <div className="flex flex-col items-center">
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          onEnded={handleVideoEnd}
          onLoadedData={() => {
            if (shouldPlayAfterLoad) {
              videoRef.current?.play();
              setShouldPlayAfterLoad(false);
            }
          }}
          controls
          autoPlay
          className="w-screen h-screen object-cover"
        />
      )}
      {showQuiz &&
      currentQuiz?.type === "quiz" &&
      currentQuiz.id === "quiz2" ? (
        <FakeSupportScamScreen onResult={handleQuiz2Result} />
      ) : (
        showQuiz &&
        currentQuiz?.type === "quiz" && (
          <QuizModal
            isOpen={showQuiz}
            question={currentQuiz.question}
            image={currentQuiz.image}
            choices={currentQuiz.choices}
            correctAnswers={currentQuiz.correct}
            onAnswer={handleQuizAnswered}
          />
        )
      )}
    </div>
  );
}
