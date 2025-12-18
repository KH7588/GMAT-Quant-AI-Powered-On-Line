export interface Option {
  label: string; // A, B, C, D, E
  text: string;
}

export interface Question {
  id: string;
  text: string;
  // Optional SVG content for graphical questions
  svg?: string;
  // For Data Sufficiency
  statements?: string[]; 
  // For Problem Solving with Roman Numerals
  romanNumerals?: {
    I: string;
    II: string;
    III: string;
  };
  options: Option[];
  correctAnswer: string; // 'A', 'B', etc.
  explanation: string;
}

export enum AppState {
  LOADING,
  READY,
  ERROR
}

export enum AppMode {
  INSTRUCTION = 'INSTRUCTION',
  EXAM = 'EXAM',
  SUMMARY = 'SUMMARY',
  REVIEW = 'REVIEW'
}

export interface UserResponse {
  questionId: string;
  questionNumber: number;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  isFlagged: boolean;
}
