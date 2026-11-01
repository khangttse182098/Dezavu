"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateRoomCode,
  isValidRoomCode,
  ROOM_CODE_LENGTH,
} from "@/shared/multiplayer";

//landing screen: create a room or join one with a code
const Page = () => {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setJoinError("Codes are 4 letters or numbers");
      return;
    }
    router.push(`/multiplayer/${code}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-14 px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl text-white sm:text-6xl">
          PARTY MODE<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Same song · Everyone guesses · Fastest wins
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {/* create */}
        <button
          onClick={() => router.push(`/multiplayer/${generateRoomCode()}`)}
          className="group flex h-60 flex-col justify-between rounded-sm border border-neutral-800 bg-neutral-950 p-7 text-left transition-colors duration-200 hover:border-accent hover:bg-neutral-900"
        >
          <span className="font-display text-sm tracking-[0.2em] text-neutral-600 transition-colors group-hover:text-accent">
            01
          </span>
          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              CREATE ROOM<span className="text-accent">.</span>
            </h2>
            <p className="mt-3 text-xs uppercase tracking-[0.15em] text-neutral-500">
              Get a code, invite your friends, pick the playlist.
            </p>
          </div>
        </button>

        {/* join */}
        <div className="flex h-60 flex-col justify-between rounded-sm border border-neutral-800 bg-neutral-950 p-7">
          <span className="font-display text-sm tracking-[0.2em] text-neutral-600">
            02
          </span>
          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              JOIN ROOM<span className="text-accent">.</span>
            </h2>
            <div className="mt-4 flex gap-2">
              <input
                value={joinCode}
                maxLength={ROOM_CODE_LENGTH}
                placeholder="CODE"
                onChange={(event) => {
                  setJoinError("");
                  setJoinCode(event.target.value.toUpperCase());
                }}
                onKeyDown={(event) => event.key === "Enter" && handleJoin()}
                className="h-12 w-full min-w-0 rounded-sm border border-neutral-700 bg-black px-4 font-display text-xl tracking-[0.3em] text-white placeholder:text-neutral-700 focus:border-accent focus:outline-none"
              />
              <button
                onClick={handleJoin}
                className="h-12 shrink-0 rounded-sm bg-accent px-5 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-accent-dark"
              >
                Go
              </button>
            </div>
            {joinError && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-red-500">
                {joinError}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
        onClick={() => router.push("/home")}
      >
        &larr; Back to solo
      </button>
    </main>
  );
};

export default Page;
