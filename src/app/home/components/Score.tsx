import React from "react";

const GameScore = ({ isLose, score }: { isLose: boolean; score: number }) => {
  return (
    <>
      {!isLose && (
        <header className="flex w-full items-center justify-between border-b border-neutral-800 px-6 py-4">
          <p className="font-display text-xl tracking-wide text-white">
            DEZAVU<span className="text-accent">.</span>
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Score
            <span className="ml-3 font-display text-2xl tabular-nums text-accent">
              {score}
            </span>
          </p>
        </header>
      )}
    </>
  );
};

export default GameScore;
