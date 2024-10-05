//TODO: Visual progress bar
//TODO: play small part of song

"use client";

import { randomize } from "@/utils/randomize";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  getMostListenedTrackList,
  getTrackDetailById,
  playTrackByUri,
} from "./utils/spotifyApi";

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

const initialPlayerStateValue = {
  accessToken: "",
  trackList: null,
  player: null,
  deviceId: "",
  isReady: false,
  sdkReady: false,
};

//main component
const Page = () => {
  const [playerState, setPlayerState] = useState<PlayerStateType>(
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

      //set up sdk
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web playback SDK",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(session?.access_token as string);
          },
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
    const { accessToken, trackList, deviceId, isReady, sdkReady, player } =
      playerState;

    if (accessToken && trackList && deviceId && isReady && sdkReady) {
      //get random track's id
      const trackNumber = randomize(trackList.items.length as number);
      const trackId = trackList.items[trackNumber].id;
      console.log(`TrackId: ${trackId}`);

      //get random track uri
      const trackUri = trackList.items[trackNumber].uri;
      console.log(`TrackUri: ${trackUri}`);

      //get random track's detail
      const trackDetail = await getTrackDetailById(accessToken, trackId);
      const trackDuration = trackDetail.duration_ms;
      const randomTrackDuration = randomize(trackDuration);
      console.log(`RandomTrackDuration: ${randomTrackDuration}`);

      // play the track
      await playTrackByUri(
        trackUri,
        accessToken,
        randomTrackDuration,
        deviceId as string,
        player as Spotify.Player
      );
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      {playerState.accessToken &&
      playerState.trackList &&
      playerState.deviceId ? (
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
