import React from "react";
import { TChoiceOption, TChooseResult, TPlayerState } from "../types";

const letters = ["A", "B", "C", "D"];

const ChoiceGrid = ({
  options,
  playerState,
  chooseResult,
  handleChoose,
}: {
  options: TChoiceOption[];
  playerState: TPlayerState;
  chooseResult: TChooseResult;
  handleChoose: (songName: string, artistName: string) => void;
}) => {
  const { isPausing } = playerState;

  //same rhythm as the search input: answers open up during the guess pause
  if (!isPausing || chooseResult.isChoose || options.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 px-6 sm:grid-cols-2">
      {options.map((option, index) => (
        <button
          key={`${option.name} - ${option.artist}`}
          onClick={() => handleChoose(option.name, option.artist)}
          className="group flex items-center gap-4 rounded-sm border border-neutral-800 bg-neutral-950 px-5 py-4 text-left transition-colors duration-200 hover:border-accent hover:bg-neutral-900"
        >
          <span className="font-display text-xl text-neutral-600 transition-colors group-hover:text-accent">
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
      ))}
    </div>
  );
};

export default ChoiceGrid;
