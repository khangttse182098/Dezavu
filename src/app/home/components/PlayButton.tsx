import React from "react";
import { TChooseResult, TPlayerState } from "../types";

const PlayButton = ({
  handlePlayTrack,
  handleContinueTrack,
  playerState,
  chooseResult,
}: {
  handlePlayTrack: () => Promise<void>;
  handleContinueTrack: () => Promise<void>;
  playerState: TPlayerState;
  chooseResult: TChooseResult;
}) => {
  const { isContinue, isPlaying, isPausing, isClicked } = playerState;

  const handleClick = () => {
    if (chooseResult.isChoose) {
      handlePlayTrack();
    } else {
      handleContinueTrack();
    }
  };

  return (
    <>
      {/* start playing */}
      {!isContinue && (
        <button
          onClick={handlePlayTrack}
          className={` w-56 h-20 font-bold text-slate-300 text-lg border-none rounded-lg scale-100  transition-all ${
            isPlaying || isClicked
              ? "bg-blue-500"
              : "bg-blue-800 hover:bg-blue-500 hover:scale-95"
          }`}
          disabled={isPlaying || isClicked ? true : false}
        >
          {isClicked && "Loading..."}
          {isPlaying && "Playing..."}
          {!isClicked && !isPlaying && "Play"}
        </button>
      )}

      {/* continue button */}
      {isContinue && (
        <button
          onClick={handleClick}
          className={
            "w-56 h-20 font-bold text-white text-lg border-none rounded-lg scale-100 transition-all  bg-green-500 hover:bg-green-800 hover:scale-95"
          }
          disabled={!isPausing ? true : false}
        >
          Continue
        </button>
      )}
    </>
  );
};

export default PlayButton;
