export type FlowStep =
  | {
      type: "video";
      id: string;
      src: string;
      next: string;
    }
  | {
      type: "quiz";
      id: string;
      question: string;
      image?: string;
      choices: string[];
      correct: string[];
      videoCorrect: string;
      videoWrong: string | null;
      retryOnFail?: boolean;
      next: string;
    }
  | {
      type: "end";
      id: string;
    };