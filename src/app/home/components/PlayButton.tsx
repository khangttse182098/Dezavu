import React from "react";

const PlayButton = ({
  handlePlayTrack,
  isPlaying,
}: {
  handlePlayTrack: () => Promise<void>;
  isPlaying: boolean;
}) => {
  return (
    <button
      onClick={handlePlayTrack}
      className={` w-56 h-20 font-bold text-slate-300 text-lg border-none rounded-lg scale-100  transition-all ${
        isPlaying
          ? "bg-blue-500"
          : "bg-blue-800 hover:bg-blue-500 hover:scale-95"
      }`}
      disabled={isPlaying ? true : false}
    >
      Play
    </button>
  );
};

export default PlayButton;
