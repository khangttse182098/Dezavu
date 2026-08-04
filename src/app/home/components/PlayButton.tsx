import React from "react";
import { TChooseResult, TPlayerState } from "../types";

const EqBars = () => (
  <span className="flex h-4 items-end gap-[3px]" aria-hidden>
    <span className="h-full w-[3px] origin-bottom bg-accent animate-[eq_0.9s_ease-in-out_infinite]" />
    <span className="h-full w-[3px] origin-bottom bg-accent animate-[eq_0.9s_ease-in-out_-0.6s_infinite]" />
    <span className="h-full w-[3px] origin-bottom bg-accent animate-[eq_0.9s_ease-in-out_-0.3s_infinite]" />
  </span>
);

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
  const { isContinue, isPlaying, isClicked } = playerState;

  const handleClick = () => {
    if (chooseResult.isChoose) {
      handlePlayTrack();
    } else {
      handleContinueTrack();
    }
  };

  const isBusy = isPlaying || isClicked;

  return (
    <button
      onClick={isContinue ? handleClick : handlePlayTrack}
      disabled={isBusy}
      className={`flex h-16 w-72 items-center justify-center gap-3 rounded-sm text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
        isBusy
          ? "border border-neutral-800 bg-neutral-900 text-neutral-300"
          : "bg-accent text-black hover:bg-accent-dark"
      }`}
    >
      {isPlaying && <EqBars />}
      {isClicked && "Loading..."}
      {isPlaying && "Playing"}
      {!isBusy && (isContinue ? "Continue" : "Play")}
    </button>
  );
};

export default PlayButton;
