import React, { useState, useEffect, useRef } from 'react';

interface LetterInputProps {
  onGuess: (letter: string) => void;
  disabled?: boolean;
  guessedLetters: Set<string>;
}

export const LetterInput: React.FC<LetterInputProps> = ({ onGuess, disabled = false, guessedLetters }) => {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' | '' }>({ message: '', type: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and when game becomes active
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Clear feedback after a delay
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow single letters
    if (value === '' || /^[A-Z]$/.test(value)) {
      setInputValue(value);
      setFeedback({ message: '', type: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGuess();
  };

  const handleGuess = () => {
    if (!inputValue) {
      setFeedback({ message: 'Please enter a letter', type: 'error' });
      return;
    }

    if (guessedLetters.has(inputValue)) {
      setFeedback({ message: `You already guessed "${inputValue}"`, type: 'error' });
      return;
    }

    if (disabled) {
      setFeedback({ message: 'Game is not active', type: 'error' });
      return;
    }

    // Submit the guess
    onGuess(inputValue);
    setInputValue('');
    setFeedback({ message: `Guessed "${inputValue}"`, type: 'success' });
    
    // Refocus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard handler for global key presses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if input is not focused and game is active
      if (disabled || document.activeElement === inputRef.current) {
        return;
      }

      const key = e.key.toUpperCase();
      
      // Handle letter keys
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        setInputValue(key);
        
        // Auto-submit if it's a valid new guess
        if (!guessedLetters.has(key)) {
          onGuess(key);
          setFeedback({ message: `Guessed "${key}"`, type: 'success' });
        } else {
          setFeedback({ message: `You already guessed "${key}"`, type: 'error' });
        }
      }
      
      // Handle Enter key
      if (e.key === 'Enter' && inputValue) {
        e.preventDefault();
        handleGuess();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, guessedLetters, inputValue, onGuess]);

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Field */}
        <div className="relative">
          <label htmlFor="letter-input" className="block text-sm font-medium text-gray-700 mb-2">
            Guess a Letter
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="letter-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              maxLength={1}
              placeholder="A-Z"
              className={`
                flex-1 px-4 py-3 text-2xl font-mono text-center uppercase
                border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${disabled 
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
                ${feedback.type === 'error' ? 'border-red-500' : ''}
                ${feedback.type === 'success' ? 'border-green-500' : ''}
              `}
            />
            <button
              type="submit"
              disabled={disabled || !inputValue}
              className={`
                px-6 py-3 font-semibold rounded-lg transition-colors
                ${disabled || !inputValue
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                }
              `}
            >
              Guess
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback.message && (
          <div className={`
            p-3 rounded-lg text-sm font-medium
            ${feedback.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
            }
          `}>
            {feedback.message}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Type a letter and press Enter, or click Guess</p>
          <p>You can also press any letter key to guess directly</p>
        </div>
      </form>

      {/* Virtual Keyboard (Optional) */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Virtual Keyboard</h4>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && !guessedLetters.has(letter)) {
                  onGuess(letter);
                  setFeedback({ message: `Guessed "${letter}"`, type: 'success' });
                }
              }}
              disabled={disabled || guessedLetters.has(letter)}
              className={`
                w-8 h-8 text-sm font-mono font-semibold rounded border-2 transition-colors
                ${disabled || guessedLetters.has(letter)
                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                }
                ${guessedLetters.has(letter) ? 'line-through' : ''}
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};