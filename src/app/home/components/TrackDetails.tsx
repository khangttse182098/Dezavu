import React from "react";

const TrackDetails = ({
  songName,
  artistName,
  image,
  isBig,
}: {
  songName: string;
  artistName: string;
  image: string;
  isBig: boolean;
}) => {
  return (
    <>
      <div className={isBig ? "h-60 w-60 my-14" : "h-32 w-32"}>
        <img src={image} alt="track images" className="rounded-md" />
        <h1
          className={`${
            isBig ? "text-2xl text-white" : "text-lg text-slate-900"
          }  text-center font-bold`}
        >
          {songName}
        </h1>
        <p
          className={`${
            isBig ? "text-lg text-white" : "text-md text-slate-900"
          }  text-center italic`}
        >
          {artistName}
        </p>
      </div>
    </>
  );
};

export default TrackDetails;
