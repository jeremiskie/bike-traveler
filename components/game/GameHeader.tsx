
"use client";

interface GameHeaderProps {
  title?: string;
  score?: number;
  distance?: number;
  speed?: number;
}

export default function GameHeader({
  title = "Bike Traveler",
  score = 0,
  distance = 0,
  speed = 0,
}: GameHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4 text-white">
      {/* Game title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-neutral-400">
          Endless Road Adventure
        </p>
      </div>

      {/* Game statistics */}
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-xs text-neutral-400">SCORE</p>
          <p className="font-bold tabular-nums">{score}</p>
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
            {speed} km/h
          </p>
        </div>
      </div>
    </header>
  );
}
