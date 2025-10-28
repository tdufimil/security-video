"use client";

import { useEffect, useMemo, useState } from "react";
import { useStepController } from "../../../hooks/useStepController";
import QuizScreen from "../components/QuizScreen";
import VideoComponent from "../components/VideoComponent";

import { useHeartRate } from "../../../hooks/useHeartRate";
import FakeScanProgress from "../components/FakeScanProgress";
import FakeSupportScamScreen from "../components/FakeSupportScamScreen";
import NotifyPopup from "../components/NotifyPopup";
import ScoreSummary from "../components/ScoreSummary";
import { computeHeartRateScore } from "../lib/heartRateScore";
import ExplainSection from "../components/ExplainScreen";

export default function SecurityQuiz() {
  const { quiz, video, demo, explain, currentId, setCurrentId, loading, err } =
    useStepController("/data/step.json");
  const { devices, selected, subscribe, disconnect, samples, hr } =
    useHeartRate("http://127.0.0.1:5000");

  // ==== ローカル制御用の状態（FakeSupportScamScreen向け） ====
  const [showQuiz, setShowQuiz] = useState(true);
  const [quiz2WrongCount, setQuiz2WrongCount] = useState(0);
  const [retryAfterWrongQuiz2, setRetryAfterWrongQuiz2] = useState(false);

  // クイズ正答数管理
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  // 行動速度・判断力管理
  const [actionSeconds, setActionSeconds] = useState<number | null>(null);
  const [isFirstTryCorrect, setIsFirstTryCorrect] = useState<number>(
    100
  );

  // === quiz1 で心拍取得を開始 ===
  useEffect(() => {
    if (currentId === "quiz1" && devices.length > 0 && !selected) {
      console.log("[HR] quiz1開始 → 心拍計測開始");
      subscribe(devices[0]).catch(console.error);
    }
  }, [currentId, devices, selected, subscribe]);

  // === 最後（endなど）で切断 ===
  useEffect(() => {
    if (currentId === "end" && selected) {
      console.log("[HR] 終了 → 心拍計測停止");
      disconnect();
    }
  }, [currentId, selected, disconnect]);

  // ===  スコア計算 ===
  const scoreDetail = useMemo(() => computeHeartRateScore(samples), [samples]);

  // 仮データ（本番はpropsやcontextから取得）
  const baseHR = 70; // 例: 平常時心拍
  const peakHR = hr ?? 90; // 例: 体験時心拍
  const hrStddev = scoreDetail.std ?? 8; // 例: 心拍標準偏差

  // FakeSupportScamScreen から「正解」通知（ESC長押し）を受けたら
  const handleQuiz2Result = (
    correct: boolean,
    sec: number,
    isFirstTry: boolean
  ) => {
    setActionSeconds(sec);
    if (!demo) return;
    if (correct) {
      setCurrentId("correct1");
    } else {
      setCurrentId("wrong1");
    }
  };

  // ==== ローディングとエラー ====
  if (loading) {
    return (
      <div className="w-screen h-screen grid place-items-center text-gray-500">
        読み込み中…
      </div>
    );
  }
  if (err) {
    return <div className="p-6 text-red-600">エラー: {err}</div>;
  }
  if (!quiz && !video && !demo && currentId == "end") {
    return (
      <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-900/70">
        <ScoreSummary
          quizCorrectCount={quizCorrectCount}
          isFirstTryCorrect={isFirstTryCorrect}
          baseHR={baseHR}
          peakHR={peakHR}
          actionSeconds={actionSeconds ?? 0}
          hrStddev={hrStddev}
        />
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      <div className="absolute top-3 right-3 z-50 rounded bg-black/50 text-white px-3 py-2 text-sm space-y-1">
        <div>HR: {hr ?? "-"} bpm</div>
      </div>
      {/* ---- Quiz ---- */}
      {quiz?.isShow && showQuiz && (
        <QuizScreen
          quizData={quiz}
          setCurrentId={setCurrentId}
          onAnswered={(isCorrect) => {
            if (isCorrect) setQuizCorrectCount((prev) => prev + 1);
          }}
        />
      )}
      {/* ---- Explain ---- */}
      {explain?.isShow && (
        <ExplainSection
          answer={explain.answer}
          body={explain.body}
          onNext={() => setCurrentId(explain.next)}
        />
      )}
      {/* ---- Video ---- */}
      {video?.isShow && (
        <VideoComponent videoData={video} setCurrentId={setCurrentId} />
      )}
      {/* ---- Demo：偽サポート画面＋スキャン＋通知 ---- */}
      {demo?.isShow && (
        <>
          <div className="absolute inset-0 z-0">
            <img
              src="/images/mrcl-screenshot.jpg"
              alt="mrcl screenshot background"
              className="w-full h-full object-cover"
            />
          </div>
          <FakeSupportScamScreen
            onResult={handleQuiz2Result}
            setShowQuiz={setShowQuiz}
            setCurrentId={setCurrentId}
            setRetryAfterWrongQuiz2={setRetryAfterWrongQuiz2}
            wrongCount={quiz2WrongCount}
            setWrongCount={setQuiz2WrongCount}
            isFirstTryCorrect={isFirstTryCorrect}
            setFirstTryCorrect={setIsFirstTryCorrect}
          />
          <FakeScanProgress onComplete={() => {}} />
          <NotifyPopup />
        </>
      )}
    </div>
  );
}
