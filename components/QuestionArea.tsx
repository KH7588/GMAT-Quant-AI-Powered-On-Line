import React, { useEffect } from 'react';
import { Question, AppMode } from '../types.ts';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface QuestionAreaProps {
  question: Question;
  selectedOption: string | null;
  onSelectOption: (label: string) => void;
  mode: AppMode;
  userAnswer?: string | null;
}

export const QuestionArea: React.FC<QuestionAreaProps> = ({ 
  question, 
  selectedOption, 
  onSelectOption,
  mode,
  userAnswer
}) => {

  const formatText = (text: string | null): React.ReactElement | null => {
    if (!text) return null;
    const formattedHtml = text.replace(/\n/g, '<br />');
    return <div className="tex2jax_process inline-block" dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
  };

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err: any) => console.log('MathJax Error:', err));
    }
  }, [question]);

  const isReview = mode === AppMode.REVIEW;

  const getOptionColorClass = (label: string) => {
    if (!isReview) return 'text-black';
    if (label === question.correctAnswer) {
      return 'text-green-600 font-bold';
    }
    if (label === userAnswer && userAnswer !== question.correctAnswer) {
      return 'text-red-600 font-bold';
    }
    return 'text-black';
  };

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto pb-8 relative">
      <div className="w-full">
        {question.svg && (
          <div 
            className="mb-8 flex justify-center"
            dangerouslySetInnerHTML={{ __html: question.svg }}
          />
        )}

        <div className="font-verdana text-sm text-black mb-8 leading-relaxed tracking-[-0.5pt] origin-left scale-x-[0.96]">
          {formatText(question.text)}
        </div>

        {question.statements && question.statements.length === 2 && (
           <div className="font-verdana text-sm text-black mb-8 space-y-3 tracking-[-0.5pt]">
            <div className="flex items-start space-x-4">
              <span className="w-5 text-center flex-shrink-0 pt-[1px] tracking-tight">(1)</span>
              <span className="flex-1 -mt-[1px]">{formatText(question.statements[0])}</span>
            </div>
            <div className="flex items-start space-x-4">
              <span className="w-5 text-center flex-shrink-0 pt-[1px] tracking-tight">(2)</span>
              <span className="flex-1 -mt-[1px]">{formatText(question.statements[1])}</span>
            </div>
          </div>
        )}

        {question.romanNumerals && (
          <div className="font-verdana text-sm text-black mb-8 ml-4 space-y-2 tracking-[-0.5pt]">
            <div className="flex">
              <span className="w-8 text-right mr-4">I.</span>
              <span>{formatText(question.romanNumerals.I)}</span>
            </div>
            <div className="flex">
              <span className="w-8 text-right mr-4">II.</span>
              <span>{formatText(question.romanNumerals.II)}</span>
            </div>
            <div className="flex">
              <span className="w-8 text-right mr-4">III.</span>
              <span>{formatText(question.romanNumerals.III)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 font-verdana text-sm tracking-[-0.5pt]">
          {question.options.map((option) => {
            const isChecked = isReview ? (option.label === userAnswer) : (option.label === selectedOption);
            
            return (
              <div 
                key={option.label} 
                className={`flex items-start space-x-4 group cursor-default ${isReview ? '' : 'hover:opacity-100'}`}
                onClick={() => !isReview && onSelectOption(option.label)}
              >
                <div className={`
                  mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors min-w-[20px] flex-shrink-0
                  ${isChecked 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-400 group-hover:border-blue-400'
                  }
                  ${isReview ? 'cursor-default' : 'cursor-pointer'}
                `}>
                  {isChecked && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                
                <div className={`${getOptionColorClass(option.label)} cursor-default flex-1 flex items-start`}>
                  {formatText(option.text)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
