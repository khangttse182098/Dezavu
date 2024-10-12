import React from "react";

const PlayButton = ({
  handlePlayTrack,
}: {
  handlePlayTrack: () => Promise<void>;
}) => {
  return (
    <button
      onClick={handlePlayTrack}
      className="bg-blue-500 w-56 h-20 hover:bg-blue-800 font-bold text-slate-300 text-lg border-none rounded-lg scale-100 hover:scale-95 transition-all"
    >
      Play
    </button>
  );
};

export default PlayButton;
