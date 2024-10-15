import React from "react";

const TrackDetails = ({
  songName,
  artistName,
  image,
}: {
  songName: string;
  artistName: string;
  image: string;
}) => {
  return (
    <div className="h-32 w-32">
      <img src={image} alt="track images" className="rounded-md" />
      <h1 className="text-lg text-slate-900 text-center font-bold">
        {songName}
      </h1>
      <p className="text-lg text-slate-900 text-center italic">{artistName}</p>
    </div>
  );
};

export default TrackDetails;
