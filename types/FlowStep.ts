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
      choices: string[];
      correct: string[];
      videoCorrect: string;
      videoWrong: string;
      next: string;
      image?: string;
      retryOnFail?: boolean;
    }
  | {
      type: "end";
      id: string;
    };
