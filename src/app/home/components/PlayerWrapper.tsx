import React from "react";
import { TPlayerState } from "../page";

const PlayerWrapper = ({
  playerState,
  children,
}: {
  playerState: TPlayerState;
  children: React.ReactNode;
}) => {
  const { accessToken, trackList, deviceId, player, isReady, sdkReady } =
    playerState;
  return (
    <>
      {accessToken && trackList && deviceId && player && isReady && sdkReady ? (
        children
      ) : (
        <div className="h-screen w-screen flex flex-col items-center">
          <p className="font-bold text-slate-300 text-lg mt-32">Loading...</p>
        </div>
      )}
    </>
  );
};

export default PlayerWrapper;
