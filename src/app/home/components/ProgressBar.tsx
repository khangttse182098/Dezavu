import React from "react";
import { TChooseResult } from "../types";

const ProgressBar = ({ chooseResult }: { chooseResult: TChooseResult }) => {
  return (
    <>
      {!chooseResult.isChoose && (
        <progress
          value="10"
          max="100"
          className="[&::-webkit-progress-bar]:rounded-md [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-md [&::-webkit-progress-value]:bg-blue-500 h-3 w-56 mt-14"
        />
      )}
    </>
  );
};

export default ProgressBar;
