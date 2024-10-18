import React from "react";

const PlayButton = ({
  handlePlayTrack,
  isPlaying,
  isPausing,
  isClicked,
}: {
  handlePlayTrack: () => Promise<void>;
  isPlaying: boolean;
  isPausing: boolean;
  isClicked: boolean;
}) => {
  return (
    <>
      {/* start playing */}
      {!isPausing && (
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
      {isPlaying && isPausing && (
        <button
          onClick={handlePlayTrack}
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
