
import { memo } from "react";
import Link from "next/link";

import { CHALLENGE_DURATION } from "@/constants/game";

interface GameOverDialogProps {
  phase: "setup" | "countdown" | "playing" | "gameOver" | "results";
  timeRemaining: number;
  distance: number;
  speed: number;
  finalAverageSpeed: number | null;
  completed: boolean;
  saveError: string | null;
  onPlayAgain: () => void;
  onNewPlayer: () => void;
  onOpenLeaderboards: () => void;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function GameStats({
  distance,
  speed,
}: Pick<GameOverDialogProps, "distance" | "speed">) {
  return (
    <div className="mt-6 flex justify-center gap-8">
      <div>
        <p className="text-xs text-neutral-400">DISTANCE</p>
        <p className="font-bold tabular-nums">{distance} m</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">SPEED</p>
        <p className="font-bold tabular-nums">{speed.toFixed(2)} km/h</p>
      </div>
    </div>
  );
}

function GameOverDialog({
  phase,
  timeRemaining,
  distance,
  speed,
  finalAverageSpeed,
  completed,
  saveError,
  onPlayAgain,
  onNewPlayer,
  onOpenLeaderboards,
}: GameOverDialogProps) {
  if (
    phase === "setup" ||
    phase === "countdown" ||
    phase === "playing"
  ) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {phase === "gameOver" && (
        <div className="text-center">
          <h2 className="text-5xl font-black tracking-wider text-white">
            GAME OVER
          </h2>

          <p className="mt-4 text-neutral-300">
            Time survived: {formatTime(CHALLENGE_DURATION - timeRemaining)}
          </p>
          <GameStats
            distance={distance}
            speed={finalAverageSpeed ?? speed}
          />
          {saveError && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              {saveError}
            </p>
          )}
        </div>
      )}

      {phase === "results" && (
        <div className="w-full max-w-md px-6 text-center text-white">
          <h2 className="mb-3 text-3xl font-black">
            {completed ? "CHALLENGE COMPLETE" : "TRY AGAIN?"}
          </h2>

          <p className="mb-8 text-sm text-neutral-300">
            {completed
              ? `You avoided every obstacle for ${CHALLENGE_DURATION} seconds.`
              : `Time survived: ${formatTime(CHALLENGE_DURATION - timeRemaining)}`}
          </p>
          {saveError && (
            <p role="alert" className="mb-4 text-sm text-red-300">
              {saveError}
            </p>
          )}
          <GameStats
            distance={distance}
            speed={completed ? finalAverageSpeed ?? speed : speed}
          />

          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-lg font-bold transition hover:bg-red-500 active:scale-95"
          >
            <span className="text-2xl">↻</span>
            PLAY AGAIN
          </button>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onNewPlayer}
              className="flex flex-col items-center gap-2 text-sm text-neutral-300 hover:text-white"
            >
              <span className="text-3xl">+</span>
              NEW PLAYER
            </button>

            <Link
              href="/leaderboards"
              onClick={onOpenLeaderboards}
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

export default memo(GameOverDialog);
