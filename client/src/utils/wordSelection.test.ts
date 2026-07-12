import { describe, it, expect } from 'vitest';
import { WORD_CATEGORIES, ALL_WORDS } from './wordSelection';

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
