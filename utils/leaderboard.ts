import type { LeaderboardEntry } from "@/types/game";

const LEADERBOARD_STORAGE_KEY = "bike-traveler-leaderboard-v1";

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const hasValidAverageSpeed =
    !("averageSpeed" in value) ||
    (typeof value.averageSpeed === "number" &&
      Number.isFinite(value.averageSpeed) &&
      value.averageSpeed >= 0);

  return (
    hasValidAverageSpeed &&
    "id" in value &&
    typeof value.id === "string" &&
    "playerCode" in value &&
    typeof value.playerCode === "string" &&
    /^[A-Z]{3}$/.test(value.playerCode) &&
    "distance" in value &&
    typeof value.distance === "number" &&
    Number.isFinite(value.distance) &&
    value.distance >= 0 &&
    "highestSpeed" in value &&
    typeof value.highestSpeed === "number" &&
    Number.isFinite(value.highestSpeed) &&
    value.highestSpeed >= 0 &&
    "playedAt" in value &&
    typeof value.playedAt === "string" &&
    !Number.isNaN(Date.parse(value.playedAt))
  );
}

export function readLeaderboardEntries(): LeaderboardEntry[] {
  const savedEntries = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  if (savedEntries === null) return [];

  const entries: unknown = JSON.parse(savedEntries);
  if (!Array.isArray(entries) || !entries.every(isLeaderboardEntry)) {
    throw new Error("Saved leaderboard data is invalid.");
  }

  return entries;
}

export function saveLeaderboardEntry(entry: LeaderboardEntry) {
  const entries = readLeaderboardEntries();
  entries.push(entry);
  window.localStorage.setItem(
    LEADERBOARD_STORAGE_KEY,
    JSON.stringify(entries)
  );
}
