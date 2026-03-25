import '@testing-library/jest-dom';

// Mock socket.io-client
vi.mock('./socket', () => ({
  socket: {
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  },
}));