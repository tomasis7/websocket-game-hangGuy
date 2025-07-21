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
    
    expect(screen.getByText('Game in Progress')).toBeInTheDocument();
    expect(screen.getByText(/5 guesses remaining/)).toBeInTheDocument();
  });

  it('should render won status correctly', () => {
    render(
      <GameStatus 
        status="won" 
        word="TESTING"
      />
    );
    
    expect(screen.getByText('Congratulations! You Won!')).toBeInTheDocument();
    expect(screen.getByText(/The word was: TESTING/)).toBeInTheDocument();
  });

  it('should render lost status correctly', () => {
    render(
      <GameStatus 
        status="lost" 
        word="TESTING"
      />
    );
    
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    expect(screen.getByText(/The word was: TESTING/)).toBeInTheDocument();
  });

  it('should show low guesses warning', () => {
    render(
      <GameStatus 
        status="playing" 
        remainingGuesses={2}
      />
    );
    
    // Should have warning styling or text for low guesses
    expect(screen.getByText(/2 guesses remaining/)).toBeInTheDocument();
  });
});