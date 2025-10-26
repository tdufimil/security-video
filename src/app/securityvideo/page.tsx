"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowStep, QuizStep } from "../../../types/FlowStep";
import QuizModal from "../components/QuizModal";
import FakeSupportScamScreen from "../components/FakeSupportScamScreen";
import FakeScanProgress from "../components/FakeScanProgress";
import NotifyPopup from "../components/NotifyPopup";

function isQuizStep(step: FlowStep): step is QuizStep {
  return step.type === "quiz";
}

export default function InteractiveVideoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  const [flow, setFlow] = useState<FlowStep[]>([]);
  const [currentId, setCurrentId] = useState("intro");
  const [videoSrc, setVideoSrc] = useState<string | null>("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizStep | null>(null);
  const [shouldPlayAfterLoad, setShouldPlayAfterLoad] = useState(false);
  const [pendingNextId, setPendingNextId] = useState<string | null>(null);
  const [retryQuizId, setRetryQuizId] = useState<string | null>(null);
  const [retryAfterWrongQuiz2, setRetryAfterWrongQuiz2] = useState(false);
  const [quiz2WrongCount, setQuiz2WrongCount] = useState(0);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);

  useEffect(() => {
    fetch("/data/flow.json")
      .then((res) => res.json())
      .then((data: FlowStep[]) => setFlow(data));
  }, []);

  useEffect(() => {
    const step = flow.find((s) => s.id === currentId);
    if (!step) return;

    if (step.type === "video") {
      console.log("Now playing video:", step.src);
      setVideoSrc(step.src);
      setShowQuiz(false);
    } else if (step.type === "quiz") {
      if (step.id === "quiz2") {
        setShowFullscreenPrompt(true);
      } else if (isQuizStep(step)) {
        setCurrentQuiz(step);
        setShowQuiz(true);
      }
    }
  }, [currentId, flow]);

  const handleVideoEnd = () => {
    if (currentId === "wrong3" || videoSrc?.includes("correct2.mp4")) {
      setShowEndMessage(true);
      return;
    }

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
    if (step?.type === "video" && step.next) {
      setCurrentId(step.next);
    }
  };

  const handleQuiz2Result = (isCorrect: boolean) => {
    if (!currentQuiz || currentQuiz.id !== "quiz2") return;

    setShowQuiz(false);
    setCurrentQuiz(null);
    setShouldPlayAfterLoad(true);

    if (!isCorrect) {
      if (quiz2WrongCount === 0) {
        setQuiz2WrongCount(1);
        setCurrentId("wrong2");
        setVideoSrc(currentQuiz.videoWrong);
        setRetryAfterWrongQuiz2(true);
      } else {
        setQuiz2WrongCount(2);
        setCurrentId("wrong3");
        setVideoSrc("/video/wrong3.mp4");
      }
      return;
    }

    setVideoSrc(currentQuiz.videoCorrect);
    setPendingNextId(currentQuiz.next);
  };

  const handleQuizAnswered = (selected: string) => {
    if (!currentQuiz) return;

    const isCorrect = currentQuiz.correct.includes(selected);

    setShowQuiz(false);
    setCurrentQuiz(null);
    setShouldPlayAfterLoad(true);

    if (!isCorrect && currentQuiz.id === "quiz2") {
      if (quiz2WrongCount === 0) {
        setQuiz2WrongCount(1);
        setCurrentId("wrong2");
        setVideoSrc(currentQuiz.videoWrong);
        setRetryAfterWrongQuiz2(true);
      } else {
        setQuiz2WrongCount(2);
        setCurrentId("wrong3");
        setVideoSrc("/video/wrong3.mp4");
      }
      return;
    }

    const nextVideo = isCorrect ? currentQuiz.videoCorrect : currentQuiz.videoWrong;
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
      requestFullScreen?.call(docEl);
    }

    setShowFullscreenPrompt(false);
    const quiz2 = flow.find((s) => s.id === "quiz2");
    if (quiz2 && isQuizStep(quiz2)) {
      setCurrentQuiz(quiz2);
      setShowQuiz(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {showQuiz && currentQuiz?.id === "quiz2" && (
        <div className="absolute inset-0 z-0">
          <img
            src="/images/mrcl-screenshot.jpg"
            alt="mrcl screenshot background"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          onEnded={handleVideoEnd}
          onLoadedData={() => {
            if (shouldPlayAfterLoad && videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play();
              setShouldPlayAfterLoad(false);
            }
          }}
          controls
          autoPlay
          className="w-full h-full object-cover"
        />
      )}

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

      {showQuiz && currentQuiz?.id === "quiz2" ? (
        <>
          <FakeSupportScamScreen
            onResult={handleQuiz2Result}
            setShowQuiz={setShowQuiz}
            setCurrentId={setCurrentId}
            setRetryAfterWrongQuiz2={setRetryAfterWrongQuiz2}
            wrongCount={quiz2WrongCount}
            setWrongCount={setQuiz2WrongCount}
          />
          <FakeScanProgress onComplete={() => {}} />
          <NotifyPopup />
        </>
      ) : (
        showQuiz &&
        currentQuiz && (
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

      {showEndMessage && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center space-y-6">
          <p className="text-3xl font-bold">
            ご視聴ありがとうございました！<br />
            アンケートのご記入をお願いいたします。
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 text-xl bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
          >
            トップに戻る
          </button>
        </div>
      )}
    </div>
  );
}
