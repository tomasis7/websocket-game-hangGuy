// Enhanced word and letter selection utilities for the Hang Guy game

export interface WordCategory {
  name: string;
  words: string[];
}

// Expanded word lists organized by categories
export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: 'Programming',
    words: [
      'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'WEBSOCKET', 'COMPUTER',
      'PROGRAMMING', 'DEVELOPER', 'FRONTEND', 'BACKEND', 'DATABASE',
      'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPONENT', 'INTERFACE',
      'DEBUGGING', 'FRAMEWORK', 'LIBRARY', 'PACKAGE', 'TERMINAL',
      'COMPILER', 'INTERPRETER', 'SYNTAX', 'SEMANTIC', 'BOOLEAN',
      'ARRAY', 'OBJECT', 'STRING', 'NUMBER', 'CALLBACK'
    ]
  },
  {
    name: 'Animals',
    words: [
      'ELEPHANT', 'GIRAFFE', 'TIGER', 'PENGUIN', 'DOLPHIN',
      'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'RHINOCEROS', 'CHEETAH',
      'FLAMINGO', 'HIPPOPOTAMUS', 'CROCODILE', 'PEACOCK', 'KOALA'
    ]
  },
  {
    name: 'Countries',
    words: [
      'AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT',
      'FRANCE', 'GERMANY', 'HUNGARY', 'ICELAND', 'JAPAN',
      'KAZAKHSTAN', 'LUXEMBOURG', 'MADAGASCAR', 'NETHERLANDS', 'PORTUGAL'
    ]
  },
  {
    name: 'Food',
    words: [
      'PIZZA', 'HAMBURGER', 'SPAGHETTI', 'CHOCOLATE', 'STRAWBERRY',
      'PINEAPPLE', 'SANDWICH', 'PANCAKE', 'BROCCOLI', 'AVOCADO',
      'WATERMELON', 'CROISSANT', 'LASAGNA', 'SMOOTHIE', 'PRETZEL'
    ]
  }
];

// All words combined from all categories
export const ALL_WORDS = WORD_CATEGORIES.flatMap(category => category.words);

// Standard alphabet for letter selection
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Common letters ordered by frequency in English
export const LETTERS_BY_FREQUENCY = [
  'E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D',
  'L', 'U', 'C', 'M', 'W', 'F', 'G', 'Y', 'P', 'B',
  'V', 'K', 'J', 'X', 'Q', 'Z'
];

/**
 * Selects a random word from all available words
 */
export function getRandomWord(): string {
  return getRandomFromArray(ALL_WORDS);
}

/**
 * Selects a random word from a specific category
 */
export function getRandomWordFromCategory(categoryName: string): string {
  const category = WORD_CATEGORIES.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  
  if (!category) {
    throw new Error(`Category "${categoryName}" not found`);
  }
  
  return getRandomFromArray(category.words);
}

/**
 * Selects a random letter from the alphabet
 */
export function getRandomLetter(): string {
  return getRandomFromArray(ALPHABET);
}

/**
 * Selects a random letter based on English frequency
 * More common letters have higher probability of being selected
 */
export function getRandomLetterByFrequency(): string {
  // Weight letters by their frequency (first letters more likely)
  const weights = LETTERS_BY_FREQUENCY.map((_, index) => 
    LETTERS_BY_FREQUENCY.length - index
  );
  
  return getWeightedRandomFromArray(LETTERS_BY_FREQUENCY, weights);
}

/**
 * Selects a random unguessed letter from a word
 */
export function getRandomUnguessedLetterFromWord(
  word: string, 
  guessedLetters: Set<string>
): string | null {
  const uniqueLetters = [...new Set(word.split(''))];
  const unguessedLetters = uniqueLetters.filter(letter => 
    !guessedLetters.has(letter)
  );
  
  if (unguessedLetters.length === 0) {
    return null;
  }
  
  return getRandomFromArray(unguessedLetters);
}

/**
 * Selects multiple random words for variety
 */
export function getRandomWords(count: number, category?: string): string[] {
  const wordPool = category 
    ? WORD_CATEGORIES.find(cat => 
        cat.name.toLowerCase() === category.toLowerCase()
      )?.words || ALL_WORDS
    : ALL_WORDS;
  
  if (count >= wordPool.length) {
    return [...wordPool].sort(() => Math.random() - 0.5);
  }
  
  const selected: string[] = [];
  const availableWords = [...wordPool];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    selected.push(availableWords.splice(randomIndex, 1)[0]);
  }
  
  return selected;
}

/**
 * Filters words by difficulty (word length)
 */
export function getRandomWordByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string {
  const difficultyRanges = {
    easy: [3, 6],
    medium: [7, 10],
    hard: [11, Infinity]
  };
  
  const [minLength, maxLength] = difficultyRanges[difficulty];
  const filteredWords = ALL_WORDS.filter(word => 
    word.length >= minLength && word.length <= maxLength
  );
  
  if (filteredWords.length === 0) {
    return getRandomWord(); // Fallback to any word
  }
  
  return getRandomFromArray(filteredWords);
}

/**
 * Gets word statistics for analysis
 */
export function getWordStats(word: string) {
  return {
    length: word.length,
    uniqueLetters: new Set(word.split('')).size,
    commonLetters: word.split('').filter(letter => 
      ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R'].includes(letter)
    ).length,
    difficulty: word.length <= 6 ? 'easy' : word.length <= 10 ? 'medium' : 'hard'
  };
}

// Utility functions
function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getWeightedRandomFromArray<T>(array: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < array.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return array[i];
    }
  }
  
  return array[array.length - 1]; // Fallback
}

/**
 * Validates if a word contains only letters
 */
export function isValidWord(word: string): boolean {
  return /^[A-Z]+$/.test(word.toUpperCase());
}

/**
 * Gets available categories
 */
export function getAvailableCategories(): string[] {
  return WORD_CATEGORIES.map(category => category.name);
}