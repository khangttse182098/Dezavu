import React from "react";
import { TChooseResult } from "../types";

const TrackDetails = ({
  songName,
  artistName,
  image,
  isBig,
  chooseResult,
  score,
}: {
  songName: string;
  artistName: string;
  image: string;
  isBig: boolean;
  chooseResult: TChooseResult;
  score: number;
}) => {
  return (
    <>
      {chooseResult?.isChoose && (score > 0 || !isBig) && (
        <div
          className={`flex flex-col items-center text-center ${
            isBig ? "my-14 w-64 gap-4" : "w-40 gap-2"
          }`}
        >
          <img
            src={image}
            alt="track images"
            className={`rounded-sm border border-neutral-800 ${
              isBig ? "w-64" : "w-28"
            }`}
          />
          <h1
            className={`font-bold text-white ${isBig ? "text-2xl" : "text-base"}`}
          >
            {songName}
          </h1>
          <p
            className={`italic text-neutral-400 ${
              isBig ? "text-base" : "text-sm"
            }`}
          >
            {artistName}
          </p>
        </div>
      )}
    </>
  );
};

export default TrackDetails;
