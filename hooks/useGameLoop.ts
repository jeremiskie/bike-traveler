
import { useCallback, useEffect, useRef, useState } from "react";

import { useGameAnimation } from "@/hooks/useGameAnimation";

import {
  GAME_HEIGHT,
  HORIZON,
  INITIAL_SPEED,
  MAX_SPEED,
  MIN_SPEED,
  OBSTACLE_SPAWN_INTERVAL,
  PLAYER_PROGRESS,
  SPEED_CHANGE_INTERVAL,
} from "@/constants/game";

import { hasReachedPlayer } from "@/utils/gameUtils";

import type { GameFrame, Lane, Obstacle } from "@/types/game";

interface UseGameLoopProps {
  isPlaying: boolean;
  lane: Lane;
  onGameOver: () => void;
}

export function useGameLoop({
  isPlaying,
  lane,
  onGameOver,
}: UseGameLoopProps) {
  const [frame, setFrame] = useState<GameFrame>({
    offset: 0,
    obstacles: [],
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [distance, setDistance] = useState(0);

  const playingRef = useRef(isPlaying);
  const laneRef = useRef(lane);
  const gameOverCallbackRef = useRef(onGameOver);

  const stoppedRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const offsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(0);

  const elapsedRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const speedTimerRef = useRef(0);
  const distanceRef = useRef(0);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  useEffect(() => {
    gameOverCallbackRef.current = onGameOver;
  }, [onGameOver]);

  const updateFrame = useCallback((deltaTime: number) => {
    if (!playingRef.current || stoppedRef.current) return;

    // Timer
    elapsedRef.current += deltaTime / 60;

    const currentTime = Math.floor(elapsedRef.current);
    setElapsedTime((previous) =>
      previous !== currentTime ? currentTime : previous
    );

    // Random speed adjustment
    speedTimerRef.current += deltaTime;

    if (speedTimerRef.current >= SPEED_CHANGE_INTERVAL) {
      speedTimerRef.current %= SPEED_CHANGE_INTERVAL;

      const change = Math.floor(Math.random() * 4) + 1;
      const direction = Math.random() > 0.5 ? 1 : -1;

      speedRef.current = Math.max(
        MIN_SPEED,
        Math.min(MAX_SPEED, speedRef.current + change * direction)
      );

      setSpeed(speedRef.current);
    }

    // Distance
    distanceRef.current +=
      (speedRef.current / 3.6) * (deltaTime / 60);

    const currentDistance = Math.floor(distanceRef.current);
    setDistance((previous) =>
      previous !== currentDistance ? currentDistance : previous
    );

    // Road movement
    const roadSpeed = 3 * (speedRef.current / INITIAL_SPEED);

    offsetRef.current =
      (offsetRef.current + roadSpeed * deltaTime) % 10000;

    // Spawn obstacles
    spawnTimerRef.current += deltaTime;

    if (spawnTimerRef.current >= OBSTACLE_SPAWN_INTERVAL) {
      spawnTimerRef.current %= OBSTACLE_SPAWN_INTERVAL;

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        lane: Math.random() > 0.5 ? "left" : "right",
        progress: 0,
      });
    }

    // Move obstacles continuously
    const obstacleSpeed = 0.0025 * (speedRef.current / INITIAL_SPEED);

    const movedObstacles = obstaclesRef.current
      .map((obstacle) => ({
        ...obstacle,
        progress: obstacle.progress + obstacleSpeed * deltaTime,
      }))
      .filter((obstacle) => obstacle.progress < 1.1);

    // Detect the exact moment an obstacle reaches the player
    const hitObstacle = movedObstacles.find((obstacle) => {
      const previous = obstaclesRef.current.find(
        (item) => item.id === obstacle.id
      );

      if (!previous || obstacle.lane !== laneRef.current) return false;

      return hasReachedPlayer(
        previous.progress,
        obstacle.progress,
        PLAYER_PROGRESS
      );
    });

    if (hitObstacle) {
      // Stop the obstacle exactly at the player's center
      const impactObstacle = {
        ...hitObstacle,
        progress: PLAYER_PROGRESS,
      };

      obstaclesRef.current = [impactObstacle];
      stoppedRef.current = true;

      setFrame({
        offset: offsetRef.current,
        obstacles: [impactObstacle],
      });

      gameOverCallbackRef.current();
      return;
    }

    obstaclesRef.current = movedObstacles;

    setFrame({
      offset: offsetRef.current,
      obstacles: movedObstacles,
    });
  }, []);

  useGameAnimation({ onFrame: updateFrame });

  const resetGame = useCallback(() => {
    stoppedRef.current = false;
    obstaclesRef.current = [];
    offsetRef.current = 0;
    spawnTimerRef.current = 0;
    nextIdRef.current = 0;

    elapsedRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    speedTimerRef.current = 0;
    distanceRef.current = 0;

    setFrame({ offset: 0, obstacles: [] });
    setElapsedTime(0);
    setSpeed(INITIAL_SPEED);
    setDistance(0);
  }, []);

  return {
    frame,
    elapsedTime,
    speed,
    distance,
    resetGame,
  };
}
