import React, { useState, useRef } from 'react';
import { getAvailableCategories } from '../utils/wordSelection';

interface GameControlsProps {
  onNewGame: (options?: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  disabled?: boolean;
}

const DIFFICULTIES: { value: 'easy' | 'medium' | 'hard'; label: string; color: string; border: string }[] = [
  { value: 'easy',   label: 'Easy',   color: 'rgba(132,204,22,0.12)',  border: 'var(--success)' },
  { value: 'medium', label: 'Medium', color: 'rgba(245,158,11,0.12)', border: 'var(--warning)' },
  { value: 'hard',   label: 'Hard',   color: 'rgba(244,63,94,0.12)',  border: 'var(--danger)'  },
];

export const GameControls: React.FC<GameControlsProps> = ({ onNewGame, gameStatus, disabled = false }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = getAvailableCategories();

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

  const getButtonColor = () => {
    if (gameStatus === 'won')  {return 'var(--success)';}
    if (gameStatus === 'lost') {return 'var(--danger)';}
    return 'var(--accent)';
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main action button */}
      <button
        onClick={handleQuickNewGame}
        disabled={disabled}
        className="w-full font-bold py-3.5 px-6 rounded-full text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2"
        style={{
          background: disabled ? 'var(--border)' : getButtonColor(),
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          boxShadow: disabled ? 'none' : `0 4px 16px ${getButtonColor()}44`,
          fontFamily: "'Fredoka One', cursive",
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
        className="text-sm font-medium py-2 px-4 rounded-full transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        {showOptions ? 'Hide options' : 'Customize game'}
      </button>

      {/* Options panel with max-height transition */}
      <div
        style={{
          maxHeight: showOptions ? '600px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div className="flex flex-col gap-4 pt-2">
          {/* Category horizontal scroll chips */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Category
            </p>
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <button
                key="random"
                onClick={() => setSelectedCategory('')}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: selectedCategory === '' ? 'var(--accent)' : 'var(--bg-surface)',
                  color: selectedCategory === '' ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                Random
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-surface)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty cards */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Difficulty
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDifficulty(prev => prev === d.value ? '' : d.value)}
                  className="py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selectedDifficulty === d.value ? d.color : 'var(--bg-surface)',
                    border: `1.5px solid ${selectedDifficulty === d.value ? d.border : 'var(--border)'}`,
                    color: selectedDifficulty === d.value ? d.border : 'var(--text-muted)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start custom game */}
          <button
            onClick={handleCustomNewGame}
            disabled={disabled}
            className="w-full py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(139,92,246,0.35)' }}
          >
            Start Custom Game
          </button>
        </div>
      </div>
    </div>
  );
};
