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
        className="w-96 h-96 mx-auto rounded-md bg-slate-300 mt-48 p-0 m-0"
      >
        <div className="w-full h-full flex flex-col items-center">
          <div className="text-center">
            <p className="text-4xl font-bold">You lose!</p>
            <p>High score: {highScore}</p>
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
            className="w-28 h-14 rounded-md bg-green-600 hover:bg-green-700 text-lg font-bold text-slate-950 transition-all mt-20"
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
