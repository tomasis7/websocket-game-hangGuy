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
    const base = "relative flex items-center justify-center font-mono text-sm sm:text-base font-semibold border-[1.5px] select-none transition-[transform,background-color,color] duration-100";

    switch (state) {
      case 'correct':
        return `${base} bg-accent text-accent-ink border-accent`;
      case 'incorrect':
        return `${base} text-bad border-dashed border-line cursor-not-allowed`;
      case 'guessed':
        return `${base} text-bad border-line-soft cursor-not-allowed`;
      default:
        return `${base} bg-surface text-ink border-line cursor-pointer hover:bg-accent hover:text-accent-ink hover:border-accent hover:-translate-y-px active:translate-y-0`;
    }
  };

  return (
    <div
      role="group"
      aria-label="Letter keyboard"
      className={`w-full flex flex-col items-center gap-1.5 sm:gap-2 py-2 select-none transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
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
                className={`flex-1 max-w-[2.5rem] sm:max-w-[3.25rem] h-11 sm:h-13 ${getKeyClasses(state)}`}
                style={{ height: '2.875rem' }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
