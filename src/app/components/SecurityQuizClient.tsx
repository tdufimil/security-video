"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStepController } from "../../../hooks/useStepController";
import QuizScreen from "./QuizScreen";
import VideoComponent from "./VideoComponent";
import { useHeartRate } from "../../../hooks/useHeartRate";
import FakeScanProgress from "./FakeScanProgress";
import FakeSupportScamScreen from "./FakeSupportScamScreen";
import NotifyPopup from "./NotifyPopup";
import ScoreSummary from "./ScoreSummary";
import { computeRecoveryTime } from "../lib/heartRateScore";
import ExplainSection from "./ExplainScreen";

export default function SecurityQuizClient({ dataPath }: { dataPath: string }) {
  const {
    quiz,
    video,
    demo,
    explain,
    currentId,
    setCurrentId,
    loading,
    err,
    lastResult,
    setLastResult,
  } = useStepController(dataPath);
  const { devices, selected, subscribe, disconnect, samples, hr, sendStepChange } =
    useHeartRate("http://127.0.0.1:5000");

  // ==== キャリブレーションフェーズ（バックグラウンドで実行） ====
  const CALIBRATION_SAMPLES_NEEDED = 30; // 30サンプル（約30秒）
  const [calibrationComplete, setCalibrationComplete] = useState(false);

  // ==== ローカル制御用の状態（FakeSupportScamScreen向け） ====
  const [showQuiz, setShowQuiz] = useState(true);

  // クイズ正答数管理
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  // 行動速度・判断力管理
  const [actionSeconds, setActionSeconds] = useState<number | null>(null);
  const [isFirstTryCorrect, setIsFirstTryCorrect] = useState<number>(100);

  // セクション履歴管理
  const [sectionHistory, setSectionHistory] = useState<string[]>(["start"]);

  // セクション心拍数記録
  type SectionHR = {
    sectionId: string;
    startHR: number | null;
    endHR: number | null;
  };
  const [sectionHRRecords, setSectionHRRecords] = useState<SectionHR[]>([]);
  const prevSectionRef = useRef<string | null>(null);

  // === デバイスが検出されたら自動で心拍計測開始 ===
  const subscribeAttempted = useRef(false);
  useEffect(() => {
    if (devices.length > 0 && !selected && !subscribeAttempted.current) {
      subscribeAttempted.current = true;
      subscribe(devices[0]).catch(console.error);
    }
  }, [devices, selected, subscribe]);

  // === キャリブレーション完了の判定（バックグラウンド） ===
  useEffect(() => {
    if (!calibrationComplete && samples.length >= CALIBRATION_SAMPLES_NEEDED) {
      // ベースライン心拍数を計算
      const calibrationSamples = samples.slice(0, CALIBRATION_SAMPLES_NEEDED);
      const sum = calibrationSamples.reduce((acc, s) => acc + s.hr, 0);
      const avg = Math.round(sum / calibrationSamples.length);

      console.log("[HR] キャリブレーション完了（バックグラウンド）");
      console.log(`[HR] ベースライン心拍数: ${avg} bpm`);
      setCalibrationComplete(true);
    }
  }, [calibrationComplete, samples, CALIBRATION_SAMPLES_NEEDED]);

  // === 最後（endなど）で切断 ===
  useEffect(() => {
    if (currentId === "end" && selected) {
      console.log("[HR] 終了 → 心拍計測停止");
      disconnect();
    }
  }, [currentId, selected, disconnect]);

  // === セクション変更時に心拍数を記録 & 履歴に追加 ===
  useEffect(() => {
    const prevSection = prevSectionRef.current;

    // セクションが変わった場合
    if (prevSection !== currentId) {
      // 履歴に追加（重複を避ける）
      setSectionHistory((prev) => {
        if (prev[prev.length - 1] !== currentId) {
          return [...prev, currentId];
        }
        return prev;
      });

      // 前のセクションの終了心拍数を記録
      if (prevSection !== null) {
        setSectionHRRecords((prev) => {
          const lastIndex = prev.length - 1;
          const lastRecord = prev[lastIndex];
          if (lastRecord && lastRecord.sectionId === prevSection) {
            // Immutable update: create new array with new object
            return [
              ...prev.slice(0, lastIndex),
              { ...lastRecord, endHR: hr }
            ];
          }
          return prev;
        });
      }

      // 新しいセクションの開始心拍数を記録
      setSectionHRRecords((prev) => [
        ...prev,
        {
          sectionId: currentId,
          startHR: hr,
          endHR: null,
        },
      ]);

      // hrserverにステップ変更を通知
      if (prevSection !== null && selected) {
        // キャリブレーション完了後のみ送信（ステップIDをそのまま表示）
        sendStepChange(currentId, currentId);
      }

      prevSectionRef.current = currentId;
    }
  }, [currentId, hr, selected, sendStepChange]);

  // ベースライン心拍数の計算（最初の30サンプルから）
  const baseHR = useMemo(() => {
    if (samples.length >= CALIBRATION_SAMPLES_NEEDED) {
      const calibrationSamples = samples.slice(0, CALIBRATION_SAMPLES_NEEDED);
      const sum = calibrationSamples.reduce((acc, s) => acc + s.hr, 0);
      const avg = sum / calibrationSamples.length;
      return Math.round(avg);
    }
    // サンプルが十分に集まっていない場合は、現在のサンプルの平均を使用
    if (samples.length > 0) {
      const sum = samples.reduce((acc, s) => acc + s.hr, 0);
      const avg = sum / samples.length;
      return Math.round(avg);
    }
    return 70; // デフォルト値
  }, [samples, CALIBRATION_SAMPLES_NEEDED]);

  const peakHR = hr ?? 90; // 例: 体験時心拍

  // 回復時間の計算（平常時心拍数±5bpmを回復とみなす）
  const recoveryTimeSeconds = useMemo(() =>
    computeRecoveryTime(samples, baseHR, 5),
    [samples, baseHR]
  );

  // FakeSupportScamScreen から「正解」通知（ESC長押し）を受けたら
  const handleQuiz2Result = (
    correct: boolean,
    sec: number
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
      <div className="relative w-screen h-screen overflow-y-auto flex items-start justify-center bg-slate-900/70 py-6">
        <ScoreSummary
          quizCorrectCount={quizCorrectCount}
          isFirstTryCorrect={isFirstTryCorrect}
          baseHR={baseHR}
          peakHR={peakHR}
          actionSeconds={actionSeconds ?? 0}
          recoveryTimeSeconds={recoveryTimeSeconds}
          sectionHRRecords={sectionHRRecords}
          sectionHistory={sectionHistory}
        />
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      {/* 心拍数表示 */}
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
          setLastResult={setLastResult}
        />
      )}
      {/* ---- Explain ---- */}
      {explain?.isShow && (
        <ExplainSection
          answer={explain.answer}
          bodyCorrect={explain.bodyCorrect}
          bodyWrong={explain.bodyWrong}
          isCorrect={!!lastResult}
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
          {demo.backgroundImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={demo.backgroundImage}
                alt="background"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <FakeSupportScamScreen
            onResult={handleQuiz2Result}
            setShowQuiz={setShowQuiz}
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
