import React, { useEffect, useRef, useCallback } from "react";

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
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
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
  const lastPressRef = useRef<string | null>(null);

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

  const getKeyStyles = (state: string) => {
    const base: React.CSSProperties = {
      minWidth: '2.75rem',
      height: '2.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '700',
      fontFamily: 'inherit',
      cursor: state === 'default' ? 'pointer' : 'not-allowed',
      transition: 'all 0.1s ease',
      border: '1px solid',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      flexDirection: 'column' as const,
      position: 'relative' as const,
    };

    switch (state) {
      case 'correct':
        return {
          ...base,
          background: 'var(--success)',
          borderColor: 'var(--success)',
          color: '#fff',
          opacity: 0.9,
        };
      case 'incorrect':
        return {
          ...base,
          background: 'rgba(244,63,94,0.15)',
          borderColor: 'var(--danger)',
          color: 'var(--danger)',
          opacity: 0.6,
        };
      case 'guessed':
        return {
          ...base,
          background: 'var(--border)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
          opacity: 0.5,
        };
      default:
        return {
          ...base,
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          boxShadow: '0 2px 0 var(--border)',
        };
    }
  };

  return (
    <div
      role="group"
      aria-label="Letter keyboard"
      className="w-full flex flex-col items-center gap-1.5 select-none"
    >
      {QWERTY_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 sm:gap-1.5">
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
                onMouseDown={e => {
                  if (isDefault && !disabled) {
                    const el = e.currentTarget;
                    el.style.transform = 'translateY(2px) scale(0.95)';
                    el.style.boxShadow = 'none';
                    lastPressRef.current = letter;
                  }
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = isDefault ? '0 2px 0 var(--border)' : 'none';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = isDefault ? '0 2px 0 var(--border)' : 'none';
                }}
                style={getKeyStyles(state)}
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
