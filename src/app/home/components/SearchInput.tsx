import React, { Dispatch, SetStateAction } from "react";
import { TPlayerState } from "../page";

const SearchInput = ({
  playerState,
  setSearchString,
}: {
  playerState: TPlayerState;
  setSearchString: Dispatch<SetStateAction<string>>;
}) => {
  const { isPlaying, isPausing } = playerState;
  return (
    <>
      {isPlaying && isPausing && (
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
