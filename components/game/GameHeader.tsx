import { CHALLENGE_DURATION } from "@/constants/game";

interface GameHeaderProps {
  title?: string;
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

export default function GameHeader({
  title = "Bike Traveler",
  timeRemaining = CHALLENGE_DURATION,
  distance = 0,
  speed = 15,
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
            {speed} km/h
          </p>
        </div>
      </div>
    </header>
  );
}
