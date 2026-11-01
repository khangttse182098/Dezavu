import React from "react";
import { TRoomState } from "@/shared/multiplayer";
import PlayerAvatar from "./PlayerAvatar";

const RevealScreen = ({
  roomState,
  meId,
}: {
  roomState: TRoomState;
  meId: string;
}) => {
  const result = roomState.lastResult;
  if (!result) return null;

  const myResult = result.answers[meId];
  const isFinalRound = result.roundNumber >= roomState.totalRounds;
  const standings = [...roomState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          The answer was
        </p>
        {result.track.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.track.image}
            alt={result.track.name}
            className="mx-auto mt-6 h-44 w-44 rounded-sm object-cover"
          />
        )}
        <h2 className="mt-6 font-display text-4xl text-white">
          {result.track.name}
          <span className="text-accent">.</span>
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
          {result.track.artist}
        </p>

        <p
          className={`mt-6 text-sm font-bold uppercase tracking-[0.2em] ${
            myResult?.correct ? "text-accent" : "text-red-500"
          }`}
        >
          {myResult?.correct
            ? `You got it · +${myResult.gained}`
            : myResult?.choiceIndex === null || myResult === undefined
            ? "Too slow — no answer"
            : "Wrong pick"}
        </p>
      </div>

      {/* leaderboard */}
      <ul className="flex w-full flex-col gap-2">
        {standings.map((player, rank) => {
          const playerResult = result.answers[player.id];
          return (
            <li
              key={player.id}
              className={`flex items-center gap-4 rounded-sm border px-5 py-3 ${
                player.id === meId
                  ? "border-neutral-600 bg-neutral-900"
                  : "border-neutral-800 bg-neutral-950"
              } ${player.connected ? "" : "opacity-40"}`}
            >
              <span className="w-6 font-display text-lg text-neutral-600">
                {rank + 1}
              </span>
              <PlayerAvatar name={player.name} image={player.image} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                {player.name}
              </span>
              {playerResult && (
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    playerResult.correct ? "text-accent" : "text-neutral-600"
                  }`}
                >
                  {playerResult.correct ? `+${playerResult.gained}` : "—"}
                </span>
              )}
              <span className="w-16 text-right font-display text-lg text-white">
                {player.score}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="animate-pulse text-[10px] uppercase tracking-[0.3em] text-neutral-600">
        {isFinalRound ? "Final results incoming..." : "Next round incoming..."}
      </p>
    </div>
  );
};

export default RevealScreen;
