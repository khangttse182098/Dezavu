import React from "react";

const GameScore = ({ isLose, score }: { isLose: boolean; score: number }) => {
  return (
    <>
      {!isLose && (
        <h1 className="text-2xl text-white font-bold text-center p-10">
          Score: {score}
        </h1>
      )}
    </>
  );
};

export default GameScore;
