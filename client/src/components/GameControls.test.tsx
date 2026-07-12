import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from './GameControls';

describe('GameControls custom word', () => {
  const setup = (playerCount = 2) => {
    const onNewGame = vi.fn();
    render(
      <GameControls onNewGame={onNewGame} gameStatus="playing" playerCount={playerCount} />
    );
    fireEvent.click(screen.getByRole('button', { name: /customize game/i }));
    return { onNewGame };
  };

  it('starts a round with a valid custom word and clears the input', () => {
    const { onNewGame } = setup();
    const input = screen.getByLabelText('Set your own word') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'banana' } });
    fireEvent.click(screen.getByRole('button', { name: /start with my word/i }));

    expect(onNewGame).toHaveBeenCalledWith({ customWord: 'BANANA' });
    expect(input.value).toBe('');
  });

  it('shows a validation message and disables start for an invalid word', () => {
    setup();

    fireEvent.change(screen.getByLabelText('Set your own word'), {
      target: { value: 'ab1' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/letters/i);
    expect(screen.getByRole('button', { name: /start with my word/i })).toBeDisabled();
  });

  it('disables hosting with fewer than 2 players', () => {
    setup(1);

    fireEvent.change(screen.getByLabelText('Set your own word'), {
      target: { value: 'banana' },
    });

    expect(screen.getByRole('button', { name: /start with my word/i })).toBeDisabled();
    expect(screen.getByText(/at least one other player/i)).toBeInTheDocument();
  });

  it('masks the word by default and toggles visibility', () => {
    setup();
    const input = screen.getByLabelText('Set your own word');

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /show word/i }));
    expect(input).toHaveAttribute('type', 'text');
  });
});
