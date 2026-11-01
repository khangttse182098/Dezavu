import React from "react";
import { TPlayerState } from "../types";

const PlayerWrapper = ({
  playerState,
  children,
}: {
  playerState: TPlayerState;
  children: React.ReactNode;
}) => {
  const { accessToken, deviceId, player, isReady, sdkReady } = playerState;
  return (
    <>
      {accessToken && deviceId && player && isReady && sdkReady ? (
        children
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-6">
          <p className="font-display text-4xl text-white">
            DEZAVU<span className="text-accent">.</span>
          </p>
          <div className="flex h-6 items-end gap-1" aria-hidden>
            <span className="h-full w-1 origin-bottom bg-accent animate-[eq_1s_ease-in-out_infinite]" />
            <span className="h-full w-1 origin-bottom bg-accent animate-[eq_1s_ease-in-out_-0.8s_infinite]" />
            <span className="h-full w-1 origin-bottom bg-accent animate-[eq_1s_ease-in-out_-0.4s_infinite]" />
            <span className="h-full w-1 origin-bottom bg-accent animate-[eq_1s_ease-in-out_-0.6s_infinite]" />
            <span className="h-full w-1 origin-bottom bg-accent animate-[eq_1s_ease-in-out_-0.2s_infinite]" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Loading player
          </p>
        </div>
      )}
    </>
  );
};

export default PlayerWrapper;
