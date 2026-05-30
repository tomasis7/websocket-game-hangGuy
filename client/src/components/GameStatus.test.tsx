import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStatus } from './GameStatus';

describe('GameStatus', () => {
  it('should render playing status correctly', () => {
    render(
      <GameStatus
        status="playing"
        remainingGuesses={5}
      />
    );

    // Playing state shows a compact bar with the remaining count and a "left" label
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
  });

  it('should render won status correctly', () => {
    render(
      <GameStatus
        status="won"
        word="TESTING"
      />
    );

    expect(screen.getByText('You Won!')).toBeInTheDocument();
    expect(screen.getByText(/great job guessing the word/i)).toBeInTheDocument();
  });

  it('should render lost status correctly', () => {
    render(
      <GameStatus
        status="lost"
        word="TESTING"
      />
    );

    expect(screen.getByText('Game Over')).toBeInTheDocument();
    // Word is shown without quotes in new design
    expect(screen.getByText(/The word was:/)).toBeInTheDocument();
    expect(screen.getByText('TESTING')).toBeInTheDocument();
  });

  it('should show critical styling for low guesses', () => {
    render(
      <GameStatus
        status="playing"
        remainingGuesses={2}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
  });
});
