import React, { useState, useRef, useMemo } from 'react';
import { getAvailableCategories } from '../utils/wordSelection';

interface GameControlsProps {
  onNewGame: (options?: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  disabled?: boolean;
}

const DIFFICULTIES: { value: 'easy' | 'medium' | 'hard'; label: string }[] = [
  { value: 'easy',   label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
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

  const chipClasses = (active: boolean) =>
    `flex-shrink-0 font-mono text-[13px] font-semibold px-3.5 py-2 border-[1.5px] transition-colors ${
      active
        ? 'bg-accent text-accent-ink border-accent'
        : 'bg-surface text-ink border-line hover:bg-accent/20'
    }`;

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {/* Main action */}
      <button
        onClick={handleQuickNewGame}
        disabled={disabled}
        className="w-full font-mono font-bold text-base uppercase tracking-[0.04em] py-4 bg-accent text-accent-ink transition-[filter] hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>

      {/* Options toggle */}
      <button
        onClick={() => setShowOptions(v => !v)}
        disabled={disabled}
        aria-expanded={showOptions}
        className="font-mono text-xs font-semibold uppercase tracking-[0.08em] py-2.5 px-4 border-[1.5px] border-line text-muted transition-colors hover:text-ink"
      >
        {showOptions ? 'Hide options' : 'Customize game'}
      </button>

      {/* Options panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: showOptions ? '600px' : '0', opacity: showOptions ? 1 : 0 }}
      >
        <div className="flex flex-col gap-5 p-4 mt-1 panel">
          {/* Category */}
          <div>
            <p className="font-mono text-[11px] font-semibold mb-3 uppercase tracking-[0.14em] text-muted">
              Category
            </p>
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setSelectedCategory('')} className={chipClasses(selectedCategory === '')}>
                Random
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={chipClasses(selectedCategory === cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="font-mono text-[11px] font-semibold mb-3 uppercase tracking-[0.14em] text-muted">
              Difficulty
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDifficulty(prev => prev === d.value ? '' : d.value)}
                  className={`font-mono text-[13px] font-semibold py-3 border-[1.5px] transition-colors ${
                    selectedDifficulty === d.value
                      ? 'bg-accent text-accent-ink border-accent'
                      : 'bg-surface text-ink border-line hover:bg-accent/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start custom */}
          <button
            onClick={handleCustomNewGame}
            disabled={disabled}
            className="w-full font-mono text-[13px] font-bold uppercase tracking-[0.04em] py-3 bg-accent text-accent-ink transition-[filter] hover:brightness-95"
          >
            Start Custom Game
          </button>
        </div>
      </div>
    </div>
  );
};
