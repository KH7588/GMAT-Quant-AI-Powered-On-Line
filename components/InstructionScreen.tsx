import React, { useState } from 'react';
import { Timer, MonitorPlay, BrainCircuit, Copy, Upload, ArrowRight, Zap, Feather } from 'lucide-react';

interface InstructionScreenProps {
  onGenerate: (difficulty: 'HARD' | 'EASY') => void;
  onGenerateFromSeeds: (difficulty: 'HARD' | 'EASY') => void;
  onBulkGenerate: (text: string, difficulty: 'HARD' | 'EASY') => void;
  onStart: (isPracticeMode: boolean) => void;
  isGenerating: boolean;
  questionsReady: boolean;
  progress: { current: number; total: number } | null;
}

export const InstructionScreen: React.FC<InstructionScreenProps> = ({ 
  onGenerate, 
  onGenerateFromSeeds,
  onBulkGenerate,
  onStart, 
  isGenerating, 
  questionsReady,
  progress
}) => {
  const [mode, setMode] = useState<'timed' | 'practice'>('timed');
  const [view, setView] = useState<'menu' | 'bulkInput'>('menu');
  const [bulkText, setBulkText] = useState('');
  const [difficulty, setDifficulty] = useState<'HARD' | 'EASY'>('HARD');

  const estimateTime = (text: string) => {
    const count = text.split(/---/).filter(t => t.trim().length > 0).length;
    const seconds = count * 4; 
    return seconds > 60 ? `${Math.ceil(seconds/60)} mins` : `${seconds} secs`;
  };

  if (isGenerating) {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
         <p className="text-gray-800 font-verdana font-bold text-lg mb-2">Crafting your {difficulty === 'EASY' ? 'Warm-up' : 'Challenge'} problem set...</p>
         
         {progress ? (
           <div className="w-full max-w-md mt-4">
             <div className="flex justify-between text-xs text-gray-500 mb-1 font-verdana">
               <span>Processing Batch</span>
               <span>{Math.round((progress.current / progress.total) * 100)}%</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5">
               <div 
                 className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                 style={{ width: `${(progress.current / progress.total) * 100}%` }}
               ></div>
             </div>
             <p className="text-gray-400 text-xs mt-3">
               Generated {progress.current} of {progress.total} questions. Please wait.
             </p>
           </div>
         ) : (
           <p className="text-gray-400 text-xs mt-2">Connecting to AI...</p>
         )}
      </div>
    );
  }

  if (view === 'bulkInput' && !questionsReady) {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <button 
            onClick={() => setView('menu')}
            className="text-blue-600 hover:text-blue-800 font-verdana text-sm mb-4 flex items-center"
          >
            ← Back to Menu
          </button>
          <h2 className="text-xl font-bold font-verdana text-gray-800 mb-2">Bulk Import ({difficulty === 'HARD' ? 'Challenge' : 'Warm-up'})</h2>
          <p className="text-sm text-gray-600 mb-6 font-verdana leading-relaxed">
            Paste your questions below. Separate each question with at least 3 dashes: <code className="bg-gray-100 px-1 rounded border border-gray-300">---</code>
          </p>
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
            placeholder={`Example:
If x2 - y2 = 17, find x+y?
(A) 1
(B) 17
...
---
Machine A takes 10 hours...`}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4">
             <span className="text-xs text-gray-500">
               Detected: <b>{bulkText.split(/[\r\n]+-{3,}[\r\n]+/).filter(t => t.trim().length > 5).length}</b>
               <span className="mx-2">|</span>
               Est. Time: {estimateTime(bulkText)}
             </span>
             <button
               disabled={!bulkText.trim()}
               onClick={() => onBulkGenerate(bulkText, difficulty)}
               className={`flex items-center space-x-2 px-6 py-2 rounded text-white font-bold font-verdana transition-colors ${
                 bulkText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
               }`}
             >
               <span>Start Processing</span>
               <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (questionsReady) {
    return (
       <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col items-center">
        <div className="max-w-3xl w-full mt-10">
          <h1 className="text-2xl font-verdana font-bold text-gray-800 mb-10 text-center">Your Problem Set is Ready!</h1>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="font-verdana text-sm text-gray-700">
              Please select your preferred mode for this problem set. 
              This setting only applies to the current session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div 
              onClick={() => setMode('timed')}
              className={`cursor-pointer border-2 rounded-sm p-6 transition-all relative ${
                mode === 'timed' 
                  ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
                <Timer className={`w-5 h-5 mr-2 ${mode === 'timed' ? 'text-blue-600' : 'text-gray-500'}`} />
                <h3 className="font-verdana font-bold text-base text-gray-800">Timed Mode</h3>
              </div>
              <ul className="list-disc pl-5 space-y-3 font-verdana text-sm text-gray-600 leading-relaxed">
                <li>Timer Active.</li>
                <li>Strict Navigation (Must Answer).</li>
                <li>Simulates real exam pressure.</li>
              </ul>
            </div>

            <div 
              onClick={() => setMode('practice')}
              className={`cursor-pointer border-2 rounded-sm p-6 transition-all relative ${
                mode === 'practice' 
                  ? 'border-green-500 bg-green-50/50 shadow-md ring-1 ring-green-500' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
                <MonitorPlay className={`w-5 h-5 mr-2 ${mode === 'practice' ? 'text-green-600' : 'text-gray-500'}`} />
                <h3 className="font-verdana font-bold text-base text-gray-800">Practice Mode</h3>
              </div>
              <ul className="list-disc pl-5 space-y-3 font-verdana text-sm text-gray-600 leading-relaxed">
                <li>No Time Pressure.</li>
                <li>Flexible Navigation.</li>
                <li>Ideal for reviewing concepts.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => onStart(mode === 'practice')}
              className="bg-[#3182ce] hover:bg-[#2b6cb0] text-white font-verdana font-bold py-3 px-16 rounded shadow-lg transition-transform transform hover:scale-105 active:scale-95 text-lg tracking-wide"
            >
              START EXAM
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
      <div className="max-w-4xl w-full">
        <BrainCircuit size={48} className="mx-auto text-blue-500 mb-4" />
        <h1 className="text-2xl font-verdana font-bold text-gray-800 mb-2">AI Practice System</h1>
        <p className="font-verdana text-md text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose a generation method and set your difficulty level.
        </p>

        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
             <button 
               onClick={() => setDifficulty('HARD')}
               className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-all font-verdana font-bold text-sm ${
                 difficulty === 'HARD' 
                   ? 'bg-white text-blue-800 shadow-sm ring-1 ring-black/5' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <Zap size={16} className={difficulty === 'HARD' ? 'text-blue-600' : ''} />
               <span>700+ Challenge</span>
             </button>
             <button 
               onClick={() => setDifficulty('EASY')}
               className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-all font-verdana font-bold text-sm ${
                 difficulty === 'EASY' 
                   ? 'bg-white text-teal-700 shadow-sm ring-1 ring-black/5' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <Feather size={16} className={difficulty === 'EASY' ? 'text-teal-500' : ''} />
               <span>Warm-up / Foundation</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Random Exam</h3>
              <p className="text-sm text-gray-500 mb-4">
                Completely new questions covering all GMAT Quant topics. 
                <br/><span className="text-xs text-blue-600 mt-2 block font-semibold">{difficulty === 'EASY' ? 'Targeting 500-600 level.' : 'Targeting 700+ level.'}</span>
              </p>
            </div>
            <button
              onClick={() => onGenerate(difficulty)}
              className={`${difficulty === 'EASY' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-verdana font-bold py-3 px-4 rounded w-full transition-colors mt-auto`}
            >
              Generate Random
            </button>
          </div>

          <div className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
            <div className="flex-1">
              <div className="flex items-center justify-center mb-2 space-x-2">
                 <Copy size={18} className="text-purple-600"/>
                 <h3 className="font-bold text-lg text-gray-800">Use Seed File</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Use predefined seeds in <code>data/seedQuestions.ts</code>.
                <br/><span className="text-xs text-purple-600 mt-2 block font-semibold">{difficulty === 'EASY' ? 'Variants will be simplified.' : 'Variants match seed difficulty.'}</span>
              </p>
            </div>
            <button
              onClick={() => onGenerateFromSeeds(difficulty)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-verdana font-bold py-3 px-4 rounded w-full transition-colors mt-auto"
            >
              Load from File
            </button>
          </div>

          <div className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ring-2 ring-transparent hover:ring-indigo-100 bg-white">
            <div className="flex-1">
               <div className="flex items-center justify-center mb-2 space-x-2">
                 <Upload size={18} className="text-indigo-600"/>
                 <h3 className="font-bold text-lg text-gray-800">Bulk Import</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Paste raw text from Word.
                <br/><span className="text-xs text-indigo-600 mt-2 block font-semibold">{difficulty === 'EASY' ? 'Variants will be simplified.' : 'Variants match input.'}</span>
              </p>
            </div>
            <button
              onClick={() => setView('bulkInput')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-verdana font-bold py-3 px-4 rounded w-full transition-colors mt-auto"
            >
              Paste & Process
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
