
import type { CharacterConfig } from "@/types/game";

interface GameCharacterProps {
  width: number;
  height: number;
  config?: Partial<CharacterConfig>;
}

export default function GameCharacter({
  width,
  height,
  config,
}: GameCharacterProps) {
  const size = Math.max(
    28,
    width * (config?.sizeRatio ?? 0.065)
  );

  const center = width / 2;
  const roadWidth = width * 0.82;

  const lane = config?.lane ?? "right";

  const x =
    lane === "right"
      ? center + roadWidth * 0.25
      : center - roadWidth * 0.25;

  const y = height * (config?.verticalPosition ?? 0.72);

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#e52e35"
      />
    </svg>
  );
}
