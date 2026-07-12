import { describe, it, expect } from 'vitest';
import { WORD_CATEGORIES, ALL_WORDS, validateCustomWord } from './wordSelection';

describe('word dictionary integrity', () => {
  it('has at least 10 categories with at least 25 words each', () => {
    expect(WORD_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    for (const category of WORD_CATEGORIES) {
      expect(category.words.length).toBeGreaterThanOrEqual(25);
    }
  });

  it('contains only uppercase A-Z words of length 3-20', () => {
    for (const word of ALL_WORDS) {
      expect(word).toMatch(/^[A-Z]{3,20}$/);
    }
  });

  it('has no duplicate words within a category', () => {
    for (const category of WORD_CATEGORIES) {
      expect(new Set(category.words).size).toBe(category.words.length);
    }
  });
});

describe('validateCustomWord', () => {
  it('accepts a valid word and normalizes it', () => {
    expect(validateCustomWord('  banana ')).toEqual({ valid: true, word: 'BANANA' });
  });

  it('rejects words shorter than 3 or longer than 20 letters', () => {
    expect(validateCustomWord('ab')).toEqual({
      valid: false,
      reason: 'Word must be 3-20 letters long',
    });
    expect(validateCustomWord('A'.repeat(21))).toEqual({
      valid: false,
      reason: 'Word must be 3-20 letters long',
    });
  });

  it('rejects non-letter characters', () => {
    for (const bad of ['abc1', 'two words', 'well-known', 'café']) {
      expect(validateCustomWord(bad)).toEqual({
        valid: false,
        reason: 'Word may only contain letters A-Z',
      });
    }
  });
});
