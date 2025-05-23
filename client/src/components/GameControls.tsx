import React, { useState } from 'react';
import { getAvailableCategories } from '../utils/wordSelection';

interface GameControlsProps {
  onNewGame: (options?: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({ onNewGame, gameStatus, disabled = false }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');

  const categories = getAvailableCategories();
  const difficulties = [
    { value: 'easy', label: 'Easy (3-6 letters)', icon: '🟢' },
    { value: 'medium', label: 'Medium (7-10 letters)', icon: '🟡' },
    { value: 'hard', label: 'Hard (11+ letters)', icon: '🔴' }
  ];

  const handleQuickNewGame = () => {
    onNewGame();
    setShowOptions(false);
  };

  const handleCustomNewGame = () => {
    const options: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' } = {};
    
    if (selectedCategory) {
      options.category = selectedCategory;
    }
    
    if (selectedDifficulty) {
      options.difficulty = selectedDifficulty as 'easy' | 'medium' | 'hard';
    }

    onNewGame(options);
    setShowOptions(false);
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  const getButtonText = () => {
    switch (gameStatus) {
      case 'playing':
        return '🔄 Restart Game';
      case 'won':
        return '🎉 Play Again';
      case 'lost':
        return '💪 Try Again';
      default:
        return '🎮 New Game';
    }
  };

  const getButtonColor = () => {
    switch (gameStatus) {
      case 'playing':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'won':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'lost':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Game Controls</h3>
      
      <div className="space-y-4">
        {/* Quick New Game Button */}
        <button
          onClick={handleQuickNewGame}
          disabled={disabled}
          className={`
            w-full text-white font-semibold py-3 px-4 rounded-lg 
            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
            ${disabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : getButtonColor()
            }
          `}
        >
          {getButtonText()}
        </button>

        {/* Options Toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled}
          className={`
            w-full bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg
            border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
            ${disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:bg-gray-200'
            }
          `}
        >
          ⚙️ {showOptions ? 'Hide Options' : 'Show Options'}
        </button>

        {/* Game Options */}
        {showOptions && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📚 Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={disabled}
                className={`
                  w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
              >
                <option value="">Random Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Difficulty
              </label>
              <div className="space-y-2">
                {difficulties.map(diff => (
                  <label key={diff.value} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff.value}
                      checked={selectedDifficulty === diff.value}
                      onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      disabled={disabled}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {diff.icon} {diff.label}
                    </span>
                  </label>
                ))}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value=""
                    checked={selectedDifficulty === ''}
                    onChange={() => setSelectedDifficulty('')}
                    disabled={disabled}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    🎲 Random Difficulty
                  </span>
                </label>
              </div>
            </div>

            {/* Custom Start Button */}
            <button
              onClick={handleCustomNewGame}
              disabled={disabled}
              className={`
                w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg
                transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${disabled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'hover:bg-indigo-700'
                }
              `}
            >
              🚀 Start Custom Game
            </button>

            {/* Clear Options */}
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedDifficulty('');
              }}
              disabled={disabled}
              className={`
                w-full bg-gray-200 text-gray-700 font-medium py-1 px-4 rounded text-sm
                transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'hover:bg-gray-300'
                }
              `}
            >
              🧹 Clear Options
            </button>
          </div>
        )}

        {/* Game Statistics (if game is finished) */}
        {gameStatus !== 'playing' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">🎮 Ready for another round?</p>
              {gameStatus === 'won' && (
                <p className="text-green-600 font-medium">🏆 Great job solving that word!</p>
              )}
              {gameStatus === 'lost' && (
                <p className="text-red-600 font-medium">💪 Don't give up - you've got this!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};