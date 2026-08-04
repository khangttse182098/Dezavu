import React, { Dispatch, SetStateAction } from "react";
import { TChooseResult, TPlayerState } from "../types";

const SearchInput = ({
  playerState,
  setSearchString,
  chooseResult,
}: {
  playerState: TPlayerState;
  setSearchString: Dispatch<SetStateAction<string>>;
  chooseResult: TChooseResult;
}) => {
  const { isPausing } = playerState;
  return (
    <>
      {isPausing && !chooseResult.isChoose && (
        <input
          type="search"
          placeholder="Enter your guess"
          autoFocus
          className="h-14 w-72 rounded-sm border border-neutral-800 bg-neutral-900 px-4 text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-accent"
          onChange={(e) => setSearchString(e.currentTarget.value)}
        />
      )}
    </>
  );
};

export default SearchInput;
