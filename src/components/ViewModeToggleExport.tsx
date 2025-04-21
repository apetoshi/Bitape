'use client';

import React from 'react';

export type ViewMode = 'SIMPLE' | 'PRO';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onChange,
  className = '',
  buttonClassName = '',
  compact = false
}) => {
  return (
    <div className={`flex ${compact ? 'border-b-2 border-banana px-3 py-2' : ''} ${className}`}>
      {compact ? (
        <div className="flex w-full justify-between">
          <button 
            onClick={() => onChange('SIMPLE')}
            className={`font-press-start text-xs transition-all duration-200 ${
              viewMode === 'SIMPLE' 
                ? 'text-banana font-bold border-b-2 border-banana pb-1' 
                : 'text-[#4A5568] hover:text-[#6B7280]'
            } ${buttonClassName}`}
          >
            SIMPLE
          </button>
          <button 
            onClick={() => onChange('PRO')}
            className={`font-press-start text-xs transition-all duration-200 ${
              viewMode === 'PRO' 
                ? 'text-banana font-bold border-b-2 border-banana pb-1' 
                : 'text-[#4A5568] hover:text-[#6B7280]'
            } ${buttonClassName}`}
          >
            PRO
          </button>
        </div>
      ) : (
        <button
          onClick={() => onChange(viewMode === 'SIMPLE' ? 'PRO' : 'SIMPLE')}
          className={`pixel-button font-press-start text-xs bg-transparent text-banana border-2 border-banana hover:bg-banana hover:text-royal ${buttonClassName}`}
        >
          {viewMode === 'SIMPLE' ? 'SWITCH TO PRO VIEW' : 'SWITCH TO SIMPLE VIEW'}
        </button>
      )}
    </div>
  );
};

export default ViewModeToggle; 