import React, { forwardRef } from "react";
import TrackDetails from "./TrackDetails";
import { TLoseModalProps } from "../types";

const LoseModal = forwardRef<HTMLDialogElement, TLoseModalProps>(
  (props: TLoseModalProps, ref) => {
    const {
      highScore,
      songName,
      artistName,
      image,
      chooseResult,
      score,
      handlePlayAgain,
    } = props;
    return (
      <dialog
        ref={ref}
        className="mx-auto mt-32 w-96 rounded-sm border border-neutral-800 bg-neutral-950 p-8 text-white"
      >
        <div className="flex w-full flex-col items-center gap-6">
          <div className="text-center">
            <p className="font-display text-5xl tracking-wide text-white">
              YOU LOSE
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
              High score
              <span className="ml-2 font-display text-xl tabular-nums text-accent">
                {highScore}
              </span>
            </p>
          </div>
          {/* show song detail */}
          <TrackDetails
            songName={songName}
            artistName={artistName}
            image={image}
            isBig={false}
            chooseResult={chooseResult}
            score={score}
          />
          <button
            className="h-14 w-full rounded-sm bg-accent text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-accent-dark"
            onClick={() => handlePlayAgain()}
          >
            Play again
          </button>
        </div>
      </dialog>
    );
  }
);
export default LoseModal;
