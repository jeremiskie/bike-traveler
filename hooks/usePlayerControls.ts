
"use client";

import { useEffect, useRef, useState } from "react";

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

  // =====================================
  // ESP32 CONNECTION SETTINGS
  // =====================================

  const [esp32IP, setEsp32IP] = useState("172.26.180.69");
  const [connected, setConnected] = useState(false);
  const [connectionMessage, setConnectionMessage] =
    useState("Waiting for ESP32...");

  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const previousButtons = useRef({
    left: false,
    right: false,
  });

  // =====================================
  // KEYBOARD + ESP32 CONTROLS
  // =====================================

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    // KEYBOARD CONTROLS
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

    // ESP32 WIFI CONTROLS
    const checkESP32 = async () => {
      try {
        const response = await fetch(
          `http://${esp32IP.trim()}/buttons`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("ESP32 request failed");
        }

        const data = await response.json();

        if (
          typeof data.left !== "boolean" ||
          typeof data.right !== "boolean"
        ) {
          throw new Error("Invalid ESP32 response");
        }

        if (!active) return;

        setConnected(true);
        setConnectionMessage("ESP32 Connected!");

        setLeftPressed(data.left);
        setRightPressed(data.right);

        // LEFT BUTTON
        if (
          data.left &&
          !previousButtons.current.left
        ) {
          console.log("ESP32 LEFT BUTTON PRESSED");
          onMoveLeft();
        }

        // RIGHT BUTTON
        if (
          data.right &&
          !previousButtons.current.right
        ) {
          console.log("ESP32 RIGHT BUTTON PRESSED");
          onMoveRight();
        }

        previousButtons.current = {
          left: data.left,
          right: data.right,
        };

      } catch (error) {
        if (!active) return;

        setConnected(false);
        setConnectionMessage("ESP32 Disconnected");

        setLeftPressed(false);
        setRightPressed(false);

        previousButtons.current = {
          left: false,
          right: false,
        };

      }

      if (active) {
        timer = setTimeout(checkESP32, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (esp32IP.trim()) {
      checkESP32();
    }

    return () => {
      active = false;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      clearTimeout(timer);
    };

  }, [enabled, onMoveLeft, onMoveRight, esp32IP]);

  // =====================================
  // RETURN ESP32 INFORMATION TO COMPONENT
  // =====================================

  return {
    esp32IP,
    setEsp32IP,
    connected,
    connectionMessage,
    leftPressed,
    rightPressed,
  };
}
