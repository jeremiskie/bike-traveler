"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GAME_RESULT_STORAGE_KEY } from "@/constants/game";
import { readLeaderboardEntries } from "@/utils/leaderboard";
import type { LeaderboardEntry } from "@/types/game";

type LeaderboardView = "player" | "topFive";

function isSavedPlayerCode(value: unknown): value is { playerCode: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "playerCode" in value &&
    typeof value.playerCode === "string" &&
    /^[A-Z]{3}$/.test(value.playerCode)
  );
}

function readCurrentPlayerCode() {
  const savedResult = window.sessionStorage.getItem(GAME_RESULT_STORAGE_KEY);
  if (savedResult === null) return null;

  const parsedResult: unknown = JSON.parse(savedResult);
  return isSavedPlayerCode(parsedResult) ? parsedResult.playerCode : null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LeaderboardsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPlayerCode, setCurrentPlayerCode] = useState<string | null>(
    null
  );
  const [view, setView] = useState<LeaderboardView>("player");

  const handleBackToGame = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const savedEntries = readLeaderboardEntries();
        setEntries(savedEntries);

        let savedPlayerCode: string | null = null;
        try {
          savedPlayerCode = readCurrentPlayerCode();
        } catch (error) {
          console.error("Could not identify the current player.", error);
          setLoadError(
            "The current player could not be identified. Showing the most recent player's runs."
          );
        }

        const mostRecentEntry = [...savedEntries].sort((a, b) =>
          b.playedAt.localeCompare(a.playedAt)
        )[0];
        setCurrentPlayerCode(
          savedPlayerCode ?? mostRecentEntry?.playerCode ?? null
        );
      } catch (error) {
        console.error("Could not load leaderboard entries.", error);
        setLoadError("Leaderboard data could not be loaded from this browser.");
        setEntries([]);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const sortedEntries = entries
    ? [...entries].sort(
        (a, b) =>
          b.distance - a.distance ||
          (b.averageSpeed ?? -1) - (a.averageSpeed ?? -1) ||
          b.playedAt.localeCompare(a.playedAt)
      )
    : [];
  const playerEntries = entries
    ? entries
        .filter((entry) => entry.playerCode === currentPlayerCode)
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    : [];
  const displayedEntries =
    view === "topFive" ? sortedEntries.slice(0, 5) : playerEntries;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
            <p className="mt-2 text-sm text-neutral-400">
              {view === "player"
                ? `All runs for player ${currentPlayerCode ?? "—"}, newest first.`
                : "Top five runs ranked by highest distance."}{" "}
              Run dates and times are saved with each result.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-neutral-700 p-1">
              <button
                type="button"
                aria-pressed={view === "player"}
                onClick={() => setView("player")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  view === "player"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                My attempts
              </button>
              <button
                type="button"
                aria-pressed={view === "topFive"}
                onClick={() => setView("topFive")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  view === "topFive"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                Top 5
              </button>
            </div>
            <button
              type="button"
              onClick={handleBackToGame}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white"
            >
              Back to game
            </button>
          </div>
        </header>

        {loadError && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-900 bg-red-950/60 p-4 text-sm text-red-200"
          >
            {loadError}
          </p>
        )}

        {entries === null ? (
          <p className="text-neutral-400">Loading leaderboard...</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
            <p className="text-lg font-semibold">No scores yet</p>
            <p className="mt-2 text-sm text-neutral-400">
              Finish a game to add the first leaderboard entry.
            </p>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
            <p className="text-lg font-semibold">
              {currentPlayerCode
                ? `No runs found for ${currentPlayerCode}`
                : "No player selected"}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              {currentPlayerCode
                ? "Play a game with this player code to see its attempts here."
                : "Finish a game to see a player's run history."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Player code
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Highest distance
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Average speed
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {displayedEntries.map((entry, index) => (
                  <tr key={entry.id} className="bg-neutral-950">
                    <td className="px-4 py-3 font-semibold text-neutral-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold tracking-widest">
                      {entry.playerCode}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {entry.distance} m
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {entry.averageSpeed === undefined
                        ? "—"
                        : `${entry.averageSpeed.toFixed(2)} km/h`}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {formatDate(entry.playedAt)}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {formatTime(entry.playedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
