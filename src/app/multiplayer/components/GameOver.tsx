import React from "react";
import { useRouter } from "next/navigation";
import { TClientMessage, TRoomState } from "@/shared/multiplayer";
import PlayerAvatar from "./PlayerAvatar";

const GameOver = ({
  roomState,
  meId,
  send,
}: {
  roomState: TRoomState;
  meId: string;
  send: (message: TClientMessage) => void;
}) => {
  const router = useRouter();
  const isHost = roomState.hostId === meId;
  const standings = [...roomState.players].sort((a, b) => b.score - a.score);
  const winner = standings[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10 px-6 py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Game over
        </p>
        {winner && (
          <>
            <h1 className="mt-4 font-display text-6xl text-white sm:text-7xl">
              {winner.name}
              <span className="text-accent"> wins.</span>
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-400">
              {winner.score} points
              {winner.id === meId && " · That's you!"}
            </p>
          </>
        )}
      </div>

      <ul className="flex w-full flex-col gap-2">
        {standings.map((player, rank) => (
          <li
            key={player.id}
            className={`flex items-center gap-4 rounded-sm border px-5 py-4 ${
              rank === 0
                ? "border-accent bg-neutral-900"
                : player.id === meId
                ? "border-neutral-600 bg-neutral-900"
                : "border-neutral-800 bg-neutral-950"
            } ${player.connected ? "" : "opacity-40"}`}
          >
            <span className="w-6 font-display text-xl text-neutral-600">
              {rank + 1}
            </span>
            <PlayerAvatar name={player.name} image={player.image} />
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
              {player.name}
              {player.id === meId && (
                <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  You
                </span>
              )}
            </span>
            <span className="font-display text-2xl text-white">
              {player.score}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-4">
        {isHost ? (
          <button
            className="h-14 w-72 rounded-sm bg-accent text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-accent-dark"
            onClick={() => send({ type: "play_again" })}
          >
            Back to lobby
          </button>
        ) : (
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
            Waiting for the host to restart
          </p>
        )}
        <button
          className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
          onClick={() => router.push("/home")}
        >
          &larr; Leave room
        </button>
      </div>
    </div>
  );
};

export default GameOver;
