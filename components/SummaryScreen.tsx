import React, { useState, useEffect } from 'react';
import { UserResponse, Question } from '../types.ts';
import { Flag, ListRestart, BookOpen, X } from 'lucide-react';

interface SummaryScreenProps {
  responses: UserResponse[];
  questions: Record<number, Question> | null;
  onReviewAll: () => void;
  onReviewFlagged: () => void;
  isPracticeMode: boolean;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ responses, questions, onReviewAll, onReviewFlagged, isPracticeMode }) => {
  const [activeExplanation, setActiveExplanation] = useState<{id: string, text: string} | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatText = (text: string | null): string => {
    if (!text) return '';
    return text.replace(/\n/g, '<br />');
  };

  useEffect(() => {
    if (activeExplanation && window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
         window.MathJax.typesetPromise().catch((err: any) => console.log('MathJax Error:', err));
      }, 50);
    }
  }, [activeExplanation]);

  return (
    <div className="flex-1 bg-white flex flex-col relative h-full">
      <div className="flex-1 overflow-y-auto p-8 mb-[25px]">
        <h2 className="text-2xl font-verdana font-bold text-gray-800 mb-6 text-center">Exam Summary</h2>
        <div className="w-full border border-gray-300 rounded-sm overflow-hidden">
          <table className="w-full text-sm font-verdana text-left table-fixed">
             <colgroup>
                <col className="w-[80px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[100px]" />
                {!isPracticeMode && <col className="w-[100px]" />}
            </colgroup>
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="py-3 px-6 font-semibold text-gray-700">Q #</th>
                <th className="py-3 px-6 font-semibold text-gray-700">Your Answer</th>
                <th className="py-3 px-6 font-semibold text-gray-700">Correct Answer</th>
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">Explanation</th>
                {!isPracticeMode && (
                  <th className="py-3 px-6 font-semibold text-gray-700">Time Taken</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {responses.map((response) => (
                <React.Fragment key={response.questionNumber}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 text-gray-800 font-medium">
                      {response.questionNumber}
                      {response.isFlagged && <Flag size={12} className="inline ml-2 text-red-500 fill-current" />}
                    </td>
                    <td className={`py-3 px-6 font-bold ${response.isCorrect ? 'text-green-600' : (response.selectedOption ? 'text-red-600' : 'text-gray-400')}`}>
                      {response.selectedOption || "Skipped"}
                    </td>
                    <td className="py-3 px-6 text-gray-800">
                      {response.correctAnswer}
                    </td>
                    <td className="py-3 px-6 text-center">
                       <button 
                         onClick={() => {
                           const q = questions ? questions[response.questionNumber] : null;
                           if (q) setActiveExplanation({ id: String(response.questionNumber), text: q.explanation });
                         }}
                         className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                         title="View Explanation"
                       >
                         <BookOpen size={18} />
                       </button>
                    </td>
                    {!isPracticeMode && (
                      <td className="py-3 px-6 text-gray-600 font-mono">
                        {response.timeSpent > 0 ? formatTime(response.timeSpent) : "－"}
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {activeExplanation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => setActiveExplanation(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg font-verdana text-gray-800">
                Explanation for Question #{activeExplanation.id}
              </h3>
              <button 
                onClick={() => setActiveExplanation(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
               <div 
                 className="text-sm font-verdana text-gray-800 leading-relaxed tex2jax_process space-y-4"
                 dangerouslySetInnerHTML={{ __html: formatText(activeExplanation.text) }} 
               />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-lg">
              <button
                onClick={() => setActiveExplanation(null)}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#4299e1] text-white h-[25px] flex items-center justify-between px-4 text-sm fixed bottom-0 w-full z-20">
         <div className="flex items-center space-x-6 h-full">
        </div>

        <div className="flex items-center space-x-4 h-full">
          <button 
            onClick={onReviewAll}
            className="flex items-center space-x-1 hover:bg-blue-600 px-2 rounded transition h-full"
          >
            <ListRestart size={12} />
            <span className="leading-none font-semibold">Review All</span>
          </button>

          <button 
            onClick={onReviewFlagged}
            className="flex items-center space-x-1 hover:bg-blue-600 px-2 rounded transition h-full"
          >
            <Flag size={12} />
            <span className="leading-none font-semibold">Review Flagged/Wrong</span>
          </button>
        </div>
      </div>
    </div>
  );
};
