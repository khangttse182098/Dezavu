import React from "react";
import { GUESS_WINDOW_MS, TRoomState } from "@/shared/multiplayer";
import { useCountdown } from "../hooks/useCountdown";
import PlayerAvatar from "./PlayerAvatar";

const letters = ["A", "B", "C", "D"];

const RoundScreen = ({
  roomState,
  myAnswerIndex,
  handleAnswer,
}: {
  roomState: TRoomState;
  myAnswerIndex: number | null;
  handleAnswer: (choiceIndex: number) => void;
}) => {
  const round = roomState.round;
  const remainingMs = useCountdown(round?.deadline ?? null);

  if (!round) return null;

  const hasLocked = myAnswerIndex !== null;
  const progress = Math.min(remainingMs / GUESS_WINDOW_MS, 1);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-16">
      <div className="w-full text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Round {round.number} / {roomState.totalRounds}
        </p>
        <p className="mt-2 font-display text-6xl text-white">
          {Math.ceil(remainingMs / 1000)}
          <span className="text-accent">s</span>
        </p>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-sm bg-neutral-800">
          <div
            className="h-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {round.options.map((option, index) => {
          const isMine = myAnswerIndex === index;
          return (
            <button
              key={`${option.name} - ${option.artist}`}
              disabled={hasLocked}
              onClick={() => handleAnswer(index)}
              className={`group flex items-center gap-4 rounded-sm border px-5 py-4 text-left transition-colors duration-200 ${
                isMine
                  ? "border-accent bg-neutral-900"
                  : hasLocked
                  ? "border-neutral-800 bg-neutral-950 opacity-40"
                  : "border-neutral-800 bg-neutral-950 hover:border-accent hover:bg-neutral-900"
              }`}
            >
              <span
                className={`font-display text-xl transition-colors ${
                  isMine
                    ? "text-accent"
                    : "text-neutral-600 group-hover:text-accent"
                }`}
              >
                {letters[index]}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">
                  {option.name}
                </span>
                <span className="block truncate text-xs text-neutral-400">
                  {option.artist}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
        {hasLocked ? "Locked in — waiting for the others" : "Faster = more points"}
      </p>

      {/* who has answered */}
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {roomState.players
          .filter((player) => player.connected)
          .map((player) => (
            <li key={player.id} className="flex items-center gap-2">
              <PlayerAvatar name={player.name} image={player.image} />
              <span
                className={`text-[10px] uppercase tracking-[0.2em] ${
                  player.hasAnswered ? "text-accent" : "text-neutral-600"
                }`}
              >
                {player.hasAnswered ? "✓" : "…"}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RoundScreen;
