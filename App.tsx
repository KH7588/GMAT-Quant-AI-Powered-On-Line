import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SubHeader } from './components/SubHeader';
import { QuestionArea } from './components/QuestionArea';
import { Footer } from './components/Footer';
import { SummaryScreen } from './components/SummaryScreen';
import { InstructionScreen } from './components/InstructionScreen';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Question, AppState, AppMode, UserResponse } from './types';
import { APP_CONFIG } from './data/config';
import { generateGmatQuestions, generateVariantsFromSeeds } from './services/geminiService';
import { SEED_QUESTIONS } from './data/seedQuestions';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.READY);
  const [mode, setMode] = useState<AppMode>(AppMode.INSTRUCTION);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Data State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentExamQuestions, setCurrentExamQuestions] = useState<Record<number, Question> | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [currentFlag, setCurrentFlag] = useState(false);
  
  // Review Queue State
  const [reviewQueue, setReviewQueue] = useState<number[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Timer State
  const [remainingTime, setRemainingTime] = useState(APP_CONFIG.timeLimitMinutes * 60);
  const [questionStartTime, setQuestionStartTime] = useState(APP_CONFIG.timeLimitMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<{current: number, total: number} | null>(null);
  const timerRef = useRef<number | null>(null);

  const resetAppState = () => {
    setAppState(AppState.READY);
    setMode(AppMode.INSTRUCTION);
    setIsPracticeMode(false);
    setCurrentQuestion(null);
    setCurrentExamQuestions(null);
    setSelectedOption(null);
    setResponses([]);
    setCurrentFlag(false);
    setReviewQueue([]);
    setReviewIndex(0);
    setRemainingTime(APP_CONFIG.timeLimitMinutes * 60);
    setQuestionStartTime(APP_CONFIG.timeLimitMinutes * 60);
    setQuestionNumber(1);
    setShowConfirmation(false);
    setIsTimerPaused(false);
    setShowExitConfirmation(false);
    setIsGenerating(false);
    setGenProgress(null);

    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      mode === AppMode.SUMMARY || 
      mode === AppMode.REVIEW || 
      mode === AppMode.INSTRUCTION ||
      isPracticeMode || 
      isTimerPaused
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!timerRef.current && mode === AppMode.EXAM && !isTimerPaused) { 
       timerRef.current = window.setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, isPracticeMode, isTimerPaused]);
  
  const handleGenerateSet = async (difficulty: 'HARD' | 'EASY') => {
    setIsGenerating(true);
    setAppState(AppState.LOADING);
    setGenProgress(null);
    try {
      const questions = await generateGmatQuestions(difficulty);
      setCurrentExamQuestions(questions);
      setAppState(AppState.READY);
    } catch (error) {
      console.error("Failed to generate and set questions:", error);
      setAppState(AppState.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromSeeds = async (difficulty: 'HARD' | 'EASY') => {
    setIsGenerating(true);
    setAppState(AppState.LOADING);
    setGenProgress(null);
    try {
      if (SEED_QUESTIONS.length === 0) {
        alert("No seed questions found in data/seedQuestions.ts");
        setIsGenerating(false);
        setAppState(AppState.READY);
        return;
      }
      const questions = await generateVariantsFromSeeds(SEED_QUESTIONS, difficulty);
      
      if (Object.keys(questions).length > 0) {
        setCurrentExamQuestions(questions);
        setAppState(AppState.READY);
      } else {
        throw new Error("AI returned no questions.");
      }
    } catch (error) {
      console.error("Failed to generate variants:", error);
      setAppState(AppState.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async (rawText: string, difficulty: 'HARD' | 'EASY') => {
    const seeds = rawText.split(/[\r\n]+-{3,}[\r\n]+/).map(s => s.trim()).filter(s => s.length > 5);

    if (seeds.length === 0) {
      alert("No valid questions found. Please ensure you separate questions with '---'.");
      return;
    }

    setIsGenerating(true);
    setAppState(AppState.LOADING);
    setGenProgress({ current: 0, total: seeds.length });

    const BATCH_SIZE = 4;
    const accumulatedQuestions: Record<number, Question> = {};
    let globalIndex = 0;

    try {
      for (let i = 0; i < seeds.length; i += BATCH_SIZE) {
        const batchSeeds = seeds.slice(i, i + BATCH_SIZE);
        const batchResults = await generateVariantsFromSeeds(batchSeeds, difficulty);
        
        Object.values(batchResults).forEach((q) => {
          globalIndex++;
          accumulatedQuestions[globalIndex] = q;
        });

        setGenProgress({ current: Math.min(globalIndex, seeds.length), total: seeds.length });
        
        if (i + BATCH_SIZE < seeds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (Object.keys(accumulatedQuestions).length > 0) {
        setCurrentExamQuestions(accumulatedQuestions);
        setAppState(AppState.READY);
      } else {
        throw new Error("No questions were generated successfully.");
      }

    } catch (error) {
       console.error("Bulk generation failed:", error);
       alert("An error occurred during bulk processing. Some questions might have failed.");
       setAppState(AppState.ERROR);
    } finally {
      setIsGenerating(false);
      setGenProgress(null);
    }
  };


  const loadNewQuestion = (qNum: number) => {
    if (!currentExamQuestions) {
      setAppState(AppState.ERROR);
      console.error("No exam questions loaded.");
      return;
    }

    if (!isTimerPaused) { 
      setQuestionStartTime(remainingTime); 
    }
    
    const q = currentExamQuestions[qNum];
    const totalLoaded = Object.keys(currentExamQuestions).length;

    if (q) {
      setCurrentQuestion(q);
      setSelectedOption(null);
      setCurrentFlag(false);
    } else {
      if (qNum > totalLoaded) {
        setMode(AppMode.SUMMARY);
      } else {
        setAppState(AppState.ERROR);
        console.error(`Question ${qNum} not found.`);
      }
    }
  };

  const handleStartExam = (practice: boolean) => {
    setIsPracticeMode(practice);
    setMode(AppMode.EXAM);
    setIsTimerPaused(false);
    loadNewQuestion(1);
  };

  const handleNext = () => {
    if (mode === AppMode.EXAM) {
      if (isPracticeMode) {
        recordResponseAndProceed();
      } else {
        if (selectedOption) {
          setShowConfirmation(true);
        }
      }
      return;
    }

    if (mode === AppMode.REVIEW) {
      const nextIndex = reviewIndex + 1;
      if (nextIndex < reviewQueue.length) {
        setReviewIndex(nextIndex);
        const qNum = reviewQueue[nextIndex];
        setQuestionNumber(qNum);
        loadNewQuestion(qNum); 
      } else {
        setMode(AppMode.SUMMARY);
      }
    }
  };

  const recordResponseAndProceed = () => {
    if (!currentQuestion) return;

    const timeSpent = Math.max(0, questionStartTime - remainingTime);

    const response: UserResponse = {
      questionId: currentQuestion.id,
      questionNumber: questionNumber,
      selectedOption: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: selectedOption === currentQuestion.correctAnswer,
      timeSpent: timeSpent,
      isFlagged: currentFlag
    };

    setResponses(prev => [...prev, response]);

    // Dynamic Total check:
    const totalLoaded = currentExamQuestions ? Object.keys(currentExamQuestions).length : APP_CONFIG.totalQuestions;

    if (questionNumber >= totalLoaded) {
      setMode(AppMode.SUMMARY);
    } else {
      const nextNum = questionNumber + 1;
      setQuestionNumber(nextNum);
      loadNewQuestion(nextNum);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    recordResponseAndProceed();
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleOptionSelect = (label: string) => {
    if (mode === AppMode.EXAM) {
      setSelectedOption(label);
    }
  };

  const handleToggleFlag = () => {
    setCurrentFlag(!currentFlag);
  };

  const handleTogglePause = () => {
    if (mode === AppMode.EXAM && !isPracticeMode) {
      setIsTimerPaused(prev => !prev);
    }
  };

  const handleExit = () => {
    setShowExitConfirmation(true);
  };

  const startReviewAll = () => {
    const totalLoaded = currentExamQuestions ? Object.keys(currentExamQuestions).length : APP_CONFIG.totalQuestions;
    const queue = Array.from({ length: totalLoaded }, (_, i) => i + 1);
    setReviewQueue(queue);
    setReviewIndex(0);
    setMode(AppMode.REVIEW);
    setIsTimerPaused(true);
    setQuestionNumber(queue[0]);
    loadNewQuestion(queue[0]);
  };

  const startReviewFlagged = () => {
    const queue = responses
      .filter(r => r.isFlagged || !r.isCorrect)
      .map(r => r.questionNumber)
      .sort((a, b) => a - b);
    
    if (queue.length === 0) {
      alert("No flagged or incorrect questions to review!");
      return;
    }

    setReviewQueue(queue);
    setReviewIndex(0);
    setMode(AppMode.REVIEW);
    setIsTimerPaused(true);
    setQuestionNumber(queue[0]);
    loadNewQuestion(queue[0]);
  };

  if (appState === AppState.ERROR) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-red-100 font-sans p-8">
        <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
            <p className="text-lg text-red-600 font-medium mb-4">
               Failed to generate questions. This might be an issue with the AI service. Please try again later.
            </p>
            <button 
              onClick={resetAppState}
              className="mt-8 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
        </div>
      </div>
    );
  }

  // Calculate dynamic total for Header
  const currentTotal = currentExamQuestions ? Object.keys(currentExamQuestions).length : APP_CONFIG.totalQuestions;

  if (mode === AppMode.SUMMARY) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
         <Header 
          title={APP_CONFIG.title}
          elapsedTime={remainingTime} 
          questionNumber={currentTotal}
          totalQuestions={currentTotal} 
          isPracticeMode={isPracticeMode}
        />
        <SubHeader 
          isFlagged={false} 
          onToggleFlag={() => {}} 
          disabled={true} 
        />
        <SummaryScreen 
          responses={responses} 
          questions={currentExamQuestions}
          onReviewAll={startReviewAll}
          onReviewFlagged={startReviewFlagged}
          isPracticeMode={isPracticeMode}
        />
        <ConfirmationModal 
          isOpen={showExitConfirmation}
          onConfirm={resetAppState}
          onCancel={() => setShowExitConfirmation(false)}
          headerText="Confirmation"
          message="Are you sure you want to end this session?"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Header 
        title={APP_CONFIG.title}
        elapsedTime={remainingTime} 
        questionNumber={questionNumber}
        totalQuestions={currentTotal}
        isPracticeMode={isPracticeMode} 
      />
      
      <SubHeader 
        isFlagged={currentFlag}
        onToggleFlag={handleToggleFlag}
        disabled={mode === AppMode.REVIEW || mode === AppMode.INSTRUCTION} 
      />
      
      {mode === AppMode.INSTRUCTION ? (
        <InstructionScreen 
          onGenerate={handleGenerateSet}
          onGenerateFromSeeds={handleGenerateFromSeeds}
          onBulkGenerate={handleBulkGenerate}
          onStart={handleStartExam}
          isGenerating={isGenerating}
          questionsReady={!!currentExamQuestions}
          progress={genProgress}
        />
      ) : (
        currentQuestion ? (
          <QuestionArea 
            question={currentQuestion}
            selectedOption={selectedOption}
            onSelectOption={handleOptionSelect}
            mode={mode}
            userAnswer={mode === AppMode.REVIEW ? responses.find(r => r.questionNumber === questionNumber)?.selectedOption : null}
          />
        ) : (
          <div className="flex-1 bg-white p-8 overflow-y-auto flex items-center justify-center text-gray-500 text-lg font-verdana">
            Loading question...
          </div>
        )
      )}
      
      {mode !== AppMode.INSTRUCTION && (
        <Footer 
          onNext={handleNext} 
          loading={false}
          canProceed={
             mode === AppMode.REVIEW || 
             isPracticeMode || 
             (mode === AppMode.EXAM && selectedOption !== null)
          }
          onExit={handleExit}
          onTogglePause={handleTogglePause}
          isTimerPaused={isTimerPaused}
          isPracticeMode={isPracticeMode}
          isExamMode={mode === AppMode.EXAM}
        />
      )}

      <ConfirmationModal 
        isOpen={showConfirmation}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        headerText="Confirmation"
        message="You have selected an answer. Are you sure you want to proceed to the next question?"
      />

      <ConfirmationModal 
        isOpen={showExitConfirmation}
        onConfirm={resetAppState}
        onCancel={() => setShowExitConfirmation(false)}
        headerText="Confirmation"
        message="Are you sure you want to exit? Your progress will be lost."
      />
    </div>
  );
}