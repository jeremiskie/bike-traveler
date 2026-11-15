
import Link from "next/link";

interface GameOverDialogProps {
  phase: "playing" | "gameOver" | "results";
  elapsedTime: number;
  onPlayAgain: () => void;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function GameOverDialog({
  phase,
  elapsedTime,
  onPlayAgain,
}: GameOverDialogProps) {
  if (phase === "playing") return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {phase === "gameOver" && (
        <div className="text-center">
          <h2 className="text-5xl font-black tracking-wider text-white">
            GAME OVER
          </h2>

          <p className="mt-4 text-neutral-300">
            Time survived: {formatTime(elapsedTime)}
          </p>
        </div>
      )}

      {phase === "results" && (
        <div className="w-full max-w-md px-6 text-center text-white">
          <h2 className="mb-3 text-3xl font-black">
            TRY AGAIN?
          </h2>

          <p className="mb-8 text-sm text-neutral-300">
            Your time: {formatTime(elapsedTime)}
          </p>

          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-lg font-bold transition hover:bg-red-500 active:scale-95"
          >
            <span className="text-2xl">↻</span>
            PLAY AGAIN
          </button>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 text-sm text-neutral-300 hover:text-white"
            >
              <span className="text-3xl">⌂</span>
              HOME
            </Link>

            <Link
              href="/leaderboards"
              className="flex flex-col items-center gap-2 text-sm text-neutral-300 hover:text-white"
            >
              <span className="text-3xl">🏆</span>
              LEADERBOARDS
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
