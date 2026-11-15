
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  HORIZON,
} from "@/constants/game";

import type { Lane, Obstacle } from "@/types/game";

export function getObstaclePosition(obstacle: Obstacle) {
  const progress = Math.min(obstacle.progress, 1);

  const roadWidth = 156 + progress * (984 - 156);
  const center = GAME_WIDTH / 2;

  const x =
    obstacle.lane === "right"
      ? center + roadWidth * 0.25
      : center - roadWidth * 0.25;

  const y = HORIZON + progress * (GAME_HEIGHT - HORIZON);
  const size = 12 + progress * 52;

  return { x, y, size };
}

export function getLaneX(lane: Lane, progress: number) {
  const roadWidth = 156 + progress * (984 - 156);
  const center = GAME_WIDTH / 2;

  return lane === "right"
    ? center + roadWidth * 0.25
    : center - roadWidth * 0.25;
}

export function hasReachedPlayer(
  previousProgress: number,
  nextProgress: number,
  playerProgress: number
) {
  return (
    previousProgress <= playerProgress &&
    nextProgress >= playerProgress
  );
}
