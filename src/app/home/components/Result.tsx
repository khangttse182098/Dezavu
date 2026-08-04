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
        <h1 className="my-10 font-display text-5xl tracking-wide text-accent">
          CORRECT!
        </h1>
      )}
      {/* show incorrect text */}
      {isChoose && !isCorrect && score > 0 && (
        <h1 className="my-10 font-display text-5xl tracking-wide text-red-500">
          INCORRECT!
        </h1>
      )}
    </>
  );
};

export default Result;
