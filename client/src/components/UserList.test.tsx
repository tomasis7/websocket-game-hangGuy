import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';
import type { User } from '../../../shared/types';

const users: User[] = [
  { id: 'p1', nickname: 'Alice', isActive: true, joinedAt: 1 },
  { id: 'p2', nickname: 'Bob', isActive: true, joinedAt: 2 },
];

describe('UserList turn marker', () => {
  it('marks the player whose turn it is', () => {
    render(
      <UserList users={users} currentUserId="p2" currentTurnPlayerId="p1" />
    );

    const badge = screen.getByLabelText('Current turn');
    expect(badge).toBeInTheDocument();
    // The badge sits in Alice's row, not Bob's
    expect(badge.closest('li')).toHaveTextContent('Alice');
  });

  it('shows no turn marker when currentTurnPlayerId is not set', () => {
    render(<UserList users={users} currentUserId="p2" />);

    expect(screen.queryByLabelText('Current turn')).not.toBeInTheDocument();
  });

  it('badges the word setter', () => {
    render(<UserList users={users} currentUserId="p2" wordSetterId="p1" />);

    const badge = screen.getByLabelText('Word setter');
    expect(badge).toHaveTextContent('Word');
    expect(badge.closest('li')).toHaveTextContent('Alice');
  });
});
