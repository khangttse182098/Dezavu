//TODO: Visual progress bar
//TODO: Regenerate access token when expired

"use client";

import { randomize } from "@/utils/randomize";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  getMostListenedTrackList,
  getTrackDetailById,
  playTrackByUri,
  searchTracks,
} from "./utils/spotifyApi";
import PlayButton from "./components/PlayButton";
import SearchList from "./components/SearchList";
import { initializeSpotifySdk } from "./utils/initializeSpotifySdk";
import TrackDetails from "./components/TrackDetails";
import LoseModal from "./components/LoseModal";

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
  isPausing: boolean;
  isClicked: boolean;
};

export type TChooseResult = {
  isChoose: boolean;
  isCorrect: boolean;
};

export type TLoseModalProps = {
  highScore: number;
  songName: string;
  artistName: string;
  image: string;
  handlePlayAgain: () => void;
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
  isPausing: false,
  isClicked: false,
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
  const [preloadImage, setPreloadImage] = useState("");
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [highestScore, setHighestScore] = useState(0);
  const [isLose, setIsLose] = useState(false);

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

  //load image in advance
  useEffect(() => {
    if (playerState.currentTrack) {
      const img = new Image();
      img.src = playerState.currentTrack.album.images[0].url;
      img.onload = () => setPreloadImage(img.src);
    }
  }, [playerState.currentTrack]);

  //handle play track at random time
  const handlePlayTrack = async () => {
    const { accessToken, trackList, deviceId, isReady, sdkReady, player } =
      playerState;

    if (accessToken && trackList && deviceId && isReady && sdkReady && player) {
      //pause previous track if currently play
      player.pause();

      //reset choosing state
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: false,
      }));

      //set isClicked to true
      setPlayerState((prev) => ({ ...prev, isClicked: true }));

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
        setPlayerState,
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

    //pause the track & play
    player?.pause();
    player?.togglePlay();

    //if user choose correct search result
    if (
      currentTrack?.name === songName &&
      currentTrack.artists[0].name === artistName
    ) {
      setChooseResult((prev) => ({ ...prev, isCorrect: true, isChoose: true }));
      //update score
      setScore((prev) => prev + 1);

      //check if score is new high score
      {
        highestScore < score + 1 && setHighestScore(score + 1);
      }

      //if user didn't choose the correct awnser
    } else {
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: true,
      }));
      //update score
      const updatedScore = score - 1;
      setScore(updatedScore);

      //showing losing screen
      if (updatedScore <= 0) {
        modalRef.current?.setAttribute("open", "true");
        player?.pause();
        setIsLose(true);
      }
    }
  };

  const handlePlayAgain = () => {
    setIsLose(false);
    setScore(0);
    setHighestScore(0);
    modalRef.current?.removeAttribute("open");
  };

  return (
    <>
      {playerState.accessToken &&
      playerState.trackList &&
      playerState.deviceId &&
      playerState.player &&
      playerState.isReady &&
      playerState.sdkReady ? (
        <>
          {!isLose && (
            <h1 className="text-2xl text-white font-bold text-center p-10">
              Score: {score}
            </h1>
          )}
          <div className="flex flex-col items-center">
            <LoseModal
              songName={playerState.currentTrack?.name as string}
              artistName={playerState.currentTrack?.artists[0].name as string}
              highScore={highestScore}
              image={preloadImage}
              handlePlayAgain={handlePlayAgain}
              ref={modalRef}
            />
            {!isLose && (
              <div className="flex flex-col gap-3">
                <PlayButton
                  handlePlayTrack={handlePlayTrack}
                  isPlaying={playerState.isPlaying}
                  isPausing={playerState.isPausing}
                  isClicked={playerState.isClicked}
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
            )}

            {/* search result */}
            {playerState.isPlaying && (
              <SearchList
                searchResultList={searchResultList}
                handleChooseSearch={handleChooseSearch}
              />
            )}

            {/* progress bar */}
            {playerState.isPlaying && (
              <progress
                value="10"
                max="100"
                className="[&::-webkit-progress-bar]:rounded-md [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-md [&::-webkit-progress-value]:bg-blue-500 h-3 w-56 mt-14"
              ></progress>
            )}

            {/* show track detail */}
            {chooseResult.isChoose && score > 0 && (
              <TrackDetails
                songName={playerState.currentTrack?.name as string}
                artistName={playerState.currentTrack?.artists[0].name as string}
                image={preloadImage}
                isBig={true}
              />
            )}

            {/* show correct text */}
            {chooseResult.isChoose && chooseResult.isCorrect && (
              <h1 className="text-4xl font-bold text-green-600 my-10">
                Correct!
              </h1>
            )}
            {/* show incorrect text */}
            {chooseResult.isChoose && !chooseResult.isCorrect && score > 0 && (
              <>
                <h1 className="text-4xl text-red-600 my-10">Incorrect!</h1>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="h-screen w-screen flex flex-col items-center">
          <p className="font-bold text-slate-300 text-lg mt-32">Loading...</p>
        </div>
      )}
    </>
  );
};

export default Page;
