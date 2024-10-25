import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { getMostListenedTrackList } from "../utils/spotifyApi";
import { initializeSpotifySdk } from "../utils/initializeSpotifySdk";
import { TPlayerState } from "../types";

const initialPlayerStateValue = {
  accessToken: "",
  trackList: null,
  player: null,
  deviceId: "",
  isReady: false,
  sdkReady: false,
  currentTrack: null,
  isPlaying: false,
  isPausing: false,
  isClicked: false,
  isContinue: false,
  songInterval: 1,
};

export const useSpotifyPlayer = () => {
  const [playerState, setPlayerState] = useState<TPlayerState>(
    initialPlayerStateValue
  );

  useEffect(() => {
    const fetchData = async () => {
      //get access token
      const session = await getSession();
      setPlayerState((prev) => ({
        ...prev,
        accessToken: session?.access_token as string | null,
      }));

      //get track list
      const trackList = await getMostListenedTrackList();
      setPlayerState((prev) => ({
        ...prev,
        trackList,
      }));

      //initialize spotify sdk
      initializeSpotifySdk(session?.access_token as string, setPlayerState);
    };
    fetchData();
  }, []);

  return { playerState, setPlayerState };
};
