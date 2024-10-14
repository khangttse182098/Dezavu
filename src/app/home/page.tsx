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
import PlayButton from "./components/PlayButton";
import SearchList from "./components/SearchList";
import { initializeSpotifySdk } from "./utils/initializeSpotifySdk";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export type TPlayerState = {
  accessToken: string | null;
  trackList: SpotifyApi.UsersTopTracksResponse | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  sdkReady: boolean;
  currentTrack: SpotifyApi.SingleTrackResponse | null;
  isPlaying: boolean;
};

export type TChooseResult = {
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
    useState<SpotifyApi.TrackSearchResponse | null>(null);
  const [chooseResult, setChooseResult] = useState<TChooseResult>(
    initialChooseResultValue
  );
  const [score, setScore] = useState(0);

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
        player as Spotify.Player,
        trackDuration
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
      //update score
      setScore((prev) => prev + 1);
    } else {
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: true,
      }));
      //update score
      setScore((prev) => prev - 1);
    }
  };

  return (
    <>
      <h1 className="text-lg text-white text-right p-10">Score: {score}</h1>
      <div className="h-screen w-screen flex flex-col items-center">
        {playerState.accessToken &&
        playerState.trackList &&
        playerState.deviceId &&
        playerState.player &&
        playerState.isReady &&
        playerState.sdkReady ? (
          <>
            <div className="flex flex-col gap-3 justify-self-end">
              <PlayButton
                handlePlayTrack={handlePlayTrack}
                isPlaying={playerState.isPlaying}
              />
              {playerState.isPlaying && (
                <input
                  type="search"
                  placeholder="Enter your guess"
                  className="p-5 rounded-lg"
                  onChange={(e) => setSearchString(e.currentTarget.value)}
                />
              )}
            </div>

            {/* search result */}
            {playerState.isPlaying && (
              <SearchList
                searchResultList={searchResultList}
                handleChooseSearch={handleChooseSearch}
              />
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
    </>
  );
};

export default Page;
