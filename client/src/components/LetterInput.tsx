import React, { useEffect, useCallback } from "react";

interface LetterInputProps {
  onGuess: (letter: string) => void;
  disabled?: boolean;
  guessedLetters: Set<string>;
  correctLetters?: Set<string>;
  incorrectLetters?: Set<string>;
}

const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

function CheckIcon() {
  return (
    <svg className="absolute bottom-1 right-1 opacity-70" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="absolute bottom-1 right-1 opacity-70" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}

export const LetterInput: React.FC<LetterInputProps> = ({
  onGuess,
  disabled = false,
  guessedLetters,
  correctLetters,
  incorrectLetters,
}) => {
  const handleGuess = useCallback((letter: string) => {
    if (disabled || guessedLetters.has(letter)) {return;}
    onGuess(letter);
  }, [disabled, guessedLetters, onGuess]);

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) {return;}
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !guessedLetters.has(key)) {
        e.preventDefault();
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, guessedLetters, handleGuess]);

  const getKeyState = (letter: string) => {
    if (correctLetters?.has(letter)) {return 'correct';}
    if (incorrectLetters?.has(letter)) {return 'incorrect';}
    if (guessedLetters.has(letter)) {return 'guessed';}
    return 'default';
  };

  const getKeyClasses = (state: string) => {
    const base = "relative flex items-center justify-center rounded-xl text-sm sm:text-lg font-bold transition-all duration-150 select-none shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    switch (state) {
      case 'correct':
        return `${base} bg-emerald-500 text-white shadow-inner opacity-90 border-b-2 border-emerald-700`;
      case 'incorrect':
        return `${base} bg-rose-100 text-rose-500 shadow-inner opacity-60 border-b-2 border-rose-200`;
      case 'guessed':
        return `${base} bg-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed shadow-none`;
      default:
        return `${base} bg-white text-zinc-800 border sm:border-zinc-200 border-b-2 border-zinc-300 hover:bg-zinc-50 active:translate-y-0.5 active:border-b-0 cursor-pointer`;
    }
  };

  return (
    <div
      role="group"
      aria-label="Letter keyboard"
      className="w-full flex flex-col items-center gap-2 sm:gap-3 py-4 select-none"
    >
      {QWERTY_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5 sm:gap-2 w-full max-w-2xl px-1">
          {row.map(letter => {
            const state = getKeyState(letter);
            const isDefault = state === 'default';
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={disabled || !isDefault}
                aria-label={`Guess letter ${letter}${state !== 'default' ? `, ${state}` : ''}`}
                aria-disabled={disabled || !isDefault}
                className={`flex-1 max-w-[2.5rem] sm:max-w-[3.5rem] h-12 sm:h-14 ${getKeyClasses(state)}`}
              >
                <span>{letter}</span>
                {state === 'correct' && <CheckIcon />}
                {state === 'incorrect' && <XIcon />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
