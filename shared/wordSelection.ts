// Enhanced word and letter selection utilities for the Hang Guy game

export interface WordCategory {
  name: string;
  words: string[];
}

// Word lists organized by categories. Rules (enforced by
// client/src/utils/wordSelection.test.ts): UPPERCASE, A-Z only,
// 3-20 letters, no duplicates within a category.
export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: 'Programming',
    words: [
      'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'WEBSOCKET', 'COMPUTER',
      'PROGRAMMING', 'DEVELOPER', 'FRONTEND', 'BACKEND', 'DATABASE',
      'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPONENT', 'INTERFACE',
      'DEBUGGING', 'FRAMEWORK', 'LIBRARY', 'PACKAGE', 'TERMINAL',
      'COMPILER', 'INTERPRETER', 'SYNTAX', 'SEMANTIC', 'BOOLEAN',
      'ARRAY', 'OBJECT', 'STRING', 'NUMBER', 'CALLBACK',
      'PROMISE', 'CLOSURE', 'RECURSION', 'ITERATOR', 'MUTATION',
      'TEMPLATE', 'MODULE', 'BUNDLER', 'ROUTER', 'SERVER'
    ]
  },
  {
    name: 'Animals',
    words: [
      'ELEPHANT', 'GIRAFFE', 'TIGER', 'PENGUIN', 'DOLPHIN',
      'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'RHINOCEROS', 'CHEETAH',
      'FLAMINGO', 'HIPPOPOTAMUS', 'CROCODILE', 'PEACOCK', 'KOALA',
      'PANDA', 'ZEBRA', 'GORILLA', 'LEOPARD', 'OSTRICH',
      'PELICAN', 'RACCOON', 'SQUIRREL', 'HEDGEHOG', 'TORTOISE',
      'CHAMELEON', 'ARMADILLO', 'WOLVERINE', 'MONGOOSE', 'PORCUPINE',
      'ANTELOPE', 'BUFFALO', 'WALRUS', 'LOBSTER', 'JELLYFISH',
      'SEAHORSE', 'FALCON', 'SPARROW', 'TOUCAN', 'IGUANA'
    ]
  },
  {
    name: 'Countries',
    words: [
      'AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT',
      'FRANCE', 'GERMANY', 'HUNGARY', 'ICELAND', 'JAPAN',
      'KAZAKHSTAN', 'LUXEMBOURG', 'MADAGASCAR', 'NETHERLANDS', 'PORTUGAL',
      'ARGENTINA', 'BELGIUM', 'COLOMBIA', 'ECUADOR', 'FINLAND',
      'GREECE', 'INDONESIA', 'IRELAND', 'ITALY', 'JAMAICA',
      'KENYA', 'LITHUANIA', 'MEXICO', 'MOROCCO', 'NIGERIA',
      'NORWAY', 'PAKISTAN', 'PHILIPPINES', 'POLAND', 'SINGAPORE',
      'SLOVAKIA', 'SWEDEN', 'SWITZERLAND', 'THAILAND', 'VIETNAM'
    ]
  },
  {
    name: 'Food',
    words: [
      'PIZZA', 'HAMBURGER', 'SPAGHETTI', 'CHOCOLATE', 'STRAWBERRY',
      'PINEAPPLE', 'SANDWICH', 'PANCAKE', 'BROCCOLI', 'AVOCADO',
      'WATERMELON', 'CROISSANT', 'LASAGNA', 'SMOOTHIE', 'PRETZEL',
      'BURRITO', 'CHEESECAKE', 'DUMPLING', 'ESPRESSO', 'FALAFEL',
      'GRANOLA', 'HUMMUS', 'KETCHUP', 'MEATBALL', 'NOODLES',
      'OATMEAL', 'OMELETTE', 'PAELLA', 'POPCORN', 'QUICHE',
      'RAVIOLI', 'RISOTTO', 'SALAD', 'SUSHI', 'TACO',
      'TIRAMISU', 'WAFFLE', 'YOGURT', 'ZUCCHINI', 'MUFFIN'
    ]
  },
  {
    name: 'Sports',
    words: [
      'SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BASEBALL',
      'CRICKET', 'RUGBY', 'HOCKEY', 'GOLF', 'BOXING',
      'WRESTLING', 'SWIMMING', 'DIVING', 'ROWING', 'SAILING',
      'SURFING', 'SKIING', 'SNOWBOARD', 'SKATING', 'CYCLING',
      'MARATHON', 'SPRINT', 'HURDLES', 'JAVELIN', 'DISCUS',
      'ARCHERY', 'FENCING', 'KARATE', 'JUDO', 'TAEKWONDO',
      'BADMINTON', 'SQUASH', 'HANDBALL', 'LACROSSE', 'SOFTBALL',
      'BOWLING', 'BILLIARDS', 'DARTS', 'GYMNASTICS', 'TRIATHLON'
    ]
  },
  {
    name: 'Science',
    words: [
      'ATOM', 'MOLECULE', 'ELECTRON', 'PROTON', 'NEUTRON',
      'GRAVITY', 'ENERGY', 'PHOTON', 'QUANTUM', 'GALAXY',
      'NEBULA', 'ASTEROID', 'COMET', 'ECLIPSE', 'ORBIT',
      'TELESCOPE', 'MICROSCOPE', 'CHEMISTRY', 'PHYSICS', 'BIOLOGY',
      'GEOLOGY', 'ASTRONOMY', 'EVOLUTION', 'GENETICS', 'BACTERIA',
      'VIRUS', 'ENZYME', 'PROTEIN', 'NEURON', 'SYNAPSE',
      'MAGNETISM', 'FRICTION', 'VELOCITY', 'MOMENTUM', 'PRESSURE',
      'TEMPERATURE', 'CATALYST', 'ISOTOPE', 'PENDULUM', 'SPECTRUM'
    ]
  },
  {
    name: 'Nature',
    words: [
      'MOUNTAIN', 'VALLEY', 'RIVER', 'OCEAN', 'DESERT',
      'FOREST', 'JUNGLE', 'GLACIER', 'VOLCANO', 'CANYON',
      'WATERFALL', 'MEADOW', 'PRAIRIE', 'TUNDRA', 'SAVANNA',
      'LAGOON', 'ISLAND', 'PENINSULA', 'CLIFF', 'CAVE',
      'THUNDER', 'LIGHTNING', 'RAINBOW', 'BLIZZARD', 'HURRICANE',
      'TORNADO', 'MONSOON', 'DRIZZLE', 'SUNRISE', 'SUNSET',
      'HORIZON', 'BREEZE', 'AVALANCHE', 'EARTHQUAKE', 'GEYSER',
      'MARSH', 'SWAMP', 'DUNE', 'REEF', 'ARCHIPELAGO'
    ]
  },
  {
    name: 'Occupations',
    words: [
      'TEACHER', 'DOCTOR', 'NURSE', 'ENGINEER', 'ARCHITECT',
      'LAWYER', 'PLUMBER', 'ELECTRICIAN', 'CARPENTER', 'MECHANIC',
      'PILOT', 'SAILOR', 'FARMER', 'BAKER', 'BUTCHER',
      'CHEF', 'WAITER', 'BARISTA', 'LIBRARIAN', 'SCIENTIST',
      'JOURNALIST', 'PHOTOGRAPHER', 'MUSICIAN', 'PAINTER', 'SCULPTOR',
      'ACTOR', 'DIRECTOR', 'PRODUCER', 'DENTIST', 'SURGEON',
      'PHARMACIST', 'VETERINARIAN', 'ACCOUNTANT', 'BANKER', 'CASHIER',
      'JANITOR', 'GARDENER', 'TAILOR', 'BLACKSMITH', 'FIREFIGHTER'
    ]
  },
  {
    name: 'Music',
    words: [
      'GUITAR', 'PIANO', 'VIOLIN', 'CELLO', 'TRUMPET',
      'TROMBONE', 'SAXOPHONE', 'CLARINET', 'FLUTE', 'OBOE',
      'BASSOON', 'HARP', 'DRUMS', 'CYMBAL', 'TAMBOURINE',
      'XYLOPHONE', 'ACCORDION', 'HARMONICA', 'BANJO', 'MANDOLIN',
      'UKULELE', 'ORGAN', 'SYNTHESIZER', 'MELODY', 'HARMONY',
      'RHYTHM', 'TEMPO', 'CHORUS', 'VERSE', 'OCTAVE',
      'CHORD', 'SCALE', 'SOPRANO', 'BARITONE', 'ORCHESTRA',
      'SYMPHONY', 'CONCERTO', 'SONATA', 'BALLAD', 'ANTHEM'
    ]
  },
  {
    name: 'Transportation',
    words: [
      'BICYCLE', 'MOTORCYCLE', 'AUTOMOBILE', 'TRUCK', 'TRACTOR',
      'BUS', 'TRAIN', 'SUBWAY', 'TRAM', 'TROLLEY',
      'FERRY', 'YACHT', 'CANOE', 'KAYAK', 'GONDOLA',
      'SUBMARINE', 'HELICOPTER', 'AIRPLANE', 'GLIDER', 'BALLOON',
      'ROCKET', 'SHUTTLE', 'SCOOTER', 'SKATEBOARD', 'RICKSHAW',
      'CARRIAGE', 'WAGON', 'SLED', 'SNOWMOBILE', 'HOVERCRAFT',
      'ZEPPELIN', 'FREIGHTER', 'TANKER', 'BARGE', 'LIMOUSINE',
      'AMBULANCE', 'TAXI', 'VAN', 'JEEP', 'CONVOY'
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

// ─── Custom word validation (shared by client UI and server enforcement) ────

export type CustomWordValidation =
  | { valid: true; word: string }
  | { valid: false; reason: string };

/**
 * Validates and normalizes a player-supplied custom word.
 * The server is authoritative; the client uses this for inline feedback.
 */
export function validateCustomWord(input: string): CustomWordValidation {
  const word = input.trim().toUpperCase();
  if (word.length < 3 || word.length > 20) {
    return { valid: false, reason: "Word must be 3-20 letters long" };
  }
  if (!isValidWord(word)) {
    return { valid: false, reason: "Word may only contain letters A-Z" };
  }
  return { valid: true, word };
}
