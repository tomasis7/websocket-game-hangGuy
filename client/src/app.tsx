// This file defines the main App component for the client-side React application.
// It includes error boundaries and connection handling for a robust multiplayer experience.

import { MultiplayerHangGuy } from "./components/MultiplayerHangGuy";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConnectionStatus } from "./components/ConnectionStatus";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="relative">
        <ConnectionStatus />
        <div className="pt-0">
          <MultiplayerHangGuy />
        </div>
      </div>
    </ErrorBoundary>
  );
}

// import { HangGuyGame } from "./components/HangGuyGame";

// export default function App() {
//   return <HangGuyGame />;
// }
