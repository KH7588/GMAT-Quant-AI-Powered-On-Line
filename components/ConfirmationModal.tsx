import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  headerText: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, headerText, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-verdana">
      <div className="bg-white rounded-sm shadow-2xl w-[550px] overflow-hidden">
        <div className="bg-[#4c7aae] h-[25px] px-4 flex items-center border-b border-blue-800">
          <span className="text-white font-bold text-sm tracking-wide leading-none">{headerText}</span>
        </div>
        <div className="p-8 pb-6">
          <p className="text-black text-sm mb-8 leading-normal">
            {message}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="bg-[#2b4e7e] text-white font-bold py-1.5 px-8 rounded-sm text-sm border border-[#1a3356] hover:bg-[#1a3356] transition-colors shadow-sm"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="bg-[#e9e9e9] text-black font-normal py-1.5 px-8 rounded-sm text-sm border border-gray-400 hover:bg-gray-300 transition-colors shadow-sm"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
