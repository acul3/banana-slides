import React, { useState, memo } from 'react';
import { Sparkles, History, ChevronDown, ChevronUp, Send } from 'lucide-react';

export interface AiRefineInputProps {
  /** Title text */
  title: string;
  /** Input placeholder text */
  placeholder: string;
  /** Submit callback function, receives current requirement and history requirements, returns Promise */
  onSubmit: (requirement: string, previousRequirements: string[]) => Promise<void>;
  /** Whether disabled (e.g., when there's no content to modify) */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Status change callback, notifies parent component whether currently submitting */
  onStatusChange?: (isSubmitting: boolean) => void;
}

const AiRefineInputComponent: React.FC<AiRefineInputProps> = ({
  title,
  placeholder,
  onSubmit,
  disabled = false,
  className = '',
  onStatusChange,
}) => {
  const [requirement, setRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async () => {
    if (!requirement.trim() || isSubmitting || disabled) return;

    const currentRequirement = requirement.trim();
    setIsSubmitting(true);
    onStatusChange?.(true); // Notify parent that submission started
    try {
      await onSubmit(currentRequirement, history);
      // On success, add current requirement to history
      setHistory(prev => [...prev, currentRequirement]);
      // Clear input
      setRequirement('');
    } finally {
      setIsSubmitting(false);
      onStatusChange?.(false); // Notify parent that submission ended
    }
  };

  // Handle Ctrl+Enter shortcut
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (disabled) {
    return null;
  }

  // Determine if compact mode (when there's no title)
  const isCompactMode = !title;

  return (
    <div className={isCompactMode ? `group ${className}` : `group bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 md:p-4 border border-purple-200 ${className}`}>
      {/* Title and history button - only shown in non-compact mode */}
      {!isCompactMode && (
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600 md:w-[18px] md:h-[18px]" />
            <h3 className="text-xs md:text-sm font-semibold text-gray-800">{title}</h3>
            <span className="text-xs text-gray-500 hidden sm:inline">(Ctrl+Enter to submit)</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <History size={14} />
              <span className="hidden sm:inline">History ({history.length})</span>
              <span className="sm:hidden">{history.length}</span>
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      )}

      {/* History display */}
      {showHistory && history.length > 0 && (
        <div className={`${isCompactMode ? 'mb-2' : 'mb-3'} p-2 bg-white rounded border ${isCompactMode ? 'border-gray-200 shadow-sm' : 'bg-white/60 border-purple-100'} max-h-32 overflow-y-auto`}>
          <div className="text-xs text-gray-500 mb-1">Previous modification requests:</div>
          <ul className="space-y-1">
            {history.map((req, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                <span className="text-purple-400 flex-shrink-0">{idx + 1}.</span>
                <span className="break-all">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 items-center relative">
        {/* Compact mode: show icon and history button */}
        {isCompactMode && (
          <>
            <Sparkles size={16} className={`flex-shrink-0 transition-colors ${isSubmitting ? 'text-purple-500' : 'text-purple-600'}`} />
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors flex-shrink-0"
                title={`View ${history.length} previous modifications`}
              >
                <History size={14} />
                <span className="hidden sm:inline">{history.length}</span>
              </button>
            )}
          </>
        )}

        <div className="flex-1 relative">
          <input
            type="text"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-3 py-1.5 text-sm border ${isCompactMode ? 'border-gray-200' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${isSubmitting ? 'animate-gradient-x bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 bg-[length:200%_100%]' : 'bg-white'
              }`}
            disabled={isSubmitting}
          />
          {isSubmitting && (
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent animate-shimmer"
                style={{ backgroundSize: '200% 100%' }} />
            </div>
          )}
        </div>

        {/* Submit button - always shown on mobile, shown on hover on desktop */}
        <button
          onClick={handleSubmit}
          disabled={!requirement.trim() || isSubmitting}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all ${!requirement.trim() || isSubmitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
            } md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100`}
          title="Submit (Ctrl+Enter)"
        >
          <Send size={16} className={isSubmitting ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
};

// Wrap component with memo to avoid re-renders when parent component re-renders frequently
// Only re-render when props actually change
export const AiRefineInput = memo(AiRefineInputComponent);


