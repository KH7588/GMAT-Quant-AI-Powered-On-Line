import { Option } from '../types'; // Removed .ts extension

// Standard Data Sufficiency Options
export const DS_OPTIONS: Option[] = [
  { label: "A", text: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient." },
  { label: "B", text: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient." },
  { label: "C", text: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient." },
  { label: "D", text: "EACH statement ALONE is sufficient." },
  { label: "E", text: "Statements (1) and (2) TOGETHER are NOT sufficient." }
];

// QUESTION_BANK has been removed. Individual exam questions will be dynamically loaded
// from `data/exams/` based on the exam ID via `data/examLoaders.ts`.
// PS_ROMAN_NUMERALS_OPTIONS was moved to A1.ts as it was only used there and should not be global.