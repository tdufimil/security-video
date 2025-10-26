"use client";

import { useEffect, useState } from "react";
import { fetchStepData } from "../utils/fetchStepData";

type RawOption = { id: string; option?: string; e?: string };
type RawStep =
  | {
      id: string;
      type: "quiz";
      question: string;
      options: RawOption[];
      correct: string;
      nextId: string;
    }
  | { id: string; type: "video"; src?: string; next: string }
  | {
      id: string;
      type: "demo";
      options: string[];
      correct: string[];
      retryOnFail?: boolean;
      videoCorrect: string;
      videoWrong: string;
      nextId: string;
    };

export type Quiz = {
  id: string;
  isShow: boolean;
  question: string;
  options: { id: string; option: string }[];
  correct: string;
  next: string;
};
export type Video = { id: string; isShow: boolean; src?: string; next: string };
export type Demo = {
  id: string;
  isShow: boolean;
  options: string[];
  correct: string[];
  retryOnFail: boolean;
  videoCorrect: string;
  videoWrong: string;
  next: string;
};

export const useStepController = () => {
  const [currentId, setCurrentId] = useState("quiz1");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [stepData, setStepData] = useState<RawStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchStepData();
        if (!Array.isArray(data)) throw new Error("stepData is not an array");
        if (mounted) setStepData(data);
      } catch (e: any) {
        console.error("fetchStepData failed:", e);
        if (mounted) setErr(e?.message ?? "failed to load steps");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || err) return;
    const s = stepData.find((x) => x.id === currentId);
    if (!s) {
      console.warn("No step matched currentId:", currentId);
      setQuiz(null);
      setVideo(null);
      setDemo(null);
      return;
    }

    // リセット
    setQuiz(null);
    setVideo(null);
    setDemo(null);

    if (s.type === "quiz") {
      setQuiz({
        id: s.id,
        isShow: true,
        question: s.question,
        options: s.options
          .map((o) => ({ id: o.id, option: o.option ?? o.e ?? "" }))
          .filter((o) => o.option),
        correct: s.correct,
        next: s.nextId,
      });
      return;
    }

    if (s.type === "video") {
      setVideo({ id: s.id, isShow: true, src: s.src, next: s.next });
      return;
    }

    if (s.type === "demo") {
      setDemo({
        id: s.id,
        isShow: true,
        options: s.options,
        correct: s.correct,
        retryOnFail: s.retryOnFail ?? false,
        videoCorrect: s.videoCorrect,
        videoWrong: s.videoWrong,
        next: s.nextId,
      });
      return;
    }
  }, [currentId, stepData, loading, err]);

  // デバッグ
  useEffect(() => {
    console.log("[useStepController]", {
      loading,
      err,
      currentId,
      stepData,
      quiz,
      video,
      demo,
    });
  }, [loading, err, currentId, stepData, quiz, video, demo]);

  return { quiz, video, demo, currentId, setCurrentId, loading, err };
};
