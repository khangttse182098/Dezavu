import React from "react";
import { TChooseResult } from "../types";

const Result = ({
  chooseResult,
  score,
}: {
  chooseResult: TChooseResult;
  score: number;
}) => {
  const { isChoose, isCorrect } = chooseResult;
  return (
    <>
      {/* show correct text */}
      {isChoose && isCorrect && (
        <h1 className="text-4xl font-bold text-green-600 my-10">Correct!</h1>
      )}
      {/* show incorrect text */}
      {isChoose && !isCorrect && score > 0 && (
        <h1 className="text-4xl font-bold text-red-600 my-10">Incorrect!</h1>
      )}
    </>
  );
};

export default Result;
