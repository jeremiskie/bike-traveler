"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readLeaderboardEntries } from "@/utils/leaderboard";
import type { LeaderboardEntry } from "@/types/game";

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
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setEntries(readLeaderboardEntries());
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
          b.highestSpeed - a.highestSpeed ||
          b.playedAt.localeCompare(a.playedAt)
      )
    : [];

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Every completed run, ranked by distance. Records are saved in
              this browser.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white"
          >
            Back to game
          </Link>
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
                    Peak speed
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
                {sortedEntries.map((entry, index) => (
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
                      {entry.highestSpeed} km/h
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
