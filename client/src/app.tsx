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
