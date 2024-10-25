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
          className="p-5 rounded-lg"
          onChange={(e) => setSearchString(e.currentTarget.value)}
        />
      )}
    </>
  );
};

export default SearchInput;
