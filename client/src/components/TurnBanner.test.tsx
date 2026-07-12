import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TurnBanner } from './TurnBanner';

describe('TurnBanner', () => {
  it('shows the call-to-action when it is your turn', () => {
    render(<TurnBanner isMyTurn={true} />);

    expect(screen.getByRole('status')).toHaveTextContent(/your turn/i);
    expect(screen.getByRole('status')).toHaveTextContent(/pick a letter/i);
  });

  it('shows a waiting message with the current player name otherwise', () => {
    render(<TurnBanner isMyTurn={false} currentPlayerName="Alice" />);

    expect(screen.getByRole('status')).toHaveTextContent(/waiting for alice/i);
  });

  it('falls back to a generic waiting message without a name', () => {
    render(<TurnBanner isMyTurn={false} />);

    expect(screen.getByRole('status')).toHaveTextContent(/waiting for next player/i);
  });

  it('shows the spectator message for the word setter', () => {
    render(<TurnBanner isMyTurn={false} spectating={true} />);

    expect(screen.getByRole('status')).toHaveTextContent(/you set the word/i);
  });
});
