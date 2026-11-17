"use client";

import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";

interface GameSetupDialogProps {
  onStart: (playerCode: string) => void;
}

export default function GameSetupDialog({
  onStart,
}: GameSetupDialogProps) {
  const [letters, setLetters] = useState(["", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const playerCode = letters.join("");
  const canStart = letters.every((letter) => letter !== "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canStart) {
      onStart(playerCode);
    }
  };

  const handleLetterChange = (index: number, value: string) => {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);

    setLetters((current) =>
      current.map((currentLetter, currentIndex) =>
        currentIndex === index ? letter : currentLetter
      )
    );

    if (letter && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleLetterKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !letters[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < inputRefs.current.length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 p-6 text-center text-white shadow-2xl sm:p-8"
      >
        <h2 className="text-3xl font-black tracking-tight">Choose your code</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Type any three letters. Each letter fills the next slot.
        </p>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium text-neutral-300">
            3-letter player code
          </legend>
          <div className="mt-3 flex justify-center gap-3">
            {letters.map((letter, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                aria-label={`Code letter ${index + 1}`}
                value={letter}
                autoFocus={index === 0}
                onChange={(event) =>
                  handleLetterChange(index, event.target.value)
                }
                onKeyDown={(event) => handleLetterKeyDown(index, event)}
                maxLength={1}
                autoComplete="off"
                required
                className="h-14 w-16 rounded-full border border-neutral-600 bg-neutral-800 text-center text-2xl font-bold uppercase text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
              />
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!canStart}
          className="mt-8 w-full rounded-xl bg-sky-600 px-6 py-4 text-lg font-bold transition hover:bg-sky-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          PLAY
        </button>

        <Link
          href="/leaderboards"
          className="mt-5 inline-flex items-center gap-2 text-sm text-neutral-300 transition hover:text-white"
        >
          <span aria-hidden="true">🏆</span>
          LEADERBOARDS
        </Link>
      </form>
    </div>
  );
}
