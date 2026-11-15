
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
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill="#2563eb"
    />
  );
}
