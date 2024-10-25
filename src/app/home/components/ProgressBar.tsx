import React from "react";
import { TChooseResult } from "../types";

const ProgressBar = ({
  chooseResult,
  songInterval,
}: {
  chooseResult: TChooseResult;
  songInterval: number;
}) => {
  //1 2 5 8 14
  return (
    <>
      {!chooseResult.isChoose && (
        <progress
          value={songInterval}
          max="14"
          className="[&::-webkit-progress-bar]:rounded-md [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-md [&::-webkit-progress-value]:bg-blue-500 h-3 w-56 mt-14"
        />
      )}
    </>
  );
};

export default ProgressBar;
