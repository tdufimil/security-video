"use client";

import { useEffect, useRef, useState } from "react";
import { FlowStep } from "../../../types/FlowStep";
import QuizModal from "../components/QuizModal";
import FakeSupportScamScreen from "../components/FakeSupportScamScreen";
import FakeScanProgress from "../components/FakeScanProgress";
import NotifyPopup from "../components/NotifyPopup";

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
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

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
    } else if (step.type === "quiz") {
      if (step.id === "quiz2") {
        setShowFullscreenPrompt(true);
      } else {
        setCurrentQuiz(step);
        setShowQuiz(true);
      }
    }
  }, [currentId, flow]);

  const handleVideoEnd = () => {
    if (retryAfterWrongQuiz2 && currentId === "wrong2") {
      setShowFullscreenPrompt(true);
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

  const handleQuiz2Result = (isCorrect: boolean) => {
    if (!currentQuiz || currentQuiz.type !== "quiz" || currentQuiz.id !== "quiz2") return;

    const nextVideo = isCorrect ? currentQuiz.videoCorrect : currentQuiz.videoWrong;
    setShowQuiz(false);
    setShouldPlayAfterLoad(true);

    if (!isCorrect) {
      setCurrentId("wrong2");
      setRetryAfterWrongQuiz2(true);
      setVideoSrc(nextVideo);
      return;
    }

    setVideoSrc(nextVideo);
    setPendingNextId(currentQuiz.next);
  };

  const handleQuizAnswered = (selected: string) => {
    if (currentQuiz?.type !== "quiz") return;

    const isCorrect = currentQuiz.correct.includes(selected);
    const nextVideo = isCorrect ? currentQuiz.videoCorrect : currentQuiz.videoWrong;
    setShowQuiz(false);
    setShouldPlayAfterLoad(true);

    if (!isCorrect && currentQuiz.id === "quiz2") {
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
  };

  const enterFullscreenAndStartQuiz2 = () => {
    const doc = document;
    const docEl = document.documentElement;
    const requestFullScreen =
      docEl.requestFullscreen ||
      (docEl as any).webkitRequestFullscreen ||
      (docEl as any).mozRequestFullScreen ||
      (docEl as any).msRequestFullscreen;

    if (
      !doc.fullscreenElement &&
      !(doc as any).webkitFullscreenElement &&
      !(doc as any).mozFullScreenElement &&
      !(doc as any).msFullscreenElement
    ) {
      requestFullScreen.call(docEl);
    }

    setShowFullscreenPrompt(false);
    setCurrentQuiz(flow.find((s) => s.id === "quiz2") || null);
    setShowQuiz(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🎥 動画再生エリア */}
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
          className="w-full h-full object-cover"
        />
      )}

      {/* ▶️ quiz2へ進む全画面ボタン */}
      {showFullscreenPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <button
            onClick={enterFullscreenAndStartQuiz2}
            className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded shadow hover:bg-blue-700"
          >
            クイズを始める（全画面表示）
          </button>
        </div>
      )}

      {/* ❓ クイズ or サポート詐欺UI */}
      {showQuiz && currentQuiz?.id === "quiz2" ? (
        <>
          <FakeSupportScamScreen
            onResult={handleQuiz2Result}
            videoWrongUrl={currentQuiz.videoWrong!}
            setVideoSrc={setVideoSrc}
            setShowQuiz={setShowQuiz}
            setCurrentId={setCurrentId}
            setRetryAfterWrongQuiz2={setRetryAfterWrongQuiz2}
          />
          <FakeScanProgress onComplete={() => {}} />
          <NotifyPopup />
        </>
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
