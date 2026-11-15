
"use client";

import { useEffect } from "react";

interface UsePlayerControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  enabled: boolean;
}

export function usePlayerControls({
  onMoveLeft,
  onMoveRight,
  enabled,
}: UsePlayerControlsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
      }

      if (event.repeat) return;

      if (event.key === "ArrowLeft") {
        onMoveLeft();
      }

      if (event.key === "ArrowRight") {
        onMoveRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onMoveLeft, onMoveRight]);
}
