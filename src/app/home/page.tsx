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
  searchTracks,
} from "./utils/spotifyApi";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

type TPlayerState = {
  accessToken: string | null;
  trackList: SpotifyApi.UsersTopTracksResponse | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  sdkReady: boolean;
  currentTrack: SpotifyApi.SingleTrackResponse | null;
  isPlaying: boolean;
};

type TChooseResult = {
  isChoose: boolean;
  isCorrect: boolean;
};

const initialPlayerStateValue = {
  accessToken: "",
  trackList: null,
  player: null,
  deviceId: "",
  isReady: false,
  sdkReady: false,
  currentTrack: null,
  isPlaying: false,
};

const initialChooseResultValue = {
  isChoose: false,
  isCorrect: false,
};

//main component
const Page = () => {
  const [playerState, setPlayerState] = useState<TPlayerState>(
    initialPlayerStateValue
  );

  const [searchString, setSearchString] = useState("");
  const [searchResultList, setSearchResultList] =
    useState<SpotifyApi.TrackSearchResponse | null>();
  const [chooseResult, setChooseResult] = useState<TChooseResult>(
    initialChooseResultValue
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

  //search user's input
  useEffect(() => {
    const fetchData = async () => {
      if (searchString) {
        const data = await searchTracks(
          searchString,
          playerState.accessToken as string
        );
        setSearchResultList(data);
      } else {
        setSearchResultList(null);
      }
    };
    fetchData();
  }, [searchString]);

  //handle play track at random time
  const handlePlayTrack = async () => {
    const { accessToken, trackList, deviceId, isReady, sdkReady, player } =
      playerState;

    if (accessToken && trackList && deviceId && isReady && sdkReady && player) {
      //reset choosing state
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: false,
      }));

      //set isPlay to true (use to show the search bar or not)
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));

      //get random track's id
      const trackNumber = randomize(trackList.items.length as number);
      const trackId = trackList.items[trackNumber].id;
      console.log(`TrackId: ${trackId}`);

      //get random track uri
      const trackUri = trackList.items[trackNumber].uri;
      console.log(`TrackUri: ${trackUri}`);

      //get random track's detail
      const trackDetail = await getTrackDetailById(accessToken, trackId);
      setPlayerState((prev) => ({ ...prev, currentTrack: trackDetail }));
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

  const handleChooseSearch = (songName: string, artistName: string) => {
    const { currentTrack, player } = playerState;

    //set isPlay to true (use to show the search bar or not)
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));

    //reset search state
    setSearchString("");

    //pause the track
    player?.pause();

    if (
      currentTrack?.name === songName &&
      currentTrack.artists[0].name === artistName
    ) {
      setChooseResult((prev) => ({ ...prev, isCorrect: true, isChoose: true }));
    } else {
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: true,
      }));
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {playerState.accessToken &&
      playerState.trackList &&
      playerState.deviceId &&
      playerState.player &&
      playerState.isReady &&
      playerState.sdkReady ? (
        <>
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayTrack}
              className="bg-blue-500 w-56 h-20 hover:bg-blue-800 font-bold text-slate-300 text-lg border-none rounded-lg scale-100 hover:scale-95 transition-all"
            >
              Play
            </button>
            {playerState.isPlaying && (
              <input
                type="search"
                placeholder="Enter your guess"
                className="p-5 rounded-lg"
                onChange={(e) => setSearchString(e.currentTarget.value)}
              />
            )}
          </div>

          {playerState.isPlaying && (
            <ul className="rounded-lg">
              {searchResultList &&
                searchResultList?.tracks.items.map((track, index) => (
                  <li key={index}>
                    <div
                      className="w-56 h-14 bg-white px-2 border-slate-300  hover:bg-slate-300 transition-all"
                      onClick={() =>
                        handleChooseSearch(
                          track.name,
                          track.album.artists[0].name
                        )
                      }
                    >
                      <h1 className="font-bold text-md">{track.name}</h1>
                      <p className="text-sm">{track.album.artists[0].name}</p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          {/* show correct text */}
          {chooseResult.isChoose && chooseResult.isCorrect && (
            <h1 className="text-lg text-green-600">Correct!</h1>
          )}
          {/* show incorrect text */}
          {chooseResult.isChoose && !chooseResult.isCorrect && (
            <>
              <h1 className="text-lg text-red-600">Incorrect!</h1>
              <h2 className="text-lg text-red-600">
                Correct answer is {playerState.currentTrack?.name} by{" "}
                {playerState.currentTrack?.album.artists[0].name}
              </h2>
            </>
          )}
        </>
      ) : (
        <p className="font-bold text-slate-300 text-lg">Loading...</p>
      )}
    </div>
  );
};

export default Page;
