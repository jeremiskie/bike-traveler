"use client";

import { useEffect, useRef, useState } from "react";

interface UsePlayerControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  enabled: boolean;
}

interface ESP32Telemetry {
  left: boolean;
  right: boolean;
  speed_kmh: number;
  pulses: number;
}

const ESP32_IP = process.env.NEXT_PUBLIC_ESP32_IP ?? "10.75.214.69";

function isESP32Telemetry(value: unknown): value is ESP32Telemetry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    "left" in value &&
    typeof value.left === "boolean" &&
    "right" in value &&
    typeof value.right === "boolean" &&
    "speed_kmh" in value &&
    typeof value.speed_kmh === "number" &&
    Number.isFinite(value.speed_kmh) &&
    value.speed_kmh >= 0 &&
    "pulses" in value &&
    typeof value.pulses === "number" &&
    Number.isFinite(value.pulses) &&
    value.pulses >= 0
  );
}

function isIPv4Address(value: string) {
  const octets = value.split(".");
  return (
    octets.length === 4 &&
    octets.every(
      (octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255
    )
  );
}

export function usePlayerControls({
  onMoveLeft,
  onMoveRight,
  enabled,
}: UsePlayerControlsProps) {
  const [connected, setConnected] = useState(false);
  const [sensorSpeedKmh, setSensorSpeedKmh] = useState(0);
  const previousButtons = useRef({ left: false, right: false });
  const lastConnectionState = useRef<
    "unknown" | "connected" | "disconnected"
  >("unknown");

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }

      if (event.repeat) return;

      if (event.key === "ArrowLeft") {
        onMoveLeft();
      } else if (event.key === "ArrowRight") {
        onMoveRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onMoveLeft, onMoveRight]);

  useEffect(() => {
    if (!isIPv4Address(ESP32_IP)) {
      if (lastConnectionState.current !== "disconnected") {
        console.error(
          "ESP32 connection failed: configure NEXT_PUBLIC_ESP32_IP with the board's IPv4 address."
        );
        lastConnectionState.current = "disconnected";
      }
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const pollESP32 = async () => {
      try {
        const response = await fetch(`http://${ESP32_IP}/buttons`, {
          cache: "no-store",
          signal: AbortSignal.timeout(1500),
        });

        if (!response.ok) {
          throw new Error(`ESP32 returned HTTP ${response.status}.`);
        }

        const data: unknown = await response.json();
        if (!isESP32Telemetry(data)) {
          throw new Error("ESP32 returned an invalid telemetry response.");
        }

        if (!active) return;

        setConnected(true);
        setSensorSpeedKmh(data.speed_kmh);

        if (data.left && !previousButtons.current.left) {
          console.info("Left button pressed!");
          if (enabled) onMoveLeft();
        }
        if (data.right && !previousButtons.current.right) {
          console.info("Right button pressed!");
          if (enabled) onMoveRight();
        }

        previousButtons.current = {
          left: data.left,
          right: data.right,
        };

        if (lastConnectionState.current !== "connected") {
          console.info("ESP32 connected.");
          lastConnectionState.current = "connected";
        }
      } catch (error) {
        if (!active) return;

        setConnected(false);
        setSensorSpeedKmh(0);
        previousButtons.current = { left: false, right: false };

        if (lastConnectionState.current !== "disconnected") {
          console.error("ESP32 connection failed.", error);
          lastConnectionState.current = "disconnected";
        }
      }

      if (active) {
        timer = setTimeout(pollESP32, 100);
      }
    };

    pollESP32();
    return () => {
      active = false;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [enabled, onMoveLeft, onMoveRight]);

  return { connected, sensorSpeedKmh };
}
