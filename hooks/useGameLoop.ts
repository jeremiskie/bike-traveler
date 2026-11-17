
import { useCallback, useEffect, useRef, useState } from "react";

import { useGameAnimation } from "@/hooks/useGameAnimation";

import {
  GAME_HEIGHT,
  HORIZON,
  CHALLENGE_DURATION,
  INITIAL_SPEED,
  MAX_SPEED,
  MIN_SPEED,
  OBSTACLE_SPAWN_INTERVAL,
  PLAYER_PROGRESS,
  SPEED_CHANGE_INTERVAL,
} from "@/constants/game";

import { hasReachedPlayer } from "@/utils/gameUtils";

import type { GameFrame, GameResult, Lane, Obstacle } from "@/types/game";

const OBSTACLE_MODELS = ["spikes", "rocks", "logs"] as const;

interface UseGameLoopProps {
  isPlaying: boolean;
  lane: Lane;
  onGameOver: (result: GameResult) => void;
  onChallengeComplete: (result: GameResult) => void;
}

interface RestoredResult {
  timeRemaining: number;
  speed: number;
  distance: number;
}

export function useGameLoop({
  isPlaying,
  lane,
  onGameOver,
  onChallengeComplete,
}: UseGameLoopProps) {
  const [frame, setFrame] = useState<GameFrame>({
    offset: 0,
    obstacles: [],
  });

  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [highestSpeed, setHighestSpeed] = useState(INITIAL_SPEED);
  const [distance, setDistance] = useState(0);

  const playingRef = useRef(isPlaying);
  const laneRef = useRef(lane);
  const gameOverCallbackRef = useRef(onGameOver);
  const challengeCompleteCallbackRef = useRef(onChallengeComplete);

  const stoppedRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const offsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(0);

  const elapsedRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const highestSpeedRef = useRef(INITIAL_SPEED);
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

  useEffect(() => {
    challengeCompleteCallbackRef.current = onChallengeComplete;
  }, [onChallengeComplete]);

  const updateFrame = useCallback((deltaTime: number) => {
    if (!playingRef.current || stoppedRef.current) return;

    const remainingTime = CHALLENGE_DURATION - elapsedRef.current;
    const frameDeltaTime = Math.min(deltaTime, remainingTime * 60);
    elapsedRef.current += frameDeltaTime / 60;

    const currentTimeRemaining = Math.max(
      0,
      Math.ceil(CHALLENGE_DURATION - elapsedRef.current)
    );
    setTimeRemaining((previous) =>
      previous !== currentTimeRemaining ? currentTimeRemaining : previous
    );

    // Random speed adjustment
    speedTimerRef.current += frameDeltaTime;

    if (speedTimerRef.current >= SPEED_CHANGE_INTERVAL) {
      speedTimerRef.current %= SPEED_CHANGE_INTERVAL;

      const change = Math.floor(Math.random() * 4) + 1;
      const direction = Math.random() > 0.5 ? 1 : -1;

      speedRef.current = Math.max(
        MIN_SPEED,
        Math.min(MAX_SPEED, speedRef.current + change * direction)
      );

      setSpeed(speedRef.current);
      if (speedRef.current > highestSpeedRef.current) {
        highestSpeedRef.current = speedRef.current;
        setHighestSpeed(speedRef.current);
      }
    }

    // Distance
    distanceRef.current +=
      (speedRef.current / 3.6) * (frameDeltaTime / 60);

    const currentDistance = Math.floor(distanceRef.current);
    setDistance((previous) =>
      previous !== currentDistance ? currentDistance : previous
    );

    // Road movement
    const roadSpeed = 3 * (speedRef.current / INITIAL_SPEED);

    offsetRef.current =
      (offsetRef.current + roadSpeed * frameDeltaTime) % 10000;

    // Spawn obstacles
    spawnTimerRef.current += frameDeltaTime;

    if (spawnTimerRef.current >= OBSTACLE_SPAWN_INTERVAL) {
      spawnTimerRef.current %= OBSTACLE_SPAWN_INTERVAL;

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        lane: Math.random() > 0.5 ? "left" : "right",
        progress: 0,
        model: OBSTACLE_MODELS[
          Math.floor(Math.random() * OBSTACLE_MODELS.length)
        ],
      });
    }

    // Move obstacles continuously
    const obstacleSpeed = 0.0025 * (speedRef.current / INITIAL_SPEED);

    const movedObstacles = obstaclesRef.current
      .map((obstacle) => ({
        ...obstacle,
        progress: obstacle.progress + obstacleSpeed * frameDeltaTime,
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

      gameOverCallbackRef.current({
        distance: Math.floor(distanceRef.current),
        highestSpeed: highestSpeedRef.current,
      });
      return;
    }

    obstaclesRef.current = movedObstacles;

    setFrame({
      offset: offsetRef.current,
      obstacles: movedObstacles,
    });

    if (elapsedRef.current >= CHALLENGE_DURATION) {
      stoppedRef.current = true;
      challengeCompleteCallbackRef.current({
        distance: Math.floor(distanceRef.current),
        highestSpeed: highestSpeedRef.current,
      });
    }
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
    highestSpeedRef.current = INITIAL_SPEED;
    speedTimerRef.current = 0;
    distanceRef.current = 0;

    setFrame({ offset: 0, obstacles: [] });
    setTimeRemaining(CHALLENGE_DURATION);
    setSpeed(INITIAL_SPEED);
    setHighestSpeed(INITIAL_SPEED);
    setDistance(0);
  }, []);

  const restoreResult = useCallback(
    ({ timeRemaining, speed, distance }: RestoredResult) => {
      stoppedRef.current = true;
      elapsedRef.current = CHALLENGE_DURATION - timeRemaining;
      speedRef.current = speed;
      highestSpeedRef.current = speed;
      distanceRef.current = distance;

      obstaclesRef.current = [];
      offsetRef.current = 0;
      spawnTimerRef.current = 0;
      speedTimerRef.current = 0;
      setFrame({ offset: 0, obstacles: [] });
      setTimeRemaining(timeRemaining);
      setSpeed(speed);
      setHighestSpeed(speed);
      setDistance(distance);
    },
    []
  );

  return {
    frame,
    timeRemaining,
    speed,
    highestSpeed,
    distance,
    resetGame,
    restoreResult,
  };
}
