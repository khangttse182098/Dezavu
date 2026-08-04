import React from "react";
import { TChooseResult } from "../types";

const ProgressBar = ({
  chooseResult,
  songInterval,
}: {
  chooseResult: TChooseResult;
  songInterval: number;
}) => {
  //1 2 5 8 14
  return (
    <>
      {!chooseResult.isChoose && (
        <div className="mt-14 flex w-72 flex-col gap-2">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            <span>Snippet</span>
            <span className="tabular-nums">{songInterval}s / 14s</span>
          </div>
          <progress
            value={songInterval}
            max="14"
            className="h-1.5 w-full [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:rounded-sm [&::-webkit-progress-bar]:bg-neutral-800 [&::-webkit-progress-value]:rounded-sm [&::-webkit-progress-value]:bg-accent"
          />
        </div>
      )}
    </>
  );
};

export default ProgressBar;
