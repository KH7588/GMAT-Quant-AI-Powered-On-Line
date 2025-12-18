import React, { useState } from 'react';
import { Clock, Layers } from 'lucide-react';

interface HeaderProps {
  title: string;
  elapsedTime: number;
  questionNumber: number;
  totalQuestions: number;
  isPracticeMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, elapsedTime, questionNumber, totalQuestions, isPracticeMode }) => {
  const [showTimer, setShowTimer] = useState(true);

  const formatTime = (seconds: number) => {
    const validSeconds = Math.max(0, seconds);
    const mins = Math.floor(validSeconds / 60);
    const secs = validSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#2d3748] text-white h-[42px] flex items-center justify-between px-4 font-sans shadow-md z-10 relative border-b border-gray-600">
      <div className="flex items-center space-x-4">
        <span className="font-semibold text-gray-200 text-sm">{title}</span>
      </div>
      
      <div className="flex items-center">
        {!isPracticeMode && (
          <div 
            className="flex items-center text-[#fce588] leading-none font-verdana cursor-pointer select-none hover:opacity-90 transition-opacity mr-6"
            onClick={() => setShowTimer(!showTimer)}
            title={showTimer ? "Hide Timer" : "Show Timer"}
          >
            <Clock size={16} strokeWidth={2.5} className="mr-2" />
            {showTimer ? (
              <>
                <span className="text-sm font-normal tracking-tight mr-2">Time Remaining</span>
                <span className="text-sm font-normal tracking-widest">{formatTime(elapsedTime)}</span>
              </>
            ) : (
              <span className="text-sm font-normal tracking-tight opacity-70">Timer Hidden</span>
            )}
          </div>
        )}

        <div className="flex items-center text-white leading-none font-verdana">
          <Layers size={14} className="mr-2" fill="currentColor" strokeWidth={0} />
          <span className="font-bold text-sm tracking-wide font-verdana inline-block origin-left scale-x-90">{questionNumber} of {totalQuestions}</span>
        </div>
      </div>
    </div>
  );
};
