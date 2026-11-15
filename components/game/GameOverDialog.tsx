
import Link from "next/link";

interface GameOverDialogProps {
  phase: "playing" | "gameOver" | "results";
  onPlayAgain: () => void;
}

export default function GameOverDialog({
  phase,
  onPlayAgain,
}: GameOverDialogProps) {
  if (phase === "playing") return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {phase === "gameOver" && (
        <div className="animate-in zoom-in text-center">
          <h2 className="text-5xl font-black tracking-wider text-white">
            GAME OVER
          </h2>
          <p className="mt-3 text-sm text-neutral-300">
            You crashed! Better luck next time.
          </p>
        </div>
      )}

      {phase === "results" && (
        <div className="w-full max-w-md px-6 text-center text-white">
          {/* Top */}
          <h2 className="mb-8 text-3xl font-black">
            TRY AGAIN?
          </h2>

          {/* Center */}
          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-lg font-bold transition hover:bg-red-500 active:scale-95"
          >
            <span className="text-2xl">↻</span>
            PLAY AGAIN
          </button>

          {/* Bottom actions */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 text-sm text-neutral-300 transition hover:text-white"
            >
              <span className="text-3xl">⌂</span>
              HOME
            </Link>

            <Link
              href="/leaderboards"
              className="flex flex-col items-center gap-2 text-sm text-neutral-300 transition hover:text-white"
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
