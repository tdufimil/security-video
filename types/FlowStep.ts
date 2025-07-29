export type VideoStep = {
  type: "video";
  id: string;
  src: string;
  next: string;
};

export type QuizStep = {
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
};

export type EndStep = {
  type: "end";
  id: string;
};

export type FlowStep = VideoStep | QuizStep | EndStep;
