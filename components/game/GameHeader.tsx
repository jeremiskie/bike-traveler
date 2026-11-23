import { memo } from "react";

import { CHALLENGE_DURATION } from "@/constants/game";

interface GameHeaderProps {
  title?: string;
  playerCode?: string;
  timeRemaining?: number;
  distance?: number;
  speed?: number;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function GameHeader({
  title = "Bike Traveler",
  playerCode,
  timeRemaining = CHALLENGE_DURATION,
  distance = 0,
  speed = 0,
}: GameHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-neutral-400">
          Endless Road Adventure
        </p>
        {playerCode && (
          <p className="mt-1 text-xs text-neutral-300">
            Player code
            <span className="ml-2 font-bold tracking-widest text-white">
              {playerCode}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-xs text-neutral-400">TIME LEFT</p>
          <p className="font-bold tabular-nums">
            {formatTime(timeRemaining)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-400">DISTANCE</p>
          <p className="font-bold tabular-nums">
            {distance} m
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-400">SPEED</p>
          <p className="font-bold tabular-nums">
            {speed.toFixed(2)} km/h
          </p>
        </div>
      </div>
    </header>
  );
}

export default memo(GameHeader);
