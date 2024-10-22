//TODO: Visual progress bar
//TODO: Regenerate access token when expired

"use client";

import { randomize } from "@/utils/randomize";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  getMostListenedTrackList,
  getTrackDetailById,
  playInterval,
  playTrackByUri,
  searchTracks,
} from "./utils/spotifyApi";
import PlayButton from "./components/PlayButton";
import SearchList from "./components/SearchList";
import { initializeSpotifySdk } from "./utils/initializeSpotifySdk";
import TrackDetails from "./components/TrackDetails";
import LoseModal from "./components/LoseModal";
import PlayerWrapper from "./components/PlayerWrapper";
import Score from "./components/Score";
import SearchInput from "./components/SearchInput";
import Result from "./components/Result";

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
  isContinue: boolean;
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
  isContinue: false,
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

  //handle continue playing track
  const handleContinueTrack = async () => {
    const { player } = playerState;
    player?.togglePlay();
    player?.addListener("player_state_changed", (state) => {
      if (state && !state.loading && !state.paused) {
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        playInterval(2, playerState.player as Spotify.Player, setPlayerState);
      }
    });
  };

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

      //subtract 30s from the end
      const subtractedTrackTime = trackDuration - 30000;

      //get random track duration
      const randomTrackDuration = randomize(subtractedTrackTime);
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
    <PlayerWrapper playerState={playerState}>
      <Score isLose={isLose} score={score} />

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
              handleContinueTrack={handleContinueTrack}
              playerState={playerState}
            />
            <SearchInput
              playerState={playerState}
              setSearchString={setSearchString}
            />
          </div>
        )}

        {/* search result */}
        <SearchList
          searchResultList={searchResultList}
          handleChooseSearch={handleChooseSearch}
        />

        {/* progress bar */}
        <progress
          value="10"
          max="100"
          className="[&::-webkit-progress-bar]:rounded-md [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-md [&::-webkit-progress-value]:bg-blue-500 h-3 w-56 mt-14"
        />

        {/* show track detail */}
        <TrackDetails
          songName={playerState.currentTrack?.name as string}
          artistName={playerState.currentTrack?.artists[0].name as string}
          image={preloadImage}
          isBig={true}
          chooseResult={chooseResult}
          score={score}
        />

        {/* show result */}
        <Result chooseResult={chooseResult} score={score} />
      </div>
    </PlayerWrapper>
  );
};

export default Page;
