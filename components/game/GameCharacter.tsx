
"use client";

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
      {/* Shadow */}
      <ellipse
        cx={x}
        cy={y + size}
        rx={size * 0.8}
        ry={size * 0.2}
        fill="rgba(0,0,0,0.3)"
      />

      {/* Character body */}
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill="#e52e35"
      />

      {/* Top face */}
      <path
        d={`M ${x - size / 2} ${y - size / 2}
            L ${x - size / 3} ${y - size * 0.7}
            L ${x + size * 0.67} ${y - size * 0.7}
            L ${x + size / 2} ${y - size / 2} Z`}
        fill="#ff6268"
      />

      {/* Side face */}
      <path
        d={`M ${x + size / 2} ${y - size / 2}
            L ${x + size * 0.67} ${y - size * 0.7}
            L ${x + size * 0.67} ${y + size * 0.3}
            L ${x + size / 2} ${y + size / 2} Z`}
        fill="#a91d27"
      />
    </svg>
  );
}
