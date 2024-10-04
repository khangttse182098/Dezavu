"use client";

import { randomize } from "@/utils/randomize";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getMostListenedTrackList, playTrackByUri } from "./utils/spotifyApi";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

type PlayerStateType = {
  accessToken: string | null;
  trackList: SpotifyApi.UsersTopTracksResponse | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  sdkReady: boolean;
};

//main component
const Page = () => {
  const [playerState, setPlayerState] = useState<PlayerStateType>({
    accessToken: "",
    trackList: null,
    player: null,
    deviceId: "",
    isReady: false,
    sdkReady: false,
  });

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

      //set up sdk
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web playback SDK",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(session?.access_token as string);
          },
          volume: 0,
        });
        setPlayerState((prev) => ({
          ...prev,
          player,
        }));

        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          setPlayerState((prev) => ({
            ...prev,
            deviceId: device_id,
          }));
        });

        player.connect().then((success) => {
          if (success) {
            console.log(
              "The Web Playback SDK successfully connected to Spotify!"
            );

            setPlayerState((prev) => ({ ...prev, isReady: true }));
          }
        });
      };

      //apend sdk script AFTER setup sdk
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      script.onload = () => {
        console.log("Spotify Web Playback SDK script loaded successfully.");

        setPlayerState((prev) => ({
          ...prev,
          sdkReady: true,
        }));
      };

      document.body.appendChild(script);
    };
    fetchData();
  }, []);

  //handle play track at random time
  const handlePlayTrack = async () => {
    const { accessToken, deviceId, player, trackList } = playerState;
    //place holder value for duration
    let duration = 120 * 1000;

    if (accessToken && deviceId && player && trackList) {
      //generate random track number
      const randomTrackNumber = randomize(trackList.items.length as number);
      const trackUri = trackList.items[randomTrackNumber].uri;

      // play track
      await playTrackByUri(
        trackUri as string,
        accessToken as string,
        deviceId as string
      );

      //get current track's time
      player.addListener("player_state_changed", (state) => {
        if (state) {
          const currentTrackTime = state.track_window.current_track.duration_ms;
          duration = currentTrackTime;
          console.log(duration);

          playerState.player?.removeListener("player_state_changed");
        }
      });

      //skip to a random time in the track
      player.seek(randomize(duration)).then(() => {
        console.log("seeking");
        playerState.player?.setVolume(1);
      });
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      {playerState.isReady &&
      playerState.sdkReady &&
      playerState.accessToken ? (
        <button
          onClick={handlePlayTrack}
          className="bg-blue-500 w-56 h-20 hover:bg-blue-800 font-bold text-slate-300 text-lg border-none rounded-md scale-100 hover:scale-95 transition-all"
        >
          Play
        </button>
      ) : (
        <p className="font-bold text-slate-300 text-lg">Loading...</p>
      )}
    </div>
  );
};

export default Page;
