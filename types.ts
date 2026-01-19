export interface Ranking {
  position: number;
  model: string;
  score: number;
  reason: string;
}

export interface JudgeOutput {
  rankings: Ranking[];
}

export interface ModelResponse {
  id: string;
  modelName: string; 
  content: string;
  isError?: boolean;
  timeTaken: number;
  tokensUsed: number;
  cost: number;
}

export interface JudgeResult {
  judgeName: string;
  rawOutput: string;
  parsedOutput: JudgeOutput | null;
  isError?: boolean;
  timeTaken: number;
  tokensUsed: number;
  cost: number;
}

export interface LogEntry {
  timestamp: string;
  sessionId: string;
  question: string;
  responses: {
    model: string;
    content: string;
    metrics: { time: number; tokens: number; cost: number };
  }[];
  judgments: {
    judge: string;
    rankings?: Ranking[];
    raw: string;
  }[];
  status: 'SUCCESS' | 'ERROR';
  errorMessage: string | null;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_RESPONSES = 'GENERATING_RESPONSES',
  JUDGING = 'JUDGING',
  COMPLETE = 'COMPLETE',
}