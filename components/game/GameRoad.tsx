
"use client";

import { useRef } from "react";
import type { RoadConfig } from "@/types/game";

interface GameRoadProps {
  width: number;
  height: number;
  offset: number;
  config?: Partial<RoadConfig>;
}

export default function GameRoad({
  width,
  height,
  offset,
  config,
}: GameRoadProps) {
  const horizon = height * (config?.horizonRatio ?? 0.25);
  const center = width / 2;

  const topWidth = width * (config?.topWidthRatio ?? 0.13);
  const bottomWidth = width * (config?.bottomWidthRatio ?? 0.82);

  const roadPath = `
    M ${center - topWidth / 2} ${horizon}
    L ${center + topWidth / 2} ${horizon}
    L ${center + bottomWidth / 2} ${height}
    L ${center - bottomWidth / 2} ${height}
    Z
  `;

  const dashCount = 12;
  const cycle = (height - horizon) / dashCount;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      {/* Environment */}
      <rect width={width} height={height} fill="#9bc8df" />
      <rect
        y={horizon}
        width={width}
        height={height - horizon}
        fill="#526c45"
      />

      {/* Road */}
      <path d={roadPath} fill="#303238" />

      {/* Road edges */}
      <path
        d={`M ${center - topWidth / 2} ${horizon}
            L ${center - bottomWidth / 2} ${height}
            M ${center + topWidth / 2} ${horizon}
            L ${center + bottomWidth / 2} ${height}`}
        fill="none"
        stroke="white"
        strokeWidth="3"
      />

      {/* Moving center line */}
      {Array.from({ length: dashCount }).map((_, index) => {
        const progress =
          ((index * cycle + offset) % (height - horizon)) /
          (height - horizon);

        const y = horizon + progress * (height - horizon);
        const dashHeight = 5 + progress * 28;
        const dashWidth = 2 + progress * 5;

        return (
          <rect
            key={index}
            x={center - dashWidth / 2}
            y={y}
            width={dashWidth}
            height={dashHeight}
            fill="white"
          />
        );
      })}
    </svg>
  );
}
