
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
      {/* Shadow */}
      <ellipse
        cx={x}
        cy={y + size * 0.6}
        rx={size * 0.65}
        ry={size * 0.2}
        fill="rgba(0,0,0,0.35)"
      />

      {/* Front face */}
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#1677e8"
      />

      {/* Top face */}
      <path
        d={`
          M ${x - size / 2} ${y - size / 2}
          L ${x - size / 3} ${y - size * 0.7}
          L ${x + size * 0.67} ${y - size * 0.7}
          L ${x + size / 2} ${y - size / 2}
          Z
        `}
        fill="#60a5fa"
      />

      {/* Side face */}
      <path
        d={`
          M ${x + size / 2} ${y - size / 2}
          L ${x + size * 0.67} ${y - size * 0.7}
          L ${x + size * 0.67} ${y + size * 0.3}
          L ${x + size / 2} ${y + size / 2}
          Z
        `}
        fill="#0755b5"
      />
    </svg>
  );
}
