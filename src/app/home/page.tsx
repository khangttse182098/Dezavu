"use client";

import { randomize } from "@/utils/randomize";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

const playTrack = async (
  trackUri: string,
  accessToken: string,
  deviceId: string
) => {
  const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    if (response.ok) {
      console.log("Track is playing");
    } else {
      const error = await response.json();
      console.error("Error playing track:", error);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

//main component
const Page = () => {
  const [accessToken, setAccessToken] = useState<string>();
  const [trackList, setTrackList] =
    useState<SpotifyApi.UsersTopArtistsResponse | null>();
  const [player, setPlayer] = useState<Spotify.Player>();
  const [deviceId, setDeviceId] = useState<string | null>();
  const [isReady, setIsReady] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      //get access token
      const session = await getSession();
      setAccessToken(session?.access_token);

      //get track list
      const trackListApiRes = await fetch("http://localhost:3000/api/track");
      const trackList = await trackListApiRes.json();
      setTrackList(trackList);

      //set up sdk
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web playback SDK",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(session?.access_token as string);
          },
          volume: 0,
        });
        setPlayer(player);

        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
        });

        player.connect().then((success) => {
          if (success) {
            console.log(
              "The Web Playback SDK successfully connected to Spotify!"
            );

            setIsReady(true);
          }
        });
      };

      //apend sdk script AFTER setup sdk
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      script.onload = () => {
        console.log("Spotify Web Playback SDK script loaded successfully.");

        setSdkReady(true);
      };

      document.body.appendChild(script);
    };
    fetchData();
  }, []);

  const handlePlayTrack = async () => {
    let duration = 120 * 1000;
    if (accessToken && deviceId && player && trackList) {
      const randomTrackNumber = randomize(trackList?.items.length as number);
      const trackUri = trackList?.items[randomTrackNumber].uri;

      // play track
      await playTrack(
        trackUri as string,
        accessToken as string,
        deviceId as string
      );

      //play at random time
      player.addListener("player_state_changed", (state) => {
        if (state) {
          const currentTrackTime = state.track_window.current_track.duration_ms;
          duration = currentTrackTime;
          console.log(duration);

          player.removeListener("player_state_changed");
        }
      });

      player.seek(randomize(duration)).then(() => {
        console.log("seeking");
        player.setVolume(1);
      });
    }
  };

  return (
    <>
      {isReady && sdkReady ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <button
            onClick={handlePlayTrack}
            className="bg-blue-500 w-56 h-20 hover:bg-blue-800 font-bold text-slate-300 text-lg border-none rounded-md scale-100 hover:scale-95 transition-all"
          >
            Play
          </button>
        </div>
      ) : (
        <p>Loading Player...</p>
      )}
    </>
  );
};

export default Page;
