
interface GameObstacleProps {
  x: number;
  y: number;
  size: number;
}

export default function GameObstacle({
  x,
  y,
  size,
}: GameObstacleProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#1677e8"
      />
    </svg>
  );
}
