import { MultiplayerHangGuy } from "./components/MultiplayerHangGuy";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { useTheme } from "./hooks/useTheme";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
      <line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
      <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" />
      <line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ErrorBoundary>
      <div className="min-h-dvh flex flex-col bg-bg text-ink">
        {/* Global connection toast */}
        <ConnectionStatus />

        {/* App header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-line-soft bg-bg/80 backdrop-blur-md">
          <span className="font-mono text-lg font-extrabold tracking-tight select-none uppercase">
            Hang <span className="bg-accent text-accent-ink px-1.5">Guy</span>
          </span>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex items-center justify-center w-9 h-9 border border-line text-ink transition-colors hover:bg-accent hover:text-accent-ink hover:border-accent"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* Main content */}
        <main role="main" className="flex-1 px-3 sm:px-4 pb-6">
          <MultiplayerHangGuy />
        </main>
      </div>
    </ErrorBoundary>
  );
}
