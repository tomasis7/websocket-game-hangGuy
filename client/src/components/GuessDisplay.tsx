import React, { useMemo } from 'react';

interface GuessDisplayProps {
  correctGuesses: string[]; // ✅ Should be array, not Set
  incorrectGuesses: string[]; // ✅ Should be array, not Set
  remainingGuesses: number;
  maxGuesses: number;
}

export const GuessDisplay: React.FC<GuessDisplayProps> = ({ 
  correctGuesses, 
  incorrectGuesses, 
  remainingGuesses, 
  maxGuesses 
}) => {
  const correctLetters = useMemo(() => [...correctGuesses].sort(), [correctGuesses]);
  const incorrectLetters = useMemo(() => [...incorrectGuesses].sort(), [incorrectGuesses]);
  const totalGuesses = correctLetters.length + incorrectLetters.length;
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Remaining Guesses Section */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Remaining Guesses</h3>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-2xl font-bold ${
            remainingGuesses <= 2 ? 'text-red-600' : 
            remainingGuesses <= 4 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {remainingGuesses}
          </span>
          <span className="text-gray-500">/ {maxGuesses}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              remainingGuesses <= 2 ? 'bg-red-500' : 
              remainingGuesses <= 4 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${(remainingGuesses / maxGuesses) * 100}%` }}
          />
        </div>
      </div>

      {/* Correct Guesses Section */}
      <div>
        <h4 className="text-sm font-medium text-green-700 mb-2">
          Correct Letters ({correctLetters.length})
        </h4>
        <div className="min-h-[2rem] p-2 bg-green-50 rounded border border-green-200">
          {correctLetters.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {correctLetters.map(letter => (
                <span 
                  key={letter} 
                  className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-mono"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-green-600 text-sm italic">No correct guesses yet</span>
          )}
        </div>
      </div>

      {/* Incorrect Guesses Section */}
      <div>
        <h4 className="text-sm font-medium text-red-700 mb-2">
          Incorrect Letters ({incorrectLetters.length})
        </h4>
        <div className="min-h-[2rem] p-2 bg-red-50 rounded border border-red-200">
          {incorrectLetters.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {incorrectLetters.map(letter => (
                <span 
                  key={letter} 
                  className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm font-mono line-through"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-red-600 text-sm italic">No incorrect guesses yet</span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Guesses: {totalGuesses}</span>
          <span>Accuracy: {totalGuesses > 0 ? Math.round((correctLetters.length / totalGuesses) * 100) : 0}%</span>
        </div>
      </div>
    </div>
  );
};