import React from 'react';
import { Flag } from 'lucide-react';

interface SubHeaderProps {
  isFlagged: boolean;
  onToggleFlag: () => void;
  disabled?: boolean;
}

export const SubHeader: React.FC<SubHeaderProps> = ({ isFlagged, onToggleFlag, disabled = false }) => {
  return (
    <div className="bg-[#4299e1] text-white h-[22px] flex items-center justify-between px-4 text-xs font-medium shadow-sm z-0 relative">
      <div className="flex items-center space-x-4 h-full">
        <div className="flex items-center space-x-1 px-2 h-full cursor-default">
          <span className="font-bold leading-none">Quantitative</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 h-full">
        <button 
          onClick={onToggleFlag}
          disabled={disabled}
          className={`flex items-center space-x-1 px-2 rounded transition h-full ${
            isFlagged ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-blue-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Flag size={10} fill={isFlagged ? "white" : "none"} />
          <span className="leading-none">{isFlagged ? 'Flagged' : 'Flag as Review'}</span>
        </button>
      </div>
    </div>
  );
};
