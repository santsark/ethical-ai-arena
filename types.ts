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

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_RESPONSES = 'GENERATING_RESPONSES',
  JUDGING = 'JUDGING',
  COMPLETE = 'COMPLETE',
}