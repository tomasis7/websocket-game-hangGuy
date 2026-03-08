import React, { useState, useRef, useMemo } from 'react';
import { getAvailableCategories } from '../utils/wordSelection';

interface GameControlsProps {
  onNewGame: (options?: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  disabled?: boolean;
}

const DIFFICULTIES: { value: 'easy' | 'medium' | 'hard'; label: string; baseClass: string; activeClass: string }[] = [
  { value: 'easy',   label: 'Easy',   baseClass: 'text-emerald-600 border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50', activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' },
  { value: 'medium', label: 'Medium', baseClass: 'text-amber-600 border-zinc-200 hover:border-amber-200 hover:bg-amber-50', activeClass: 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' },
  { value: 'hard',   label: 'Hard',   baseClass: 'text-rose-600 border-zinc-200 hover:border-rose-200 hover:bg-rose-50', activeClass: 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'  },
];

export const GameControls: React.FC<GameControlsProps> = ({ onNewGame, gameStatus, disabled = false }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => getAvailableCategories(), []);

  const handleQuickNewGame = () => {
    onNewGame();
    setShowOptions(false);
  };

  const handleCustomNewGame = () => {
    const options: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' } = {};
    if (selectedCategory) {options.category = selectedCategory;}
    if (selectedDifficulty) {options.difficulty = selectedDifficulty;}
    onNewGame(options);
    setShowOptions(false);
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  const getButtonText = () => {
    if (gameStatus === 'won')  {return 'Play Again';}
    if (gameStatus === 'lost') {return 'Try Again';}
    return 'New Game';
  };

  const getButtonClasses = () => {
    if (disabled) { return 'bg-zinc-200 text-zinc-400 cursor-not-allowed'; }
    if (gameStatus === 'won') { return 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600 shadow-lg'; }
    if (gameStatus === 'lost') { return 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600 shadow-lg'; }
    return 'bg-violet-500 text-white shadow-violet-500/30 hover:bg-violet-600 shadow-lg'; // Accent color equivalent
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto mt-4">
      {/* Main action button */}
      <button
        onClick={handleQuickNewGame}
        disabled={disabled}
        className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${getButtonClasses()}`}
        style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.1rem',
          letterSpacing: '0.02em',
        }}
      >
        {getButtonText()}
      </button>

      {/* Options toggle */}
      <button
        onClick={() => setShowOptions(v => !v)}
        disabled={disabled}
        aria-expanded={showOptions}
        className="text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 bg-white border border-zinc-200 text-zinc-500"
      >
        {showOptions ? 'Hide options' : 'Customize game'}
      </button>

      {/* Options panel with max-height transition */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: showOptions ? '600px' : '0',
          opacity: showOptions ? 1 : 0,
        }}
      >
        <div className="flex flex-col gap-5 p-4 mt-2 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          {/* Category horizontal scroll chips */}
          <div>
            <p className="text-xs font-bold mb-3 uppercase tracking-wider text-zinc-400">
              Category
            </p>
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
              <button
                key="random"
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCategory === '' ? 'bg-violet-500 text-white border-violet-500 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
              >
                Random
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCategory === cat ? 'bg-violet-500 text-white border-violet-500 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty cards */}
          <div>
            <p className="text-xs font-bold mb-3 uppercase tracking-wider text-zinc-400">
              Difficulty
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {DIFFICULTIES.map(d => {
                const isActive = selectedDifficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDifficulty(prev => prev === d.value ? '' : d.value)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${isActive ? d.activeClass : d.baseClass}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start custom game */}
          <button
            onClick={handleCustomNewGame}
            disabled={disabled}
            className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-violet-500 shadow-md shadow-violet-500/20"
          >
            Start Custom Game
          </button>
        </div>
      </div>
    </div>
  );
};
