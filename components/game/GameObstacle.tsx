import { GAME_HEIGHT, GAME_WIDTH } from "@/constants/game";

type GameObstacleProps = {
  x: number;
  y: number;
  size: number;
};

export default function GameObstacle({
  x,
  y,
  size,
}: GameObstacleProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#2563eb"
      />
    </svg>
  );
}
