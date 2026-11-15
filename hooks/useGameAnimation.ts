
"use client";

import { useEffect, useRef } from "react";

interface UseGameAnimationProps {
  onFrame: (deltaTime: number) => void;
}

export function useGameAnimation({
  onFrame,
}: UseGameAnimationProps) {
  const callbackRef = useRef(onFrame);

  useEffect(() => {
    callbackRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    let animationId = 0;
    let previousTime = 0;

    const animate = (time: number) => {
      const deltaTime = previousTime
        ? Math.min((time - previousTime) / 16.67, 3)
        : 1;

      previousTime = time;

      callbackRef.current(deltaTime);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);
}
