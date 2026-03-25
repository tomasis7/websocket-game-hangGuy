import { MultiplayerHangGuy } from "./components/MultiplayerHangGuy";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { useTheme } from "./hooks/useTheme";

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ErrorBoundary>
      <div
        className="min-h-dvh flex flex-col"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      >
        {/* Global connection toast */}
        <ConnectionStatus />

        {/* App header */}
        <header
          className="glass-card sticky top-0 z-40 mx-2 mt-2 flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ borderRadius: '1rem' }}
        >
          <span
            className="text-2xl font-bold tracking-tight select-none"
            style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}
          >
            Hang Guy
          </span>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* Main content */}
        <main role="main" className="flex-1 px-2 pb-4">
          <MultiplayerHangGuy />
        </main>
      </div>
    </ErrorBoundary>
  );
}
